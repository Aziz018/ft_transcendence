📚 EADDRINUSE Fix - Complete Documentation Index
================================================

This folder contains the complete solution for the "EADDRINUSE: address already in use 0.0.0.0:3000" error.

## 🚀 START HERE

Read these in order:

1. **START_HERE.md** (backend/) - Visual overview & quick start
2. **EADDRINUSE_FIX.md** (backend/) - Complete technical guide
3. **EADDRINUSE_COMPLETE_SOLUTION.md** (root) - Implementation summary

## 📖 DOCUMENTATION

### For Development
- **backend/START_HERE.md** - Quick visual guide with ASCII art
- **backend/EADDRINUSE_FIX.md** - Complete dev setup guide
- **backend/PORT_HANDLING.md** - Port handling deep dive
- **backend/QUICK_REFERENCE.sh** - Command cheatsheet (view as text)

### For Production
- **backend/ecosystem.config.js** - PM2 configuration for production
- **backend/Dockerfile** - Docker setup with signal handling
- **backend/pm2-helper.sh** - PM2 management script

## 🛠️ HELPER SCRIPTS

All scripts are in `backend/` directory:

```bash
# Emergency port cleanup
./fix-port-3000.sh

# Smart development startup
./start-dev.sh

# Production management
./pm2-helper.sh start|stop|restart|status|logs|delete
```

## 📝 CODE CHANGES

Modified files:
- backend/src/app.ts - Added signal handlers
- backend/src/server.ts - Added EADDRINUSE fallback & gracefulShutdown()
- backend/nodemon.json - Improved restart config
- backend/.env.example - Added PORT variable
- backend/Dockerfile - Fixed signal handling

## 🎯 QUICK START

Development:
```bash
npm run dev
```

Production:
```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

Docker:
```bash
docker build -t backend .
docker run -p 3000:3000 backend
```

## 💡 Key Improvements

✅ **Dynamic Port Assignment** - Never blocked by EADDRINUSE  
✅ **Graceful Shutdown** - Clean resource cleanup on all signals  
✅ **Smart Signal Handling** - Works with Nodemon, PM2, Docker  
✅ **Auto Port Cleanup** - One-liner emergency fix  
✅ **Production Failover** - PM2 auto-restart on crash  
✅ **Zero-Downtime Restarts** - PM2 graceful reload  
✅ **Docker Ready** - Proper signal forwarding  
✅ **Fully Documented** - Multiple guides for different scenarios  

## 🔍 How It Works

### Development (npm run dev)
1. Nodemon watches for file changes
2. If port 3000 is busy → auto-tries 3001, 3002, etc.
3. On file change → graceful shutdown → clean restart
4. Ctrl+C → clean exit, port is released

### Production (PM2)
1. Process starts with health checks
2. Crashes → auto-restarts (up to 10 times)
3. Manual restart → zero-downtime graceful reload
4. Memory limit prevents bloat

### Docker
1. Container receives SIGTERM on stop
2. Process gracefully shuts down (5s timeout)
3. Port is released before timeout
4. Health check endpoint monitors container health

## 🚨 Emergency Commands

```bash
# Port stuck?
./fix-port-3000.sh

# Or manually:
kill -9 $(lsof -ti:3000) 2>/dev/null || true

# PM2 issues?
pm2 delete ft-transcendence-backend
pm2 start ecosystem.config.js --env production

# See what's using a port?
lsof -i :3000
```

## 📊 Files Overview

```
backend/
├── START_HERE.md                 ← Read this first!
├── EADDRINUSE_FIX.md            ← Complete guide
├── PORT_HANDLING.md             ← Port handling reference
├── QUICK_REFERENCE.sh           ← Commands cheatsheet
├── fix-port-3000.sh             ← Emergency cleanup (executable)
├── start-dev.sh                 ← Smart startup (executable)
├── pm2-helper.sh                ← PM2 management (executable)
├── ecosystem.config.js          ← PM2 production config
├── nodemon.json                 ← Dev config (UPDATED)
├── Dockerfile                   ← Docker config (UPDATED)
├── .env.example                 ← Environment template (UPDATED)
├── src/
│   ├── app.ts                   ← Signal handlers (UPDATED)
│   └── server.ts                ← Port fallback (UPDATED)
└── ... (other existing files)

root/
└── EADDRINUSE_COMPLETE_SOLUTION.md ← Implementation summary
```

## 🎓 For Your Team

Share these files:
1. **START_HERE.md** - Quick overview
2. **QUICK_REFERENCE.sh** - Command cheatsheet
3. **EADDRINUSE_FIX.md** - For detailed understanding

Tell them:
- Use `npm run dev` for development (no special setup needed)
- Port 3000 busy? Run `./fix-port-3000.sh`
- Production? Use PM2 with `pm2 start ecosystem.config.js`

## ✅ Verification Checklist

- ✅ app.ts has SIGTERM/SIGINT/SIGHUP handlers
- ✅ server.ts has EADDRINUSE fallback logic
- ✅ server.ts has gracefulShutdown() method
- ✅ nodemon.json has SIGTERM signal config
- ✅ .env.example has PORT variable
- ✅ Dockerfile uses exec form ENTRYPOINT
- ✅ ecosystem.config.js created
- ✅ Helper scripts are executable
- ✅ Documentation is complete

## 🔗 Related Documentation

Within the repo:
- backend/CONTRIBUTING.md
- backend/README.md
- backend/OAUTH_FLOW_EXPLAINED.md

Online resources:
- Node.js Docker: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
- PM2 Docs: https://pm2.keymetrics.io/docs/
- Fastify Docs: https://www.fastify.io/

## 📞 Support

If you encounter issues:

1. Check QUICK_REFERENCE.sh for common commands
2. Read EADDRINUSE_FIX.md for detailed explanation
3. Run `./fix-port-3000.sh` if port is stuck
4. Check logs with `npm run dev` or `pm2 logs`
5. Verify environment with `npm list` and `node --version`

---

**Last Updated**: January 17, 2026  
**Status**: ✅ Production Ready  
**All scenarios tested**: ✅ Yes
