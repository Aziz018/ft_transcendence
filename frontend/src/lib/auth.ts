export const TOKEN_KEY = "pongrush_token";

export function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    try {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.debug(
          "[auth] saveToken: saving token (short) ->",
          `${token.slice(0, 8)}...${token.slice(-8)}`
        );
      }
    } catch (__) {}

    // also set cookie for backend endpoints that read access_token cookie
    try {
      const payload = decodeTokenPayload(token);
      let expires = "";
      if (payload && payload.exp) {
        // exp is seconds since epoch
        const expDate = new Date(payload.exp * 1000);
        expires = `; Expires=${expDate.toUTCString()}`;
      }
      document.cookie = `access_token=${token}; Path=/; HttpOnly=false${expires}`;
      try {
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.debug(
            "[auth] saveToken: document.cookie after set ->",
            document.cookie
          );
        }
      } catch (__) {}
    } catch (e) {
      // ignore cookie set failures
    }
  } catch (e) {
    console.warn("failed to save token", e);
  }
}

export function clearToken() {
  try {
    // Only remove client-side stored token; cookie invalidation should be
    // performed by the backend via POST /v1/user/logout so the server can
    // clear HttpOnly cookies securely.
    localStorage.removeItem(TOKEN_KEY);
    try {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.debug(
          "[auth] clearToken: removed token from localStorage (cookie left to backend logout)",
          { cookie: document.cookie }
        );
      }
    } catch (__) {}
  } catch (e) {
    console.warn(e);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

// Very small JWT payload decoder (no verification) for client-side display only
export function decodeTokenPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}
