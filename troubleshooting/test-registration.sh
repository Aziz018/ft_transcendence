#!/bin/bash
# Quick test script for registration endpoint

echo "🧪 Testing Backend Registration Endpoint"
echo "========================================="
echo ""

# Test if backend is running
echo "1️⃣ Checking if backend is running on port 3000..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Backend is running on port 3000"
else
    echo "❌ Backend is NOT running on port 3000"
    echo "   Start it with: cd backend && npm run dev"
    exit 1
fi

echo ""
echo "2️⃣ Testing registration endpoint..."
echo "   URL: http://localhost:3000/v1/user/register"
echo ""

# Generate random email to avoid duplicates
RANDOM_EMAIL="test$(date +%s)@example.com"

response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/v1/user/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"password123\"
  }")

# Split response body and status code
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n-1)

echo "Response Status: $http_code"
echo "Response Body: $response_body"
echo ""

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo "✅ SUCCESS! Registration endpoint is working correctly"
    echo "   User registered with email: $RANDOM_EMAIL"
elif [ "$http_code" -eq 409 ]; then
    echo "✅ Backend is working (409 means email already exists)"
else
    echo "❌ FAILED! Got status code: $http_code"
    echo "   Check backend logs for errors"
fi

echo ""
echo "========================================="
echo "Next steps:"
echo "1. Restart frontend: cd frontend && npm run dev"
echo "2. Open browser to frontend URL (usually http://localhost:5173)"
echo "3. Try registering a user through the UI"
echo "4. Check Network tab in DevTools - should see successful request"
