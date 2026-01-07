# ft_transcendence - Microservices Architecture

A full-stack web application with real-time chat, user authentication, friend management, and game features, built with a microservices architecture.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Nginx:80)                         │
│                        React SPA + Client-Side Routing                   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (:3000)                              │
│    - Request routing          - JWT validation                          │
│    - OAuth2 handling           - Rate limiting                           │
│    - WebSocket proxy           - CORS management                         │
└─────┬──────────┬───────────┬──────────┬─────────────────────────────────┘
      │          │           │          │
      ▼          ▼           ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   Auth   │ │   User   │ │  Friend  │ │   Chat   │
│ Service  │ │ Service  │ │ Service  │ │ Service  │
│  :3001   │ │  :3002   │ │  :3003   │ │  :3004   │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │            │
     └────────────┴────────────┴────────────┘
                      │
              ┌───────▼────────┐
              │  SQLite DB     │
              │ (Shared Volume)│
              └────────────────┘
```

## 📁 Project Structure

```
ft_transcendence/
├── docker-compose.yml          # Orchestrates all services
├── Makefile                    # Build & run commands
├── .env.example                # Environment variables template
│
├── frontend/                   # React SPA
│   ├── Dockerfile.microservices
│   ├── nginx.conf
│   └── src/
│
└── services/
    ├── api-gateway/            # API Gateway (Port 3000)
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── prisma/
    │   └── src/
    │       └── server.ts       # Routes to microservices
    │
    ├── auth-service/           # Authentication Service (Port 3001)
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── prisma/
    │   └── src/
    │       ├── controllers/    # auth.ts, intra42.ts, totp.ts
    │       ├── routes/         # auth.ts, totp.ts
    │       ├── services/       # auth.ts, totp.ts
    │       └── server.ts
    │
    ├── user-service/           # User Management Service (Port 3002)
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── prisma/
    │   └── src/
    │       ├── controllers/    # user.ts
    │       ├── routes/         # user.ts
    │       ├── services/       # user.ts
    │       └── server.ts
    │
    ├── friend-service/         # Friend Management Service (Port 3003)
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── prisma/
    │   └── src/
    │       ├── controllers/    # friend.ts
    │       ├── routes/         # friend.ts
    │       ├── services/       # friend.ts
    │       └── server.ts
    │
    └── chat-service/           # Chat & Messaging Service (Port 3004)
        ├── Dockerfile
        ├── package.json
        ├── prisma/
        └── src/
            ├── controllers/    # chat.ts, message.ts
            ├── routes/         # chat.ts, message.ts
            ├── services/       # message.ts, room.ts
            ├── middleware/     # chat.ts
            └── server.ts
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Make (optional but recommended)

### Running the Application

```bash
# Start all services (builds if needed)
make

# Stop all services
make down

# View logs from all services
make logs

# View logs from specific service
make logs-gateway
make logs-auth
make logs-user
make logs-friend
make logs-chat
make logs-frontend

# Clean containers and volumes
make clean

# Full cleanup (including images)
make fclean

# Rebuild everything from scratch
make re

# Show service status
make status
```

### Without Make

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api-gateway
```

## 🔌 Services & Ports

| Service         | Port | Public | Description                              |
|-----------------|------|--------|------------------------------------------|
| Frontend        | 80   | ✅      | Nginx serving React SPA                  |
| API Gateway     | 3000 | ✅      | Main API entry point                     |
| Auth Service    | 3001 | ❌      | User authentication & OAuth              |
| User Service    | 3002 | ❌      | User profile management                  |
| Friend Service  | 3003 | ❌      | Friend requests & blocking               |
| Chat Service    | 3004 | ❌      | Real-time messaging & WebSocket          |

**Public Access:**
- Frontend: http://localhost
- API Gateway: http://localhost:3000
- API Documentation: http://localhost:3000/docs

## 🔗 API Endpoints

All external requests go through the API Gateway at `http://localhost:3000`.

### Authentication (`/v1/auth/*`, `/v1/totp/*`)

**Auth Service handles:**
- `POST /v1/user/register` - Register new user
- `POST /v1/user/login` - Login user
- `POST /v1/user/logout` - Logout user
- `GET /v1/user/refresh` - Refresh access token
- `GET /v1/auth/google` - Google OAuth
- `GET /v1/auth/google/callback` - Google OAuth callback
- `GET /v1/auth/facebook` - Facebook OAuth
- `GET /v1/auth/facebook/callback` - Facebook OAuth callback
- `GET /v1/auth/intra42` - 42 Intra OAuth
- `GET /v1/auth/intra42/callback` - 42 Intra OAuth callback

**TOTP/2FA:**
- `GET /v1/totp/status` - Get 2FA status
- `PUT /v1/totp/enable` - Enable 2FA
- `PUT /v1/totp/disable` - Disable 2FA
- `GET /v1/totp/qr-code` - Get 2FA QR code
- `POST /v1/totp/verify` - Verify 2FA code

### User Management (`/v1/user/*`)

**User Service handles:**
- `GET /v1/user/profile` - Get current user profile
- `PUT /v1/user/profile` - Update user profile
- `POST /v1/user/avatar` - Upload avatar
- `GET /v1/user/search` - Search users
- `GET /v1/user/:userId` - Get user by ID

### Friend Management (`/v1/friend/*`)

**Friend Service handles:**
- `POST /v1/friend/request` - Send friend request
- `PUT /v1/friend/respond` - Accept/reject friend request
- `GET /v1/friend/friends` - Get friends list
- `GET /v1/friend/pending` - Get pending requests (sent)
- `GET /v1/friend/incoming` - Get incoming requests
- `POST /v1/friend/block` - Block user
- `POST /v1/friend/unblock` - Unblock user
- `GET /v1/friend/blocked` - Get blocked users
- `DELETE /v1/friend/unfriend` - Remove friend

### Chat & Messaging (`/v1/chat/*`, `/v1/message/*`)

**Chat Service handles:**
- `GET /v1/chat/ws` - WebSocket connection for real-time chat
- `POST /v1/chat/rooms` - Create chat room
- `GET /v1/chat/rooms` - Get user's rooms
- `POST /v1/message/send` - Send message
- `GET /v1/message/direct` - Get direct messages
- `GET /v1/message/room/:roomId` - Get room messages
- `DELETE /v1/message/:messageId` - Delete message

## 🔐 Inter-Service Communication

### Request Flow

1. **External Request** → API Gateway (`:3000`)
2. **API Gateway** validates JWT (if required)
3. **API Gateway** routes to appropriate microservice:
   - `/v1/auth/*` → Auth Service (`:3001`)
   - `/v1/totp/*` → Auth Service (`:3001`)
   - `/v1/user/*` → User Service (`:3002`)
   - `/v1/friend/*` → Friend Service (`:3003`)
   - `/v1/chat/*` → Chat Service (`:3004`)
   - `/v1/message/*` → Chat Service (`:3004`)
4. **Microservice** processes request and returns response
5. **API Gateway** forwards response to client

### WebSocket Flow

1. Client connects to `ws://localhost:3000/v1/chat/ws`
2. API Gateway proxies to Chat Service `ws://chat-service:3004/ws`
3. Bidirectional real-time communication established

### Database Access

- All services access the **same SQLite database** via shared Docker volume
- Database: `/app/shared-data/dev.db`
- Each service has its own Prisma client
- Migrations are run automatically on container startup

## 🛠️ Environment Variables

Create a `.env` file in the project root (use `.env.example` as template):

```bash
# Database
DATABASE_URL=file:/app/shared-data/dev.db

# JWT Secrets
JWT_SECRET=your_jwt_secret_here
CKE_SECRET=your_cookie_secret_here

# Frontend
FRONTEND_ORIGIN=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# 42 Intra OAuth
INTRA42_CLIENT_ID=your_42_client_id
INTRA42_CLIENT_SECRET=your_42_client_secret
```

## 🏛️ Design Principles

### Service Boundaries

Each service has clear ownership:

- **Auth Service**: Authentication, authorization, OAuth, JWT, TOTP/2FA
- **User Service**: User profiles, avatars, user search
- **Friend Service**: Friend relationships, blocking
- **Chat Service**: Real-time messaging, rooms, WebSocket

### Data Consistency

- Shared SQLite database ensures ACID transactions
- No eventual consistency issues
- Single source of truth for all data

### Scalability Strategy

- Services are containerized and isolated
- Can be scaled independently (horizontal scaling)
- API Gateway handles load balancing
- WebSocket connections proxied efficiently

### Development Workflow

1. Each service can be developed independently
2. Shared code (utils, types, models) copied to each service
3. Prisma schema shared across all services
4. TypeScript for type safety across services

## 🧪 Development

### Running Individual Services

```bash
# Run just the API Gateway
docker-compose up api-gateway

# Run auth and user services
docker-compose up auth-service user-service

# Rebuild specific service
docker-compose build user-service
docker-compose up -d user-service
```

### Debugging

```bash
# Follow logs from all services
make logs

# Follow logs from specific service
docker-compose logs -f auth-service

# Execute command in running container
docker-compose exec auth-service sh

# Check service health
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

### Database Migrations

```bash
# Migrations run automatically on container startup
# To run manually:
docker-compose exec auth-service npx prisma migrate deploy

# Generate Prisma Client
docker-compose exec auth-service npx prisma generate

# View database
docker-compose exec auth-service npx prisma studio
```

## 📦 Technology Stack

- **Frontend**: React, Vite, TypeScript, Nginx
- **Backend**: Node.js, Fastify, TypeScript
- **Database**: SQLite, Prisma ORM
- **Authentication**: JWT, OAuth2 (Google, Facebook, 42 Intra), TOTP/2FA
- **Real-time**: WebSocket (ws library)
- **Containerization**: Docker, Docker Compose
- **API Documentation**: Swagger/OpenAPI

## 🔒 Security Features

- JWT-based authentication
- HTTP-only cookies
- CORS configuration
- Rate limiting
- Password hashing (bcrypt)
- Token blacklisting
- Two-Factor Authentication (TOTP)
- OAuth2 integration

## 📝 License

This project is licensed under the GNU General Public License v3.0.

<<<<<<< HEAD
│   │   └── prometheus-grafana
│   │       ├── alertmanager
│   │       │   ├── config
│   │       │   │   └── alertmanager.yml
│   │       │   └── Dockerfile
│   │       ├── grafana
│   │       │   ├── setup-dashboards
│   │       │   │   ├── scripts\
│   │       │   │   └── Dockerfile
│   │       │   └── Dockerfile
│   │       ├── prometheus
│   │       │   ├── config\
│   │       │   └── Dockerfile
│   │       ├── docker-compose.yaml
│   ├── security
│   │   └── vault
│   │       ├── policies\
│   │       ├── config.hcl
│   │       └── Dockerfile
│   ├── server
│   │   ├── ssl\
│   │   ├── Dockerfile
│   │   └── nginx.config
│   └── user-service
│       ├── db\
│       ├── src
│       │   ├── routes\
│       │   ├── types\
│       │   └── index.ts
│       ├── Dockerfile
│       └── package.json
├── frontend
│   ├── public
│   ├── src
│   │   ├── components\
│   │   ├── services\
│   │   ├── types\
│   │   ├── utils\
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker-compose.yml
├── LICENSE
├── Makefile
└── README.md
```
>>>>>>> backend
