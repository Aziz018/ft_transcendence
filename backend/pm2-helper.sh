#!/bin/bash
# Helper script for PM2 management
# Usage: ./pm2-helper.sh [start|stop|restart|status|logs|delete]

set -e

COMMAND=${1:-status}
APP_NAME="ft-transcendence-backend"

case $COMMAND in
  start)
    echo "🚀 Starting $APP_NAME with PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo "✅ App started. Run 'pm2 logs' to watch"
    ;;
  stop)
    echo "⏹️  Stopping $APP_NAME..."
    pm2 stop $APP_NAME
    echo "✅ App stopped"
    ;;
  restart)
    echo "🔄 Restarting $APP_NAME gracefully..."
    pm2 reload $APP_NAME
    echo "✅ App restarted"
    ;;
  status)
    echo "📊 PM2 Status:"
    pm2 status
    ;;
  logs)
    echo "📝 Following logs (Ctrl+C to exit)..."
    pm2 logs $APP_NAME
    ;;
  delete)
    echo "🗑️  Deleting $APP_NAME from PM2..."
    pm2 delete $APP_NAME
    echo "✅ App deleted"
    ;;
  *)
    echo "Usage: $0 [start|stop|restart|status|logs|delete]"
    exit 1
    ;;
esac
