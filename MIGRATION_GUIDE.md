# 🔄 Migration Guide: Monolith → Microservices

This document explains the changes made to migrate from the monolithic architecture to microservices.

## 📋 What Changed?

### Before (Monolith)
```
ft_transcendence/
├── backend/
│   └── src/
│       ├── app.ts              # Single application
│       ├── routes/             # All routes
│       ├── controllers/        # All controllers
│       └── services/           # All services
└── frontend/
```

### After (Microservices)
```
ft_transcendence/
├── docker-compose.yml          # NEW: Orchestrates all services
├── Makefile                    # NEW: Simple commands to control everything
├── frontend/                   # UPDATED: Now containerized
│   ├── Dockerfile.microservices
│   └── nginx.conf
└── services/                   # NEW: Individual microservices
    ├── api-gateway/
    ├── auth-service/
    ├── user-service/
    ├── friend-service/
    └── chat-service/
```

## 🎯 Service Breakdown

### 1. API Gateway (NEW)
- **Purpose**: Single entry point for all external requests
- **Responsibilities**:
  - Routes requests to appropriate microservices
  - Handles OAuth2 flows
  - Proxies WebSocket connections
  - Rate limiting and CORS
- **Port**: 3000 (external)

### 2. Auth Service
- **Extracted from**: `backend/src/controllers/auth.ts`, `controllers/totp.ts`, `controllers/intra42.ts`
- **Responsibilities**:
  - User registration and login
  - JWT token management
  - OAuth2 (Google, Facebook, 42 Intra)
  - TOTP/2FA management
- **Port**: 3001 (internal only)
- **Endpoints**: `/v1/auth/*`, `/v1/totp/*`, `/v1/user/login`, `/v1/user/register`

### 3. User Service
- **Extracted from**: `backend/src/controllers/user.ts`, `services/user.ts`
- **Responsibilities**:
  - User profile management
  - Avatar uploads
  - User search
  - Profile updates
- **Port**: 3002 (internal only)
- **Endpoints**: `/v1/user/*`

### 4. Friend Service
- **Extracted from**: `backend/src/controllers/friend.ts`, `services/friend.ts`
- **Responsibilities**:
  - Friend requests (send, accept, reject)
  - Friend list management
  - Block/unblock users
  - Unfriend functionality
- **Port**: 3003 (internal only)
- **Endpoints**: `/v1/friend/*`

### 5. Chat Service
- **Extracted from**: `backend/src/controllers/chat.ts`, `controllers/message.ts`, `services/message.ts`, `services/room.ts`
- **Responsibilities**:
  - WebSocket connections
  - Real-time messaging
  - Room management
  - Message history
- **Port**: 3004 (internal only)
- **Endpoints**: `/v1/chat/*`, `/v1/message/*`

## 🔗 How Services Communicate

### Request Flow Example: Get User Profile

**Before (Monolith)**:
```
Client → Backend → Database → Backend → Client
```

**After (Microservices)**:
```
Client → API Gateway → User Service → Database → User Service → API Gateway → Client
```

### Inter-Service Communication

Services don't communicate directly with each other. All communication goes through the API Gateway or is done at the database level.

**Example: Friend Request**
1. Client sends request to API Gateway: `POST /v1/friend/request`
2. API Gateway routes to Friend Service
3. Friend Service validates and stores in database
4. Friend Service returns response
5. API Gateway forwards response to client

## 🗄️ Database Strategy

### Decision: Shared Database

We chose a **shared SQLite database** approach:

**Pros**:
- ✅ ACID transactions guaranteed
- ✅ No data synchronization issues
- ✅ Simpler to manage
- ✅ Faster queries (no network calls between services)

**Cons**:
- ❌ Services coupled at database level
- ❌ Schema changes affect all services
- ❌ Cannot scale database per-service

**Alternative** (for future): Each service has its own database with event-driven communication.

### Database Access
- All services connect to: `file:/app/shared-data/dev.db`
- Shared via Docker volume: `shared-data`
- Each service has identical Prisma schema
- Migrations run automatically on container startup

## 🔐 Authentication Flow

### JWT Token Flow

**Before (Monolith)**:
```
1. User logs in
2. Backend generates JWT
3. JWT stored in cookie
4. Backend validates JWT on each request
```

**After (Microservices)**:
```
1. User logs in via API Gateway
2. Auth Service generates JWT
3. JWT stored in cookie
4. API Gateway validates JWT for protected routes
5. Services trust authenticated requests from API Gateway
```

### OAuth2 Flow

**Before (Monolith)**:
```
1. User clicks "Login with Google"
2. Backend redirects to Google
3. Google redirects back to backend callback
4. Backend creates user and issues JWT
```

**After (Microservices)**:
```
1. User clicks "Login with Google"
2. API Gateway (OAuth client) redirects to Google
3. Google redirects to API Gateway callback
4. API Gateway forwards to Auth Service
5. Auth Service creates user and issues JWT
6. JWT returned to client
```

## 📡 WebSocket Handling

### Chat WebSocket Flow

**Before (Monolith)**:
```
Client WebSocket → Backend WebSocket Handler → Database
```

**After (Microservices)**:
```
Client WebSocket → API Gateway (Proxy) → Chat Service WebSocket → Database
```

The API Gateway proxies WebSocket connections to the Chat Service seamlessly.

## 🚀 Deployment Changes

### Before (Monolith)
```bash
cd backend && npm install && npm start
cd frontend && npm install && npm run dev
```

### After (Microservices)
```bash
make          # Builds and starts all services
```

**What happens behind the scenes**:
1. Docker Compose builds 6 containers (frontend + 5 backend services)
2. Creates shared network for service communication
3. Mounts shared volumes for database and avatars
4. Each service runs `prisma migrate deploy` on startup
5. All services become available

## 🔄 Development Workflow Changes

### Before (Monolith)
```bash
# Edit code
nano backend/src/controllers/user.ts

# Restart server
npm restart
```

### After (Microservices)
```bash
# Edit code
nano services/user-service/src/controllers/user.ts

# Rebuild and restart just that service
docker-compose build user-service
docker-compose up -d user-service

# Or restart all services
make restart
```

## 📊 Monitoring & Debugging

### Viewing Logs

**Before (Monolith)**:
```bash
# Single application log
npm start | tee app.log
```

**After (Microservices)**:
```bash
# All services
make logs

# Specific service
make logs-auth
make logs-user
make logs-friend
make logs-chat
make logs-gateway
make logs-frontend

# Or with docker-compose
docker-compose logs -f auth-service
```

### Health Checks

**New Feature**: Each service has a `/health` endpoint

```bash
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service (internal)
curl http://localhost:3002/health  # User Service (internal)
curl http://localhost:3003/health  # Friend Service (internal)
curl http://localhost:3004/health  # Chat Service (internal)
```

## 🛠️ Configuration Management

### Environment Variables

**Before**: Variables scattered across multiple `.env` files

**After**: Centralized in root `.env` file, distributed to services via `docker-compose.yml`

```bash
# Root .env file
DATABASE_URL=file:/app/shared-data/dev.db
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=...

# docker-compose.yml injects these into each service
```

## 🎓 Key Concepts

### 1. Service Isolation
- Each service runs in its own container
- Services cannot directly access each other's memory
- Communication only via HTTP/WebSocket

### 2. API Gateway Pattern
- Single entry point for clients
- Handles cross-cutting concerns (auth, rate limiting, CORS)
- Simplifies client code (one base URL)

### 3. Shared Database
- All services access same database
- Ensures data consistency
- Trade-off: coupling at data layer

### 4. Stateless Services
- Services don't maintain session state
- JWT tokens carry authentication state
- Services can be restarted/scaled without losing data

## ✅ Benefits of This Architecture

1. **Independent Scaling**: Scale services based on load
   ```bash
   docker-compose up -d --scale user-service=3
   ```

2. **Isolated Deployments**: Update one service without affecting others
   ```bash
   docker-compose build auth-service
   docker-compose up -d auth-service
   ```

3. **Technology Flexibility**: Each service can use different tech stack (if needed)

4. **Team Independence**: Different teams can own different services

5. **Fault Isolation**: If one service fails, others continue running

## 🚧 Known Limitations

1. **Database Coupling**: All services share the same database schema
2. **No Service Discovery**: Services have hardcoded URLs
3. **No Load Balancing**: Single instance of each service (can be improved)
4. **No Circuit Breakers**: No protection against cascading failures
5. **No Distributed Tracing**: Hard to trace requests across services

## 🔮 Future Improvements

1. **Service Mesh**: Add Istio or Linkerd for service-to-service communication
2. **Separate Databases**: Give each service its own database
3. **Message Queue**: Add RabbitMQ or Kafka for async communication
4. **API Gateway Enhancements**: Add caching, load balancing, circuit breakers
5. **Monitoring**: Add Prometheus, Grafana for metrics
6. **Logging**: Centralized logging with ELK stack
7. **Service Discovery**: Use Consul or Kubernetes for dynamic service discovery

## 📚 Additional Resources

- [12-Factor App Methodology](https://12factor.net/)
- [Microservices Patterns](https://microservices.io/patterns/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)

## ❓ FAQ

**Q: Can I still run services locally without Docker?**
A: Yes, but you'll need to manage ports and environment variables manually.

**Q: How do I add a new service?**
A: 
1. Create new directory in `services/`
2. Add service configuration to `docker-compose.yml`
3. Add routing in API Gateway

**Q: Can services call each other directly?**
A: Technically yes (they're on the same Docker network), but it's not recommended. Use the API Gateway.

**Q: How do I debug a specific service?**
A: Use `docker-compose logs -f <service-name>` or attach a debugger to the container.

**Q: What happens if the API Gateway goes down?**
A: All external requests will fail. The API Gateway is a single point of failure (can be mitigated with load balancers and multiple instances).
