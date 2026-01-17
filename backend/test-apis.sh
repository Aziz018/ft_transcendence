#!/bin/bash

# Friend Management API Testing Script
# This script tests all endpoints in the friend management system

BASE_URL="http://localhost:3000"
CONTENT_TYPE="Content-Type: application/json"

echo "========================================="
echo "Friend Management API Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local token="$5"
    local expected_code="$6"
    
    echo -e "${YELLOW}Testing:${NC} $name"
    echo "  Method: $method"
    echo "  Endpoint: $endpoint"
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "$CONTENT_TYPE" \
                -H "Authorization: Bearer $token" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "$CONTENT_TYPE" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "  Status: $http_code"
    echo "  Response: $body" | head -c 200
    echo ""
    
    if [ "$http_code" -eq "$expected_code" ]; then
        echo -e "  ${GREEN}✓ PASS${NC}"
        ((PASS++))
    else
        echo -e "  ${RED}✗ FAIL${NC} (Expected: $expected_code)"
        ((FAIL++))
    fi
    echo ""
}

# ==============================================
# PART 1: AUTHENTICATION TESTS
# ==============================================

echo "========================================="
echo "PART 1: Authentication Tests"
echo "========================================="
echo ""

# Test 1: Signup
test_endpoint \
    "Signup - Create User 1" \
    "POST" \
    "/v1/user/register" \
    '{"name":"testuser1","email":"test1@example.com","password":"Test123!@#"}' \
    "" \
    "201"

# Test 2: Login
test_endpoint \
    "Login - User 1" \
    "POST" \
    "/v1/user/login" \
    '{"email":"test1@example.com","password":"Test123!@#"}' \
    "" \
    "200"

# Extract token from login response (you'll need to do this manually)
echo "================================================"
echo "MANUAL STEP: Copy the JWT token from above"
echo "and set it as TOKEN1 variable:"
echo "export TOKEN1='your-token-here'"
echo "================================================"
echo ""

# Test 3: Create second user for friend request testing
test_endpoint \
    "Signup - Create User 2" \
    "POST" \
    "/v1/user/register" \
    '{"name":"testuser2","email":"test2@example.com","password":"Test123!@#"}' \
    "" \
    "201"

test_endpoint \
    "Login - User 2" \
    "POST" \
    "/v1/user/login" \
    '{"email":"test2@example.com","password":"Test123!@#"}' \
    "" \
    "200"

echo "================================================"
echo "MANUAL STEP: Copy the JWT token from above"
echo "and set it as TOKEN2 variable:"
echo "export TOKEN2='your-token-here'"
echo "================================================"
echo ""

# ==============================================
# PART 2: USER MANAGEMENT TESTS
# ==============================================

echo "========================================="
echo "PART 2: User Management Tests"
echo "========================================="
echo ""

# Note: You need to set TOKEN1 and TOKEN2 before running these tests

# Test 4: Get User Profile
if [ -n "$TOKEN1" ]; then
    test_endpoint \
        "Get User Profile" \
        "GET" \
        "/v1/user/profile" \
        "" \
        "$TOKEN1" \
        "200"
fi

# Test 5: Search Users
if [ -n "$TOKEN1" ]; then
    test_endpoint \
        "Search Users" \
        "GET" \
        "/v1/user/search?q=test" \
        "" \
        "$TOKEN1" \
        "200"
fi

# ==============================================
# PART 3: FRIEND REQUEST TESTS
# ==============================================

echo "========================================="
echo "PART 3: Friend Request Tests"
echo "========================================="
echo ""

# Get User IDs first (manual step required)
echo "================================================"
echo "MANUAL STEP: Get user IDs from profile responses"
echo "export USER1_ID='user-1-id-here'"
echo "export USER2_ID='user-2-id-here'"
echo "================================================"
echo ""

# Test 6: Send Friend Request (User 1 → User 2)
if [ -n "$TOKEN1" ] && [ -n "$USER2_ID" ]; then
    test_endpoint \
        "Send Friend Request (User1 → User2)" \
        "POST" \
        "/v1/friend/request" \
        "{\"requested_uid\":\"$USER2_ID\"}" \
        "$TOKEN1" \
        "201"
fi

# Test 7: Get Pending Requests (User 1)
if [ -n "$TOKEN1" ]; then
    test_endpoint \
        "Get Pending Requests (User 1)" \
        "GET" \
        "/v1/friend/pending" \
        "" \
        "$TOKEN1" \
        "200"
fi

# Test 8: Get Incoming Requests (User 2)
if [ -n "$TOKEN2" ]; then
    test_endpoint \
        "Get Incoming Requests (User 2)" \
        "GET" \
        "/v1/friend/incoming" \
        "" \
        "$TOKEN2" \
        "200"
fi

# Get friend request ID (manual step)
echo "================================================"
echo "MANUAL STEP: Get friend request ID from response"
echo "export REQUEST_ID='request-id-here'"
echo "================================================"
echo ""

# Test 9: Accept Friend Request (User 2 accepts User 1's request)
if [ -n "$TOKEN2" ] && [ -n "$REQUEST_ID" ]; then
    test_endpoint \
        "Accept Friend Request" \
        "PUT" \
        "/v1/friend/respond" \
        "{\"request_id\":\"$REQUEST_ID\",\"action\":true}" \
        "$TOKEN2" \
        "200"
fi

# Test 10: Get Friends List (User 1)
if [ -n "$TOKEN1" ]; then
    test_endpoint \
        "Get Friends List (User 1)" \
        "GET" \
        "/v1/friend/friends" \
        "" \
        "$TOKEN1" \
        "200"
fi

# Test 11: Get Friends List (User 2)
if [ -n "$TOKEN2" ]; then
    test_endpoint \
        "Get Friends List (User 2)" \
        "GET" \
        "/v1/friend/friends" \
        "" \
        "$TOKEN2" \
        "200"
fi

# ==============================================
# PART 4: BLOCK/UNBLOCK TESTS
# ==============================================

echo "========================================="
echo "PART 4: Block/Unblock Tests"
echo "========================================="
echo ""

# Test 12: Block User (User 1 blocks User 2)
if [ -n "$TOKEN1" ] && [ -n "$USER2_ID" ]; then
    test_endpoint \
        "Block User (User1 blocks User2)" \
        "POST" \
        "/v1/friend/block" \
        "{\"blocked_uid\":\"$USER2_ID\"}" \
        "$TOKEN1" \
        "200"
fi

# Test 13: Get Blocked Users
if [ -n "$TOKEN1" ]; then
    test_endpoint \
        "Get Blocked Users (User 1)" \
        "GET" \
        "/v1/friend/blocked" \
        "" \
        "$TOKEN1" \
        "200"
fi

# Test 14: Unblock User
if [ -n "$TOKEN1" ] && [ -n "$USER2_ID" ]; then
    test_endpoint \
        "Unblock User (User1 unblocks User2)" \
        "POST" \
        "/v1/friend/unblock" \
        "{\"blocked_uid\":\"$USER2_ID\"}" \
        "$TOKEN1" \
        "200"
fi

# ==============================================
# PART 5: ERROR HANDLING TESTS
# ==============================================

echo "========================================="
echo "PART 5: Error Handling Tests"
echo "========================================="
echo ""

# Test 15: Duplicate Friend Request (should fail with 409)
if [ -n "$TOKEN1" ] && [ -n "$USER2_ID" ]; then
    test_endpoint \
        "Duplicate Friend Request (should fail)" \
        "POST" \
        "/v1/friend/request" \
        "{\"requested_uid\":\"$USER2_ID\"}" \
        "$TOKEN1" \
        "409"
fi

# Test 16: Send Request to Self (should fail with 409)
if [ -n "$TOKEN1" ] && [ -n "$USER1_ID" ]; then
    test_endpoint \
        "Send Request to Self (should fail)" \
        "POST" \
        "/v1/friend/request" \
        "{\"requested_uid\":\"$USER1_ID\"}" \
        "$TOKEN1" \
        "409"
fi

# Test 17: Unauthorized Access (no token)
test_endpoint \
    "Unauthorized Access (should fail)" \
    "GET" \
    "/v1/friend/friends" \
    "" \
    "" \
    "401"

# ==============================================
# TEST SUMMARY
# ==============================================

echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${RED}Failed:${NC} $FAIL"
echo "Total:  $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
else
    echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
fi
