/**
 * Game WebSocket Integration Tests
 *
 * Tests the complete game flow including:
 * - Connection and authentication
 * - Matchmaking
 * - Ready check enforcement
 * - Game start and play
 * - Disconnection handling
 * - Bot games
 */

import WebSocket from 'ws';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

// Test configuration
const WS_URL = process.env.WS_URL || 'ws://localhost:3001/v1/game/ws';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Test user credentials
const TEST_USERS = [
  { email: 'player1@test.com', password: 'password123', name: 'Player1' },
  { email: 'player2@test.com', password: 'password123', name: 'Player2' },
];

interface GameMessage {
  type: string;
  payload?: any;
  message?: string;
}

class GameClient {
  private ws: WebSocket | null = null;
  private token: string;
  private userId: string = '';
  private messageHandlers: Map<string, (payload: any) => void> = new Map();
  private messages: GameMessage[] = [];

  constructor(private userEmail: string, token: string) {
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${WS_URL}?token=${this.token}`);

      this.ws.on('open', () => {
        console.log(`[${this.userEmail}] Connected to game server`);
        resolve();
      });

      this.ws.on('message', (data: Buffer) => {
        const message: GameMessage = JSON.parse(data.toString());
        this.messages.push(message);
        console.log(`[${this.userEmail}] Received: ${message.type}`, message.payload || message.message);

        if (message.type === 'welcome') {
          this.userId = message.userId || '';
        }

        const handler = this.messageHandlers.get(message.type);
        if (handler) {
          handler(message.payload || message);
        }
      });

      this.ws.on('error', (error) => {
        console.error(`[${this.userEmail}] WebSocket error:`, error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log(`[${this.userEmail}] Disconnected`);
      });
    });
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log(`[${this.userEmail}] Sent: ${message.type}`);
    }
  }

  on(messageType: string, handler: (payload: any) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  waitForMessage(messageType: string, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.messageHandlers.delete(messageType);
        reject(new Error(`Timeout waiting for ${messageType}`));
      }, timeout);

      this.on(messageType, (payload) => {
        clearTimeout(timer);
        this.messageHandlers.delete(messageType);
        resolve(payload);
      });
    });
  }

  joinMatchmaking(gameType: string = 'classic'): void {
    this.send({
      type: 'matchmaking',
      payload: { action: 'join', gameType }
    });
  }

  leaveMatchmaking(gameType: string = 'classic'): void {
    this.send({
      type: 'matchmaking',
      payload: { action: 'leave', gameType }
    });
  }

  sendReady(gameId: string): void {
    this.send({
      type: 'game_ready',
      payload: { gameId }
    });
  }

  sendMove(gameId: string, direction: 'up' | 'down'): void {
    this.send({
      type: 'player_move',
      payload: {
        gameId,
        direction,
        timestamp: Date.now()
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  getMessages(): GameMessage[] {
    return this.messages;
  }

  getUserId(): string {
    return this.userId;
  }
}

// Helper function to get auth token
async function getAuthToken(email: string, password: string): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error(`Failed to login: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Helper to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('Game WebSocket Tests', () => {
  let tokens: string[] = [];

  before(async () => {
    console.log('🔐 Getting authentication tokens...');
    for (const user of TEST_USERS) {
      try {
        const token = await getAuthToken(user.email, user.password);
        tokens.push(token);
        console.log(`✅ Token obtained for ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to get token for ${user.email}:`, error);
        throw error;
      }
    }
  });

  describe('Connection and Authentication', () => {
    it('should successfully connect with valid token', async () => {
      const client = new GameClient(TEST_USERS[0]!.email, tokens[0]!);

      await client.connect();
      const welcome = await client.waitForMessage('welcome');

      assert.ok(welcome, 'Should receive welcome message');
      assert.ok(welcome.userId, 'Should receive userId');

      client.disconnect();
    });

    it('should reject connection without token', async () => {
      const ws = new WebSocket(WS_URL);

      await new Promise<void>((resolve, reject) => {
        ws.on('message', (data) => {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'error' && msg.message.includes('Authentication required')) {
            resolve();
          }
        });

        ws.on('close', () => resolve());
        ws.on('error', () => resolve());

        setTimeout(() => reject(new Error('Timeout')), 2000);
      });
    });
  });

  describe('Matchmaking', () => {
    it('should join matchmaking queue', async () => {
      const client = new GameClient(TEST_USERS[0]!.email, tokens[0]!);

      await client.connect();
      await client.waitForMessage('welcome');

      client.joinMatchmaking();
      const result = await client.waitForMessage('matchmaking_result');

      assert.ok(result.success, 'Should successfully join matchmaking');
      assert.ok(result.queueSize >= 1, 'Queue size should be at least 1');

      client.leaveMatchmaking();
      client.disconnect();
    });

    it('should match two players and create game session', async () => {
      const player1 = new GameClient(TEST_USERS[0]!.email, tokens[0]!);
      const player2 = new GameClient(TEST_USERS[1]!.email, tokens[1]!);

      await player1.connect();
      await player2.connect();

      await player1.waitForMessage('welcome');
      await player2.waitForMessage('welcome');

      // Both join matchmaking
      player1.joinMatchmaking();
      player2.joinMatchmaking();

      // Wait for match
      const match1 = await player1.waitForMessage('game_matched', 10000);
      const match2 = await player2.waitForMessage('game_matched', 10000);

      assert.ok(match1, 'Player 1 should receive game_matched');
      assert.ok(match2, 'Player 2 should receive game_matched');
      assert.strictEqual(match1.id, match2.id, 'Both players should be in same game');
      assert.strictEqual(match1.status, 'starting', 'Game should be in starting status');

      player1.disconnect();
      player2.disconnect();
    });
  });

  describe('Ready Check Enforcement', () => {
    it('should not start game until both players are ready', async () => {
      const player1 = new GameClient(TEST_USERS[0]!.email, tokens[0]!);
      const player2 = new GameClient(TEST_USERS[1]!.email, tokens[1]!);

      await player1.connect();
      await player2.connect();
      await player1.waitForMessage('welcome');
      await player2.waitForMessage('welcome');

      // Join matchmaking
      player1.joinMatchmaking();
      player2.joinMatchmaking();

      // Wait for match
      const match1 = await player1.waitForMessage('game_matched', 10000);
      const gameId = match1.id;

      // Only player 1 sends ready
      player1.sendReady(gameId);

      // Wait a bit and verify game hasn't started
      await wait(2000);

      const messages = player1.getMessages();
      const gameStarted = messages.some(m => m.type === 'game_start');

      assert.strictEqual(gameStarted, false, 'Game should NOT start with only one player ready');

      player1.disconnect();
      player2.disconnect();
    });

    it('should start game when both players are ready', async () => {
      const player1 = new GameClient(TEST_USERS[0]!.email, tokens[0]!);
      const player2 = new GameClient(TEST_USERS[1]!.email, tokens[1]!);

      await player1.connect();
      await player2.connect();
      await player1.waitForMessage('welcome');
      await player2.waitForMessage('welcome');

      // Join matchmaking
      player1.joinMatchmaking();
      player2.joinMatchmaking();

      // Wait for match
      const match1 = await player1.waitForMessage('game_matched', 10000);
      await player2.waitForMessage('game_matched', 10000);
      const gameId = match1.id;

      // Both players send ready
      player1.sendReady(gameId);
      player2.sendReady(gameId);

      // Wait for game to start
      const gameStart1 = await player1.waitForMessage('game_start', 5000);
      const gameStart2 = await player2.waitForMessage('game_start', 5000);

      assert.ok(gameStart1, 'Player 1 should receive game_start');
      assert.ok(gameStart2, 'Player 2 should receive game_start');
      assert.strictEqual(gameStart1.gameId, gameId, 'Game ID should match');

      player1.disconnect();
      player2.disconnect();
    });

    it('should cancel game if ready timeout expires', async () => {
      const player1 = new GameClient(TEST_USERS[0]!.email, tokens[0]!);
      const player2 = new GameClient(TEST_USERS[1]!.email, tokens[1]!);

      await player1.connect();
      await player2.connect();
      await player1.waitForMessage('welcome');
      await player2.waitForMessage('welcome');

      // Join matchmaking
      player1.joinMatchmaking();
      player2.joinMatchmaking();

      // Wait for match but don't send ready
      await player1.waitForMessage('game_matched', 10000);
      await player2.waitForMessage('game_matched', 10000);

      // Wait for timeout (30 seconds + buffer)
      const cancelled = await player1.waitForMessage('game_cancelled', 35000);

      assert.ok(cancelled, 'Should receive game_cancelled after timeout');
      assert.ok(cancelled.reason.includes('ready'), 'Reason should mention ready timeout');

      player1.disconnect();
      player2.disconnect();
    }).timeout(40000);
  });

  describe('Disconnection Handling', () => {
    it('should cancel game when player disconnects during ready phase', async () => {
      const player1 = new GameClient(TEST_USERS[0]!.email, tokens[0]!);
      const player2 = new GameClient(TEST_USERS[1]!.email, tokens[1]!);

      await player1.connect();
      await player2.connect();
      await player1.waitForMessage('welcome');
      await player2.waitForMessage('welcome');

      // Join matchmaking
      player1.joinMatchmaking();
      player2.joinMatchmaking();

      // Wait for match
      await player1.waitForMessage('game_matched', 10000);
      await player2.waitForMessage('game_matched', 10000);

      // Player 1 disconnects before ready
      player1.disconnect();

      // Player 2 should receive cancellation
      const cancelled = await player2.waitForMessage('game_cancelled', 5000);

      assert.ok(cancelled, 'Player 2 should receive game_cancelled');
      assert.ok(cancelled.reason.includes('disconnected'), 'Reason should mention disconnection');

      player2.disconnect();
    });

    it('should handle player leaving matchmaking queue', async () => {
      const client = new GameClient(TEST_USERS[0]!.email, tokens[0]!);

      await client.connect();
      await client.waitForMessage('welcome');

      client.joinMatchmaking();
      await client.waitForMessage('matchmaking_result');

      client.leaveMatchmaking();

      // Should be able to reconnect and join again
      client.joinMatchmaking();
      const result = await client.waitForMessage('matchmaking_result');

      assert.ok(result.success, 'Should be able to rejoin matchmaking');

      client.disconnect();
    });
  });

  describe('Bot Games', () => {
    it('should create bot game after waiting in queue', async () => {
      const player = new GameClient(TEST_USERS[0]!.email, tokens[0]!);

      await player.connect();
      await player.waitForMessage('welcome');

      player.joinMatchmaking();

      // Wait for bot match (happens after 10 seconds)
      const match = await player.waitForMessage('game_matched', 15000);

      assert.ok(match.opponentIsBot, 'Opponent should be a bot');
      assert.ok(match.isBotGame, 'Should be marked as bot game');

      // Bot auto-readies, so only player needs to ready
      player.sendReady(match.id);

      // Game should start immediately
      const gameStart = await player.waitForMessage('game_start', 3000);
      assert.ok(gameStart, 'Game should start with bot');

      player.disconnect();
    }).timeout(20000);
  });

  describe('Game Play', () => {
    it('should handle player movements', async () => {
      const player1 = new GameClient(TEST_USERS[0]!.email, tokens[0]!);
      const player2 = new GameClient(TEST_USERS[1]!.email, tokens[1]!);

      await player1.connect();
      await player2.connect();
      await player1.waitForMessage('welcome');
      await player2.waitForMessage('welcome');

      player1.joinMatchmaking();
      player2.joinMatchmaking();

      const match = await player1.waitForMessage('game_matched', 10000);
      await player2.waitForMessage('game_matched', 10000);

      player1.sendReady(match.id);
      player2.sendReady(match.id);

      await player1.waitForMessage('game_start', 5000);

      // Send some movements
      player1.sendMove(match.id, 'up');
      player1.sendMove(match.id, 'down');

      // Player 2 should receive movement notifications
      const movement = await player2.waitForMessage('player_moved', 3000);

      assert.ok(movement, 'Player 2 should receive movement update');
      assert.strictEqual(movement.gameId, match.id, 'Movement should be for correct game');

      player1.disconnect();
      player2.disconnect();
    });
  });

  describe('Statistics', () => {
    it('should return game service stats', async () => {
      const response = await fetch(`${BACKEND_URL}/v1/game/service-stats`);
      const stats = await response.json();

      assert.ok(stats.activeConnections !== undefined, 'Should have activeConnections');
      assert.ok(stats.gameSessions !== undefined, 'Should have gameSessions');
      assert.ok(stats.matchmakingQueue !== undefined, 'Should have matchmakingQueue');
    });
  });
});
