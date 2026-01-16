#!/bin/bash

# Manual Game Testing Script
# Provides interactive commands to test the game backend

BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
WS_URL="${WS_URL:-ws://localhost:3001/v1/game/ws}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Game Backend Manual Testing${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to get token
get_token() {
    local email="$1"
    local password="$2"

    response=$(curl -s -X POST "$BACKEND_URL/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")

    token=$(echo "$response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

    if [ -z "$token" ]; then
        echo -e "${RED}❌ Failed to get token for $email${NC}" >&2
        echo -e "${RED}Response: $response${NC}" >&2
        echo -e "${YELLOW}Hint: Make sure test users exist (run option 3)${NC}" >&2
        return 1
    fi

    echo "$token"
}

# Test 1: Check service stats
test_service_stats() {
    echo -e "${YELLOW}📊 Test 1: Checking Service Stats${NC}"

    response=$(curl -s "$BACKEND_URL/v1/game/service-stats")
    echo "$response" | jq '.'

    echo -e "${GREEN}✅ Service stats retrieved${NC}\n"
}

# Test 2: WebSocket connection
test_websocket_connection() {
    echo -e "${YELLOW}🔌 Test 2: WebSocket Connection${NC}"

    echo "Getting authentication token..."
    TOKEN=$(get_token "player1@test.com" "password123")

    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ Failed to get token${NC}"
        return 1
    fi

    echo -e "${GREEN}✅ Token received${NC}"
    echo "Token: ${TOKEN:0:20}..."

    echo -e "\n${BLUE}To test WebSocket manually, use:${NC}"
    echo "wscat -c '$WS_URL?token=$TOKEN'"
    echo ""
}

# Test 3: Create test users if needed
create_test_users() {
    echo -e "${YELLOW}👥 Test 3: Creating Test Users${NC}"

    users=(
        "player1@test.com:password123:Player1"
        "player2@test.com:password123:Player2"
    )

    for user in "${users[@]}"; do
        IFS=':' read -r email password name <<< "$user"

        echo "Creating user: $email"
        response=$(curl -s -X POST "$BACKEND_URL/v1/auth/register" \
            -H "Content-Type: application/json" \
            -d "{\"email\":\"$email\",\"password\":\"$password\",\"name\":\"$name\"}" \
            2>&1)

        if echo "$response" | grep -q "access_token\|already exists"; then
            echo -e "${GREEN}✅ User $email ready${NC}"
        else
            echo -e "${YELLOW}⚠️  User $email: $response${NC}"
        fi
    done

    echo ""
}

# Test 4: Run automated WebSocket test
test_websocket_automated() {
    echo -e "${YELLOW}🤖 Test 4: Running Automated WebSocket Tests${NC}"

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm not found. Please install Node.js${NC}"
        return 1
    fi

    echo "Running test suite..."
    cd "$(dirname "$0")/.."
    npm test -- tests/game-websocket.test.ts

    echo ""
}

# Test 5: Load test
test_load() {
    echo -e "${YELLOW}⚡ Test 5: Load Testing${NC}"

    read -p "How many concurrent games? (default: 5): " num_games
    num_games=${num_games:-5}

    echo "Starting load test with $num_games concurrent games..."
    cd "$(dirname "$0")/.."
    NUM_GAMES=$num_games node --loader ts-node/esm tests/game-load.test.ts

    echo ""
}

# Test 6: Manual two-player scenario
test_two_player_manual() {
    echo -e "${YELLOW}👥 Test 6: Two-Player Manual Test Instructions${NC}"

    echo "Getting tokens for both players..."
    TOKEN1=$(get_token "player1@test.com" "password123")
    TOKEN2=$(get_token "player2@test.com" "password123")

    echo -e "${GREEN}✅ Tokens received${NC}\n"

    echo -e "${BLUE}Instructions for manual testing:${NC}"
    echo ""
    echo "1. Open two terminal windows"
    echo ""
    echo "2. In Terminal 1 (Player 1), run:"
    echo "   wscat -c '$WS_URL?token=$TOKEN1'"
    echo ""
    echo "3. In Terminal 2 (Player 2), run:"
    echo "   wscat -c '$WS_URL?token=$TOKEN2'"
    echo ""
    echo "4. In both terminals, send:"
    echo '   {"type":"matchmaking","payload":{"action":"join","gameType":"classic"}}'
    echo ""
    echo "5. Wait for game_matched event"
    echo ""
    echo "6. Both players send ready (replace GAME_ID with actual ID):"
    echo '   {"type":"game_ready","payload":{"gameId":"GAME_ID"}}'
    echo ""
    echo "7. Wait for game_start event"
    echo ""
    echo "8. Send movements:"
    echo '   {"type":"player_move","payload":{"gameId":"GAME_ID","direction":"up","timestamp":1234567890}}'
    echo ""
    echo -e "${YELLOW}Note: Install wscat with: npm install -g wscat${NC}\n"
}

# Test 7: Bot game test
test_bot_game() {
    echo -e "${YELLOW}🤖 Test 7: Bot Game Instructions${NC}"

    TOKEN=$(get_token "player1@test.com" "password123")

    echo -e "${BLUE}Instructions:${NC}"
    echo ""
    echo "1. Connect to WebSocket:"
    echo "   wscat -c '$WS_URL?token=$TOKEN'"
    echo ""
    echo "2. Join matchmaking:"
    echo '   {"type":"matchmaking","payload":{"action":"join","gameType":"classic"}}'
    echo ""
    echo "3. Wait ~10 seconds (no other players)"
    echo ""
    echo "4. You'll be matched with a bot (opponentIsBot: true)"
    echo ""
    echo "5. Send ready:"
    echo '   {"type":"game_ready","payload":{"gameId":"GAME_ID"}}'
    echo ""
    echo "6. Game should start immediately (bot auto-readies)"
    echo ""
}

# Test 8: Disconnection test
test_disconnection() {
    echo -e "${YELLOW}🔌 Test 8: Disconnection Handling Test${NC}"

    echo -e "${BLUE}Instructions:${NC}"
    echo ""
    echo "1. Open two terminals with Player 1 and Player 2 connections"
    echo "2. Match them together"
    echo "3. Before sending ready, disconnect Player 1"
    echo "4. Player 2 should receive game_cancelled event"
    echo ""
    echo "Or test ready timeout:"
    echo "1. Match two players"
    echo "2. Don't send ready from either player"
    echo "3. Wait 30+ seconds"
    echo "4. Both should receive game_cancelled event"
    echo ""
}

# Main menu
show_menu() {
    echo -e "${BLUE}Choose a test to run:${NC}"
    echo "1) Check Service Stats"
    echo "2) Test WebSocket Connection"
    echo "3) Create/Verify Test Users"
    echo "4) Run Automated Tests (requires Node.js)"
    echo "5) Run Load Test"
    echo "6) Manual Two-Player Test (instructions)"
    echo "7) Bot Game Test (instructions)"
    echo "8) Disconnection Test (instructions)"
    echo "9) Run All Automated Tests"
    echo "0) Exit"
    echo ""
}

run_all_tests() {
    echo -e "${BLUE}Running all automated tests...${NC}\n"

    test_service_stats || echo -e "${RED}Service stats test failed${NC}\n"

    echo -e "${YELLOW}Creating test users first...${NC}"
    create_test_users || echo -e "${RED}User creation had issues${NC}\n"

    test_websocket_connection || echo -e "${RED}WebSocket connection test failed${NC}\n"

    if command -v npm &> /dev/null; then
        test_websocket_automated || echo -e "${RED}Automated tests failed${NC}\n"
    else
        echo -e "${YELLOW}⚠️  Skipping automated tests (npm not found)${NC}\n"
    fi

    echo -e "${GREEN}All tests completed${NC}\n"

# Main loop
while true; do
    show_menu
    read -p "Select option: " choice
    echo ""

    case $choice in
        1) test_service_stats ;;
        2) test_websocket_connection ;;
        3) create_test_users ;;
        4) test_websocket_automated ;;
        5) test_load ;;
        6) test_two_player_manual ;;
        7) test_bot_game ;;
        8) test_disconnection ;;
        9) run_all_tests ;;
        0)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}\n"
            ;;
    esac

    read -p "Press Enter to continue..."
    echo ""
done
