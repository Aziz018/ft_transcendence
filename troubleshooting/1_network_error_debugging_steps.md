# Troubleshooting Network Errors

This guide will walk you through the steps to diagnose and fix the network error you're encountering during user registration.

## Step 1: Browser Developer Tools

The first step is to use your browser's developer tools to inspect the failing network request.

1.  Open your browser's developer tools (usually by pressing `F12` or `Ctrl+Shift+I` / `Cmd+Option+I`).
2.  Go to the **Network** tab.
3.  Make sure "Preserve log" is checked so you don't lose the request information on a page reload.
4.  Try to register a new user again.
5.  Look for the failed request in the network log. It will likely be red.

### What to Look For:

*   **Status Column:**
    *   `(failed)`: This often indicates a CORS issue, a DNS problem, or that the server is unreachable. Check the **Console** tab for a more specific CORS error message.
    *   `404 Not Found`: The URL is wrong, or the backend endpoint doesn't exist.
    *   `500 Internal Server Error`: The request reached the backend, but an error occurred on the server.
*   **General Tab:**
    *   **Request URL:** Verify that the URL, port, and path are correct.
    *   **Request Method:** Ensure it's a `POST` request for registration.

## Step 2: Isolate the Backend with `curl`

Next, let's test the backend in isolation to see if it's working correctly. We'll use `curl` to send a direct request to the registration endpoint.

```bash
curl -X POST http://localhost:3001/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "testuser", "password": "password123", "email": "test@example.com"}' \
-v
```

*   The `-v` flag (verbose) will show you detailed information about the request and response, which is very helpful for debugging.

### Interpreting `curl` Output:

*   **`Connection refused`**: The backend server is not running or is not accessible at that address and port.
*   **HTML Error Page in Response**: This could indicate a proxy issue or a misconfiguration.
*   **JSON Error Response**: If you get a JSON response with an error (like a 400 or 500 status code), the backend is running, but there's a problem with the request data or server-side logic. Check the backend logs.
*   **Successful Response (e.g., 201 Created)**: The backend is working correctly! The problem is likely in the frontend or the connection between the frontend and backend (like CORS).

## Step 3: Check Backend Logs

If the `curl` test fails, the next step is to check the backend logs for errors. How you do this depends on how you're running your backend. If you are using `pm2`, you can use `pm2 logs`.

Look for:

*   Crash reports or stack traces.
*   Error messages related to the database, environment variables, or other services.
*   Incoming request logs (if you have logging middleware).

Now, let's move on to fixing the potential issues.
