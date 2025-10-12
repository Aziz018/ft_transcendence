# 🔐 Google OAuth Login Flow - Complete Explanation

## Overview

This document explains how Google OAuth authentication works in your application, from clicking the login button to receiving the JWT token.

---

## 🔄 The Complete Flow

### 1️⃣ **User Clicks "Google" Button** (Frontend)

**File**: `/frontend/src/components/SecondaryLogin/Main.tsx`

```tsx
<button onClick={openGooglePopup}>
  <PrimaryButton data="Google" />
</button>
```

**What happens:**

- `openGooglePopup()` function is called
- Opens a popup window pointing to `http://localhost:3000/v1/auth/google`
- Popup size: 520x640, centered on screen

---

### 2️⃣ **Backend Redirects to Google**

**Endpoint**: `GET /v1/auth/google`  
**File**: `/backend/src/auth/consts.ts`

```typescript
redirectPath: "/v1/auth/google";
```

**What happens:**

- Fastify's `@fastify/oauth2` plugin intercepts this route
- Redirects user to Google's OAuth consent screen
- URL looks like: `https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=http://localhost:3000/v1/auth/google/callback`
- User sees: "Sign in with Google" screen

**Configuration** (from `backend/src/auth/clients.ts`):

- Client ID: `process.env.GOOGLE_CLIENT_ID`
- Client Secret: `process.env.GOOGLE_CLIENT_SECRET`
- Scopes: `['profile', 'email']`

---

### 3️⃣ **User Authorizes App on Google**

**What happens:**

- User clicks "Allow" on Google's consent screen
- Google validates the user
- Google redirects back to your callback URL with an authorization code

---

### 4️⃣ **Google Redirects to Your Callback**

**Endpoint**: `GET /v1/auth/google/callback?code=...&state=...`  
**File**: `/backend/src/routes/auth.ts` → `/backend/src/controllers/auth.ts`

```typescript
fastify.get("/google/callback", {
  schema: { tags: ["oauth"] },
  handler: googleOAuthCallbackController,
});
```

**What happens:**

1. **Controller** calls `authHelper(req, res, 'google')`
2. **authHelper** (`/backend/src/utils/auth.ts`) does:
   - Exchanges authorization code for Google access token
   - Uses access token to fetch user profile from Google API
   - Gets: `{ email, name, picture }`
3. **Check if user exists** in database:

   ```typescript
   const user = await prisma.user.findUnique({
     where: { email: user_info.email },
   });
   ```

4. **If user exists** → Check 2FA status

   - If 2FA enabled → Return temporary token (5 min expiry)
   - If no 2FA → Generate full JWT token (1 hour expiry)

5. **If user is new** → `authenticate()` auto-registers them:

   - Creates new user in database
   - Generates JWT token

6. **Set HTTP-only cookie**:

   ```typescript
   res.setCookie("access_token", token, {
     path: "/",
     httpOnly: true,
     secure: true,
   });
   ```

7. **Return HTML with postMessage**:
   ```html
   <script>
     if (window.opener) {
       window.opener.postMessage(
         { access_token: "JWT_TOKEN_HERE" },
         "http://localhost:5173"
       );
       window.close();
     }
   </script>
   ```

---

### 5️⃣ **Token Sent Back to Parent Window** (Frontend)

**File**: `/frontend/src/components/SecondaryLogin/Main.tsx`

```typescript
function handleMessage(e: MessageEvent) {
  if (!e.origin.startsWith(new URL(BACKEND_ORIGIN).origin)) return;
  const data = e.data as any;
  if (data && data.access_token) {
    saveToken(data.access_token); // Save to localStorage
    popup.close(); // Close popup
    redirect("/dashboard"); // Navigate to dashboard
  }
}
window.addEventListener("message", handleMessage, false);
```

**Security check:**

- Verifies message origin matches backend URL
- Only accepts messages from `http://localhost:3000`

---

## 🔑 Key Files & Their Roles

| File                                              | Purpose                          |
| ------------------------------------------------- | -------------------------------- |
| `frontend/src/components/SecondaryLogin/Main.tsx` | Login UI & popup management      |
| `backend/src/auth/consts.ts`                      | OAuth redirect paths             |
| `backend/src/auth/clients.ts`                     | Google OAuth configuration       |
| `backend/src/routes/auth.ts`                      | Routes definition                |
| `backend/src/controllers/auth.ts`                 | Callback handler (returns HTML)  |
| `backend/src/utils/auth.ts`                       | Core auth logic (authHelper)     |
| `backend/src/services/auth.ts`                    | User verification & registration |

---

## 🔧 Environment Variables Required

```env
# Backend (.env)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
FRONTEND_ORIGIN=http://localhost:5173
```

---

## ✅ What Was Fixed

### **Problem 1: User Registration**

**Before:**

```typescript
if (!user) {
  throwErr({ code: 404, message: "user doesn't exist" });
}
```

❌ New users couldn't sign up!

**After:**

```typescript
if (user) {
  // Only check 2FA for existing users
}
// authenticate() handles both new and existing users
```

✅ New users are auto-registered!

---

### **Problem 2: Popup Communication**

**Before:**

```typescript
res.code(200).send({
  access_token: token,
});
```

❌ Returns JSON, popup can't send token to parent window!

**After:**

```typescript
const html = `
    <script>
        window.opener.postMessage(
            { access_token: '${token}' },
            '${process.env.FRONTEND_ORIGIN}'
        );
        window.close();
    </script>
`;
res.type("text/html").send(html);
```

✅ Returns HTML that uses `postMessage` to communicate!

---

## 🧪 Testing the Flow

1. **Start backend**: `npm start` in `/backend`
2. **Start frontend**: `npm run dev` in `/frontend`
3. **Open**: `http://localhost:5173`
4. **Click**: "Google" button
5. **Expected**:
   - Popup opens
   - Google login screen appears
   - After login → popup closes
   - Main window redirects to `/dashboard`
   - Token saved in localStorage

---

## 🐛 Debugging

### Check backend logs:

```bash
# Look for:
[INFO] Prisma client connected ✅
[INFO] Server listening at http://127.0.0.1:3000
```

### Check browser console:

```javascript
// Should see:
console.log("Opening Google popup...");
// Then token should be saved
localStorage.getItem("token");
```

### Common issues:

1. **"Invalid redirect URI"** → Check `FRONTEND_ORIGIN` in `.env`
2. **"User doesn't exist"** → ✅ Fixed! (removed the check)
3. **Token not received** → ✅ Fixed! (added postMessage HTML)
4. **CORS errors** → Check `@fastify/cors` configuration

---

## 📚 Additional Resources

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Fastify OAuth2 Plugin](https://github.com/fastify/fastify-oauth2)
- [postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

---

**Last Updated**: October 9, 2025  
**Status**: ✅ Ready for testing
