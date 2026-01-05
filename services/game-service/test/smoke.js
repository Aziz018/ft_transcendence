// Smoke-test for game-service tournament flow using curl (more reliable across containers)
// Usage: node test/smoke.js

import { execSync } from 'child_process';
const BASE = process.env.BASE || 'http://localhost:3005';
const RUN_ID = Date.now(); // unique ID per test run

function run(cmd) {
  try {
    const output = execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
    return output;
  } catch (e) {
    console.error('Command failed:', e.message);
    console.error('Stdout:', e.stdout);
    console.error('Stderr:', e.stderr);
    throw e;
  }
}

console.log('BASE:', BASE, 'RUN_ID:', RUN_ID);
console.log('1) Create tournament (user-' + RUN_ID + '-1)');
const user1 = 'user-' + RUN_ID + '-1';
const createCmd = `curl -s -X POST ${BASE}/v1/tournament -H "Content-Type: application/json" -H "x-user-id: ${user1}" -d '{"name":"SmokeTest","maxPlayers":4,"isPrivate":false}'`;
let created, tourId;
try {
  created = run(createCmd);
  console.log('create response:', created);
  tourId = JSON.parse(created).tournament.id;
} catch (e) { console.error('Failed to create tournament:', e.message); process.exit(1); }
console.log('Tournament id:', tourId);

console.log('\n2) Join user-' + RUN_ID + '-2');
console.log(run(`curl -s -X POST ${BASE}/v1/tournament/${tourId}/join -H "Content-Type: application/json" -H "x-user-id: user-${RUN_ID}-2" -d '{}'`));

console.log('\n3) Join user-' + RUN_ID + '-3');
console.log(run(`curl -s -X POST ${BASE}/v1/tournament/${tourId}/join -H "Content-Type: application/json" -H "x-user-id: user-${RUN_ID}-3" -d '{}'`));

console.log('\n4) Join user-' + RUN_ID + '-4');
console.log(run(`curl -s -X POST ${BASE}/v1/tournament/${tourId}/join -H "Content-Type: application/json" -H "x-user-id: user-${RUN_ID}-4" -d '{}'`));

console.log('\n5) Start tournament (user-' + RUN_ID + '-1)');
console.log(run(`curl -s -X POST ${BASE}/v1/tournament/${tourId}/start -H "x-user-id: ${user1}"`));

console.log('\n6) Get tournament info');
console.log(run(`curl -s ${BASE}/v1/tournament/${tourId}`));

console.log('\n✅ Smoke test completed successfully!');
