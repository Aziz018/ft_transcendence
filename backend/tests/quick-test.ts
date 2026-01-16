/**
 * Quick Load Test with Provided Token
 * No login required - uses hardcoded token
 */

import WebSocket from 'ws';

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwY2QzMzJiOS0xNzNiLTQ2MTAtODQ4MC0wZTkzZTRjMWViMGEiLCJuYW1lIjoiYWFhIiwiZW1haWwiOiJhYWFAYWFhLmFhYSIsImNyZWF0ZWRBdCI6IjIwMjYtMDEtMTZUMDI6MjQ6NDAuMTU2WiIsIm1mYV9yZXF1aXJlZCI6ZmFsc2UsImlhdCI6MTc2ODUzMDI4MCwiZXhwIjoxNzY4NjE2NjgwfQ.Ay3ZRSYKYioeBSo_mEStNK9D-9tfSVbb-X4TrEvaYDo";
const WS_URL = process.env.WS_URL || 'ws://localhost:3001/v1/game/ws';
const NUM_CLIENTS = parseInt(process.env.NUM_CLIENTS || '4');

interface GameMessage {
  type: string;
  payload?: any;
}

class TestClient {
  private ws: WebSocket | null = null;
  private connected = false;
  private gameId: string | null = null;

  constructor(private id: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout for client ${this.id}`));
      }, 10000);

      this.ws = new WebSocket(`${WS_URL}?token=${TOKEN}`);

      this.ws.on('open', () => {
        this.connected = true;
        console.log(`[Client ${this.id}] ✅ Connected`);
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message: GameMessage = JSON.parse(data.toString());

          if (message.type === 'welcome') {
            console.log(`[Client ${this.id}] 👋 Welcome received`);
            clearTimeout(timeout);
            resolve();
          } else {
            this.handleMessage(message);
          }
        } catch (error) {
          console.error(`[Client ${this.id}] Parse error:`, error);
        }
      });

      this.ws.on('error', (error) => {
        clearTimeout(timeout);
        console.error(`[Client ${this.id}] ❌ Error:`, error.message);
        this.connected = false;
      });

      this.ws.on('close', (code, reason) => {
        this.connected = false;
        console.log(`[Client ${this.id}] 🔌 Disconnected (${code}${reason ? ': ' + reason.toString() : ''})`);
      });
    });
  }

  private handleMessage(message: GameMessage): void {
    switch (message.type) {
      case 'matchmaking_result':
        console.log(`[Client ${this.id}] 🔍 In queue (position: ${message.payload?.position})`);
        break;

      case 'game_matched':
        this.gameId = message.payload?.id;
        const opponentType = message.payload?.opponentIsBot ? '🤖 bot' : '👤 player';
        console.log(`[Client ${this.id}] 🎮 Matched with ${opponentType} (game: ${this.gameId})`);
        // Auto-ready after 500ms
        setTimeout(() => this.sendReady(), 500);
        break;

      case 'player_ready':
        console.log(`[Client ${this.id}] ⏳ Opponent ready (${message.payload?.readyCount}/${message.payload?.totalPlayers})`);
        break;

      case 'game_start':
        console.log(`[Client ${this.id}] 🚀 Game started!`);
        this.startPlaying();
        break;

      case 'player_moved':
        // Silent - too many messages
        break;

      case 'game_cancelled':
        console.log(`[Client ${this.id}] ❌ Game cancelled: ${message.payload?.reason}`);
        break;

      case 'match_ended':
        console.log(`[Client ${this.id}] 🏁 Match ended`);
        break;

      default:
        console.log(`[Client ${this.id}] 📨 ${message.type}`);
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
    if (!this.gameId) return;

    const directions: ('up' | 'down')[] = ['up', 'down'];
    let moveCount = 0;

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

      moveCount++;
      if (moveCount % 50 === 0) {
        console.log(`[Client ${this.id}] 🎯 Sent ${moveCount} moves`);
      }
    }, 100);

    // Play for 20 seconds
    setTimeout(() => {
      clearInterval(moveInterval);
      console.log(`[Client ${this.id}] 🛑 Stopped playing (${moveCount} total moves)`);
    }, 20000);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function runQuickTest() {
  console.log(`🚀 Quick Game Test with ${NUM_CLIENTS} clients\n`);

  const clients: TestClient[] = [];

  // Create clients
  for (let i = 0; i < NUM_CLIENTS; i++) {
    clients.push(new TestClient(`${i + 1}`));
  }

  // Connect all clients
  console.log('📡 Connecting clients...\n');
  const results = await Promise.allSettled(clients.map(c => c.connect()));

  const connected = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`\n📊 Connection: ${connected} ✅ connected, ${failed} ❌ failed\n`);

  if (connected === 0) {
    throw new Error('All clients failed to connect');
  }

  // Wait for stability
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Join matchmaking
  console.log('🔍 Joining matchmaking...\n');
  clients.forEach(c => c.joinMatchmaking());

  // Let test run for 30 seconds
  console.log('⏳ Running test for 30 seconds...\n');
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Disconnect all
  console.log('\n🔌 Disconnecting clients...');
  clients.forEach(c => c.disconnect());

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\n✅ Test completed!\n');
}

runQuickTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
