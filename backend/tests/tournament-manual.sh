#!/bin/bash

# Tournament Manual Testing Instructions

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwY2QzMzJiOS0xNzNiLTQ2MTAtODQ4MC0wZTkzZTRjMWViMGEiLCJuYW1lIjoiYWFhIiwiZW1haWwiOiJhYWFAYWFhLmFhYSIsImNyZWF0ZWRBdCI6IjIwMjYtMDEtMTZUMDI6MjQ6NDAuMTU2WiIsIm1mYV9yZXF1aXJlZCI6ZmFsc2UsImlhdCI6MTc2ODUzMDI4MCwiZXhwIjoxNzY4NjE2NjgwfQ.Ay3ZRSYKYioeBSo_mEStNK9D-9tfSVbb-X4TrEvaYDo"
WS_URL="${WS_URL:-ws://localhost:3001/v1/game/ws}"

echo "🏆 Tournament System Manual Testing"
echo "====================================="
echo ""
echo "WebSocket URL: $WS_URL"
echo ""

cat << 'EOF'
TOURNAMENT COMMANDS
===================

1. CREATE TOURNAMENT
   {"type":"tournament","payload":{"action":"create","tournamentData":{"name":"My Tournament","maxPlayers":4,"isPrivate":false,"description":"Test tournament"}}}

   Private tournament (with password):
   {"type":"tournament","payload":{"action":"create","tournamentData":{"name":"Private Tourney","maxPlayers":8,"isPrivate":true,"password":"secret123"}}}

2. JOIN TOURNAMENT (replace TOURNAMENT_ID)
   {"type":"tournament","payload":{"action":"join","tournamentId":"TOURNAMENT_ID"}}

   With password:
   {"type":"tournament","payload":{"action":"join","tournamentId":"TOURNAMENT_ID","tournamentData":{"password":"secret123"}}}

3. GET TOURNAMENT INFO
   {"type":"tournament","payload":{"action":"get_info","tournamentId":"TOURNAMENT_ID"}}

4. START TOURNAMENT (creator only)
   {"type":"tournament","payload":{"action":"start","tournamentId":"TOURNAMENT_ID"}}

5. LEAVE TOURNAMENT
   {"type":"tournament","payload":{"action":"leave","tournamentId":"TOURNAMENT_ID"}}

6. SEND READY (when match starts)
   {"type":"game_ready","payload":{"gameId":"GAME_ID"}}


EVENTS YOU'LL RECEIVE
======================

- tournament_action_result: Response to create/join/leave/start/get_info
- tournament_player_joined: When another player joins
- tournament_player_left: When a player leaves
- tournament_started: When tournament begins
- tournament_round_started: When a new round starts
- tournament_match_ready: When your match is ready
- game_start: When your match begins
- tournament_match_completed: When a match finishes
- tournament_completed: When tournament ends (winner announced)


TEST SCENARIOS
==============

SCENARIO 1: Create and Join
----------------------------
Terminal 1 (Creator):
  1. Connect: wscat -c '$WS_URL?token=$TOKEN'
  2. Create: {"type":"tournament","payload":{"action":"create","tournamentData":{"name":"Test","maxPlayers":4,"isPrivate":false}}}
  3. Note the tournament ID from response

Terminal 2-4 (Players):
  1. Connect: wscat -c '$WS_URL?token=$TOKEN'
  2. Join: {"type":"tournament","payload":{"action":"join","tournamentId":"TOURNAMENT_ID"}}

Creator (Terminal 1):
  3. Start: {"type":"tournament","payload":{"action":"start","tournamentId":"TOURNAMENT_ID"}}


SCENARIO 2: Private Tournament
-------------------------------
Terminal 1:
  1. Create private: {"type":"tournament","payload":{"action":"create","tournamentData":{"name":"Secret","maxPlayers":4,"isPrivate":true,"password":"abc123"}}}

Terminal 2:
  1. Try without password (should fail): {"type":"tournament","payload":{"action":"join","tournamentId":"TOURNAMENT_ID"}}
  2. Try with password (should work): {"type":"tournament","payload":{"action":"join","tournamentId":"TOURNAMENT_ID","tournamentData":{"password":"abc123"}}}


SCENARIO 3: Tournament Bracket Flow
------------------------------------
1. Create 4-player tournament
2. Have 4 players join
3. Creator starts tournament
4. Watch for tournament_match_ready events
5. All players in active matches send game_ready
6. Matches auto-start after 2 seconds
7. Matches complete (semi-finals)
8. Winners advance to finals
9. Final match plays
10. Tournament winner announced


REQUIREMENTS
============
- Minimum 4 players to start tournament
- Player count must be power of 2 (4, 8, 16, 32, 64)
- Only creator can start tournament
- Tournament must be in 'waiting_for_players' status to start
- Matches auto-start 2 seconds after all players ready


TIPS
====
- Use multiple terminal windows for testing
- Save tournament ID after creating
- Tournament matches are regular games - send movements, scores, etc.
- Winners automatically advance in bracket
- Check logs in backend for detailed tournament flow

EOF

echo ""
echo "To start manual testing, open terminal and run:"
echo "wscat -c '$WS_URL?token=$TOKEN'"
echo ""
