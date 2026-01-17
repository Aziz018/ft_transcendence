#!/bin/bash
# EADDRINUSE Quick Reference Card
# Save this as a cheatsheet for your team

# ============================================
# 🆘 PORT IS STUCK - EMERGENCY FIX
# ============================================

# One-liner to fix port 3000
kill -9 $(lsof -ti:3000) 2>/dev/null || true

# Or use the helper
./fix-port-3000.sh

# ============================================
# ✅ NORMAL DEVELOPMENT STARTUP
# ============================================

# Option 1: Smart startup (auto-cleanup)
./start-dev.sh

# Option 2: Standard npm
npm run dev

# Option 3: Direct Nodemon
npx nodemon

# ============================================
# 📊 CHECK WHAT'S USING THE PORT
# ============================================

# List process using port 3000
lsof -i :3000

# Get only the PID
lsof -ti:3000

# Check multiple ports
lsof -i :3000 :3001 :5173

# ============================================
# 🧹 CLEAN UP PORTS
# ============================================

# Kill by port number (graceful)
kill $(lsof -ti:3000)

# Kill by port number (force)
kill -9 $(lsof -ti:3000)

# Kill all Node processes
killall node

# Kill by process name pattern
pkill -f "node.*app.ts"

# ============================================
# 🏭 PRODUCTION WITH PM2
# ============================================

# Install PM2 (one time)
npm install -g pm2

# Start
pm2 start ecosystem.config.js --env production

# Restart gracefully
pm2 reload ft-transcendence-backend

# Stop gracefully
pm2 stop ft-transcendence-backend

# View logs
pm2 logs

# Monitor
pm2 monit

# Status
pm2 status

# Helper script (all-in-one)
./pm2-helper.sh start|stop|restart|logs|status

# ============================================
# 🐳 DOCKER DEPLOYMENT
# ============================================

# Build
docker build -t ft-transcendence-backend .

# Run (interactive)
docker run -it -p 3000:3000 ft-transcendence-backend

# Run (daemon)
docker run -d -p 3000:3000 --name backend ft-transcendence-backend

# Stop gracefully
docker stop backend  # Sends SIGTERM

# Kill forcefully
docker kill backend  # Sends SIGKILL

# View logs
docker logs -f backend

# ============================================
# 🔧 CONFIGURATION FILES
# ============================================

# Environment variables
cat .env

# Development config
cat nodemon.json

# Production config
cat ecosystem.config.js

# Docker config
cat Dockerfile

# ============================================
# 📝 LOGGING & DEBUGGING
# ============================================

# Tail server logs in real-time
npm run dev  # Logs appear here

# Check PM2 logs
pm2 logs

# Find if process is still running after Ctrl+C
ps aux | grep node

# ============================================
# 🎯 COMMON ISSUES & FIXES
# ============================================

# Issue: "Cannot find module tsx"
npm install

# Issue: "Prisma client not found"
npx prisma generate

# Issue: "Port still shows as in use"
./fix-port-3000.sh
sleep 2
npm run dev

# Issue: "Nodemon not watching changes"
rm -rf node_modules/.pnpm
npm install

# Issue: "PM2 app won't start"
pm2 delete ft-transcendence-backend
pm2 start ecosystem.config.js --env production
pm2 logs

# ============================================
# 🚀 WHAT TO DO WHEN...
# ============================================

# When starting development
npm run dev

# When port is stuck
./fix-port-3000.sh && npm run dev

# When deploying to production
pm2 start ecosystem.config.js --env production

# When updating code in production
pm2 reload ft-transcendence-backend

# When you want zero-downtime restart
pm2 reload ft-transcendence-backend --update-env

# When debugging
npm run dev
# (Press Ctrl+Shift+J in VS Code to open Debug Console)

# ============================================
# 💾 FILE LOCATIONS
# ============================================

# .env file (create from example)
backend/.env

# Environment example
backend/.env.example

# Development config
backend/nodemon.json

# Production config
backend/ecosystem.config.js

# Docker config
backend/Dockerfile

# Full documentation
backend/EADDRINUSE_FIX.md
backend/PORT_HANDLING.md

# Helper scripts
backend/fix-port-3000.sh
backend/start-dev.sh
backend/pm2-helper.sh

# ============================================
# 📚 DOCUMENTATION
# ============================================

# Complete guide
./EADDRINUSE_FIX.md

# Port handling details
./PORT_HANDLING.md

# Node.js official docs
https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

# PM2 documentation
https://pm2.keymetrics.io/docs/

# Fastify graceful shutdown
https://www.fastify.io/

# ============================================
# ⏱️ TIMING REFERENCE
# ============================================

# Port cleanup takes ~1 second
./fix-port-3000.sh  # < 1s

# Nodemon restart delay
# 500ms (configured in nodemon.json)

# PM2 graceful shutdown timeout
# 5000ms (configured in ecosystem.config.js)

# Docker container stop timeout
# 10s (default, then SIGKILL)

# ============================================
