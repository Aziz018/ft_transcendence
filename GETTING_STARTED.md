# 🚀 Getting Started with Microservices

This guide will help you run the ft_transcendence microservices architecture.

## ✅ Prerequisites

1. **Docker & Docker Compose installed**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your OAuth credentials (optional for testing)
   # - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   # - FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET
   # - INTRA42_CLIENT_ID and INTRA42_CLIENT_SECRET
   ```

## 🏗️ First Time Setup

```bash
# 1. Build all services
make build

# 2. Start all services
make up

# 3. Wait for services to be healthy (30-60 seconds)
# Check status
make status
```

## 🌐 Access the Application

Once all services are running:

- **Frontend**: http://localhost or http://localhost:8080
- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/docs

## 🔍 Verify Services Are Running

```bash
# Check all services
make status

# View logs
make logs

# Check individual service health
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Friend Service
curl http://localhost:3004/health  # Chat Service
```

## 🐛 Troubleshooting

### Services won't start

```bash
# Clean everything and rebuild
make fclean
make build
make up
```

### Port conflicts

If you see errors about ports already in use:

```bash
# Check what's using the ports
sudo lsof -i :3000
sudo lsof -i :80

# Stop conflicting services or change ports in docker-compose.yml
```

### Database issues

```bash
# Remove database volume and recreate
docker volume rm ft_transcendence_shared-data
make up
```

### View service logs

```bash
# All services
make logs

# Specific service
make logs-gateway
make logs-auth
make logs-user
make logs-friend
make logs-chat
make logs-frontend
```

## 🔄 Daily Development Workflow

```bash
# Start services
make

# Stop services
make down

# Restart after code changes
make restart

# Rebuild specific service
docker-compose build auth-service
docker-compose up -d auth-service
```

## 📊 Service Health Checks

Each service exposes a `/health` endpoint:

```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service (internal - access via API Gateway)
docker-compose exec auth-service wget -qO- http://localhost:3001/health

# User Service (internal)
docker-compose exec user-service wget -qO- http://localhost:3002/health

# Friend Service (internal)
docker-compose exec friend-service wget -qO- http://localhost:3003/health

# Chat Service (internal)
docker-compose exec chat-service wget -qO- http://localhost:3004/health
```

## 🧪 Testing the Setup

### 1. Test User Registration

```bash
curl -X POST http://localhost:3000/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Test User Login

```bash
curl -X POST http://localhost:3000/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test WebSocket Connection

Open browser console and run:

```javascript
const ws = new WebSocket('ws://localhost:3000/v1/chat/ws?token=YOUR_JWT_TOKEN');
ws.onopen = () => console.log('Connected to chat');
ws.onmessage = (event) => console.log('Message:', event.data);
ws.send(JSON.stringify({ type: 'ping' }));
```

## 🛠️ Common Commands

```bash
# View all containers
docker-compose ps

# Stop all services
make down

# Restart all services
make restart

# Rebuild and restart
make re

# Clean up everything
make fclean

# View logs for specific service
docker-compose logs -f api-gateway

# Execute command in service
docker-compose exec auth-service sh

# Run database migrations
docker-compose exec auth-service npx prisma migrate deploy

# Generate Prisma client
docker-compose exec auth-service npx prisma generate
```

## 📦 What Each Service Does

- **API Gateway** (`:3000`): Entry point, routes requests, handles OAuth
- **Auth Service** (`:3001`): Login, register, JWT, TOTP/2FA
- **User Service** (`:3002`): User profiles, avatars, search
- **Friend Service** (`:3003`): Friend requests, blocking
- **Chat Service** (`:3004`): WebSocket, messages, rooms
- **Frontend** (`:80`): React SPA served by Nginx

## 🎯 Next Steps

1. ✅ Verify all services are running
2. ✅ Access the frontend at http://localhost
3. ✅ Create a test account
4. ✅ Test the chat functionality
5. ✅ Explore the API documentation at http://localhost:3000/docs

## 📚 Additional Resources

- See [README.md](README.md) for full architecture documentation
- Check [docker-compose.yml](docker-compose.yml) for service configuration
- Review individual service code in `services/*/src/`

## ❓ Need Help?

```bash
# Show available make commands
make help

# Check service status
make status

# View recent logs
make logs | tail -n 100
```
