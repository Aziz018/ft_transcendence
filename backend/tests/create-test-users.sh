#!/bin/bash

# Quick script to create test users for game testing

BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"

echo "Creating test users for game backend..."
echo ""

# Test users
declare -A users=(
    ["player1@test.com"]="password123:Player1"
    ["player2@test.com"]="password123:Player2"
)

for email in "${!users[@]}"; do
    IFS=':' read -r password name <<< "${users[$email]}"

    echo "Creating user: $email ($name)"

    response=$(curl -s -X POST "$BACKEND_URL/v1/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\",\"name\":\"$name\"}")

    if echo "$response" | grep -q "access_token"; then
        echo "✅ $email created successfully"
    elif echo "$response" | grep -q "already exists\|duplicate"; then
        echo "ℹ️  $email already exists"
    else
        echo "❌ Failed to create $email"
        echo "   Response: $response"
    fi
    echo ""
done

echo "Test users ready!"
echo ""
echo "You can now run:"
echo "  ./tests/manual-game-test.sh"
echo "  npm test tests/game-websocket.test.ts"
echo "  node --loader ts-node/esm tests/game-load.test.ts"
