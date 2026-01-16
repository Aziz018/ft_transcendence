/**
 * Game Load Testing Script
 *
 * Simulates multiple concurrent games to test backend performance
 */

import WebSocket from 'ws';

const WS_URL = process.env.WS_URL || 'ws://localhost:3001/v1/game/ws';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const NUM_CONCURRENT_GAMES = parseInt(process.env.NUM_GAMES || '10');

interface GameMessage {
  type: string;
  payload?: any;
}

class LoadTestClient {
  private ws: WebSocket | null = null;
  private token: string;
  private connected = false;
  private gameId: string | null = null;

  constructor(private id: string, token: string) {
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout for client ${this.id}`));
      }, 10000);

      this.ws = new WebSocket(`${WS_URL}?token=${this.token}`);

      this.ws.on('open', () => {
        this.connected = true;
        console.log(`[Client ${this.id}] Connected`);
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message: GameMessage = JSON.parse(data.toString());

          // Resolve on welcome message (connection established)
          if (message.type === 'welcome') {
            clearTimeout(timeout);
            resolve();
          }

          this.handleMessage(message);
        } catch (error) {
          console.error(`[Client ${this.id}] Parse error:`, error);
        }
      });

      this.ws.on('error', (error) => {
        clearTimeout(timeout);
        console.error(`[Client ${this.id}] Error:`, error.message);
        this.connected = false;
        // Don't reject here, let it try to continue
      });

      this.ws.on('close', (code, reason) => {
        this.connected = false;
        console.log(`[Client ${this.id}] Disconnected (code: ${code}, reason: ${reason.toString()})`);
      });
    });
  }

  private handleMessage(message: GameMessage): void {
    switch (message.type) {
      case 'welcome':
        console.log(`[Client ${this.id}] ✅ Welcome received`);
        break;

      case 'game_matched':
        this.gameId = message.payload?.id;
        console.log(`[Client ${this.id}] 🎮 Matched to game ${this.gameId}`);
        // Auto-ready
        if (this.gameId) {
          setTimeout(() => this.sendReady(), 500);
        }
        break;

      case 'player_ready':
        console.log(`[Client ${this.id}] ⏳ Opponent ready`);
        break;

      case 'game_start':
        console.log(`[Client ${this.id}] 🚀 Game started!`);
        // Start sending random movements
        this.startPlaying();
        break;

      case 'player_moved':
        // Received opponent movement
        break;

      case 'game_cancelled':
        console.log(`[Client ${this.id}] ❌ Game cancelled: ${message.payload?.reason}`);
        break;

      case 'match_ended':
        console.log(`[Client ${this.id}] 🏁 Match ended`);
        break;
    }
  }

  send(message: any): void {
    if (this.ws && this.connected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  joinMatchmaking(): void {
    this.send({
      type: 'matchmaking',
      payload: { action: 'join', gameType: 'classic' }
    });
    console.log(`[Client ${this.id}] 🔍 Joined matchmaking`);
  }

  sendReady(): void {
    if (this.gameId) {
      this.send({
        type: 'game_ready',
        payload: { gameId: this.gameId }
      });
      console.log(`[Client ${this.id}] ✅ Sent ready signal`);
    }
  }

  startPlaying(): void {
    const directions: ('up' | 'down')[] = ['up', 'down'];

    const moveInterval = setInterval(() => {
      if (!this.connected || !this.gameId) {
        clearInterval(moveInterval);
        return;
      }

      const direction = directions[Math.floor(Math.random() * directions.length)];
      this.send({
        type: 'player_move',
        payload: {
          gameId: this.gameId,
          direction,
          timestamp: Date.now()
        }
      });
    }, 100); // Send movement every 100ms

    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(moveInterval);
      this.endGame();
    }, 30000);
  }

  endGame(): void {
    if (this.gameId) {
      // Send match end
      this.send({
        type: 'match_end',
        payload: {
          gameId: this.gameId,
          player1Id: 'test1',
          player1Exp: Math.floor(Math.random() * 1000),
          player2Id: 'test2',
          player2Exp: Math.floor(Math.random() * 1000),
          matchDurationMs: 30000,
          timestamp: Date.now()
        }
      });
      console.log(`[Client ${this.id}] 📤 Sent match end`);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function getTestToken(): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'player1@test.com',
        password: 'password123'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error(`No access token in response: ${JSON.stringify(data)}`);
    }

    console.log('✅ Authentication token obtained');
    return data.access_token;
  } catch (error) {
    console.error('❌ Failed to get token:', error);
    throw error;
  }
}

async function runLoadTest() {
  console.log(`🚀 Starting load test with ${NUM_CONCURRENT_GAMES * 2} concurrent clients (${NUM_CONCURRENT_GAMES} games)...\n`);

  const token = await getTestToken();
  const clients: LoadTestClient[] = [];

  // Create clients
  for (let i = 0; i < NUM_CONCURRENT_GAMES * 2; i++) {
    clients.push(new LoadTestClient(`${i + 1}`, token));
  }

  // Connect all clients
  console.log('📡 Connecting clients...');
  const connectionResults = await Promise.allSettled(clients.map(c => c.connect()));

  const connected = connectionResults.filter(r => r.status === 'fulfilled').length;
  const failed = connectionResults.filter(r => r.status === 'rejected').length;

  console.log(`\n📊 Connection Summary: ${connected} connected, ${failed} failed\n`);

  if (connected === 0) {
    throw new Error('All clients failed to connect');
  }
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Join matchmaking
  console.log('\n🔍 Joining matchmaking...');
  clients.forEach(c => c.joinMatchmaking());

  // Let games run for 40 seconds
  console.log('\n⏳ Games running for 40 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 40000));

  // Disconnect all
  console.log('\n🔌 Disconnecting all clients...');
  clients.forEach(c => c.disconnect());

  // Wait for cleanup
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n✅ Load test completed!');
}

// Run the load test
runLoadTest().catch(error => {
  console.error('❌ Load test failed:', error);
  process.exit(1);
});
