import { WebSocket } from 'ws';
import { prisma } from '../utils/prisma.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;
const BALL_SIZE = 15;
const PADDLE_SPEED = 8;

interface Player {
    id: string;
    ws: WebSocket;
    name: string;
    score: number;
    y: number;
}

interface GameState {
    id: string;
    p1: Player;
    p2: Player;
    ball: { x: number; y: number; vx: number; vy: number };
    interval: NodeJS.Timeout | null;
    paused: boolean;
}

export class GameManager {
    private queue: { id: string; ws: WebSocket; name: string }[] = [];
    private games: Map<string, GameState> = new Map();

    joinQueue(ws: WebSocket, user: { uid: string; name: string }) {
        if (this.queue.find(p => p.id === user.uid)) return;
        if (this.findGameByPlayer(user.uid)) return;

        this.queue.push({ id: user.uid, ws, name: user.name });
        console.log(`[GameManager] User ${user.name} joined queue. Queue size: ${this.queue.length}`);

        // Notify user they joined queue (optional, but good for UI)
        ws.send(JSON.stringify({ type: 'queue_joined', payload: { position: this.queue.length } }));

        if (this.queue.length >= 2) {
            const p1 = this.queue.shift()!;
            const p2 = this.queue.shift()!;
            this.startGame(p1, p2);
        }
    }

    leaveQueue(id: string) {
        this.queue = this.queue.filter(p => p.id !== id);
        console.log(`[GameManager] User ${id} left queue.`);
    }

    movePaddle(userId: string, position: number) {
        const game = this.findGameByPlayer(userId);
        if (!game) return;

        if (game.p1.id === userId) {
            game.p1.y = position;
        } else {
            game.p2.y = position;
        }
    }

    private findGameByPlayer(id: string): GameState | undefined {
        for (const game of this.games.values()) {
            if (game.p1.id === id || game.p2.id === id) return game;
        }
        return undefined;
    }

    pauseGame(userId: string) {
        const game = this.findGameByPlayer(userId);
        if (!game) return;

        game.paused = !game.paused;
        const msg = JSON.stringify({ type: 'game:paused', payload: { paused: game.paused } });

        if (game.p1.ws.readyState === WebSocket.OPEN) game.p1.ws.send(msg);
        if (game.p2.ws.readyState === WebSocket.OPEN) game.p2.ws.send(msg);
    }

    private startGame(u1: { id: string; ws: WebSocket; name: string }, u2: { id: string; ws: WebSocket; name: string }) {
        const gameId = `game_${Date.now()}_${Math.random()}`;
        console.log(`[GameManager] Starting game ${gameId} between ${u1.name} and ${u2.name}`);

        const state: GameState = {
            id: gameId,
            p1: { ...u1, score: 0, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
            p2: { ...u2, score: 0, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
            ball: {
                x: CANVAS_WIDTH / 2,
                y: CANVAS_HEIGHT / 2,
                vx: (Math.random() > 0.5 ? 1 : -1) * 5,
                vy: (Math.random() - 0.5) * 5
            },
            interval: null,
            paused: false
        };

        this.games.set(gameId, state);

        // Notify Start
        const startPayload = {
            gameId,
            player1: { id: u1.id, name: u1.name },
            player2: { id: u2.id, name: u2.name },
            ball: state.ball
        };
        u1.ws.send(JSON.stringify({ type: 'game:start', payload: startPayload }));
        u2.ws.send(JSON.stringify({ type: 'game:start', payload: startPayload }));

        // Start Loop
        state.interval = setInterval(() => this.updateGame(state), 1000 / 60); // 60 FPS
    }

    private updateGame(state: GameState) {
        if (state.paused) return;

        // Update Ball
        state.ball.x += state.ball.vx;
        state.ball.y += state.ball.vy;

        // Collision Walls
        if (state.ball.y <= 0 || state.ball.y + BALL_SIZE >= CANVAS_HEIGHT) {
            state.ball.vy *= -1;
        }

        // Collision Paddles
        // P1 (Left)
        if (state.ball.x <= PADDLE_WIDTH &&
            state.ball.y + BALL_SIZE >= state.p1.y &&
            state.ball.y <= state.p1.y + PADDLE_HEIGHT) {
            state.ball.vx *= -1.1;
            state.ball.x = PADDLE_WIDTH;
        }
        // P2 (Right)
        if (state.ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE &&
            state.ball.y + BALL_SIZE >= state.p2.y &&
            state.ball.y <= state.p2.y + PADDLE_HEIGHT) {
            state.ball.vx *= -1.1;
            state.ball.x = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE;
        }

        // Scoring
        if (state.ball.x <= 0) {
            state.p2.score++;
            this.resetBall(state);
        } else if (state.ball.x >= CANVAS_WIDTH) {
            state.p1.score++;
            this.resetBall(state);
        }

        // Send Update
        const update = {
            type: 'game:state:update',
            payload: {
                state: {
                    id: state.id,
                    status: 'playing',
                    ball: state.ball,
                    paddle1: { y: state.p1.y, velocity: 0 },
                    paddle2: { y: state.p2.y, velocity: 0 },
                    player1: { id: state.p1.id, score: state.p1.score, name: state.p1.name },
                    player2: { id: state.p2.id, score: state.p2.score, name: state.p2.name }
                }
            }
        };

        if (state.p1.ws.readyState === WebSocket.OPEN) state.p1.ws.send(JSON.stringify(update));
        if (state.p2.ws.readyState === WebSocket.OPEN) state.p2.ws.send(JSON.stringify(update));

        // Check Win
        if (state.p1.score >= 5 || state.p2.score >= 5) {
            this.endGame(state);
        }
    }

    private resetBall(state: GameState) {
        state.ball.x = CANVAS_WIDTH / 2;
        state.ball.y = CANVAS_HEIGHT / 2;
        state.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 5;
        state.ball.vy = (Math.random() - 0.5) * 5;
    }

    private async endGame(state: GameState) {
        if (state.interval) clearInterval(state.interval);
        this.games.delete(state.id);

        const winner = state.p1.score >= 5 ? state.p1 : state.p2;
        const loser = winner.id === state.p1.id ? state.p2 : state.p1;

        const endPayload = {
            gameId: state.id,
            winnerId: winner.id,
            winnerScore: winner.score,
            loserId: loser.id,
            loserScore: loser.score,
            xpGained: 50
        };

        const msg = JSON.stringify({ type: 'game:end', payload: endPayload });
        if (winner.ws.readyState === WebSocket.OPEN) winner.ws.send(msg);
        if (loser.ws.readyState === WebSocket.OPEN) loser.ws.send(msg);

        // Save to DB
        try {
            await prisma.match.create({
                data: {
                    gameType: 'remote',
                    player1Id: state.p1.id,
                    player2Id: state.p2.id,
                    player1Score: state.p1.score,
                    player2Score: state.p2.score,
                    winnerId: winner.id
                }
            });

            // Update XP
            await prisma.user.update({
                where: { id: winner.id },
                data: { xp: { increment: 50 } }
            });
            await prisma.user.update({
                where: { id: loser.id },
                data: { xp: { increment: 10 } }
            });
        } catch (error) {
            console.error("[GameManager] Failed to save match history:", error);
        }
    }
}

export const getMatchHistory = async (request: FastifyRequest, reply: FastifyReply) => {
    const { uid } = request.params as { uid: string };
    try {
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { player1Id: uid },
                    { player2Id: uid }
                ]
            },
            orderBy: { playedAt: 'desc' },
            include: {
                player1: true,
                player2: true
            }
        });

        const history = matches.map(m => {
            let p1Exp = 0;
            let p2Exp = 0;

            if (m.gameType === 'remote') {
                // Remote logic: Winner 50, Loser 10
                if (m.winnerId === m.player1Id) {
                    p1Exp = 50;
                    p2Exp = 10;
                } else {
                    p1Exp = 10;
                    p2Exp = 50;
                }
            } else {
                // Local/Bot logic: No XP gain
                p1Exp = 0;
                p2Exp = 0;
            }

            return {
                id: m.id,
                gameType: m.gameType,
                player1Id: m.player1Id,
                player2Id: m.player2Id,
                player1Score: m.player1Score,
                player2Score: m.player2Score,
                player1Exp: p1Exp,
                player2Exp: p2Exp,
                player1Name: m.player1.name,
                player2Name: m.player2?.name || (m.gameType === 'bot' ? 'Bot' : 'Guest'),
                player1Avatar: m.player1.avatar,
                player2Avatar: m.player2?.avatar || "",
                winnerId: m.winnerId,
                playedAt: m.playedAt
            };
        });

        reply.send({ games: history });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: "Failed to fetch history" });
    }
};

export const saveMatch = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = (request as any).user;
        if (!user) return reply.status(401).send({ error: "Unauthorized" });

        const { gameType, player1Score, player2Score, winner } = request.body as any;

        console.log(`[GameController] Saving ${gameType} match. P1: ${player1Score}, P2: ${player2Score}, Winner: ${winner}`);

        const isWin = winner === 'p1';

        // No XP gain for Local/Bot games
        const xpGained = 0;

        await prisma.match.create({
            data: {
                gameType,
                player1Id: user.uid,
                player2Id: null, // Local/Bot has no P2 User ID
                player1Score,
                player2Score,
                winnerId: isWin ? user.uid : null
            }
        });

        // Update XP for the logged-in user (Player 1)
        await prisma.user.update({
            where: { id: user.uid },
            data: { xp: { increment: xpGained } }
        });

        console.log(`[GameController] Awarded ${xpGained} XP to user ${user.uid}`);

        reply.send({ success: true, xp: xpGained });
    } catch (error) {
        request.log.error(error);
        reply.status(500).send({ error: "Failed to save match" });
    }
};


export const gameManager = new GameManager();
