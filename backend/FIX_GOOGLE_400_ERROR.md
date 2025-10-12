# 🔴 Fixing Google OAuth 400 Error

## The Problem

You're seeing:

```
400. That's an error.
The server cannot process the request because it is malformed.
```

This means **Google rejected your OAuth request** because the redirect URI doesn't match what's configured in Google Cloud Console.

---

## ✅ Solution: Configure Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project (or create a new one)
3. Go to **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID

You're using: `120020198088-9780ohm2qrcpca9upqd72as8qjuooa6c.apps.googleusercontent.com`

1. Click on this Client ID in the credentials list
2. Scroll down to **Authorized redirect URIs**

### Step 3: Add Your Redirect URI

Add **EXACTLY** this URI to the authorized redirect URIs list:

```
http://localhost:3000/v1/auth/google/callback
```

⚠️ **IMPORTANT**:

- No trailing slash
- Must be `http://localhost:3000` (not `127.0.0.1`)
- Must include `/v1/auth/google/callback` path
- Case-sensitive!

### Step 4: Save Changes

Click **SAVE** at the bottom of the page.

⏱️ **Wait 5 minutes** for Google to propagate the changes.

---

## 🔧 Alternative: Use Environment Variable for Base URL

If you want more flexibility, modify `backend/src/auth/consts.ts`:

### Current Code:

```typescript
const baseURL: string = "http://localhost:3000";
```

### Better Code:

```typescript
const baseURL: string = process.env.BACKEND_URL || "http://localhost:3000";
```

This way you can change the URL in `.env` without modifying code.

---

## 🧪 Testing Steps

### 1. Verify Your Configuration

Run this in terminal to check what Google sees:

```bash
curl -s "http://localhost:3000/v1/auth/google" -I
```

You should see a redirect to Google with the callback URL included.

### 2. Check the Full OAuth URL

When you click "Google" button, check the browser network tab. You should see a redirect to:

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=120020198088-9780ohm2qrcpca9upqd72as8qjuooa6c.apps.googleusercontent.com
  &redirect_uri=http://localhost:3000/v1/auth/google/callback
  &response_type=code
  &scope=profile%20email
  &state=...
```

The `redirect_uri` parameter **must match** what you configured in Google Cloud Console!

---

## 🎯 Checklist

- [ ] Go to Google Cloud Console
- [ ] Find OAuth Client ID: `120020198088-9780...`
- [ ] Add authorized redirect URI: `http://localhost:3000/v1/auth/google/callback`
- [ ] Save changes
- [ ] Wait 5 minutes
- [ ] Try login again

---

## 🐛 Still Not Working? Common Issues:

### Issue 1: Using 127.0.0.1 instead of localhost

**Fix**: Google treats `localhost` and `127.0.0.1` as different domains!

- In Google Console: Use `http://localhost:3000/v1/auth/google/callback`
- In your code: Use `http://localhost:3000` (already correct!)

### Issue 2: Trailing Slash

**Wrong**: `http://localhost:3000/v1/auth/google/callback/`  
**Correct**: `http://localhost:3000/v1/auth/google/callback`

### Issue 3: Port Mismatch

Make sure your backend is actually running on port 3000:

```bash
# Check:
curl http://localhost:3000/
```

### Issue 4: Client ID Mismatch

Verify `.env` has the correct Client ID:

```env
GOOGLE_CLIENT_ID=120020198088-9780ohm2qrcpca9upqd72as8qjuooa6c.apps.googleusercontent.com
```

---

## 📝 What Should Be in Google Cloud Console

### Authorized JavaScript Origins:

```
http://localhost:3000
http://localhost:5173
```

### Authorized Redirect URIs:

```
http://localhost:3000/v1/auth/google/callback
```

---

## 🔍 Debugging

### Check Backend Logs

```bash
# Look for any errors when you try to login
# Watch the terminal where npm start is running
```

### Enable Fastify Logging

If you need more details, add this to your Fastify instance config:

```typescript
const fastify = Fastify({
  logger: {
    level: "debug",
  },
});
```

---

## 🎬 After Fixing

Once you've added the redirect URI in Google Cloud Console:

1. **Wait 5 minutes** (Google needs time to propagate)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Try again**: Click the "Google" button
4. **Expected flow**:
   - Popup opens
   - Google consent screen appears
   - You click "Allow"
   - Popup closes
   - You're redirected to dashboard

---

## 📚 Reference

- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred)
- [Common OAuth Errors](https://developers.google.com/identity/protocols/oauth2/web-server#errors)

**Last Updated**: October 9, 2025
