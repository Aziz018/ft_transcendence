import type { FastifyRequest, FastifyReply } from "fastify";
import { WebSocket } from "ws";

type ExtendedWS = WebSocket & {
  id: string;
  authenticatedUser?: { uid: string; id: string; name: string };
};

/**
 * WebSocket handler for real-time Pong game
 */
export const gameWebSocketHandler = async (connection: ExtendedWS, request: FastifyRequest) => {
  const token = extractTokenFromRequest(request);

  if (!token) {
    request.log.error('❌ No token provided');
    connection.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
    connection.close();
    return;
  }

  try {
    const decoded = request.server.jwt.verify(token) as any;

    if (decoded.mfa_required) {
      request.log.error('❌ MFA required for user');
      connection.send(JSON.stringify({ type: 'error', message: 'MFA verification required' }));
      connection.close();
      return;
    }

    connection.authenticatedUser = {
      uid: decoded.uid || decoded.id,
      id: decoded.id,
      name: decoded.name || decoded.email || 'Player'
    };
  } catch (error) {
    request.log.error({ error }, '❌ Invalid token');
    connection.send(JSON.stringify({ type: 'error', message: 'Invalid or expired token' }));
    connection.close();
    return;
  }

  const userId = connection.authenticatedUser.uid;
  connection.id = crypto.randomUUID();
  request.log.info(`🔗 User ${userId} (${connection.authenticatedUser.name}) connected to game (ConnID: ${connection.id})`);

  // Access game service from fastify instance
  const gameService = request.server.service.game;
  gameService.addConnection(userId, connection);
  request.log.info(`🔗 User ${userId} connected. ${gameService.getStats().activeConnections} total connections`);

  connection.on('message', async (message: Buffer) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      request.log.debug(`📨 Received from ${userId}:`, parsedMessage);

      if (parsedMessage.type === 'ping') {
        connection.send(JSON.stringify({ type: 'pong', userId }));
        return;
      }

      switch (parsedMessage.type) {
        case 'player_move':
          await gameService.handlePlayerMove(userId, parsedMessage.payload);
          break;

        case 'game_join':
          const joinResult = await gameService.handleGameJoin(userId, parsedMessage.payload);
          connection.send(JSON.stringify({
            type: 'game_join_result',
            payload: joinResult
          }));
          break;

        case 'leave_game':
          await gameService.handleLeaveGame(userId);
          break;

        case 'matchmaking':
          const matchmakingResult = await gameService.handleMatchmaking(userId, parsedMessage.payload);
          connection.send(JSON.stringify({
            type: 'matchmaking_result',
            payload: matchmakingResult
          }));
          break;

        case 'game_ready':
          await gameService.handleGameReady(userId, parsedMessage.payload);
          break;

        case 'score_update':
          const scoreUpdateResult = await gameService.handleScoreUpdate(userId, parsedMessage.payload);
          connection.send(JSON.stringify({
            type: 'score_update_ack',
            payload: scoreUpdateResult
          }));
          break;

        case 'match_end':
          const matchEndResult = await gameService.handleMatchEnd(userId, parsedMessage.payload);
          connection.send(JSON.stringify({
            type: 'match_end_ack',
            payload: matchEndResult
          }));
          break;

        case 'tournament':
          const tournamentResult = await gameService.handleTournamentAction(userId, parsedMessage.payload);
          connection.send(JSON.stringify({
            type: 'tournament_action_result',
            payload: tournamentResult
          }));
          break;

        default:
          request.log.warn(`❌ Unknown message type: ${parsedMessage.type}`);
          connection.send(JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${parsedMessage.type}`
          }));
      }
    } catch (error) {
      request.log.error({ error }, '❌ Error processing message');
      connection.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format or validation failed'
      }));
    }
  });

  connection.on('close', () => {
    request.log.info(`🔌 User ${userId} disconnected from game`);
    gameService.removeConnection(userId, connection);
    request.log.debug(gameService.getStats(), `📊 Stats:`);
  });

  connection.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to game server',
    userId: userId,
    stats: gameService.getStats()
  }));
};

/**
 * Extract JWT token from request (query param or header)
 */
function extractTokenFromRequest(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const query = request.query as any;
  if (query.token) {
    return query.token;
  }

  return null;
}

/**
 * Get player statistics
 */
export const getPlayerStatsController = async (
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { userId } = request.params;
    const gameService = request.server.service.game;

    let stats = await gameService.prisma.playerStats.findUnique({
      where: { userId }
    });

    if (!stats) {
      stats = await gameService.prisma.playerStats.create({
        data: { userId }
      });
    }

    reply.send({ stats });
  } catch (error) {
    request.log.error({ error }, 'Failed to get player stats');
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Get recent games for a player
 */
export const getRecentGamesController = async (
  request: FastifyRequest<{ Params: { userId: string }; Querystring: { limit?: string } }>,
  reply: FastifyReply
): Promise<void> => {
  try {
    const { userId } = request.params;
    const limit = parseInt(request.query.limit || '10');
    const gameService = request.server.service.game;

    // 1. Fetch History
    const games = await gameService.prisma.gameHistory.findMany({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }]
      },
      orderBy: { playedAt: 'desc' },
      take: limit
    });

    // 2. Fetch related data (XP from Session, Avatars from User)
    const sessionIds = games.map(g => g.gameSessionId);
    const userIds = Array.from(new Set(games.flatMap(g => [g.player1Id, g.player2Id])));

    const [sessions, users] = await Promise.all([
      gameService.prisma.gameSession.findMany({
        where: { id: { in: sessionIds } },
        select: { id: true, player1Exp: true, player2Exp: true }
      }),
      gameService.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, avatar: true }
      })
    ]);

    // 3. Create lookups for faster merging
    const sessionMap = new Map(sessions.map(s => [s.id, s]));
    const userMap = new Map(users.map(u => [u.id, u]));

    // 4. Merge Data
    const enrichedGames = games.map(game => {
      const session = sessionMap.get(game.gameSessionId);
      const p1User = userMap.get(game.player1Id);
      const p2User = userMap.get(game.player2Id);

      return {
        ...game,
        player1Exp: session?.player1Exp || 0,
        player2Exp: session?.player2Exp || 0,
        player1Avatar: p1User?.avatar || "",
        player2Avatar: p2User?.avatar || ""
      };
    });

    reply.send({ games: enrichedGames });
  } catch (error) {
    request.log.error({ error }, 'Failed to get recent games');
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};

/**
 * Get current game stats
 */
export const getGameStatsController = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const gameService = request.server.service.game;
    const stats = gameService.getStats();

    reply.send({ stats });
  } catch (error) {
    request.log.error({ error }, 'Failed to get game stats');
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};
