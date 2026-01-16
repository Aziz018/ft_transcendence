/**
 * Simple Tournament Test
 * Quick validation of tournament system
 */

import WebSocket from 'ws';

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwY2QzMzJiOS0xNzNiLTQ2MTAtODQ4MC0wZTkzZTRjMWViMGEiLCJuYW1lIjoiYWFhIiwiZW1haWwiOiJhYWFAYWFhLmFhYSIsImNyZWF0ZWRBdCI6IjIwMjYtMDEtMTZUMDI6MjQ6NDAuMTU2WiIsIm1mYV9yZXF1aXJlZCI6ZmFsc2UsImlhdCI6MTc2ODUzMDI4MCwiZXhwIjoxNzY4NjE2NjgwfQ.Ay3ZRSYKYioeBSo_mEStNK9D-9tfSVbb-X4TrEvaYDo";
const WS_URL = process.env.WS_URL || 'ws://localhost:3001/v1/game/ws';

console.log('\n🏆 Quick Tournament Test\n');
console.log('Connecting...');

const ws = new WebSocket(`${WS_URL}?token=${TOKEN}`);

ws.on('open', () => {
  console.log('✅ Connected\n');
  console.log('Creating tournament...');

  ws.send(JSON.stringify({
    type: 'tournament',
    payload: {
      action: 'create',
      tournamentData: {
        name: 'Quick Test Tournament',
        maxPlayers: 4,
        isPrivate: false,
        description: 'Testing tournament creation'
      }
    }
  }));
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log(`📨 ${message.type}:`);

    if (message.type === 'welcome') {
      console.log(`   User ID: ${message.payload?.userId || message.userId}`);
    } else if (message.type === 'tournament_action_result') {
      if (message.payload.success) {
        console.log('   ✅ Success!');
        console.log(`   Tournament ID: ${message.payload.tournament.id}`);
        console.log(`   Name: ${message.payload.tournament.name}`);
        console.log(`   Max Players: ${message.payload.tournament.maxPlayers}`);
        console.log(`   Status: ${message.payload.tournament.status}`);
        console.log(`   Players: ${message.payload.tournament.players.length}/${message.payload.tournament.maxPlayers}`);

        // Test getting info
        console.log('\nGetting tournament info...');
        ws.send(JSON.stringify({
          type: 'tournament',
          payload: {
            action: 'get_info',
            tournamentId: message.payload.tournament.id
          }
        }));
      } else {
        console.log('   ❌ Failed:', message.payload.message);
      }
    } else if (message.type === 'error') {
      console.log(`   ❌ Error: ${message.message}`);
    } else {
      console.log(`   ${JSON.stringify(message.payload || message).substring(0, 200)}`);
    }
  } catch (error: any) {
    console.error('Parse error:', error.message);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log('\n🔌 Disconnected');
  process.exit(0);
});

// Close after 10 seconds
setTimeout(() => {
  console.log('\n⏱️  Test complete');
  ws.close();
}, 10000);
