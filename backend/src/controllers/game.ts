import { WebSocket } from "ws";
import { prisma } from "../utils/prisma.js";

interface ExtendedWS extends WebSocket {
    userData?: { userId: string; rooms: Set<string> };
    authenticatedUser?: any;
}

interface Player {
    id: string;
    ws: ExtendedWS;
    name: string;
    avatar: string;
}

interface GameState {
    gameId: string;
    leftPlayer: Player;
    rightPlayer: Player;

    ballX: number;
    ballY: number;
    ballVX: number;
    ballVY: number;

    leftPaddleY: number;
    rightPaddleY: number;

    leftPaddleDy: number;
    rightPaddleDy: number;

    leftScore: number;
    rightScore: number;

    status: "waiting" | "playing" | "paused" | "finished";
    startTime: number;
    pausedAt?: number;
    pausedBy?: string;
}

const GAME_WIDTH = 1150;
const GAME_HEIGHT = 534;
const PADDLE_HEIGHT = 144;
const PADDLE_WIDTH = 20;
const PADDLE_SPEED = 8;
const BALL_SIZE = 20;
const BALL_SPEED = 5;
const GAME_DURATION_MS = 60000; // 60 seconds

export class GameManager {
    private static instance: GameManager;
    private queue: Player[] = [];
    private activeGames: Map<string, GameState> = new Map(); // gameId -> GameState
    private playerGameMap: Map<string, string> = new Map(); // userId -> gameId

    private constructor() {
        this.startGameLoop();
    }

    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    public handleConnection(ws: ExtendedWS, userId: string) {
        // Check if user is already in a game (reconnection logic could go here)
        if (this.playerGameMap.has(userId)) {
            const gameId = this.playerGameMap.get(userId)!;
            const game = this.activeGames.get(gameId);
            if (game && game.status === "playing") {
                // Simple re-attach logic: update ws reference
                if (game.leftPlayer.id === userId) game.leftPlayer.ws = ws;
                else if (game.rightPlayer.id === userId) game.rightPlayer.ws = ws;

                // Send current state immediately
                this.sendGameState(game);
                return;
            }
        }
    }

    public handleDisconnect(userId: string) {
        // Remove from queue
        this.queue = this.queue.filter(p => p.id !== userId);

        // End active game if playing
        if (this.playerGameMap.has(userId)) {
            const gameId = this.playerGameMap.get(userId)!;
            const game = this.activeGames.get(gameId);

            if (game) {
                // Notify other player and end game
                const winner = game.leftPlayer.id === userId ? game.rightPlayer : game.leftPlayer;
                this.endGame(game, winner.id, "Opponent disconnected");
            }
        }
    }

    public joinQueue(ws: ExtendedWS, user: any) {
        const userId = user.uid;

        // return if already in queue
        if (this.queue.some(p => p.id === userId)) return;

        // return if already in game
        if (this.playerGameMap.has(userId)) return;

        const player: Player = {
            id: userId,
            ws,
            name: user.name,
            avatar: user.avatar || "",
        };

        this.queue.push(player);
        console.log(`[GameManager] User ${user.name} joined queue. Queue size: ${this.queue.length}`);

        if (this.queue.length >= 2) {
            const p1 = this.queue.shift()!;
            const p2 = this.queue.shift()!;
            this.createGame(p1, p2);
        }
    }

    public leaveQueue(userId: string) {
        this.queue = this.queue.filter(p => p.id !== userId);
    }

    public togglePause(userId: string) {
        const gameId = this.playerGameMap.get(userId);
        if (!gameId) return;

        const game = this.activeGames.get(gameId);
        if (!game || game.status === "finished") return;

        if (game.status === "playing") {
            game.status = "paused";
            game.pausedAt = Date.now();
            game.pausedBy = userId;
        } else if (game.status === "paused" && game.pausedBy === userId) {
            game.status = "playing";
            // Adjust startTime so the duration doesn't count the paused time
            const pausedDuration = Date.now() - (game.pausedAt || 0);
            game.startTime += pausedDuration;
            game.pausedAt = undefined;
            game.pausedBy = undefined;
        }

        this.sendGameState(game);
    }

    public movePaddle(userId: string, direction: number) {
        const gameId = this.playerGameMap.get(userId);
        if (!gameId) return;

        const game = this.activeGames.get(gameId);
        if (!game || game.status !== "playing") return;

        // Direction: -1 (Up), 0 (Stop), 1 (Down)
        // Ensure strictly -1, 0, or 1
        const dir = direction > 0 ? 1 : direction < 0 ? -1 : 0;

        if (game.leftPlayer.id === userId) {
            game.leftPaddleDy = dir;
        } else {
            game.rightPaddleDy = dir;
        }
    }

    private createGame(p1: Player, p2: Player) {
        const gameId = `g-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const game: GameState = {
            gameId,
            leftPlayer: p1,
            rightPlayer: p2,
            ballX: GAME_WIDTH / 2,
            ballY: GAME_HEIGHT / 2,
            ballVX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
            ballVY: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
            leftPaddleY: (GAME_HEIGHT - PADDLE_HEIGHT) / 2,
            rightPaddleY: (GAME_HEIGHT - PADDLE_HEIGHT) / 2,
            leftScore: 0,
            rightScore: 0,
            status: "playing",
            startTime: Date.now(),
            leftPaddleDy: 0,
            rightPaddleDy: 0,
        };

        this.activeGames.set(gameId, game);
        this.playerGameMap.set(p1.id, gameId);
        this.playerGameMap.set(p2.id, gameId);

        // Notify Start
        this.send(p1.ws, {
            type: "game_start",
            payload: {
                gameId,
                opponentName: p2.name,
                opponentAvatar: p2.avatar,
                side: "left"
            }
        });
        this.send(p2.ws, {
            type: "game_start",
            payload: {
                gameId,
                opponentName: p1.name,
                opponentAvatar: p1.avatar,
                side: "right"
            }
        });

        console.log(`[GameManager] Game started: ${p1.name} vs ${p2.name}`);
    }

    private endGame(game: GameState, winnerId: string | null, reasonString?: string) {
        game.status = "finished";

        // Save to DB (optional, can be async)
        this.saveGameResult(game, winnerId);

        // Notify Players
        const payload = {
            winnerId,
            reason: reasonString,
            xpEarned: 50, // simple XP logic
        };

        this.send(game.leftPlayer.ws, { type: "game_over", payload });
        this.send(game.rightPlayer.ws, { type: "game_over", payload });

        // Cleanup
        this.activeGames.delete(game.gameId);
        this.playerGameMap.delete(game.leftPlayer.id);
        this.playerGameMap.delete(game.rightPlayer.id);
    }

    private async saveGameResult(game: GameState, winnerId: string | null) {
        try {
            await prisma.game.create({
                data: {
                    player1Id: game.leftPlayer.id,
                    player2Id: game.rightPlayer.id,
                    score1: game.leftScore,
                    score2: game.rightScore,
                    winnerId: winnerId,
                    duration: Math.floor((Date.now() - game.startTime) / 1000)
                }
            });

            // Award XP only if there is a winner
            if (winnerId) {
                await prisma.user.update({
                    where: { id: winnerId },
                    data: { xp: { increment: 50 } }
                });
            }

        } catch (e) {
            console.error("Failed to save game result:", e);
        }
    }

    private startGameLoop() {
        setInterval(() => {
            this.activeGames.forEach(game => {
                if (game.status === "playing") {
                    this.updateGame(game);
                }
            });
        }, 1000 / 60); // 60 FPS
    }

    private updateGame(game: GameState) {
        // Move Ball
        game.ballX += game.ballVX;
        game.ballY += game.ballVY;

        // Move Paddles
        if (game.leftPaddleDy !== 0) {
            game.leftPaddleY += game.leftPaddleDy * PADDLE_SPEED;
            // Clamp
            game.leftPaddleY = Math.max(0, Math.min(game.leftPaddleY, GAME_HEIGHT - PADDLE_HEIGHT));
        }

        if (game.rightPaddleDy !== 0) {
            game.rightPaddleY += game.rightPaddleDy * PADDLE_SPEED;
            // Clamp
            game.rightPaddleY = Math.max(0, Math.min(game.rightPaddleY, GAME_HEIGHT - PADDLE_HEIGHT));
        }

        // Wall Collision (Top/Bottom)
        if (game.ballY <= 0 || game.ballY + BALL_SIZE >= GAME_HEIGHT) {
            game.ballVY *= -1;
        }

        // Paddle Collision
        // Left Paddle
        if (
            game.ballX <= PADDLE_WIDTH &&
            game.ballY + BALL_SIZE >= game.leftPaddleY &&
            game.ballY <= game.leftPaddleY + PADDLE_HEIGHT
        ) {
            game.ballVX = Math.abs(game.ballVX); // Bounce right
            game.ballVX *= 1.05; // speed up
        }

        // Right Paddle
        if (
            game.ballX + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
            game.ballY + BALL_SIZE >= game.rightPaddleY &&
            game.ballY <= game.rightPaddleY + PADDLE_HEIGHT
        ) {
            game.ballVX = -Math.abs(game.ballVX); // Bounce left
            game.ballVX *= 1.05; // speed up
        }

        // Scoring
        if (game.ballX < 0) {
            game.rightScore++;
            this.resetBall(game);
        } else if (game.ballX > GAME_WIDTH) {
            game.leftScore++;
            this.resetBall(game);
        }

        // Check Win Condition (e.g., score 5)
        if (game.leftScore >= 5) {
            this.endGame(game, game.leftPlayer.id, "Score Limit Reached");
            return;
        } else if (game.rightScore >= 5) {
            this.endGame(game, game.rightPlayer.id, "Score Limit Reached");
            return;
        }

        // Check Time Duration
        if (Date.now() - game.startTime >= GAME_DURATION_MS) {
            const winnerId = game.leftScore > game.rightScore ? game.leftPlayer.id :
                game.rightScore > game.leftScore ? game.rightPlayer.id :
                    "TIE";

            this.endGame(game, winnerId === "TIE" ? null : winnerId, "Time Limit Reached");
            return;
        }

        this.sendGameState(game);
        return;
    }

    private resetBall(game: GameState) {
        game.ballX = GAME_WIDTH / 2;
        game.ballY = GAME_HEIGHT / 2;
        game.ballVX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        game.ballVY = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    }

    private sendGameState(game: GameState) {
        const payload = {
            ballX: game.ballX,
            ballY: game.ballY,
            leftPaddleY: game.leftPaddleY,
            rightPaddleY: game.rightPaddleY,
            leftScore: game.leftScore,
            rightScore: game.rightScore,
            timeLeft: Math.max(0, Math.floor((GAME_DURATION_MS - (Date.now() - game.startTime)) / 1000)),
            status: game.status
        };

        this.send(game.leftPlayer.ws, { type: "game_state", payload });
        this.send(game.rightPlayer.ws, { type: "game_state", payload });
    }

    private send(ws: WebSocket, message: any) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
}

export const gameManager = GameManager.getInstance();
