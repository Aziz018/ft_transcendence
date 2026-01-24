import type { FastifyInstance } from "fastify";
import DataBaseWrapper from "../utils/prisma.js";
import type {
  PlayerMoveInput,
  GameJoinInput,
  MatchmakingInput,
  GameReadyInput,
  GameResultInput,
  ScoreUpdateInput,
  MatchEndInput,
  GameSession as GameSessionModel,
  GameStats,
  Tournament,
  TournamentPlayer,
  TournamentMatch,
  TournamentActionInput,
  TournamentCreateInput
} from "../models/game.js";

interface GameSession extends GameSessionModel {
  savedResult?: boolean;
}

type Timer = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>;

/**
 * GameService
 *
 * Manages real-time multiplayer Pong game sessions.
 * Handles WebSocket connections, matchmaking, bot opponents, and game state.
 *
 * Responsibilities:
 * - Manage active WebSocket connections
 * - Handle matchmaking queue and player matching
 * - Create and manage game sessions
 * - Implement bot AI for single-player experience
 * - Track scores and game results
 * - Persist game history to database
 */
export default class GameService extends DataBaseWrapper {
  private activeConnections = new Map<string, any>();
  private gameSessions = new Map<string, GameSession>();
  private matchmakingQueue: string[] = [];
  private botConnections = new Map<string, any>();
  private matchmakingJoinTimes = new Map<string, number>();
  private botIntervals = new Map<string, Timer>();
  private matchmakingInterval: Timer | null = null;
  private readyTimeouts = new Map<string, Timer>();
  private activeGames = new Map<string, string>(); // userId -> gameId
  private readonly MATCHMAKING_TIMEOUT_MS = 60000; // 1 minute
  private readonly READY_TIMEOUT_MS = 30000; // 30 seconds to ready up

  // XP Constants
  private readonly WIN_XP = 100;
  private readonly LOSS_XP = 10;
  private readonly TIE_XP = 50;
  private readonly FORFEIT_XP = 0;


  // Game Physics Constants (Matched with Frontend)
  private readonly GAME_WIDTH = 1150;
  private readonly GAME_HEIGHT = 534;
  private readonly PADDLE_HEIGHT = 144;
  private readonly PADDLE_WIDTH = 20;
  private readonly BALL_SIZE = 20;
  private readonly BALL_SPEED = 5;
  private readonly PADDLE_SPEED = 8;
  private readonly FPS = 60;
  private readonly FRAME_TIME = 1000 / 60;

  // Tournament system
  private tournaments = new Map<string, Tournament>();
  private playerTournaments = new Map<string, string>(); // playerId -> tournamentId

  constructor(fastify: FastifyInstance) {
    super('game.service', fastify);
    this.startMatchmakingProcessor();
  }

  /**
   * Starts the periodic matchmaking processor.
   * Checks every 2 seconds for players to match or bots to assign.
   */
  private startMatchmakingProcessor(): void {
    this.matchmakingInterval = setInterval(() => {
      this.tryMatchPlayers('classic');
    }, 2000);
  }

  /**
   * Normalize velocity vector to maintain constant speed
   */
  private normalizeVelocity(vx: number, vy: number, targetSpeed: number): { vx: number, vy: number } {
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed === 0) return { vx: targetSpeed, vy: 0 };
    const scale = targetSpeed / speed;
    return { vx: vx * scale, vy: vy * scale };
  }

  /**
   * Calculates XP based on match result
   */
  private calculateXP(score1: number, score2: number): { p1Exp: number, p2Exp: number } {
    if (score1 > score2) return { p1Exp: this.WIN_XP, p2Exp: this.LOSS_XP };
    if (score2 > score1) return { p1Exp: this.LOSS_XP, p2Exp: this.WIN_XP };
    return { p1Exp: this.TIE_XP, p2Exp: this.TIE_XP };
  }

  /**
   * Starts the main game loop for a session
   */
  private startGameLoop(gameId: string): void {
    const gameSession = this.gameSessions.get(gameId);
    if (!gameSession) return;

    // Initialize Physics State
    gameSession.ballX = this.GAME_WIDTH / 2;
    gameSession.ballY = this.GAME_HEIGHT / 2;

    // Initialize Speed
    gameSession.currentBallSpeed = this.BALL_SPEED;

    // Randomize start direction slightly
    const startDirX = Math.random() > 0.5 ? 1 : -1;
    const startDirY = (Math.random() * 2 - 1) * 0.5; // Random Y between -0.5 and 0.5
    const vel = this.normalizeVelocity(startDirX * this.BALL_SPEED, startDirY * this.BALL_SPEED, gameSession.currentBallSpeed);

    gameSession.ballVelX = vel.vx;
    gameSession.ballVelY = vel.vy;

    gameSession.leftPaddleY = (this.GAME_HEIGHT / 2) - (this.PADDLE_HEIGHT / 2);
    gameSession.rightPaddleY = (this.GAME_HEIGHT / 2) - (this.PADDLE_HEIGHT / 2);
    gameSession.leftScore = 0;
    gameSession.rightScore = 0;
    gameSession.lastUpdate = Date.now();

    this.fastify.log.info(`🔄 Starting game loop for ${gameId}`);

    // clear any existing loop
    if (gameSession.gameLoopInterval) clearInterval(gameSession.gameLoopInterval);

    gameSession.gameLoopInterval = setInterval(() => {
      this.updateGame(gameId);
    }, this.FRAME_TIME);
  }

  /**
   * Updates game state (physics, collisions, scoring)
   */
  private updateGame(gameId: string): void {
    const gameSession = this.gameSessions.get(gameId);
    if (!gameSession || gameSession.status !== 'active') {
      if (gameSession?.gameLoopInterval) clearInterval(gameSession.gameLoopInterval);
      return;
    }

    // Positions
    // Safety: Verify players are still connected
    // Safety: Verify players are still connected
    const p1 = gameSession.players[0];
    const p2 = gameSession.players[1];

    if (p1 && !this.activeConnections.has(p1)) {
      this.fastify.log.warn(`⚠️ Player ${p1} disconnected but game ${gameId} loop active. Force ending.`);
      if (gameSession.gameLoopInterval) clearInterval(gameSession.gameLoopInterval);
      this.handlePlayerDisconnect(p1);
      return;
    }
    if (p2 && !this.activeConnections.has(p2) && !p2.startsWith('bot-')) {
      this.fastify.log.warn(`⚠️ Player ${p2} disconnected but game ${gameId} loop active. Force ending.`);
      if (gameSession.gameLoopInterval) clearInterval(gameSession.gameLoopInterval);
      this.handlePlayerDisconnect(p2);
      return;
    }

    let bx = gameSession.ballX || this.GAME_WIDTH / 2;
    let by = gameSession.ballY || this.GAME_HEIGHT / 2;
    let bvx = gameSession.ballVelX || this.BALL_SPEED;
    let bvy = gameSession.ballVelY || 0;

    // Update Position
    bx += bvx;
    by += bvy;

    // Wall Collisions (Top/Bottom)
    if (by <= 0 || by + this.BALL_SIZE >= this.GAME_HEIGHT) {
      bvy = -bvy;
      // Clamp positions to avoid sticking
      if (by <= 0) by = 1;
      if (by + this.BALL_SIZE >= this.GAME_HEIGHT) by = this.GAME_HEIGHT - this.BALL_SIZE - 1;
    }

    // Paddle Collisions
    // Left Paddle
    const padLeftY = gameSession.leftPaddleY || 0;
    if (bx <= this.PADDLE_WIDTH &&
      by + this.BALL_SIZE >= padLeftY &&
      by <= padLeftY + this.PADDLE_HEIGHT) {

      bx = this.PADDLE_WIDTH + 1; // Push out
      bvx = -bvx;

      // Add "English" effect based on hit position
      const hitPos = (by + this.BALL_SIZE / 2) - (padLeftY + this.PADDLE_HEIGHT / 2);
      bvy += hitPos * 0.05;

      // Increase Speed on Hit (5%)
      gameSession.currentBallSpeed = (gameSession.currentBallSpeed || this.BALL_SPEED) * 1.05;

      // Normalize to keep speed constant
      const v = this.normalizeVelocity(bvx, bvy, gameSession.currentBallSpeed);
      bvx = v.vx;
      bvy = v.vy;
    }

    // Right Paddle
    const padRightY = gameSession.rightPaddleY || 0;
    if (bx + this.BALL_SIZE >= this.GAME_WIDTH - this.PADDLE_WIDTH &&
      by + this.BALL_SIZE >= padRightY &&
      by <= padRightY + this.PADDLE_HEIGHT) {

      bx = this.GAME_WIDTH - this.PADDLE_WIDTH - this.BALL_SIZE - 1; // Push out
      bvx = -bvx;

      const hitPos = (by + this.BALL_SIZE / 2) - (padRightY + this.PADDLE_HEIGHT / 2);
      bvy += hitPos * 0.05;

      // Increase Speed on Hit (5%)
      gameSession.currentBallSpeed = (gameSession.currentBallSpeed || this.BALL_SPEED) * 1.05;

      const v = this.normalizeVelocity(bvx, bvy, gameSession.currentBallSpeed);
      bvx = v.vx;
      bvy = v.vy;
    }

    // Scoring
    let scoreChanged = false;
    if (bx < 0) {
      gameSession.rightScore = (gameSession.rightScore || 0) + 1;
      scoreChanged = true;
      this.resetBall(gameSession, 'right');
    } else if (bx > this.GAME_WIDTH) {
      gameSession.leftScore = (gameSession.leftScore || 0) + 1;
      scoreChanged = true;
      this.resetBall(gameSession, 'left');
    } else {
      // Update state if no score
      gameSession.ballX = bx;
      gameSession.ballY = by;
      gameSession.ballVelX = bvx;
      gameSession.ballVelY = bvy;
    }

    // Broadcast State
    this.broadcastGameState(gameSession);

    // Check win condition (optional, standard is time-based but maybe score limit too?)
    // For now, relies on time.
  }

  private resetBall(session: GameSession, winner: 'left' | 'right'): void {
    session.ballX = this.GAME_WIDTH / 2;
    session.ballY = this.GAME_HEIGHT / 2;

    // Serve to the loser
    const dirX = winner === 'left' ? 1 : -1;
    const dirY = (Math.random() * 2 - 1) * 0.5;

    // Reset Speed
    session.currentBallSpeed = this.BALL_SPEED;

    const v = this.normalizeVelocity(dirX * this.BALL_SPEED, dirY * this.BALL_SPEED, session.currentBallSpeed);
    session.ballVelX = v.vx;
    session.ballVelY = v.vy;
  }

  private broadcastGameState(session: GameSession): void {
    this.notifyPlayers(session.players, {
      type: 'game_state',
      payload: {
        ballX: session.ballX,
        ballY: session.ballY,
        leftPaddleY: session.leftPaddleY,
        rightPaddleY: session.rightPaddleY,
        leftScore: session.leftScore,
        rightScore: session.rightScore,
        timeLeft: Math.max(0, Math.floor(((session.matchStartTime || 0) + session.MATCH_DURATION_MS - Date.now()) / 1000)),
        status: session.status
      }
    });
  }

  /**
   * Processes a player movement action in an active game.
   */
  async handlePlayerMove(userId: string, payload: PlayerMoveInput): Promise<{ success: boolean; message: string }> {
    this.fastify.log.debug(payload, `🎮 ${userId.startsWith('bot-') ? '🤖 Bot' : 'Player'} ${userId} moved`);

    const gameSession = this.gameSessions.get(payload.gameId);
    if (gameSession && gameSession.status === 'active') {
      // Identify player side
      const isPlayer1 = userId === gameSession.players[0];

      if (isPlayer1) {
        // Update left paddle
        if (payload.position !== undefined) {
          // Absolute positioning (mouse/touch) - clamp update
          gameSession.leftPaddleY = Math.max(0, Math.min(this.GAME_HEIGHT - this.PADDLE_HEIGHT, payload.position));
        } else if (payload.direction) {
          // Relative positioning (keyboard)
          const dy = payload.direction === 'up' ? -this.PADDLE_SPEED : (payload.direction === 'down' ? this.PADDLE_SPEED : 0);
          const currentY = gameSession.leftPaddleY ?? (this.GAME_HEIGHT - this.PADDLE_HEIGHT) / 2;
          gameSession.leftPaddleY = Math.max(0, Math.min(this.GAME_HEIGHT - this.PADDLE_HEIGHT, currentY + dy));
        }
      } else {
        // Update right paddle
        if (payload.position !== undefined) {
          gameSession.rightPaddleY = Math.max(0, Math.min(this.GAME_HEIGHT - this.PADDLE_HEIGHT, payload.position));
        } else if (payload.direction) {
          const dy = payload.direction === 'up' ? -this.PADDLE_SPEED : (payload.direction === 'down' ? this.PADDLE_SPEED : 0);
          const currentY = gameSession.rightPaddleY ?? (this.GAME_HEIGHT - this.PADDLE_HEIGHT) / 2;
          gameSession.rightPaddleY = Math.max(0, Math.min(this.GAME_HEIGHT - this.PADDLE_HEIGHT, currentY + dy));
        }
      }

      // Notify opponent (optional, or rely on game loop broadcast)
      // Since we have a game loop, we don't strictly need to notify immediately if the loop is fast enough.
      // But keeping the event-based notification for interpolation on client side is good.
      gameSession.players.forEach((playerId: string) => {
        if (playerId !== userId) {
          this.notifyPlayer(playerId, {
            type: 'player_moved',
            payload: {
              userId,
              ...payload,
              isBot: userId.startsWith('bot-')
            }
          });
        }
      });
    }

    return { success: true, message: 'Movement processed' };
  }

  /**
   * Handles real-time EXP score updates from the frontend during an active match.
   */
  async handleScoreUpdate(userId: string, payload: ScoreUpdateInput): Promise<{ success: boolean; message: string }> {
    this.fastify.log.debug(`📊 Score update from ${userId}: EXP = ${payload.currentExp}`);

    const gameSession = this.gameSessions.get(payload.gameId);
    if (!gameSession) {
      return { success: false, message: 'Game session not found' };
    }

    gameSession.expScores[userId] = payload.currentExp;

    this.notifyPlayers(gameSession.players, {
      type: 'score_update',
      payload: {
        gameId: payload.gameId,
        scores: gameSession.expScores,
        timestamp: payload.timestamp
      }
    });

    return { success: true, message: 'Score updated' };
  }

  /**
   * Handles the match end event when the 1-minute timer expires.
   */
  async handleMatchEnd(initiatorId: string, payload: MatchEndInput): Promise<any> {
    this.fastify.log.info(payload, `⏰ Match end signal from ${initiatorId}`);
    this.fastify.log.debug(`[DEBUG] handleMatchEnd payload: ${JSON.stringify(payload)}`);

    const gameSession = this.gameSessions.get(payload.gameId);
    if (!gameSession) {
      return { success: false, message: 'Game session not found' };
    }

    // Idempotency check
    if (gameSession.status === 'completed') {
      this.fastify.log.warn(`⚠️ Game ${payload.gameId} already completed. Ignoring match end.`);
      return { success: false, message: 'Game already completed' };
    }

    const { player1Id, player2Id, player1Exp, player2Exp } = payload;
    const winnerId = player1Exp > player2Exp ? player1Id : (player1Exp === player2Exp ? null : player2Id);
    const isTie = player1Exp === player2Exp;

    this.fastify.log.info(`🏆 Match Result: ${player1Id} (${player1Exp} EXP) vs ${player2Id} (${player2Exp} EXP)`);
    this.fastify.log.info(`🎯 Winner: ${isTie ? 'TIE' : winnerId}`);

    gameSession.status = 'completed';
    gameSession.finalScores = {
      [player1Id]: player1Exp,
      [player2Id]: player2Exp
    };
    gameSession.endedAt = new Date();
    gameSession.matchDurationMs = payload.matchDurationMs || 60000;

    if (gameSession.matchTimer) {
      clearTimeout(gameSession.matchTimer);
      gameSession.matchTimer = null;
    }

    if (gameSession.gameLoopInterval) {
      clearInterval(gameSession.gameLoopInterval);
      gameSession.gameLoopInterval = null;
    }

    if (gameSession.botInterval) {
      clearInterval(gameSession.botInterval);
      gameSession.botInterval = null;
    }

    this.notifyPlayers(gameSession.players, {
      type: 'match_ended',
      payload: {
        gameId: payload.gameId,
        winnerId,
        isTie,
        finalScores: gameSession.finalScores,
        matchDurationMs: gameSession.matchDurationMs
      }
    });

    // Save to database
    await this.saveGameResult(gameSession, winnerId);

    return {
      success: true,
      winnerId,
      isTie,
      finalScores: gameSession.finalScores
    };
  }

  /**
   * Handles a player's request to join a game.
   */
  async handleGameJoin(userId: string, payload: GameJoinInput): Promise<any> {
    this.fastify.log.debug(payload, `Player ${userId} wants to join game`);

    if (payload.gameId) {
      return await this.joinExistingGame(userId, payload.gameId);
    } else {
      return await this.joinMatchmaking(userId, payload.gameType);
    }
  }

  /**
   * Processes matchmaking requests for joining or leaving the queue.
   */
  async handleMatchmaking(userId: string, payload: MatchmakingInput): Promise<any> {
    this.fastify.log.debug(payload, `🔍 Player ${userId} matchmaking`);

    if (payload.action === 'join') {
      return await this.joinMatchmaking(userId, payload.gameType);
    } else {
      return await this.leaveMatchmaking(userId);
    }
  }

  /**
   * Handles a player's ready signal for starting a game.
   */
  async handleGameReady(userId: string, payload: GameReadyInput): Promise<{ success: boolean; message: string }> {
    this.fastify.log.info(`✅ Player ${userId} is ready for game: ${payload.gameId}`);

    const gameSession = this.gameSessions.get(payload.gameId);
    if (!gameSession) {
      return { success: false, message: 'Game session not found' };
    }

    if (gameSession.status !== 'starting') {
      return { success: false, message: 'Game already started or completed' };
    }

    if (!gameSession.readyPlayers) gameSession.readyPlayers = new Set();
    gameSession.readyPlayers.add(userId);

    // Notify other players about ready status
    this.notifyPlayers(gameSession.players.filter(id => id !== userId), {
      type: 'player_ready',
      payload: {
        gameId: payload.gameId,
        playerId: userId,
        readyCount: gameSession.readyPlayers.size,
        totalPlayers: gameSession.players.length
      }
    });

    this.fastify.log.info(`📊 Ready status: ${gameSession.readyPlayers.size}/${gameSession.players.length} players ready`);

    // Start game when all players are ready
    if (gameSession.readyPlayers.size === gameSession.players.length) {
      // Clear ready timeout
      const timeout = this.readyTimeouts.get(payload.gameId);
      if (timeout) {
        clearTimeout(timeout);
        this.readyTimeouts.delete(payload.gameId);
      }

      this.fastify.log.info(`🎮 All players ready! Starting game ${payload.gameId}`);
      this.fastify.log.info(`🎮 All players ready! Starting game ${payload.gameId}`);
      await this.startGame(payload.gameId);
    }

    return { success: true, message: 'Player ready' };
  }

  /**
   * Allows a player to join a specific existing game session.
   */
  private async joinExistingGame(userId: string, gameId: string): Promise<any> {
    const gameSession = this.gameSessions.get(gameId);
    if (!gameSession) {
      throw new Error('Game not found');
    }

    if (gameSession.players.includes(userId)) {
      return { success: true, gameId, message: 'Already in game' };
    }

    if (gameSession.players.length >= 2) {
      throw new Error('Game is full');
    }

    gameSession.players.push(userId);
    this.notifyPlayers(gameSession.players, {
      type: 'player_joined',
      payload: { userId, gameId }
    });

    return { success: true, gameId };
  }

  /**
   * Adds a player to the matchmaking queue.
   */
  private async joinMatchmaking(userId: string, gameType: string): Promise<any> {
    // Check if player is already in a game
    const existingGameId = this.getGameIdByPlayerId(userId);
    if (existingGameId) {
      this.fastify.log.warn(`⚠️ Player ${userId} tried to join matchmaking but is already in game ${existingGameId}`);
      return { success: false, message: 'You are already in a game', gameId: existingGameId };
    }

    if (!this.matchmakingQueue.includes(userId)) {
      this.matchmakingQueue.push(userId);
      this.matchmakingJoinTimes.set(userId, Date.now());
    }

    this.fastify.log.debug(`Matchmaking queue: ${this.matchmakingQueue.length} players`);

    await this.tryMatchPlayers(gameType);

    return {
      success: true,
      position: this.matchmakingQueue.indexOf(userId) + 1,
      queueSize: this.matchmakingQueue.length
    };
  }

  /**
   * Removes a player from the matchmaking queue.
   */
  private async leaveMatchmaking(userId: string): Promise<{ success: boolean; message: string }> {
    this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId);
    this.matchmakingJoinTimes.delete(userId);
    return { success: true, message: 'Left matchmaking' };
  }

  /**
   * explicit command to leave an active game (forfeit).
   */
  async handleLeaveGame(userId: string): Promise<{ success: boolean; message: string }> {
    this.fastify.log.info(`🏳️ Player ${userId} explicitly left the game (forfeit)`);

    // Check if player is in any active or starting game logic
    // We can reuse removeConnection logic partially, or just find the game and kill it.

    let foundGame = false;

    for (const [gameId, session] of this.gameSessions.entries()) {
      if (session.players.includes(userId)) {
        foundGame = true;
        if (session.status === 'active' || session.status === 'starting') {
          // Treat explicit leave exactly like a disconnect (Win for opponent)
          // But ensures it happens immediately even if socket is still "open" for a split second.
          this.handlePlayerDisconnect(userId);
        }
        break; // User can only be in one game
      }
    }

    // Also remove from matchmaking just in case
    this.leaveMatchmaking(userId);

    return { success: true, message: foundGame ? 'Forfeited game' : 'Left matchmaking' };
  }

  /**
   * Creates a game against a bot for the specified user.
   */
  async createBotGame(userId: string): Promise<string> {
    const botId = `bot-${Date.now()}`;
    const gameType = 'classic'; // Default to classic for now
    this.fastify.log.info(`🤖 Creating bot game for ${userId} vs ${botId}`);

    const gameSession = await this.createGameSession(userId, botId, gameType);

    // Auto-start the game logic since it's a bot game
    // createGameSession already handles notification and bot auto-ready
    // But we might need to trigger the start if the user is already ready? 
    // Actually createGameSession sends 'game_matched'. The client will connect via WS.

    return gameSession.id;
  }

  /**
   * Creates a private game between two specific players (invites).
   */
  async createPrivateGame(player1Id: string, player2Id: string): Promise<string> {
    const gameId = crypto.randomUUID();

    // Create session
    const gameSession: GameSession = {
      id: gameId,
      players: [player1Id, player2Id], // p1=Host?
      gameType: 'classic',
      status: 'starting',
      createdAt: new Date(),
      isBotGame: false,
      expScores: { [player1Id]: 0, [player2Id]: 0 },
      MATCH_DURATION_MS: 180000,
      matchTimer: null,
      matchStartTime: null,
      readyPlayers: new Set()
    };

    this.gameSessions.set(gameId, gameSession);
    this.activeGames.set(player1Id, gameId);
    this.activeGames.set(player2Id, gameId);

    // Look up names/avatars 
    const p1Stats = await this.prisma.user.findUnique({ where: { id: player1Id }, select: { name: true, avatar: true } });
    const p2Stats = await this.prisma.user.findUnique({ where: { id: player2Id }, select: { name: true, avatar: true } });

    const playerNames: any = {};
    if (p1Stats) playerNames[player1Id] = p1Stats.name;
    if (p2Stats) playerNames[player2Id] = p2Stats.name;

    const playerAvatars: any = {};
    if (p1Stats) playerAvatars[player1Id] = p1Stats.avatar;
    if (p2Stats) playerAvatars[player2Id] = p2Stats.avatar;

    // Notify Players
    // We reuse 'game_matched' so frontend behaves correctly
    const payloadP1 = {
      type: 'game_matched',
      id: gameId,
      opponentId: player2Id,
      opponentName: p2Stats?.name || 'Opponent',
      opponentAvatar: p2Stats?.avatar || '',
      yourPlayerId: player1Id,
      side: 'left'
    };

    const payloadP2 = {
      type: 'game_matched',
      id: gameId,
      opponentId: player1Id,
      opponentName: p1Stats?.name || 'Opponent',
      opponentAvatar: p1Stats?.avatar || '',
      yourPlayerId: player2Id,
      side: 'right'
    };

    // We need to notify via GameSocket if they are connected
    // But they might not be on GameSocket yet if they are in Chat.
    // However, the frontend flow is: "Accept" -> Redirect to /game -> Connect GameSocket -> "matchmaking" or "game_ready"?
    // If they redirect, they will connect to GameSocket.
    // If we create the game here BEFORE they connect, we need to handle their connection.
    // "handleGameJoin" or "handleGameReady"?

    // Ideally:
    // 1. Chat sends "accept".
    // 2. Backend creates game.
    // 3. Backend tells Chat "Okay, go to /game".
    // 4. Frontend goes to /game.
    // 5. Frontend connects to GameSocket.
    // 6. GameSocket sees user is in `activeGames`, so it RECONNECTS them automatically? 
    //    Or they send "join_game"?

    // In `handleGameJoin` (which is what usually happens?), let's see.
    // Or `handleMatchmaking`?

    // Let's rely on stored activeGames.

    // Notify via Chat Socket? Or assume they will connect?
    // Let's just create it and let them join.

    // BUT we need to notify them to GO to the game. 
    // This method returns gameId. ChatController can use it.

    return gameId;
  }

  /**
   * Attempts to match players in the queue or assign bots.
   */
  private async tryMatchPlayers(gameType: string): Promise<void> {
    if (this.matchmakingQueue.length >= 2) {
      const player1 = this.matchmakingQueue.shift()!;
      const player2 = this.matchmakingQueue.shift()!;
      this.fastify.log.info(`Matched players: ${player1} vs ${player2}`);
      await this.createGameSession(player1, player2, gameType);
      return;
    }

    if (this.matchmakingQueue.length === 1) {
      const playerId = this.matchmakingQueue[0];
      if (!playerId) return;

      const joinTime = this.matchmakingJoinTimes.get(playerId);
      if (!joinTime) {
        this.matchmakingJoinTimes.set(playerId, Date.now());
        return;
      }

      const waitTime = Date.now() - joinTime;

      if (waitTime > 10000) {
        const player = this.matchmakingQueue.shift()!;
        const botId = `bot-${Date.now()}`;
        this.fastify.log.info(`🤖 Matching ${player} with bot ${botId}`);
        await this.createGameSession(player, botId, gameType);
        this.matchmakingJoinTimes.delete(playerId);
      }
    }
  }

  /**
   * Creates a new game session between two players.
   * Waits for both players to signal ready before starting.
   */
  private async createGameSession(player1Id: string, player2Id: string, gameType: string): Promise<GameSession> {
    const isPlayer2Bot = player2Id.startsWith('bot-');

    const gameSession: GameSession = {
      id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      players: [player1Id, player2Id],
      gameType,
      status: 'starting',
      createdAt: new Date(),
      isBotGame: isPlayer2Bot,
      expScores: {
        [player1Id]: 0,
        [player2Id]: 0
      },
      matchStartTime: null,
      matchTimer: null,
      MATCH_DURATION_MS: 60000,
      readyPlayers: new Set(),
      playerConnectionIds: {}
    };

    // Bind current connection IDs to the session
    const p1Conn = this.activeConnections.get(player1Id);
    if (p1Conn && p1Conn.id) {
      gameSession.playerConnectionIds![player1Id] = p1Conn.id;
    }
    const p2Conn = this.activeConnections.get(player2Id);
    if (p2Conn && p2Conn.id) {
      gameSession.playerConnectionIds![player2Id] = p2Conn.id;
    }

    this.gameSessions.set(gameSession.id, gameSession);

    this.fastify.log.info(`🎮 Created game session ${gameSession.id}: ${player1Id} vs ${player2Id}${isPlayer2Bot ? ' (bot)' : ''}`);

    // Notify player 1
    this.notifyPlayer(player1Id, {
      type: 'game_matched',
      payload: { ...gameSession, yourPlayerId: player1Id, opponentIsBot: isPlayer2Bot }
    });

    if (isPlayer2Bot) {
      // Auto-ready the bot (bots don't need to signal ready)
      if (!gameSession.readyPlayers) gameSession.readyPlayers = new Set();
      gameSession.readyPlayers.add(player2Id);
      this.fastify.log.debug(`🤖 Bot ${player2Id} auto-readied`);

      // Bot behavior will start when game actually begins (in startGame)
    } else {
      // Notify player 2
      this.notifyPlayer(player2Id, {
        type: 'game_matched',
        payload: { ...gameSession, yourPlayerId: player2Id, opponentIsBot: false }
      });
    }

    // Set timeout for players to ready up
    const readyTimeout = setTimeout(() => {
      this.handleReadyTimeout(gameSession.id);
    }, this.READY_TIMEOUT_MS);

    this.readyTimeouts.set(gameSession.id, readyTimeout);
    this.fastify.log.debug(`⏱️  Ready timeout set for game ${gameSession.id} (${this.READY_TIMEOUT_MS}ms)`);

    return gameSession;
  }

  /**
   * Handles timeout when players don't ready up in time
   */
  private handleReadyTimeout(gameId: string): void {
    const gameSession = this.gameSessions.get(gameId);
    if (!gameSession) return;

    // Check if game already started
    if (gameSession.status !== 'starting') {
      this.readyTimeouts.delete(gameId);
      return;
    }

    const readyPlayers = gameSession.readyPlayers || new Set();
    const notReadyPlayers = gameSession.players.filter(p => !readyPlayers.has(p));

    this.fastify.log.warn(`⏰ Ready timeout for game ${gameId}. Players not ready: ${notReadyPlayers.join(', ')}`);

    // Notify all players that match was cancelled
    this.notifyPlayers(gameSession.players, {
      type: 'game_cancelled',
      payload: {
        gameId,
        reason: 'Players did not ready up in time',
        notReadyPlayers
      }
    });

    // Clean up
    this.gameSessions.delete(gameId);
    this.readyTimeouts.delete(gameId);
  }

  /**
   * Starts autonomous behavior for a Pong bot opponent.
   */
  private startBotBehavior(gameSession: GameSession, botId: string): void {
    this.fastify.log.debug(`Starting Smart Pong Bot behavior for bot ${botId} in game ${gameSession.id}`);

    const UPDATE_RATE = 16; // Update roughly 60 times a second matches game loop
    const DEADZONE = 10; // Pixels of tolerance to prevent jitter

    const botInterval = setInterval(() => {
      // Cleanup if game doesn't exist or is finished
      if (!this.gameSessions.has(gameSession.id) || gameSession.status === 'completed') {
        clearInterval(botInterval);
        this.botIntervals.delete(gameSession.id);
        return;
      }

      // Determine bot paddle position
      const isP1 = gameSession.players[0] === botId;
      const myPaddleY = isP1 ? gameSession.leftPaddleY : gameSession.rightPaddleY;
      const paddleCenter = (myPaddleY || 0) + this.PADDLE_HEIGHT / 2;
      const ballY = gameSession.ballY || this.GAME_HEIGHT / 2;

      // Smart tracking logic
      let direction: 'up' | 'down' | null = null;

      if (ballY < paddleCenter - DEADZONE) {
        direction = 'up';
      } else if (ballY > paddleCenter + DEADZONE) {
        direction = 'down';
      }

      if (direction) {
        // Send move command
        this.handlePlayerMove(botId, {
          gameId: gameSession.id,
          direction,
          timestamp: Date.now()
        });
      }
    }, UPDATE_RATE);

    gameSession.botInterval = botInterval;
    this.botIntervals.set(gameSession.id, botInterval);
  }

  /**
   * Initiates an active game session when all players are ready.
   */
  private async startGame(gameId: string): Promise<void> {
    const gameSession = this.gameSessions.get(gameId);
    if (!gameSession) return;

    gameSession.status = 'active';
    gameSession.startedAt = new Date();
    gameSession.matchStartTime = Date.now();

    this.fastify.log.info(`🎮 Game ${gameId} started. 1-minute timer begins...`);

    // Start bot behavior if this is a bot game
    if (gameSession.isBotGame) {
      const botId = gameSession.players.find(id => id.startsWith('bot-'));
      if (botId) {
        this.startBotBehavior(gameSession, botId);
      }
    }

    // Fetch player details (names, avatars)
    const playerDetails = new Map<string, { name: string; avatar: string }>();

    try {
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: gameSession.players }
        },
        select: {
          id: true,
          name: true,
          avatar: true
        }
      });

      users.forEach(u => {
        playerDetails.set(u.id, {
          name: u.name,
          avatar: u.avatar || ""
        });
      });
    } catch (err) {
      this.fastify.log.error({ err }, "Failed to fetch player details for game start");
    }

    // Notify players individually with side AND opponent info
    gameSession.players.forEach((playerId, index) => {
      let opponentName = "Opponent";
      let opponentAvatar = "";

      const opponentId = gameSession.players.find(id => id !== playerId);
      if (opponentId) {
        if (opponentId.startsWith('bot-')) {
          opponentName = "Bot";
          opponentAvatar = ""; // Use default or specific bot avatar
        } else {
          const details = playerDetails.get(opponentId);
          if (details) {
            opponentName = details.name;
            opponentAvatar = details.avatar;
          }
        }
      }

      this.notifyPlayer(playerId, {
        type: 'game_start',
        payload: {
          gameId,
          startedAt: gameSession.startedAt,
          matchDurationMs: gameSession.MATCH_DURATION_MS,
          side: index === 0 ? 'left' : 'right',
          players: gameSession.players,
          opponentName,
          opponentAvatar
        }
      });
    });

    gameSession.matchTimer = setTimeout(() => {
      this.fastify.log.info(`⏰ 1-minute timer expired for game ${gameId}`);
      if (gameSession.gameLoopInterval) clearInterval(gameSession.gameLoopInterval);

      const p1Score = gameSession.leftScore || 0;
      const p2Score = gameSession.rightScore || 0;
      const { p1Exp, p2Exp } = this.calculateXP(p1Score, p2Score);

      this.handleMatchEnd(gameId, {
        gameId,
        player1Id: gameSession.players[0] || 'unknown',
        player1Exp: p1Exp,
        player2Id: gameSession.players[1] || 'unknown',
        player2Exp: p2Exp,
        matchDurationMs: gameSession.MATCH_DURATION_MS,
        timestamp: Date.now()
      });
    }, gameSession.MATCH_DURATION_MS);

    // Start physics loop
    this.startGameLoop(gameId);
  }

  /**
   * Saves game result to database.
   */
  private async saveGameResult(gameSession: GameSession, winnerId: string | null): Promise<void> {
    if (gameSession.savedResult) {
      this.fastify.log.warn(`⚠️ Game ${gameSession.id} result already saved (memory flag). Skipping.`);
      return;
    }
    gameSession.savedResult = true;

    // Double-check database to be absolutely sure
    const existingSession = await this.prisma.gameSession.findUnique({
      where: { id: gameSession.id }
    });
    if (existingSession) {
      this.fastify.log.warn(`⚠️ Game ${gameSession.id} result already in DB. Skipping.`);
      return;
    }

    try {
      const player1Id = gameSession.players[0];
      const player2Id = gameSession.players[1];

      // Guard against missing player IDs
      if (!player1Id || !player2Id) {
        this.fastify.log.warn(`⚠️ Game ${gameSession.id} missing player IDs. Skipping save.`);
        return;
      }

      // Allow saving bot games so humans get XP, but handle bot IDs carefully
      /*
      if (player1Id?.startsWith('bot-') || player2Id?.startsWith('bot-')) {
        this.fastify.log.debug('Skipping database save for bot game');
        return;
      }
      */

      // Create game session in database
      const savedSession = await this.prisma.gameSession.create({
        data: {
          gameType: gameSession.gameType.toUpperCase() as 'CLASSIC' | 'TOURNAMENT' | 'RANKED' | 'CASUAL',
          status: 'COMPLETED',
          player1Id,
          player2Id,
          winnerId,
          player1Score: gameSession.leftScore || 0,
          player2Score: gameSession.rightScore || 0,
          player1Exp: gameSession.finalScores?.[player1Id] || 0,
          player2Exp: gameSession.finalScores?.[player2Id] || 0,
          durationMs: gameSession.matchDurationMs || 60000,
          startedAt: gameSession.startedAt,
          completedAt: gameSession.endedAt
        }
      });

      // Create GameHistory record (for leaderboard/history display)
      try {
        const [p1, p2] = await Promise.all([
          player1Id.startsWith('bot-') ? { name: 'Smart Bot' } : this.prisma.user.findUnique({ where: { id: player1Id }, select: { name: true } }),
          player2Id.startsWith('bot-') ? { name: 'Smart Bot' } : this.prisma.user.findUnique({ where: { id: player2Id }, select: { name: true } })
        ]);

        await this.prisma.gameHistory.create({
          data: {
            gameSessionId: savedSession.id,
            gameType: savedSession.gameType,
            player1Id,
            player2Id,
            winnerId,
            player1Name: p1?.name || "Unknown",
            player2Name: p2?.name || "Unknown",
            player1Score: savedSession.player1Score,
            player2Score: savedSession.player2Score,
            durationMs: savedSession.durationMs || 0,
            playedAt: savedSession.completedAt || new Date()
          }
        });
        this.fastify.log.info('✅ GameHistory record created');
      } catch (historyError) {
        this.fastify.log.error({ error: historyError }, 'Failed to create GameHistory record');
      }

      // Update player stats - SKIP XP for bot games to prevent leaderboard grinding
      const isBotGame = player1Id.startsWith('bot-') || player2Id.startsWith('bot-');
      const p1XP = isBotGame ? 0 : (gameSession.finalScores?.[player1Id] || 0);
      const p2XP = isBotGame ? 0 : (gameSession.finalScores?.[player2Id] || 0);

      if (isBotGame) {
        this.fastify.log.info('🤖 Bot game detected - No XP awarded to prevent leaderboard grinding');
      }

      if (!player1Id.startsWith('bot-')) {
        await this.updatePlayerStats(player1Id, winnerId === player1Id, gameSession.matchDurationMs || 60000, p1XP);
      }

      if (!player2Id.startsWith('bot-')) {
        await this.updatePlayerStats(player2Id, winnerId === player2Id, gameSession.matchDurationMs || 60000, p2XP);
      }

      this.fastify.log.info('✅ Game result saved to database');
    } catch (error) {
      this.fastify.log.error({ error }, 'Failed to save game result');
    }
  }

  /**
   * Updates player statistics after a game.
   */
  /**
   * Updates player statistics after a game.
   */
  private async updatePlayerStats(userId: string, isWin: boolean, durationMs: number, xpEarned: number): Promise<void> {
    try {
      this.fastify.log.info(`📊 Updating stats for ${userId}: Win=${isWin}, XP=${xpEarned}`);

      // 1. Update PlayerStats
      const stats = await this.prisma.playerStats.findUnique({ where: { userId } });

      if (!stats) {
        await this.prisma.playerStats.create({
          data: {
            userId,
            totalGames: 1,
            totalWins: isWin ? 1 : 0,
            totalLosses: isWin ? 0 : 1,
            winStreak: isWin ? 1 : 0,
            bestWinStreak: isWin ? 1 : 0,
            totalExpEarned: xpEarned, // Correct field name
            averageGameDuration: durationMs,
          }
        });
      } else {
        const newWinStreak = isWin ? stats.winStreak + 1 : 0;
        await this.prisma.playerStats.update({
          where: { userId },
          data: {
            totalGames: { increment: 1 },
            totalWins: isWin ? { increment: 1 } : undefined,
            totalLosses: !isWin ? { increment: 1 } : undefined,
            winStreak: newWinStreak,
            bestWinStreak: Math.max(stats.bestWinStreak, newWinStreak),
            totalExpEarned: { increment: xpEarned }, // Correct field name
            averageGameDuration: Math.floor((stats.averageGameDuration * stats.totalGames + durationMs) / (stats.totalGames + 1))
          }
        });
      }

      // 2. Update User Profile XP (What drives the UI level bar)
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpEarned }
        }
      });

      this.fastify.log.info(`✅ Stats and XP updated for ${userId}`);

    } catch (error) {
      this.fastify.log.error({ error }, 'Failed to update player stats');
    }
  }

  /**
   * Registers a new WebSocket connection for a player.
   */
  addConnection(userId: string, connection: any): void {
    this.activeConnections.set(userId, connection);
  }

  /**
   * Removes a player's WebSocket connection.
   * Handles disconnection during matchmaking and game phases.
   */
  removeConnection(userId: string, connection?: any): void {
    // Only remove if it matches the current connection (prevents race condition on reconnect)
    const current = this.activeConnections.get(userId);

    // If connection object matches, remove it from active tracking
    if (connection && current === connection) {
      this.activeConnections.delete(userId);
    }
    // If not matching, it means we have a NEW connection. We DO NOT delete it.
    // BUT we still proceed to check if the OLD connection belongs to an active game that needs to be killed.

    // Remove from matchmaking queue if present
    const wasInQueue = this.matchmakingQueue.includes(userId);
    if (wasInQueue && (!connection || current === connection)) {
      this.leaveMatchmaking(userId);
      this.fastify.log.info(`🚪 Player ${userId} left matchmaking queue`);
    }

    // Check if player is in a game session AND if the game belongs to THIS connection
    this.gameSessions.forEach((session, gameId) => {
      if (session.players.includes(userId)) {
        // Validation: Does this game belong to the dying connection?
        // If we have connection-binding (which we are adding), check it.
        // For now, if we don't have it fully populated, we might be risky.
        // But let's assume we populated it.

        const registeredConnectionId = session.playerConnectionIds?.[userId];
        if (connection && connection.id && registeredConnectionId && registeredConnectionId !== connection.id) {
          this.fastify.log.debug(`Ignoring disconnect for game ${gameId} (Connection ID mismatch: Game=${registeredConnectionId} vs Close=${connection.id})`);
          return;
        }

        // Handle disconnection based on game state
        if (session.status === 'starting') {
          // Player disconnected during ready phase
          this.handlePlayerDisconnectDuringReady(userId, gameId, session);
        } else {
          // Player disconnected during active game
          this.handlePlayerDisconnect(userId);
        }
      }
    });
  }

  /**
   * Handles player disconnection during the ready phase (before game starts)
   */
  private handlePlayerDisconnectDuringReady(userId: string, gameId: string, gameSession: GameSession): void {
    this.fastify.log.warn(`🚪 Player ${userId} disconnected during ready phase for game ${gameId}`);

    // Clear ready timeout
    const timeout = this.readyTimeouts.get(gameId);
    if (timeout) {
      clearTimeout(timeout);
      this.readyTimeouts.delete(gameId);
    }

    // Notify opponent that match was cancelled
    const opponentId = gameSession.players.find(id => id !== userId && !id.startsWith('bot-'));
    if (opponentId) {
      this.notifyPlayer(opponentId, {
        type: 'game_cancelled',
        payload: {
          gameId,
          reason: 'Opponent disconnected before game started',
          disconnectedPlayer: userId
        }
      });
      this.fastify.log.info(`📢 Notified ${opponentId} that opponent disconnected`);
    }

    // Clean up game session
    if (gameSession.botInterval) {
      clearInterval(gameSession.botInterval);
    }
    if (this.botIntervals.has(gameId)) {
      clearInterval(this.botIntervals.get(gameId));
      this.botIntervals.delete(gameId);
    }

    this.gameSessions.delete(gameId);
    this.fastify.log.info(`🗑️  Cleaned up game session ${gameId}`);
  }

  /**
   * Handles cleanup when a player disconnects during active game.
   */
  private handlePlayerDisconnect(userId: string): void {
    this.fastify.log.debug(`Player ${userId} disconnected`);

    this.activeConnections.delete(userId);
    this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId);

    for (const [gameId, gameSession] of this.gameSessions.entries()) {
      if (gameSession.players.includes(userId)) {
        this.fastify.log.debug(`[DEBUG] Found active game ${gameId} for disconnected player ${userId}`);

        if (gameSession.status === 'completed') {
          this.fastify.log.warn(`⚠️ Game ${gameId} already completed. Resending match_end to ensure opponent is notified.`);

          // Redundant safety: Ensure opponent gets the message even if we think it's over
          const player1Id = gameSession.players[0] || 'unknown';
          const player2Id = gameSession.players[1] || 'unknown';
          const isP1 = player1Id === userId;
          const opponentId = isP1 ? player2Id : player1Id;

          if (opponentId !== 'unknown') {
            this.notifyPlayer(opponentId, {
              type: 'match_ended',
              payload: {
                gameId,
                winnerId: opponentId,
                isTie: false,
                finalScores: { [player1Id]: (isP1 ? this.LOSS_XP : this.WIN_XP), [player2Id]: (isP1 ? this.WIN_XP : this.LOSS_XP) },
                matchDurationMs: Date.now() - (gameSession.matchStartTime || 0)
              }
            });
          }
          return;
        }

        this.fastify.log.info(`🛑 Force ending game ${gameId} because ${userId} disconnected.`);

        // Clear intervals
        if (gameSession.gameLoopInterval) {
          clearInterval(gameSession.gameLoopInterval);
          gameSession.gameLoopInterval = null;
        }
        if (gameSession.botInterval) {
          clearInterval(gameSession.botInterval);
          gameSession.botInterval = null;
        }
        if (gameSession.matchTimer) {
          clearTimeout(gameSession.matchTimer);
          gameSession.matchTimer = null;
        }

        // Determine IDs
        const player1Id = gameSession.players[0] || 'unknown';
        const player2Id = gameSession.players[1] || 'unknown';
        const isP1 = player1Id === userId;
        const opponentId = isP1 ? player2Id : player1Id;

        // Scores - Forfeit Logic
        // If it's a forfeit, set score to 5-0 for the winner
        gameSession.leftScore = isP1 ? 0 : 5;
        gameSession.rightScore = isP1 ? 5 : 0;

        // Also update the in-memory scores used for saving
        const p1Score = isP1 ? 0 : 5;
        const p2Score = isP1 ? 5 : 0;

        // Assign XP: Disconnector gets FORFEIT_XP (0), Opponent gets WIN
        const p1Exp = isP1 ? this.FORFEIT_XP : this.WIN_XP;
        const p2Exp = isP1 ? this.WIN_XP : this.FORFEIT_XP;

        // End Match Logic (this will notify everyone, including the opponent)
        // We use 'handleMatchEnd' which broadcasts to all players in the session.
        this.handleMatchEnd(userId, {
          gameId,
          player1Id,
          player1Exp: p1Exp,
          player2Id,
          player2Exp: p2Exp,
          matchDurationMs: Date.now() - (gameSession.matchStartTime || 0),
          timestamp: Date.now()
        });

        // Break after handling the game
        break;
      }
    }
  }


  /**
   * Retrieves the Game ID for a given player ID if they are in an active session.
   */
  getGameIdByPlayerId(userId: string): string | undefined {
    // 1. Check active game sessions
    for (const [gameId, session] of this.gameSessions.entries()) {
      if (session.players.includes(userId) && session.status !== 'completed') {
        return gameId;
      }
    }
    return undefined;
  }

  /**
   * Retrieves current service statistics.
   */
  getStats(): GameStats {
    return {
      activeConnections: this.activeConnections.size,
      gameSessions: this.gameSessions.size,
      matchmakingQueue: this.matchmakingQueue.length
    };
  }

  /**
   * Sends a message to a specific player.
   */
  notifyPlayer(userId: string, message: any): void {
    const connection = this.activeConnections.get(userId);
    if (connection?.readyState === 1) {
      this.fastify.log.debug(`✅ Sending ${message.type} to ${userId}`);
      connection.send(JSON.stringify(message));
    } else {
      this.fastify.log.debug(`❌ No active connection for ${userId}`);
    }
  }

  /**
   * Sends a message to multiple players.
   */
  notifyPlayers(userIds: string[], message: any): void {
    userIds.forEach(userId => {
      // Create a shallow copy of the message to avoid mutating the original for other players
      const personalizedMessage = { ...message };

      // If this is a match_ended event, inject the specific XP earned by this player
      if (message.type === 'match_ended' && message.payload?.finalScores) {
        personalizedMessage.payload = {
          ...message.payload,
          xpEarned: message.payload.finalScores[userId] || 0
        };
      }

      this.notifyPlayer(userId, personalizedMessage);
    });
  }

  // ============================================================================
  // TOURNAMENT METHODS
  // ============================================================================

  /**
   * Handles tournament actions (create, join, leave, start, get_info)
   */
  async handleTournamentAction(userId: string, payload: TournamentActionInput): Promise<any> {
    this.fastify.log.info(payload, `🏆 Tournament action from ${userId}:`);

    switch (payload.action) {
      case 'create':
        if (!payload.tournamentData) {
          throw new Error('Tournament data required for create action');
        }
        return await this.createTournament(userId, payload.tournamentData as TournamentCreateInput);

      case 'join':
        if (!payload.tournamentId) {
          throw new Error('Tournament ID required for join action');
        }
        return await this.joinTournament(userId, payload.tournamentId, (payload.tournamentData as any)?.password);

      case 'leave':
        if (!payload.tournamentId) {
          throw new Error('Tournament ID required for leave action');
        }
        return await this.leaveTournament(userId, payload.tournamentId);

      case 'start':
        if (!payload.tournamentId) {
          throw new Error('Tournament ID required for start action');
        }
        return await this.startTournament(userId, payload.tournamentId);

      case 'get_info':
        if (!payload.tournamentId) {
          throw new Error('Tournament ID required for get_info action');
        }
        return this.getTournamentInfo(payload.tournamentId);

      default:
        throw new Error(`Unknown tournament action: ${(payload as any).action}`);
    }
  }

  /**
   * Creates a new tournament
   */
  private async createTournament(creatorId: string, tournamentData: TournamentCreateInput): Promise<any> {
    // Validate max players is power of 2
    if (!this.isPowerOfTwo(tournamentData.maxPlayers)) {
      throw new Error('Max players must be a power of 2 (4, 8, 16, 32, 64)');
    }

    const tournament: Tournament = {
      id: `tournament-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: tournamentData.name,
      creatorId,
      maxPlayers: tournamentData.maxPlayers,
      isPrivate: tournamentData.isPrivate,
      status: 'waiting_for_players',
      players: [],
      bracket: [],
      currentRound: 1,
      winnerId: null,
      createdAt: new Date(),
      ...(tournamentData.description && { description: tournamentData.description }),
      ...(tournamentData.password && { password: tournamentData.password })
    };

    this.tournaments.set(tournament.id, tournament);

    // Automatically join the creator
    await this.joinTournament(creatorId, tournament.id);

    this.fastify.log.info(`🏆 Tournament "${tournament.name}" created with ID: ${tournament.id}`);

    return {
      success: true,
      tournament: this.sanitizeTournamentForClient(tournament)
    };
  }

  /**
   * Allows a player to join a tournament
   */
  private async joinTournament(playerId: string, tournamentId: string, password?: string): Promise<any> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Check if player is already in a tournament
    if (this.playerTournaments.has(playerId)) {
      throw new Error('Player is already in a tournament');
    }

    // Check password for private tournaments
    if (tournament.isPrivate && tournament.password !== password) {
      throw new Error('Invalid password');
    }

    // Check if tournament is full
    if (tournament.players.length >= tournament.maxPlayers) {
      throw new Error('Tournament is full');
    }

    // Check if tournament has already started
    if (tournament.status !== 'waiting_for_players') {
      throw new Error('Tournament has already started');
    }

    // Check if player is already in the tournament
    if (tournament.players.some(p => p.id === playerId)) {
      throw new Error('Player is already in this tournament');
    }

    // Add player to tournament
    const player: TournamentPlayer = {
      id: playerId,
      name: `Player ${playerId}`,
      joinedAt: new Date(),
      isEliminated: false
    };

    tournament.players.push(player);
    this.playerTournaments.set(playerId, tournamentId);

    // Notify all players in the tournament
    this.notifyTournamentPlayers(tournamentId, {
      type: 'tournament_player_joined',
      payload: {
        tournamentId,
        player,
        totalPlayers: tournament.players.length,
        maxPlayers: tournament.maxPlayers
      }
    });

    this.fastify.log.info(`🏆 Player ${playerId} joined tournament ${tournamentId} (${tournament.players.length}/${tournament.maxPlayers})`);

    return {
      success: true,
      tournament: this.sanitizeTournamentForClient(tournament),
      message: `Joined tournament "${tournament.name}"`
    };
  }

  /**
   * Removes a player from a tournament
   */
  private async leaveTournament(playerId: string, tournamentId: string): Promise<any> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const playerIndex = tournament.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error('Player not in this tournament');
    }

    // Check if tournament has started
    if (tournament.status === 'in_progress') {
      // Mark player as eliminated instead of removing
      const player = tournament.players[playerIndex];
      if (player) {
        player.isEliminated = true;
      }
      this.playerTournaments.delete(playerId);

      this.notifyTournamentPlayers(tournamentId, {
        type: 'tournament_player_eliminated',
        payload: {
          tournamentId,
          playerId,
          reason: 'disconnected'
        }
      });

      return { success: true, message: 'Marked as eliminated due to leaving during tournament' };
    }

    // Remove player if tournament hasn't started
    tournament.players.splice(playerIndex, 1);
    this.playerTournaments.delete(playerId);

    // If creator left and tournament is empty, delete tournament
    if (tournament.creatorId === playerId && tournament.players.length === 0) {
      this.tournaments.delete(tournamentId);
      return { success: true, message: 'Left tournament (tournament deleted)' };
    }

    // If creator left but tournament has other players, transfer ownership
    if (tournament.creatorId === playerId && tournament.players.length > 0) {
      const newCreator = tournament.players[0];
      if (newCreator) {
        tournament.creatorId = newCreator.id;
      }
    }

    this.notifyTournamentPlayers(tournamentId, {
      type: 'tournament_player_left',
      payload: {
        tournamentId,
        playerId,
        totalPlayers: tournament.players.length,
        maxPlayers: tournament.maxPlayers
      }
    });

    return { success: true, message: 'Left tournament' };
  }

  /**
   * Starts a tournament if conditions are met
   */
  private async startTournament(playerId: string, tournamentId: string): Promise<any> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Check if player is the creator
    if (tournament.creatorId !== playerId) {
      throw new Error('Only the tournament creator can start the tournament');
    }

    // Check if tournament has already started
    if (tournament.status !== 'waiting_for_players') {
      throw new Error('Tournament has already started or completed');
    }

    // Check minimum players (at least 4)
    if (tournament.players.length < 4) {
      throw new Error('Tournament needs at least 4 players to start');
    }

    // Check if player count is power of 2
    if (!this.isPowerOfTwo(tournament.players.length)) {
      throw new Error('Player count must be a power of 2 to create a proper bracket');
    }

    // Generate tournament bracket
    this.generateTournamentBracket(tournament);

    tournament.status = 'in_progress';
    tournament.startedAt = new Date();

    // Start first round matches
    await this.startTournamentRound(tournamentId, 1);

    this.notifyTournamentPlayers(tournamentId, {
      type: 'tournament_started',
      payload: {
        tournamentId,
        tournament: this.sanitizeTournamentForClient(tournament)
      }
    });

    this.fastify.log.info(`🏆 Tournament ${tournamentId} started with ${tournament.players.length} players`);

    return {
      success: true,
      tournament: this.sanitizeTournamentForClient(tournament),
      message: 'Tournament started!'
    };
  }

  /**
   * Gets tournament information
   */
  private getTournamentInfo(tournamentId: string): any {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    return {
      success: true,
      tournament: this.sanitizeTournamentForClient(tournament)
    };
  }

  /**
   * Get available tournaments (public or waiting)
   */
  getAvailableTournaments(): any {
    const tournaments = Array.from(this.tournaments.values())
      .filter(t => !t.isPrivate || t.status === 'waiting_for_players')
      .map(t => this.sanitizeTournamentForClient(t));

    return { success: true, tournaments };
  }

  /**
   * Get tournaments where the user is owner or participant
   */
  getUserTournaments(userId: string): any {
    const tournaments = Array.from(this.tournaments.values())
      .filter(t => t.creatorId === userId || t.players.some(p => p.id === userId))
      .map(t => this.sanitizeTournamentForClient(t));

    return { success: true, tournaments };
  }

  /**
   * Report a match result by tournament and match id
   */
  async reportMatchResultById(tournamentId: string, matchId: string, winnerId: string): Promise<any> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) throw new Error('Tournament not found');

    const match = tournament.bracket.find(m => m.id === matchId);
    if (!match) throw new Error('Match not found');

    if (!match.gameId) throw new Error('Match has no associated game session');

    return await this.processTournamentGameResult(tournamentId, { gameId: match.gameId, winnerId });
  }

  /**
   * Generates a tournament bracket with proper seeding
   */
  private generateTournamentBracket(tournament: Tournament): void {
    const players = [...tournament.players];
    const totalRounds = Math.log2(players.length);

    // Shuffle players for random seeding
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const playerI = players[i];
      const playerJ = players[j];
      if (playerI && playerJ) {
        [players[i], players[j]] = [playerJ, playerI];
      }
    }

    // Generate first round matches
    for (let i = 0; i < players.length; i += 2) {
      const player1 = players[i];
      const player2 = players[i + 1];

      const match: TournamentMatch = {
        id: `match-${tournament.id}-1-${i / 2 + 1}`,
        round: 1,
        player1: player1 || null,
        player2: player2 || null,
        winner: null,
        gameId: null,
        status: 'waiting'
      };
      tournament.bracket.push(match);
    }

    // Generate subsequent rounds (empty matches to be filled by winners)
    let matchesInRound = players.length / 2;
    for (let round = 2; round <= totalRounds; round++) {
      matchesInRound = matchesInRound / 2;
      for (let i = 0; i < matchesInRound; i++) {
        const match: TournamentMatch = {
          id: `match-${tournament.id}-${round}-${i + 1}`,
          round,
          player1: null,
          player2: null,
          winner: null,
          gameId: null,
          status: 'waiting'
        };
        tournament.bracket.push(match);
      }
    }
  }

  /**
   * Starts a tournament round by creating game sessions for all matches
   */
  private async startTournamentRound(tournamentId: string, round: number): Promise<void> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const roundMatches = tournament.bracket.filter(m => m.round === round && m.status === 'waiting');

    for (const match of roundMatches) {
      if (match.player1 && match.player2) {
        // Create game session for this match
        const gameSession = await this.createTournamentGameSession(
          match.player1.id,
          match.player2.id,
          tournamentId,
          match.id
        );

        match.gameId = gameSession.id;
        match.status = 'in_progress';

        this.fastify.log.info(`🎮 Started tournament match: ${match.player1.name} vs ${match.player2.name}`);
      }
    }

    this.notifyTournamentPlayers(tournamentId, {
      type: 'tournament_round_started',
      payload: {
        tournamentId,
        round,
        matches: roundMatches.map(m => this.sanitizeMatchForClient(m))
      }
    });
  }

  /**
   * Creates a game session specifically for tournament matches
   */
  private async createTournamentGameSession(player1Id: string, player2Id: string, tournamentId: string, matchId: string): Promise<any> {
    const gameSession = {
      id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      players: [player1Id, player2Id],
      gameType: 'tournament',
      status: 'starting' as const,
      createdAt: new Date(),
      tournamentId,
      matchId,
      isBotGame: false,
      expScores: {
        [player1Id]: 0,
        [player2Id]: 0
      },
      matchStartTime: null,
      matchTimer: null,
      MATCH_DURATION_MS: 60000,
      readyPlayers: new Set([player1Id, player2Id])
    };

    this.gameSessions.set(gameSession.id, gameSession as any);

    // Notify both players that match is ready
    this.notifyPlayer(player1Id, {
      type: 'tournament_match_ready',
      payload: { ...gameSession, yourPlayerId: player1Id }
    });

    this.notifyPlayer(player2Id, {
      type: 'tournament_match_ready',
      payload: { ...gameSession, yourPlayerId: player2Id }
    });

    // Auto-start tournament games after a brief delay
    setTimeout(() => {
      this.fastify.log.info(`🚀 Auto-starting tournament game: ${gameSession.id}`);
      this.startGame(gameSession.id);
    }, 2000);

    return gameSession;
  }

  /**
   * Processes game results for tournament matches
   */
  private async processTournamentGameResult(tournamentId: string, result: GameResultInput): Promise<any> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const gameSession = this.gameSessions.get(result.gameId);
    if (!gameSession || !(gameSession as any).matchId) {
      throw new Error('Tournament match not found');
    }

    const match = tournament.bracket.find(m => m.id === (gameSession as any).matchId);
    if (!match) {
      throw new Error('Tournament match not found in bracket');
    }

    // Find winner player object
    const winnerPlayer = tournament.players.find(p => p.id === result.winnerId);
    if (!winnerPlayer) {
      throw new Error('Winner not found in tournament');
    }

    // Update match result
    match.winner = winnerPlayer;
    match.status = 'completed';

    // Mark loser as eliminated
    const loserId = gameSession.players.find((id: string) => id !== result.winnerId);
    if (loserId) {
      const loserPlayer = tournament.players.find(p => p.id === loserId);
      if (loserPlayer) {
        loserPlayer.isEliminated = true;
      }
    }

    this.fastify.log.info(`🏆 Tournament match completed: ${winnerPlayer.name} won!`);

    // Check if round is complete
    const currentRoundMatches = tournament.bracket.filter(m => m.round === tournament.currentRound);
    const completedMatches = currentRoundMatches.filter(m => m.status === 'completed');

    if (completedMatches.length === currentRoundMatches.length) {
      // Round completed, advance to next round or end tournament
      await this.advanceTournamentRound(tournamentId);
    }

    this.notifyTournamentPlayers(tournamentId, {
      type: 'tournament_match_completed',
      payload: {
        tournamentId,
        matchId: match.id,
        winner: winnerPlayer,
        match: this.sanitizeMatchForClient(match)
      }
    });

    return { success: true, message: 'Tournament match result processed' };
  }

  /**
   * Advances tournament to the next round or completes it
   */
  private async advanceTournamentRound(tournamentId: string): Promise<void> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;

    const currentRoundMatches = tournament.bracket.filter(m => m.round === tournament.currentRound);
    const winners = currentRoundMatches.map(m => m.winner).filter(Boolean);

    // Check if this was the final
    if (winners.length === 1) {
      // Tournament completed
      tournament.status = 'completed';
      tournament.winnerId = winners[0]!.id;
      tournament.completedAt = new Date();

      // Clean up player tournament mapping
      tournament.players.forEach(player => {
        this.playerTournaments.delete(player.id);
      });

      this.notifyTournamentPlayers(tournamentId, {
        type: 'tournament_completed',
        payload: {
          tournamentId,
          winner: winners[0],
          tournament: this.sanitizeTournamentForClient(tournament)
        }
      });

      this.fastify.log.info(`🏆 Tournament ${tournamentId} completed! Winner: ${winners[0]!.name}`);
      return;
    }

    // Advance to next round
    tournament.currentRound++;
    const nextRoundMatches = tournament.bracket.filter(m => m.round === tournament.currentRound);

    // Pair up winners for next round
    for (let i = 0; i < winners.length; i += 2) {
      const match = nextRoundMatches[i / 2];
      if (match) {
        match.player1 = winners[i] || null;
        match.player2 = winners[i + 1] || null;
      }
    }

    // Start next round
    await this.startTournamentRound(tournamentId, tournament.currentRound);

    this.fastify.log.info(`🏆 Tournament ${tournamentId} advanced to round ${tournament.currentRound}`);
  }

  /**
   * Utility to check if a number is a power of 2
   */
  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  /**
   * Sanitizes tournament data for client consumption
   */
  private sanitizeTournamentForClient(tournament: Tournament): any {
    const { password, ...sanitized } = tournament;
    return sanitized;
  }

  /**
   * Sanitizes match data for client consumption
   */
  private sanitizeMatchForClient(match: TournamentMatch): any {
    return {
      id: match.id,
      round: match.round,
      player1: match.player1 ? { id: match.player1.id, name: match.player1.name } : null,
      player2: match.player2 ? { id: match.player2.id, name: match.player2.name } : null,
      winner: match.winner ? { id: match.winner.id, name: match.winner.name } : null,
      status: match.status
    };
  }

  /**
   * Sends a message to all players in a tournament
   */
  private notifyTournamentPlayers(tournamentId: string, message: any): void {
    const tournament = this.tournaments.get(tournamentId);
    if (tournament) {
      tournament.players.forEach(player => {
        this.notifyPlayer(player.id, message);
      });
    }
  }

  /**
   * Cleans up all service resources.
   */
  destroy(): void {
    if (this.matchmakingInterval) {
      clearInterval(this.matchmakingInterval);
    }

    this.botIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.botIntervals.clear();

    this.readyTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.readyTimeouts.clear();

    this.gameSessions.clear();
    this.activeConnections.clear();
    this.botConnections.clear();
    this.tournaments.clear();
    this.playerTournaments.clear();
  }
}
