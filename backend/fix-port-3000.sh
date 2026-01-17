#!/bin/bash
# Quick fix for EADDRINUSE error on Linux
# Usage: ./fix-port-3000.sh

set -e

PORT=${1:-3000}

echo "🔍 Looking for process on port $PORT..."

# Find and kill the process
if PID=$(lsof -ti:$PORT 2>/dev/null); then
    echo "Found process PID: $PID"
    echo "💀 Killing process..."
    kill -9 $PID
    sleep 1
    echo "✅ Port $PORT is now free"
else
    echo "✅ Port $PORT is already free"
fi

echo ""
echo "🚀 You can now run: npm run dev"
