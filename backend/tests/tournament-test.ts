/**
 * Tournament System Tests
 *
 * Tests the complete tournament functionality including:
 * - Tournament creation (public/private)
 * - Player joining/leaving
 * - Tournament starting
 * - Bracket generation
 * - Match progression
 * - Winner determination
 */

import WebSocket from 'ws';

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwY2QzMzJiOS0xNzNiLTQ2MTAtODQ4MC0wZTkzZTRjMWViMGEiLCJuYW1lIjoiYWFhIiwiZW1haWwiOiJhYWFAYWFhLmFhYSIsImNyZWF0ZWRBdCI6IjIwMjYtMDEtMTZUMDI6MjQ6NDAuMTU2WiIsIm1mYV9yZXF1aXJlZCI6ZmFsc2UsImlhdCI6MTc2ODUzMDI4MCwiZXhwIjoxNzY4NjE2NjgwfQ.Ay3ZRSYKYioeBSo_mEStNK9D-9tfSVbb-X4TrEvaYDo";
const WS_URL = process.env.WS_URL || 'ws://localhost:3001/v1/game/ws';

interface Message {
  type: string;
  payload?: any;
}

class TournamentClient {
  private ws: WebSocket | null = null;
  private connected = false;
  private userId: string = '';
  private messageHandlers: Map<string, (payload: any) => void> = new Map();

  constructor(private name: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout for ${this.name}`));
      }, 10000);

      this.ws = new WebSocket(`${WS_URL}?token=${TOKEN}`);

      this.ws.on('open', () => {
        this.connected = true;
        console.log(`[${this.name}] ✅ Connected`);
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message: Message = JSON.parse(data.toString());

          if (message.type === 'welcome') {
            this.userId = message.payload?.userId || '';
            console.log(`[${this.name}] 👋 Welcome (userId: ${this.userId})`);
            clearTimeout(timeout);
            resolve();
          } else {
            this.handleMessage(message);
          }
        } catch (error) {
          console.error(`[${this.name}] Parse error:`, error);
        }
      });

      this.ws.on('error', (error) => {
        console.error(`[${this.name}] ❌ Error:`, error.message);
      });

      this.ws.on('close', () => {
        this.connected = false;
        console.log(`[${this.name}] 🔌 Disconnected`);
      });
    });
  }

  private handleMessage(message: Message): void {
    console.log(`[${this.name}] 📨 ${message.type}`, message.payload ? JSON.stringify(message.payload).substring(0, 100) : '');

    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.payload);
    }
  }

  on(type: string, handler: (payload: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  waitFor(type: string, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.messageHandlers.delete(type);
        reject(new Error(`Timeout waiting for ${type}`));
      }, timeout);

      this.on(type, (payload) => {
        clearTimeout(timer);
        this.messageHandlers.delete(type);
        resolve(payload);
      });
    });
  }

  send(message: any): void {
    if (this.ws && this.connected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Tournament actions
  createTournament(name: string, maxPlayers: number, isPrivate: boolean = false, password?: string): void {
    console.log(`[${this.name}] 🏆 Creating tournament: ${name}`);
    this.send({
      type: 'tournament',
      payload: {
        action: 'create',
        tournamentData: {
          name,
          maxPlayers,
          isPrivate,
          password,
          description: `Test tournament created by ${this.name}`
        }
      }
    });
  }

  joinTournament(tournamentId: string, password?: string): void {
    console.log(`[${this.name}] ➡️  Joining tournament: ${tournamentId}`);
    this.send({
      type: 'tournament',
      payload: {
        action: 'join',
        tournamentId,
        ...(password && { tournamentData: { password } })
      }
    });
  }

  leaveTournament(tournamentId: string): void {
    console.log(`[${this.name}] ⬅️  Leaving tournament: ${tournamentId}`);
    this.send({
      type: 'tournament',
      payload: {
        action: 'leave',
        tournamentId
      }
    });
  }

  startTournament(tournamentId: string): void {
    console.log(`[${this.name}] 🚀 Starting tournament: ${tournamentId}`);
    this.send({
      type: 'tournament',
      payload: {
        action: 'start',
        tournamentId
      }
    });
  }

  getTournamentInfo(tournamentId: string): void {
    console.log(`[${this.name}] ℹ️  Getting tournament info: ${tournamentId}`);
    this.send({
      type: 'tournament',
      payload: {
        action: 'get_info',
        tournamentId
      }
    });
  }

  sendReady(gameId: string): void {
    this.send({
      type: 'game_ready',
      payload: { gameId }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  getUserId(): string {
    return this.userId;
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Test scenarios
async function test1_CreatePublicTournament() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 1: Create Public Tournament');
  console.log('═══════════════════════════════════════════\n');

  const creator = new TournamentClient('Creator');
  await creator.connect();

  creator.createTournament('Test Tournament', 4, false);

  const response = await creator.waitFor('tournament_action_result', 10000);

  if (response.success) {
    console.log('✅ Tournament created successfully');
    console.log(`   ID: ${response.tournament.id}`);
    console.log(`   Name: ${response.tournament.name}`);
    console.log(`   Max Players: ${response.tournament.maxPlayers}`);
    console.log(`   Status: ${response.tournament.status}`);
    console.log(`   Players: ${response.tournament.players.length}`);
  } else {
    console.log('❌ Failed to create tournament');
  }

  await wait(1000);
  creator.disconnect();
}

async function test2_JoinTournament() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 2: Multiple Players Join Tournament');
  console.log('═══════════════════════════════════════════\n');

  const creator = new TournamentClient('Creator');
  const player2 = new TournamentClient('Player2');
  const player3 = new TournamentClient('Player3');

  await creator.connect();
  await player2.connect();
  await player3.connect();

  // Create tournament
  creator.createTournament('4-Player Tournament', 4, false);
  const createResponse = await creator.waitFor('tournament_action_result');
  const tournamentId = createResponse.tournament.id;

  console.log(`\n📋 Tournament ID: ${tournamentId}\n`);

  // Players join
  player2.joinTournament(tournamentId);
  await player2.waitFor('tournament_action_result');

  player3.joinTournament(tournamentId);
  await player3.waitFor('tournament_action_result');

  // Get final info
  creator.getTournamentInfo(tournamentId);
  const info = await creator.waitFor('tournament_action_result');

  console.log(`\n✅ Tournament has ${info.tournament.players.length}/4 players`);
  info.tournament.players.forEach((p: any, i: number) => {
    console.log(`   ${i + 1}. ${p.name} (${p.id})`);
  });

  await wait(1000);
  creator.disconnect();
  player2.disconnect();
  player3.disconnect();
}

async function test3_StartTournament() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 3: Start 4-Player Tournament');
  console.log('═══════════════════════════════════════════\n');

  const players = [
    new TournamentClient('Player1'),
    new TournamentClient('Player2'),
    new TournamentClient('Player3'),
    new TournamentClient('Player4')
  ];

  // Connect all
  await Promise.all(players.map(p => p.connect()));
  console.log('');

  // Player 1 creates tournament
  players[0]!.createTournament('Full Tournament', 4, false);
  const createResponse = await players[0]!.waitFor('tournament_action_result');
  const tournamentId = createResponse.tournament.id;

  console.log(`📋 Tournament created: ${tournamentId}\n`);

  // Others join
  for (let i = 1; i < players.length; i++) {
    players[i]!.joinTournament(tournamentId);
    await players[i]!.waitFor('tournament_action_result');
    await wait(500);
  }

  console.log(`\n✅ All 4 players joined\n`);

  // Start tournament
  players[0]!.startTournament(tournamentId);

  // Wait for tournament_started event
  const startEvent = await players[0]!.waitFor('tournament_started', 10000);

  console.log('\n🚀 Tournament started!');
  console.log(`   Current Round: ${startEvent.tournament.currentRound}`);
  console.log(`   Status: ${startEvent.tournament.status}`);
  console.log(`   Bracket size: ${startEvent.tournament.bracket.length}`);

  await wait(2000);
  players.forEach(p => p.disconnect());
}

async function test4_PrivateTournament() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 4: Private Tournament with Password');
  console.log('═══════════════════════════════════════════\n');

  const creator = new TournamentClient('Creator');
  const authorized = new TournamentClient('AuthorizedPlayer');
  const unauthorized = new TournamentClient('UnauthorizedPlayer');

  await creator.connect();
  await authorized.connect();
  await unauthorized.connect();

  // Create private tournament
  const password = 'secret123';
  creator.createTournament('Private Tournament', 4, true, password);
  const createResponse = await creator.waitFor('tournament_action_result');
  const tournamentId = createResponse.tournament.id;

  console.log(`\n🔒 Private tournament created with password\n`);

  // Try joining without password
  unauthorized.joinTournament(tournamentId);
  try {
    await unauthorized.waitFor('tournament_action_result', 3000);
    console.log('❌ Unauthorized player should have failed');
  } catch (error) {
    console.log('✅ Unauthorized player correctly rejected');
  }

  // Join with correct password
  authorized.joinTournament(tournamentId, password);
  const joinResponse = await authorized.waitFor('tournament_action_result');

  if (joinResponse.success) {
    console.log('✅ Authorized player joined with correct password');
  }

  await wait(1000);
  creator.disconnect();
  authorized.disconnect();
  unauthorized.disconnect();
}

async function test5_LeaveTournament() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 5: Leave Tournament Before Start');
  console.log('═══════════════════════════════════════════\n');

  const creator = new TournamentClient('Creator');
  const player2 = new TournamentClient('Player2');

  await creator.connect();
  await player2.connect();

  // Create and join
  creator.createTournament('Test Leave', 4, false);
  const createResponse = await creator.waitFor('tournament_action_result');
  const tournamentId = createResponse.tournament.id;

  player2.joinTournament(tournamentId);
  await player2.waitFor('tournament_action_result');

  console.log('✅ Player 2 joined');

  // Player 2 leaves
  player2.leaveTournament(tournamentId);
  const leaveResponse = await player2.waitFor('tournament_action_result');

  if (leaveResponse.success) {
    console.log('✅ Player 2 left successfully');
  }

  // Check tournament status
  creator.getTournamentInfo(tournamentId);
  const info = await creator.waitFor('tournament_action_result');

  console.log(`\n📊 Tournament now has ${info.tournament.players.length} players`);

  await wait(1000);
  creator.disconnect();
  player2.disconnect();
}

async function test6_TournamentMatchFlow() {
  console.log('\n═══════════════════════════════════════════');
  console.log('TEST 6: Tournament Match Flow (4 Players)');
  console.log('═══════════════════════════════════════════\n');

  const players = [
    new TournamentClient('Alice'),
    new TournamentClient('Bob'),
    new TournamentClient('Charlie'),
    new TournamentClient('Diana')
  ];

  // Connect all
  await Promise.all(players.map(p => p.connect()));
  console.log('');

  // Create tournament
  players[0]!.createTournament('Championship', 4, false);
  const createResponse = await players[0]!.waitFor('tournament_action_result');
  const tournamentId = createResponse.tournament.id;

  // Join tournament
  for (let i = 1; i < players.length; i++) {
    players[i]!.joinTournament(tournamentId);
    await players[i]!.waitFor('tournament_action_result');
  }

  console.log('✅ All players joined\n');

  // Listen for match ready events
  players.forEach((player, i) => {
    player.on('tournament_match_ready', (payload) => {
      console.log(`\n🎮 ${players[i]!.name} - Match is ready!`);
      console.log(`   Game ID: ${payload.id}`);
      console.log(`   Players: ${payload.players.join(' vs ')}`);

      // Auto-ready for tournament matches
      setTimeout(() => {
        console.log(`   ${players[i]!.name} sending ready...`);
        player.sendReady(payload.id);
      }, 1000);
    });

    player.on('game_start', (payload) => {
      console.log(`\n🚀 ${players[i]!.name} - Game started!`);
    });

    player.on('tournament_match_completed', (payload) => {
      console.log(`\n🏁 Match completed - Winner: ${payload.winner?.name}`);
    });

    player.on('tournament_completed', (payload) => {
      console.log(`\n🏆 TOURNAMENT WINNER: ${payload.winner?.name}!`);
    });
  });

  // Start tournament
  players[0]!.startTournament(tournamentId);
  await players[0]!.waitFor('tournament_started');

  console.log('\n🚀 Tournament started - matches beginning...\n');

  // Let tournament run
  await wait(60000); // Wait 60 seconds for matches

  players.forEach(p => p.disconnect());
}

// Main test runner
async function runTournamentTests() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   🏆 TOURNAMENT SYSTEM TESTS 🏆          ║');
  console.log('╚═══════════════════════════════════════════╝');

  try {
    await test1_CreatePublicTournament();
    await wait(2000);

    await test2_JoinTournament();
    await wait(2000);

    await test3_StartTournament();
    await wait(2000);

    await test4_PrivateTournament();
    await wait(2000);

    await test5_LeaveTournament();
    await wait(2000);

    // Uncomment for full match flow test (takes ~60 seconds)
    // await test6_TournamentMatchFlow();

    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║   ✅ ALL TESTS COMPLETED                  ║');
    console.log('╚═══════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTournamentTests();
