#!/bin/bash
# Production deployment helper script

# Start with PM2
pm2 start src/app.ts \
  --name "pong-rush-backend" \
  --interpreter "npx tsx" \
  --env NODE_ENV=production \
  --watch false \
  --max-memory-restart 512M \
  --error ./logs/err.log \
  --out ./logs/out.log \
  --listen-timeout 3000 \
  --kill-timeout 5000 \
  --wait-ready

# Monitor
pm2 monit
