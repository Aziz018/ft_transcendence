#!/bin/bash

# Quick WebSocket Test with provided token

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwY2QzMzJiOS0xNzNiLTQ2MTAtODQ4MC0wZTkzZTRjMWViMGEiLCJuYW1lIjoiYWFhIiwiZW1haWwiOiJhYWFAYWFhLmFhYSIsImNyZWF0ZWRBdCI6IjIwMjYtMDEtMTZUMDI6MjQ6NDAuMTU2WiIsIm1mYV9yZXF1aXJlZCI6ZmFsc2UsImlhdCI6MTc2ODUzMDI4MCwiZXhwIjoxNzY4NjE2NjgwfQ.Ay3ZRSYKYioeBSo_mEStNK9D-9tfSVbb-X4TrEvaYDo"
WS_URL="${WS_URL:-ws://localhost:3001/v1/game/ws}"

echo "🎮 Quick Game WebSocket Test"
echo "=============================="
echo ""
echo "WebSocket URL: $WS_URL"
echo "Token: ${TOKEN:0:20}..."
echo ""
echo "To test manually with wscat:"
echo ""
echo "wscat -c '$WS_URL?token=$TOKEN'"
echo ""
echo "Then send these commands:"
echo ""
echo "1. Join matchmaking:"
echo '   {"type":"matchmaking","payload":{"action":"join","gameType":"classic"}}'
echo ""
echo "2. After game_matched, send ready (replace GAME_ID):"
echo '   {"type":"game_ready","payload":{"gameId":"GAME_ID"}}'
echo ""
echo "3. After game_start, send movements:"
echo '   {"type":"player_move","payload":{"gameId":"GAME_ID","direction":"up","timestamp":1234567890}}'
echo ""
