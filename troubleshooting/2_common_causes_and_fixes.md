# Common Causes and Fixes

Based on the initial debugging, here are the most common causes for network errors and how to fix them.

## 1. CORS (Cross-Origin Resource Sharing)

**Problem:** The browser blocks the frontend from making requests to the backend because they have different origins (e.g., `localhost:5173` for the frontend and `localhost:3001` for the backend). You'll typically see a CORS error in the browser's console.

**Fix:** Configure the backend to allow requests from the frontend's origin.

In your backend's `src/app.ts` or `src/server.ts`, you should use a CORS middleware. A popular one is `cors`.

First, install it:

```bash
npm install cors
# If you need types for TypeScript
npm install --save-dev @types/cors
```

Then, use it in your main application file:

```typescript
// backend/src/app.ts (example)
import express from 'express';
import cors from 'cors';

const app = express();

// Configure CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend URL
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// ... rest of your app setup
```

**For Production:** You'll want to make the `origin` more flexible, perhaps using an environment variable.

```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

## 2. Incorrect API Base URL

**Problem:** The frontend is sending requests to the wrong URL. This is common when moving between development and production environments.

**Fix:** Use environment variables to define your API's base URL in the frontend.

Your frontend seems to be a Vite project. Vite uses `.env` files for environment variables.

1.  **Create a `.env.local` file** in your `frontend` directory:

    ```
    VITE_API_BASE_URL=http://localhost:3001/api
    ```

    **Important:** Vite requires environment variables exposed to the browser to be prefixed with `VITE_`.

2.  **In your frontend code**, where you make API calls (e.g., in a service or a utility file), use this environment variable.

    ```typescript
    // Example: frontend/src/services/api.ts
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    export async function registerUser(userData) {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      // ...
    }
    ```

## 3. Backend Not Running or Crashing

**Problem:** The backend server is not running, or it's crashing when it receives a request.

**Fix:**

1.  **Check if the backend is running.** You can use `ps aux | grep node` or check your terminal if you're running it manually. If you are using `pm2`, you can check the status with `pm2 status`.
2.  **Check the logs for errors.** If the server is crashing, the logs are the best place to find out why.
3.  **Ensure your database is running** and accessible if your backend connects to one.

## 4. Port Mismatch

**Problem:** The frontend is trying to connect to a different port than the one the backend is running on.

**Fix:**

1.  **Check which port your backend is configured to use.** Look for `process.env.PORT` or a hardcoded port number in `backend/src/server.ts` or `backend/src/app.ts`.
2.  **Ensure your frontend is configured to connect to that same port.** (See the API Base URL section above).
3.  **Check for other processes using the same port.** You can use `lsof -i :<port_number>` on macOS/Linux or `netstat -ano | findstr :<port_number>` on Windows.

## How to Confirm the Fix

1.  **Restart both your frontend and backend servers** after making any configuration changes.
2.  **Clear your browser cache** or use a private/incognito window to ensure you're not using a cached version of your frontend.
3.  **Try registering a user again.**
4.  **Check the Network tab** in your browser's developer tools. You should see a successful `POST` request to the registration endpoint (e.g., with a `201 Created` status).
5.  **Check your database** to see if the new user was created.
