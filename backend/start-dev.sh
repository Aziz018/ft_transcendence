#!/bin/bash
# Development startup script with auto port assignment
# Automatically kills existing process if port is in use

set -e

PORT=${PORT:-3000}
MAX_ATTEMPTS=5

cleanup_port() {
    local port=$1
    if PID=$(lsof -ti:$port 2>/dev/null); then
        echo "⚠️  Port $port is in use (PID: $PID). Cleaning up..."
        kill -SIGTERM $PID 2>/dev/null || true
        sleep 1
        kill -9 $PID 2>/dev/null || true
        sleep 1
        echo "✅ Cleaned up port $port"
    fi
}

echo "🚀 Starting ft_transcendence backend (development mode)"
echo "📦 Node: $(node --version)"
echo "📦 NPM: $(npm --version)"
echo ""

# Clean up any existing process
cleanup_port $PORT

# Install deps if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Generate Prisma types if needed
if [ ! -d "node_modules/.prisma" ]; then
    echo "🔧 Generating Prisma client..."
    npx prisma generate
fi

echo "▶️  Starting Nodemon (Ctrl+C to stop)"
echo "📡 Server will be available at: http://localhost:$PORT"
echo ""

# Start with Nodemon
npm run dev
