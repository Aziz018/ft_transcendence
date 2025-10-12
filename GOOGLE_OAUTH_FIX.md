## 🔴 Google OAuth 400 Error - Quick Fix Guide

### The Root Cause

The 400 error happens because **Google Cloud Console doesn't have your redirect URI registered**.

---

### ✅ Step-by-Step Fix

#### 1. **Go to Google Cloud Console**

Visit: https://console.cloud.google.com/apis/credentials

#### 2. **Find Your OAuth Client**

Look for Client ID starting with: `120020198088-9780ohm2qrcpca9upqd72as8qjuooa6c`

#### 3. **Add Authorized Redirect URI**

Click on the client ID, scroll to "Authorized redirect URIs", and add:

```
http://localhost:3000/v1/auth/google/callback
```

**Important:**

- Use `localhost` NOT `127.0.0.1`
- NO trailing slash
- Case-sensitive
- Must be EXACT

#### 4. **Save and Wait**

- Click SAVE
- Wait 5 minutes for Google to update

---

### 🧪 Test After Configuration

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Go to** http://localhost:5173
3. **Click** "Google" button
4. **You should see** Google login page (not a 400 error)

---

### 🔍 Current Status

✅ Backend is running on port 3000
✅ Frontend is running on port 5173  
✅ Environment variables are loaded
✅ Callback endpoint is configured: `/v1/auth/google/callback`

❌ **Still needs:** Redirect URI added in Google Cloud Console

---

### 📋 What to Add in Google Console

**Authorized JavaScript origins:**

```
http://localhost:3000
http://localhost:5173
```

**Authorized redirect URIs:**

```
http://localhost:3000/v1/auth/google/callback
```

---

### 🐛 Still Getting 400?

Check these:

1. **Did you wait 5 minutes?** Google needs time to propagate changes
2. **Exact match?** The URI must match EXACTLY (no extra spaces, slashes, etc.)
3. **Correct project?** Make sure you're editing the right Google Cloud project
4. **Client ID correct?** Verify it matches your `.env` file

---

### 💡 Pro Tip

After adding the redirect URI in Google Console, you can verify it's working by checking the browser's developer tools:

1. Open DevTools (F12)
2. Go to Network tab
3. Click "Google" button
4. Look for redirect to Google
5. If you see Google's login page = ✅ Success!
6. If you see 400 error page = ❌ Still not configured

---

**Last Updated:** October 9, 2025  
**Your Client ID:** `120020198088-9780ohm2qrcpca9upqd72as8qjuooa6c.apps.googleusercontent.com`
