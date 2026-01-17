# Port Handling & Graceful Shutdown Guide

## Problem Fixed
The `EADDRINUSE: address already in use 0.0.0.0:3000` error has been resolved with:

### 1. **Dynamic Port Fallback** (Development)
- If port 3000 is busy, automatically tries 3001, 3002, etc.
- See [src/server.ts](src/server.ts#L276) `start()` method

### 2. **Graceful Shutdown Handlers** (All Environments)
- Captures SIGTERM, SIGINT, SIGHUP signals
- Properly closes Fastify server and Prisma connections
- Prevents port from being held up after restart
- See [src/app.ts](src/app.ts#L66) signal handlers

### 3. **Improved Nodemon Config** (Development)
- Sends SIGTERM signal for graceful termination
- 500ms delay before restart to free resources
- Only watches TypeScript files
- See [nodemon.json](nodemon.json)

### 4. **PM2 Production Setup** (Production)
- Cluster mode for better resource handling
- Graceful shutdown with 5s timeout
- Auto-restart on crashes
- Memory limits and monitoring
- See [ecosystem.config.js](ecosystem.config.js)

## Usage

### Development
```bash
# Start with auto-port fallback & graceful shutdown
npm run dev

# Kill stuck process if needed
kill -9 $(lsof -ti:3000) 2>/dev/null || true
```

### Production
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit

# View logs
pm2 logs ft-transcendence-backend

# Restart gracefully
pm2 reload ft-transcendence-backend

# Stop gracefully
pm2 stop ft-transcendence-backend

# Delete from PM2
pm2 delete ft-transcendence-backend
```

### Docker (Production)
The updated Dockerfile includes proper signal handling and health checks.

```bash
docker build -t ft-transcendence-backend .
docker run -p 3000:3000 -e NODE_ENV=production ft-transcendence-backend
```

## Environment Variables
Create a `.env` file (or update `.env.example`):
```env
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
```

## Key Improvements
✅ Never blocks on EADDRINUSE again  
✅ Clean shutdown on Ctrl+C  
✅ Proper resource cleanup  
✅ Production-ready with PM2  
✅ Docker-safe with signal handling  
