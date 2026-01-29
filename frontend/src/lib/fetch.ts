import { API_CONFIG } from "../config/api";
import { getToken, saveToken, clearToken } from "./auth";
import { redirect } from '../router';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
}

export async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
    const token = getToken();
    const headers = new Headers(options.headers || {});

    if (!options.skipAuth && token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("ngrok-skip-browser-warning", "true");

    const config = { ...options, headers };

    try {
        let response = await fetch(url, config);

        // Check for 401 Unauthorized or 500 with expired token code
        let shouldRefresh = response.status === 401;

        if (!shouldRefresh && response.status === 500) {
            // Clone response to check body without consuming it
            try {
                const clone = response.clone();
                const errorBody = await clone.json();
                // Adjust this check based on your backend's specific error format for expired tokens
                if (errorBody.code === "FAST_JWT_EXPIRED" || (errorBody.message && errorBody.message.includes("expired"))) {
                    shouldRefresh = true;
                }
            } catch (e) {
                // Ignore JSON parse errors, assume not an expired token error if not JSON
            }
        }

        if (shouldRefresh) {
            try {
                // Attempt refresh
                const refreshRes = await fetch(API_CONFIG.AUTH.REFRESH, {
                    method: "GET",
                    credentials: "include" // Important for cookies
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    if (data.access_token) {
                        saveToken(data.access_token);

                        // Retry original request with new token
                        headers.set("Authorization", `Bearer ${data.access_token}`);
                        return fetch(url, { ...options, headers });
                    }
                }

                // If refresh failed or no token returned
                clearToken();
                redirect("/login");
                return response; // Return the 401/original response so the caller knows it failed

            } catch (refreshErr) {
                console.error("Token refresh failed", refreshErr);
                clearToken();
                redirect("/login");
                throw refreshErr;
            }
        }

        return response;
    } catch (error) {
        throw error;
    }
}
