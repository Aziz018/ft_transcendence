/**
 * Centralized API Configuration









































































































































































































































































**Note:** Your backend already has excellent CORS configuration. The issue was purely the DNS resolution of `pongrush.game` in your local environment.---- Database connection (PostgreSQL should be running)- Browser console for detailed error messages- Backend console for error logsIf you still encounter issues after following these steps, check:4. **Check the Network tab** to confirm request succeeds3. **Try registering a new user** with a unique email2. **Clear browser cache** or use incognito mode1. **Restart both servers** (frontend and backend)## 🚀 Next Steps4. ✅ Created comprehensive troubleshooting guides3. ✅ Confirmed registration endpoint exists at `/v1/user/register`2. ✅ Verified CORS is properly configured in backend1. ✅ Changed `frontend/.env.local` from `pongrush.game` to `localhost`## ✨ What Was Fixed```  -v  -d '{"name": "Test", "email": "test@test.com", "password": "test123"}' \  -H "Content-Type: application/json" \curl -X POST http://localhost:3000/v1/user/register \```bash### Test Registration via curl```# Check the terminal where you ran npm run dev# If running directlypm2 logs# If using pm2cd backend```bash### View Backend Logs```curl http://localhost:5173 -I# Should show Vite dev server```bash### Check Frontend Dev Server```curl http://localhost:3000/v1/user/profile -I```bash### Check if Backend is Running## 📝 Quick Reference```VITE_API_URL=http://localhost:3000  # Browser connects via localhost# frontend/.env.docker```envFor Docker development:- Browser → Backend container: Use `http://localhost:3000`- Frontend container → Backend container: Use `http://gateway:3000`When using Docker Compose, your services communicate via service names:### Docker```VITE_WS_URL=wss://your-production-domain.com/v1/chat/wsVITE_API_URL=https://your-production-domain.com```envCreate `frontend/.env.production`:### Production```VITE_WS_URL=ws://localhost:3000/v1/chat/wsVITE_API_URL=http://localhost:3000```envCreate `frontend/.env.local` (already done):### Development## 🎯 Environment Variable Best Practices```VITE_API_URL=https://pongrush.game```env**Production (`.env.production`):**```VITE_API_URL=http://localhost:3000```env**Development (`.env.local`):**If `pongrush.game` is your production domain, use different configs for dev and prod:### Option B: Use Production DomainThen revert `.env.local` to use `pongrush.game`.```echo "127.0.0.1 pongrush.game" | sudo tee -a /etc/hosts```bash### Option A: Add to `/etc/hosts`If you want to use `pongrush.game` locally:## 🌐 Using Custom Domain (Optional)```}  // ...  REGISTER: `${API_URL}/v1/user/register`,  // ✓ Correct  LOGIN: `${API_URL}/v1/user/login`,AUTH: {```typescriptVerify in your frontend API config (`frontend/src/config/api.ts`):The registration endpoint is: `POST /v1/user/register`**Symptom:** `404 Not Found`### Issue 4: Wrong Endpoint URL```./fix-port-3000.shcd backend# Or use the provided scriptkill -9 <PID># Kill itlsof -i :3000# Find process using port 3000```bash**Fix:****Symptom:** `EADDRINUSE: address already in use :::3000`### Issue 3: Port Already in Use3. Try in incognito/private window2. Clear browser cache (Ctrl+Shift+Delete)1. Restart the backend serverIf you still see CORS errors:```});  exposedHeaders: ["Authorization"],  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],  credentials: true,  origin: true,  // Allows all originsawait this.fastify.register(fcors, {```typescriptYour backend is already configured correctly with:**Symptom:** Console shows "blocked by CORS policy"### Issue 2: CORS Error```npm run dev# If nothing is running, start itlsof -i :3000# Check if process is runningcd backend```bash**Fix:****Symptom:** `ERR_CONNECTION_REFUSED`### Issue 1: Backend Not Running## 🐛 Troubleshooting Common Issues```[SignUp] Registration successful, redirecting to dashboard[SignUp] Response status: 200 (or 201)[SignUp] Registering user at: http://localhost:3000/v1/user/register```Your browser console should show:### Step 4: Verify in Console   - If you see `(failed)` with CORS error, see CORS troubleshooting below   - Status should be: `200` or `201` (success) or `409` (duplicate email)   - URL should be: `http://localhost:3000/v1/user/register`4. **Check the Network request:**3. **Try to register a user** through your frontend form2. **Go to Network Tab**1. **Open Browser DevTools** (F12 or Ctrl+Shift+I)### Step 3: Test in Browser- OR `409 Conflict` (if email already exists - this is fine, means backend is working)- Status: `200 OK` or `201 Created` (successful registration)**Expected Response:**```  -v  }' \    "password": "password123"    "email": "test@example.com",    "name": "Test User",  -d '{  -H "Content-Type: application/json" \curl -X POST http://localhost:3000/v1/user/register \```bashOpen a new terminal and test the backend directly:### Step 2: Check Backend is Running```npm run devcd frontend```bash**Frontend:**```npm run start:dev# or if using pm2npm run devcd backend```bash**Backend:**### Step 1: Restart Your Development Servers## 📋 How to Verify the Fix- `backend/src/routes/user.ts` - User routes including registration- `backend/src/app.ts` - Application bootstrap and route registration- `backend/src/server.ts` - Main server setup with CORS### Key Backend Files- **Registration Endpoint:** `POST /v1/user/register`- **CORS:** Already configured to accept all origins (`origin: true`)- **Server Port:** `3000` (configurable via `PORT` env variable)### Backend (Fastify + TypeScript)- **Environment Variables:** `frontend/.env.local`- **API Config:** `frontend/src/config/api.ts`- **Dev Server:** Typically runs on port `5173` (or `5174`, `5175`, etc.)### Frontend (Vite + React)## 🏗️ Your Stack Configuration```VITE_WS_URL=ws://localhost:3000/v1/chat/wsVITE_API_URL=http://localhost:3000```env**After:**```VITE_WS_URL=ws://pongrush.game:3000/v1/chat/wsVITE_API_URL=http://pongrush.game:3000```env**Before:****File Modified:** `frontend/.env.local`Changed the frontend environment configuration to use `localhost` instead of `pongrush.game`.## ✅ Solution Applied```POST http://pongrush.game:3000/v1/auth/register net::ERR_NAME_NOT_RESOLVED```### Error DetailsThe error `net::ERR_NAME_NOT_RESOLVED` occurred because your frontend was configured to use the domain `pongrush.game`, which cannot be resolved by your local DNS.## 🔍 Root Cause * 
 * All API calls use a single backend origin.
 * In monolithic architecture, backend and frontend are served from same origin.
 */

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

// Derive WS Base URL from API URL (http -> ws, https -> wss)
const WS_BASE = API_URL.replace(/^http/, "ws");

const WS_URL = (import.meta as any).env?.VITE_WS_URL || `${WS_BASE}/v1/chat/ws`;
const GAME_WS_URL = (import.meta as any).env?.VITE_GAME_WS_URL || `${WS_BASE}/v1/game/ws`;

export const API_CONFIG = {
  BASE_URL: API_URL,
  WS_URL: WS_URL,
  GAME_WS_URL: GAME_WS_URL,

  // API Endpoints
  AUTH: {
    LOGIN: `${API_URL}/v1/user/login`,
    REGISTER: `${API_URL}/v1/user/register`,
    LOGOUT: `${API_URL}/v1/auth/logout`,
    REFRESH: `${API_URL}/v1/user/refresh`,
    VERIFY_2FA: `${API_URL}/v1/totp/verify`,
  },

  USER: {
    PROFILE: `${API_URL}/v1/user/profile`,
    SEARCH: `${API_URL}/v1/user/search`,
    UPDATE_PROFILE: `${API_URL}/v1/user/profile`,
    UPLOAD_AVATAR: `${API_URL}/v1/user/avatar`,
    GET_USER: (id: string) => `${API_URL}/v1/user/${id}`,
  },

  CHAT: {
    WS: WS_URL,
    MESSAGES: `${API_URL}/v1/chat/messages`,
    ROOMS: `${API_URL}/v1/chat/rooms`,
  },

  FRIEND: {
    LIST: `${API_URL}/v1/friend/list`,
    ADD: `${API_URL}/v1/friend/add`,
    REMOVE: `${API_URL}/v1/friend/remove`,
    REQUESTS: `${API_URL}/v1/friend/requests`,
  },

  GAME: {
    START: `${API_URL}/v1/game/start`,
    MATCH: (id: string) => `${API_URL}/v1/game/match/${id}`,
    HISTORY: (id: string) => `${API_URL}/v1/game/history/${id}`,
  },

  MESSAGE: {
    SEND: `${API_URL}/v1/message/send`,
    GET: `${API_URL}/v1/message/get`,
  },
};

export default API_CONFIG;
