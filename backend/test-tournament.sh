#!/bin/bash

# Tournament API Test Script
# Demonstrates all tournament endpoints

BASE_URL="http://localhost:3001/v1"
TOKEN="" # Will be set after login

echo "=== Tournament System API Tests ==="
echo ""

# 1. Login to get JWT token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"toto@gmail.com","password":"totototo"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# 2. Create a tournament
echo "2. Creating tournament..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/tournament" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Spring Championship 2026","maxPlayers":4}')

TOURNAMENT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//' | head -1)
echo "Response: $CREATE_RESPONSE"
echo "Tournament ID: $TOURNAMENT_ID"
echo ""

# 3. Get user's tournaments
echo "3. Getting user tournaments..."
curl -s -X GET "$BASE_URL/tournament" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 4. Get tournament details
echo "4. Getting tournament details..."
curl -s -X GET "$BASE_URL/tournament/$TOURNAMENT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 5. Get pending invites
echo "5. Getting pending invites..."
curl -s -X GET "$BASE_URL/tournament/invites" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Note: Invite friends requires friend IDs, which need to be set up separately
# Example invite endpoint: POST /v1/tournament/:tournamentId/invite
# Body: {"friendIds": ["friend-id-1", "friend-id-2"]}

echo "=== Tests Complete ==="
echo ""
echo "Other available endpoints:"
echo "  POST /v1/tournament/:tournamentId/invite - Invite friends"
echo "  POST /v1/tournament/:tournamentId/accept - Accept invite"
echo "  POST /v1/tournament/:tournamentId/decline - Decline invite"
echo "  POST /v1/tournament/:tournamentId/start - Start tournament"
echo "  POST /v1/tournament/:tournamentId/match/:matchId/result - Report match result"
