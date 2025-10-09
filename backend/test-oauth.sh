#!/bin/bash

# Test script to check Google OAuth configuration

echo "==================================="
echo "🔍 Google OAuth Configuration Test"
echo "==================================="
echo ""

# Check if backend is running
echo "1️⃣ Checking if backend is running..."
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Backend is running on port 3000"
else
    echo "❌ Backend is NOT running on port 3000"
    echo "   Run: cd backend && npm start"
    exit 1
fi

echo ""
echo "2️⃣ Testing OAuth redirect endpoint..."
REDIRECT_URL=$(curl -s -I http://localhost:3000/v1/auth/google | grep -i "location:" | cut -d' ' -f2 | tr -d '\r')

if [ -z "$REDIRECT_URL" ]; then
    echo "❌ No redirect found. Checking if route exists..."
    curl -v http://localhost:3000/v1/auth/google 2>&1 | head -20
    exit 1
fi

echo "✅ Redirect URL received from backend"
echo ""

echo "3️⃣ Analyzing Google OAuth URL..."
echo "Full URL:"
echo "$REDIRECT_URL"
echo ""

# Extract redirect_uri parameter
CALLBACK_URI=$(echo "$REDIRECT_URL" | grep -oP 'redirect_uri=\K[^&]*' | python3 -c "import sys, urllib.parse as ul; print(ul.unquote(sys.stdin.read().strip()))")

echo "4️⃣ Extracted callback URI:"
echo "   $CALLBACK_URI"
echo ""

echo "5️⃣ What you need to add in Google Cloud Console:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Go to: https://console.cloud.google.com/apis/credentials"
echo ""
echo "🔧 Find your OAuth Client ID and add this EXACT URI:"
echo ""
echo "   $CALLBACK_URI"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "6️⃣ Checking environment variables..."
cd backend
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo ""
    echo "Current Google configuration:"
    grep "GOOGLE_CLIENT_ID" .env || echo "❌ GOOGLE_CLIENT_ID not found"
    grep "GOOGLE_CLIENT_SECRET" .env | sed 's/=.*/=***HIDDEN***/' || echo "❌ GOOGLE_CLIENT_SECRET not found"
else
    echo "❌ .env file not found in backend directory"
fi

echo ""
echo "==================================="
echo "✅ Configuration test complete!"
echo "==================================="
