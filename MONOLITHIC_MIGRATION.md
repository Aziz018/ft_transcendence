# Monolithic Architecture Migration Guide

## Overview
This project has been converted from a split frontend/backend microservices architecture to a **monolithic architecture** where:
- Both frontend and backend are in the same repository
- They run on the same origin (`http://localhost:3000`)
- Development is simplified with a single `npm run dev` command

---

## What Changed

### ✅ Frontend Changes

#### 1. **Environment Variables** (`.env.local`)
**Before:**
```env
VITE_BACKEND_ORIGIN=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/v1/chat/ws
```

**After:**
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/v1/chat/ws
```

#### 2. **Centralized API Config** (`src/config/api.ts`)
All frontend services now use a single configuration file instead of hardcoding URLs:

```typescript
import API_CONFIG from "../../config/api";

// Usage:
fetch(API_CONFIG.AUTH.LOGIN, {...})
fetch(API_CONFIG.USER.PROFILE, {...})
fetch(API_CONFIG.CHAT.WS, {...})
```

#### 3. **Updated Services**
The following files were updated to use `API_CONFIG`:
- `src/components/SignUp/Main.tsx` - Uses `API_CONFIG.AUTH.REGISTER`
- `src/components/Login/components/Main/LoginForm.tsx` - Uses `API_CONFIG.AUTH.LOGIN`
- `src/services/chatService.ts` - Uses `API_CONFIG.BASE_URL` and `API_CONFIG.WS_URL`
- `src/services/wsService.ts` - Uses `API_CONFIG.WS_URL`

#### 4. **Single Backend Origin**
All API calls now point to a single backend URL without service-specific routing.

---

### ✅ Backend Changes

#### 1. **Port Configuration**
**Before:** Backend listened on port 3000 (mapped to 3001 in Docker)
**After:** Backend listens on port 3000 (actual port)

Updated in `backend/Makefile`:
```makefile
# Before:
@docker run -p 3001:3000 ...

# After:
@docker run -p 3000:3000 ...
```

#### 2. **Routes Structure** (No changes needed)
Backend routes remain the same since they were already monolithic:
```
/v1/user/*     - User/Auth routes
/v1/chat/*     - Chat routes
/v1/friend/*   - Friend routes
/v1/game/*     - Game routes
/v1/totp/*     - 2FA routes
/v1/message/*  - Message routes
```

---

### ✅ Root Project Changes

#### 1. **Root `package.json`** (New)
Added at project root for orchestrating both frontend and backend:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "test": "npm run test:backend && npm run test:frontend",
    "db:migrate": "cd backend && npm run db:migrate"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

---

## How to Run

### Install Dependencies
```bash
npm install
```

This will:
1. Install `concurrently` at the root
2. `cd backend && npm install`
3. `cd frontend && npm install`

### Start Development
```bash
npm run dev
```

This will:
- Start backend on `http://localhost:3000`
- Start frontend on `http://localhost:5173`
- Frontend communicates with backend at `http://localhost:3000`

### Individual Commands
```bash
# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build for production
npm run build

# Run tests
npm run test

# Database operations
npm run db:migrate
npm run db:generate
npm run db:studio
```

---

## Benefits of Monolithic Architecture

✅ **Simpler Development**
- One `npm run dev` command
- No need to manage multiple services
- Easier debugging with everything in one place

✅ **Reduced Complexity**
- No inter-service communication
- No message queues or event buses needed
- No service discovery

✅ **Better Performance**
- No network latency between services
- No serialization/deserialization overhead
- Direct function calls for internal logic

✅ **Easier Deployment**
- Single Docker image for production
- One process to manage
- Simpler environment configuration

---

## Files Modified

### Frontend
- `frontend/.env.local` - Updated environment variables
- `frontend/src/config/api.ts` - **NEW** - Centralized API configuration
- `frontend/src/components/SignUp/Main.tsx` - Updated to use API_CONFIG
- `frontend/src/components/Login/components/Main/LoginForm.tsx` - Updated to use API_CONFIG
- `frontend/src/services/chatService.ts` - Updated to use API_CONFIG
- `frontend/src/services/wsService.ts` - Updated to use API_CONFIG

### Backend
- `backend/Makefile` - Updated port mapping to 3000

### Root
- `package.json` - **NEW** - Root orchestration package

---

## Migration Checklist

- [x] Consolidated frontend/backend into monolithic structure
- [x] Updated environment variables to single origin
- [x] Created centralized API configuration
- [x] Updated all frontend services to use single base URL
- [x] Removed service-specific environment variables
- [x] Created root package.json with dev script
- [x] Updated backend port mapping
- [x] Created this migration guide

---

## What Was Removed

❌ **Service-Specific Code:**
- No more hardcoded `localhost:3001` URLs in components
- No more `VITE_BACKEND_ORIGIN` references scattered throughout code

❌ **Docker/Compose Complexity:**
- Single Docker image for backend (still available if needed)
- No need for docker-compose orchestration for local development

❌ **Multi-Service Complexity:**
- No inter-service communication patterns
- No need for API gateway or reverse proxy

---

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
cd backend && PORT=3001 npm run dev
```

### Dependencies Not Installed
```bash
npm install
cd backend && npm install
cd frontend && npm install
```

### Database Issues
```bash
cd backend
npm run db:generate
npm run db:migrate
```

---

## Next Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000/v1/*`

4. **Test signup/login:**
   - Navigate to signup page
   - Create account
   - Verify API calls go to `http://localhost:3000`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│         Monolithic Application              │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (Vite + React)                   │
│  Port: 5173                                │
│  ├─ Components                             │
│  ├─ Services (use API_CONFIG)             │
│  └─ Config                                 │
│         │                                   │
│         │ HTTP/WS Calls                    │
│         │ (All to localhost:3000)          │
│         ▼                                   │
│                                             │
│  Backend (Fastify + Node.js)               │
│  Port: 3000                                │
│  ├─ /v1/user/* (Auth, Profile)           │
│  ├─ /v1/chat/* (Chat, WebSocket)         │
│  ├─ /v1/friend/* (Friends)               │
│  ├─ /v1/game/* (Game logic)              │
│  └─ /v1/totp/* (2FA)                     │
│         │                                   │
│         ▼                                   │
│  Database (PostgreSQL/SQLite)             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Questions?

- Check the implementation in `frontend/src/config/api.ts`
- Review how services use `API_CONFIG`
- Compare `.env.local` before and after
- Check individual service files for usage patterns
