# EADDRINUSE Fix - Complete Production Guide

## What We Fixed

Your backend now has **production-grade port management** with:
- ✅ Graceful shutdown handlers (SIGTERM, SIGINT)
- ✅ Automatic port cleanup on restart
- ✅ Configurable shutdown timeout
- ✅ Socket timeout management
- ✅ PM2 safe restart behavior
- ✅ Docker signal handling

---

## Quick Reference - Immediate Fixes

### If Port 3000 is Stuck Right Now

```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Alternative method
fuser -k 3000/tcp

# Verify it's free
lsof -ti:3000  # Should return nothing
```

### Start Development Mode

```bash
cd backend
npm run dev
```

---

## What Changed (Under the Hood)

### 1. **.env File** - Environment Variables
Added port and shutdown configuration:
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
SHUTDOWN_TIMEOUT=10000  # milliseconds
```

### 2. **nodemon.json** - Restart Behavior
- `delay: 1000` - Wait 1 second before restarting to release sockets
- `signal: "SIGTERM"` - Proper termination signal
- `verbose: true` - See what's happening during restarts

### 3. **src/app.ts** - Graceful Shutdown
Listens for process termination signals and closes server cleanly:
```typescript
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

### 4. **src/server.ts** - Socket Management
- Sets `keepAliveTimeout` to release stale connections
- Catches `EADDRINUSE` errors with helpful messages
- Logs server startup with environment info

### 5. **ecosystem.config.cjs** - PM2 Production
- Proper graceful shutdown timeout: 5 seconds
- Uses compiled JavaScript instead of TypeScript
- Fork mode for single instance (safer than cluster)

### 6. **Dockerfile** - Signal Forwarding
Uses `exec` form to forward Docker stop signals to Node:
```dockerfile
CMD [ "sh", "-c", "exec npm start" ]
```

---

## How to Use Different Ports

### Development (One-off)
```bash
PORT=3001 npm run dev
PORT=8080 npm run dev
```

### Permanent (Update .env)
```env
PORT=5000
```

### Docker Container
```bash
docker run -p 8080:3000 -e PORT=3000 your-image
```

---

## Production Deployment with PM2

### 1. Build for Production
```bash
# Compile TypeScript
npx tsc

# Or if you don't have build script, use:
npx esbuild src/app.ts --bundle --platform=node --outfile=dist/app.js
```

### 2. Start with PM2
```bash
# Start all apps from ecosystem config
pm2 start ecosystem.config.cjs --env production

# Or specific app
pm2 start ecosystem.config.cjs --name pong-rush-backend --env production

# Monitor in real-time
pm2 monit

# View logs
pm2 logs pong-rush-backend
```

### 3. Stop Safely (Graceful Shutdown)
```bash
# Gracefully stop (wait for shutdown_timeout)
pm2 stop pong-rush-backend

# Force kill (if needed)
pm2 kill

# Restart with zero-downtime
pm2 reload pong-rush-backend
```

### 4. PM2 Auto-Start on Server Reboot
```bash
# Generate startup script
pm2 startup

# Save current PM2 processes
pm2 save

# Test it (reboot and check)
pm2 status
```

---

## Docker Production Setup

### Build Image
```bash
docker build -t pong-rush-backend:latest .
```

### Run Container
```bash
# Basic (port 3000)
docker run -d \
  --name pong-rush \
  -p 3000:3000 \
  -e NODE_ENV=production \
  pong-rush-backend:latest

# With custom port
docker run -d \
  --name pong-rush \
  -p 8080:3000 \
  -e PORT=3000 \
  pong-rush-backend:latest

# With volume for database
docker run -d \
  --name pong-rush \
  -p 3000:3000 \
  -v pong-data:/app/prisma \
  -e NODE_ENV=production \
  pong-rush-backend:latest
```

### Graceful Shutdown in Docker
```bash
# Docker sends SIGTERM automatically (15 second timeout)
# Our code catches it and closes cleanly
docker stop pong-rush  # Graceful
docker kill pong-rush  # Force kill
```

---

## Troubleshooting

### Port Still Showing as In Use?
```bash
# Check what's listening
sudo netstat -tulpn | grep 3000

# Or with lsof (more detailed)
lsof -i :3000

# Kill all Node processes as last resort
killall -9 node
```

### Server Crashes Immediately
Check logs:
```bash
# Development
npm run dev  # See error in console

# PM2
pm2 logs pong-rush-backend

# Docker
docker logs pong-rush
```

### Port Changes Not Applying
Make sure to:
1. Update `.env` file
2. Restart with `npm run dev`
3. Don't hardcode port in code (we fixed this ✓)

### Graceful Shutdown Not Working
Verify in **src/app.ts**:
```typescript
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

---

## Performance Tuning

### For High Traffic (Production)
In **ecosystem.config.cjs**:
```javascript
instances: "max",        // Use all CPU cores
exec_mode: "cluster",    // Load balancing
max_memory_restart: "1G" // Increase if needed
```

### Socket Timeout Tuning
In **src/server.ts** `start()` method:
```typescript
listeningServer.keepAliveTimeout = 65000;  // 65s for keep-alive
listeningServer.headersTimeout = 66000;    // 66s for headers
```

---

## Monitoring Health

### PM2 Web Dashboard
```bash
pm2 web
# Opens http://localhost:9615
```

### Check Process Status
```bash
pm2 status              # Current status
pm2 describe pong-rush-backend  # Detailed info
pm2 jlist               # JSON output for scripting
```

---

## Files Modified

1. ✅ `.env` - Added PORT, HOST, NODE_ENV, SHUTDOWN_TIMEOUT
2. ✅ `nodemon.json` - Added delay, signal, verbose
3. ✅ `src/app.ts` - Added graceful shutdown handlers
4. ✅ `src/server.ts` - Added socket management and error handling
5. ✅ `ecosystem.config.cjs` - Production-ready PM2 config
6. ✅ `Dockerfile` - Fixed signal forwarding

---

## Why This Works

| Problem | Solution | File |
|---------|----------|------|
| Port held by dead process | Graceful shutdown on SIGTERM | app.ts |
| Nodemon restarts too fast | 1s delay before restart | nodemon.json |
| Socket timeout issues | Set keepAliveTimeout | server.ts |
| Docker doesn't stop cleanly | Use `exec` in CMD | Dockerfile |
| PM2 cluster conflicts | Use fork mode, single instance | ecosystem.config.cjs |
| No port fallback | Env var configuration | .env |

---

## Next Steps

1. **Test locally:**
   ```bash
   npm run dev
   ```

2. **Test with different port:**
   ```bash
   PORT=5000 npm run dev
   ```

3. **Test graceful shutdown:**
   ```bash
   npm run dev
   # In another terminal:
   killall -s SIGTERM tsx
   # Should see "SIGTERM received. Starting graceful shutdown..."
   ```

4. **Deploy to production:**
   ```bash
   pm2 start ecosystem.config.cjs --env production
   ```

Done! 🚀 Your backend now has enterprise-grade port management.
