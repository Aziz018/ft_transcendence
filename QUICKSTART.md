# Quick Start Guide - Monolithic Architecture

## 🚀 Getting Started in 3 Steps

### 1. Install All Dependencies
```bash
npm install
```

This installs:
- Root dependencies (`concurrently`)
- Backend dependencies (from `backend/`)
- Frontend dependencies (from `frontend/`)

### 2. Start Development
```bash
npm run dev
```

This will:
- ✅ Start Backend on `http://localhost:3000`
- ✅ Start Frontend on `http://localhost:5173`
- ✅ Both services are running with hot reload

### 3. Open in Browser
```
http://localhost:5173
```

---

## 📋 Available Commands

### Development
```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start only backend on :3000
npm run dev:frontend     # Start only frontend on :5173
```

### Building
```bash
npm run build           # Build both frontend and backend
npm run build:frontend  # Build frontend only
npm run build:backend   # Build backend only
```

### Testing
```bash
npm run test            # Run all tests
npm run test:backend    # Run backend tests
npm run test:frontend   # Run frontend tests
```

### Database
```bash
npm run db:migrate      # Run database migrations
npm run db:generate     # Generate Prisma client
npm run db:studio       # Open Prisma Studio
```

---

## 🔧 Configuration

### Backend Port
Backend runs on **port 3000** (default)

To use a different port:
```bash
cd backend && PORT=3001 npm run dev
```

Update `frontend/.env.local` if you change the port:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/v1/chat/ws
```

### Frontend Port
Frontend runs on **port 5173** (default)

---

## 🛠️ Troubleshooting

### Port 3000 Already in Use
```bash
# Find and kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use a different port
cd backend && PORT=3001 npm run dev
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

### Database Issues
```bash
# Regenerate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

### WebSocket Connection Issues
Check `.env.local` - ensure `VITE_WS_URL` matches backend port:
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/v1/chat/ws
```

---

## 📁 Project Structure

```
ft_transcendence/
├── backend/              # Fastify Node.js API
│   ├── src/
│   │   ├── app.ts       # App entry point
│   │   ├── server.ts    # Server config
│   │   ├── routes/      # All API routes (consolidated)
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   └── models/      # Data models
│   └── package.json
│
├── frontend/             # Vite React app
│   ├── src/
│   │   ├── config/
│   │   │   └── api.ts  # Centralized API config ✨ NEW
│   │   ├── components/
│   │   ├── services/
│   │   └── lib/
│   ├── .env.local       # Environment (updated)
│   └── package.json
│
├── package.json          # Root orchestration ✨ NEW
└── MONOLITHIC_MIGRATION.md  # Full migration guide
```

---

## ✨ What's New

1. **Root `package.json`** - Orchestrates both frontend and backend
2. **`frontend/src/config/api.ts`** - Centralized API configuration
3. **`MONOLITHIC_MIGRATION.md`** - Complete migration documentation
4. **Simplified `.env`** - Single backend origin instead of multiple

---

## 📝 API Overview

All API calls use the single base URL: `http://localhost:3000`

### Auth
- `POST /v1/user/register` - Create account
- `POST /v1/user/login` - Login
- `POST /v1/user/logout` - Logout
- `POST /v1/totp/verify` - 2FA verification

### User
- `GET /v1/user/profile` - Get profile
- `PUT /v1/user/profile` - Update profile
- `GET /v1/user/search` - Search users
- `POST /v1/user/avatar` - Upload avatar

### Chat
- `WS /v1/chat/ws` - WebSocket for real-time chat
- `GET /v1/chat/messages` - Get messages
- `GET /v1/chat/rooms` - Get chat rooms

### Friends
- `GET /v1/friend/list` - Get friends
- `POST /v1/friend/add` - Add friend
- `DELETE /v1/friend/remove` - Remove friend

### Game
- `POST /v1/game/start` - Start game
- `GET /v1/game/match/:id` - Get match info

---

## 🎉 Done!

You now have a fully functional monolithic application running locally.

For more details, see [MONOLITHIC_MIGRATION.md](./MONOLITHIC_MIGRATION.md)
