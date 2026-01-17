#!/bin/bash

# Auto Test Script for Friend Management System
# Fully automated verification of the fix

BASE_URL="http://localhost:3000"
CONTENT_TYPE="Content-Type: application/json"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================="
echo "Automated Friend System Test"
echo "========================================="

# Helper function to extract JSON field
get_json_val() {
    echo "$1" | jq -r "$2"
}

# 1. Register User A
echo -e "\n1. Registering User A..."
TIMESTAMP=$(date +%s)
USER_A_NAME="auto_a_$TIMESTAMP"
USER_A_EMAIL="auto_a_$TIMESTAMP@test.com"
DATA_A="{\"name\":\"$USER_A_NAME\",\"email\":\"$USER_A_EMAIL\",\"password\":\"Test123!@#\"}"

RESP_A=$(curl -s -X POST "$BASE_URL/v1/user/register" -H "$CONTENT_TYPE" -d "$DATA_A")
TOKEN_A=$(get_json_val "$RESP_A" ".access_token")
ID_A=$(get_json_val "$RESP_A" ".user.id")
SUCCESS_A=$(get_json_val "$RESP_A" ".success")

if [ "$SUCCESS_A" == "true" ] && [ "$TOKEN_A" != "null" ]; then
    echo -e "${GREEN}✓ User A registered${NC} (ID: $ID_A)"
else
    echo -e "${RED}✗ Failed to register User A${NC}"
    echo "Response: $RESP_A"
    exit 1
fi

# 2. Register User B
echo -e "\n2. Registering User B..."
USER_B_NAME="auto_b_$TIMESTAMP"
USER_B_EMAIL="auto_b_$TIMESTAMP@test.com"
DATA_B="{\"name\":\"$USER_B_NAME\",\"email\":\"$USER_B_EMAIL\",\"password\":\"Test123!@#\"}"

RESP_B=$(curl -s -X POST "$BASE_URL/v1/user/register" -H "$CONTENT_TYPE" -d "$DATA_B")
TOKEN_B=$(get_json_val "$RESP_B" ".access_token")
ID_B=$(get_json_val "$RESP_B" ".user.id")
SUCCESS_B=$(get_json_val "$RESP_B" ".success")

if [ "$SUCCESS_B" == "true" ] && [ "$TOKEN_B" != "null" ]; then
    echo -e "${GREEN}✓ User B registered${NC} (ID: $ID_B)"
else
    echo -e "${RED}✗ Failed to register User B${NC}"
    echo "Response: $RESP_B"
    exit 1
fi

# 3. User A sends Friend Request to User B
echo -e "\n3. Sending Friend Request (A -> B)..."
DATA_REQ="{\"requested_uid\":\"$ID_B\"}"
RESP_REQ=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/v1/friend/request" \
    -H "$CONTENT_TYPE" \
    -H "Authorization: Bearer $TOKEN_A" \
    -d "$DATA_REQ")

HTTP_CODE=$(echo "$RESP_REQ" | tail -n1)
BODY=$(echo "$RESP_REQ" | sed '$d')
SUCCESS_REQ=$(get_json_val "$BODY" ".success")

if [ "$HTTP_CODE" -eq 201 ] || [ "$SUCCESS_REQ" == "true" ]; then
    echo -e "${GREEN}✓ Friend Request Sent${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ Failed to send Friend Request${NC} (Status: $HTTP_CODE)"
    echo "Response: $BODY"
    exit 1
fi

# 4. User B Checks Incoming Requests
echo -e "\n4. User B checking incoming requests..."
RESP_INC=$(curl -s -X GET "$BASE_URL/v1/friend/incoming" \
    -H "Authorization: Bearer $TOKEN_B")

# Check if User A is in the list
REQUEST_ID=$(echo "$RESP_INC" | jq -r ".[] | select(.requesterId == \"$ID_A\") | .id")

if [ -n "$REQUEST_ID" ] && [ "$REQUEST_ID" != "null" ]; then
    echo -e "${GREEN}✓ Request found in User B's incoming list${NC} (Request ID: $REQUEST_ID)"
else
    echo -e "${RED}✗ Request NOT found in User B's incoming list${NC}"
    echo "Response: $RESP_INC"
    exit 1
fi

# 5. User B Accepts Request
echo -e "\n5. User B accepting request..."
DATA_ACC="{\"request_id\":\"$REQUEST_ID\",\"action\":true}"
RESP_ACC=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/v1/friend/respond" \
    -H "$CONTENT_TYPE" \
    -H "Authorization: Bearer $TOKEN_B" \
    -d "$DATA_ACC")

HTTP_CODE_ACC=$(echo "$RESP_ACC" | tail -n1)
BODY_ACC=$(echo "$RESP_ACC" | sed '$d')
SUCCESS_ACC=$(get_json_val "$BODY_ACC" ".success")

if [ "$SUCCESS_ACC" == "true" ]; then
    echo -e "${GREEN}✓ Friend Request Accepted${NC}"
    echo "Response: $BODY_ACC"
else
    echo -e "${RED}✗ Failed to accept request${NC}"
    echo "Response: $BODY_ACC"
    exit 1
fi

# 6. Verify Friendship (User A checks friends list)
echo -e "\n6. Verifying friendship..."
RESP_FRIENDS=$(curl -s -X GET "$BASE_URL/v1/friend/friends" \
    -H "Authorization: Bearer $TOKEN_A")

IS_FRIEND=$(echo "$RESP_FRIENDS" | grep "$ID_B")

if [ -n "$IS_FRIEND" ]; then
    echo -e "${GREEN}✓ User B is in User A's friend list${NC}"
else
    echo -e "${RED}✗ User B NOT found in User A's friend list${NC}"
    echo "Response: $RESP_FRIENDS"
    exit 1
fi

echo -e "\n========================================="
echo -e "${GREEN}ALL TESTS PASSED SUCCESSFULLY!${NC}"
echo "========================================="
