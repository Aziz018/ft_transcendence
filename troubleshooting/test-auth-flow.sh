#!/bin/bash
# Complete auth flow test script

echo "🔐 Testing Complete Auth Flow"
echo "=============================="
echo ""

# Check if backend is running
if ! lsof -i :3000 > /dev/null 2>&1; then
    echo "❌ Backend is NOT running on port 3000"
    echo "   Start it with: cd backend && npm run dev"
    exit 1
fi

echo "✅ Backend is running on port 3000"
echo ""

# Generate unique email
EMAIL="test$(date +%s)@example.com"
PASSWORD="password123"
NAME="Test User"

echo "1️⃣ Testing Registration..."
echo "   URL: http://localhost:3000/v1/user/register"
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/v1/user/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

REGISTER_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | head -n-1)

echo "   Response: $REGISTER_CODE"

if [ "$REGISTER_CODE" -eq 200 ] || [ "$REGISTER_CODE" -eq 201 ]; then
    echo "   ✅ Registration successful"
    TOKEN=$(echo "$REGISTER_BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo "   Token received: ${TOKEN:0:20}..."
    else
        echo "   ⚠️  No token in response"
    fi
else
    echo "   ❌ Registration failed"
    echo "   Body: $REGISTER_BODY"
    exit 1
fi

echo ""
echo "2️⃣ Testing Login..."
echo "   URL: http://localhost:3000/v1/user/login"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/v1/user/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

echo "   Response: $LOGIN_CODE"

if [ "$LOGIN_CODE" -eq 200 ]; then
    echo "   ✅ Login successful"
    TOKEN=$(echo "$LOGIN_BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    if [ -z "$TOKEN" ]; then
        echo "   ⚠️  No token in login response, trying to extract differently..."
        TOKEN=$(echo "$LOGIN_BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null || echo "")
    fi
elif [ "$LOGIN_CODE" -eq 404 ]; then
    echo "   ❌ Login returned 404 - Endpoint not found!"
    echo "   This means /v1/user/login doesn't exist on the backend"
    echo "   Check backend logs and route registration"
    exit 1
elif [ "$LOGIN_CODE" -eq 401 ]; then
    echo "   ❌ Login returned 401 - Unauthorized"
    echo "   Wrong credentials (this shouldn't happen with test user)"
    exit 1
else
    echo "   ❌ Login failed with code: $LOGIN_CODE"
    echo "   Body: $LOGIN_BODY"
    exit 1
fi

if [ -z "$TOKEN" ]; then
    echo "   ❌ Could not extract token from login response"
    echo "   Response body: $LOGIN_BODY"
    exit 1
fi

echo ""
echo "3️⃣ Testing Protected Route (Profile)..."
echo "   URL: http://localhost:3000/v1/user/profile"
PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET http://localhost:3000/v1/user/profile \
  -H "Authorization: Bearer $TOKEN")

PROFILE_CODE=$(echo "$PROFILE_RESPONSE" | tail -n1)
PROFILE_BODY=$(echo "$PROFILE_RESPONSE" | head -n-1)

echo "   Response: $PROFILE_CODE"

if [ "$PROFILE_CODE" -eq 200 ]; then
    echo "   ✅ Protected route accessible"
elif [ "$PROFILE_CODE" -eq 401 ]; then
    echo "   ❌ Token not accepted (401 Unauthorized)"
    echo "   This could mean the token is invalid or JWT verification failed"
else
    echo "   ❌ Protected route failed with code: $PROFILE_CODE"
    echo "   Body: $PROFILE_BODY"
fi

echo ""
echo "4️⃣ Testing Logout..."
echo "   URL: http://localhost:3000/v1/auth/logout"
LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN")

LOGOUT_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)

echo "   Response: $LOGOUT_CODE"

if [ "$LOGOUT_CODE" -eq 200 ]; then
    echo "   ✅ Logout successful"
elif [ "$LOGOUT_CODE" -eq 404 ]; then
    echo "   ❌ Logout returned 404 - Endpoint /v1/auth/logout not found!"
else
    echo "   ⚠️  Logout returned: $LOGOUT_CODE (may still work)"
fi

echo ""
echo "=============================="
echo "✅ Auth flow test complete!"
echo ""
echo "📝 Test summary:"
echo "   Registration: $REGISTER_CODE (expected 200/201)"
echo "   Login:        $LOGIN_CODE (expected 200)"
echo "   Profile:      $PROFILE_CODE (expected 200)"
echo "   Logout:       $LOGOUT_CODE (expected 200)"
echo ""
echo "Test user created:"
echo "   Email:    $EMAIL"
echo "   Password: $PASSWORD"
echo ""
echo "Next: Test in browser!"
echo "   1. Open http://localhost:5173"
echo "   2. Try to login with the credentials above"
echo "   3. Check Network tab in DevTools"
