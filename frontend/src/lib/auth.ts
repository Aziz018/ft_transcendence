export const TOKEN_KEY = "pongrush_token";

export function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);

    try {
      const payload = decodeTokenPayload(token);
      let expires = "";
      if (payload && payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        expires = `; Expires=${expDate.toUTCString()}`;
      }
      document.cookie = `access_token=${token}; Path=/; HttpOnly=false${expires}`;
    } catch (e) {

    }
  } catch (e) {
    console.warn("failed to save token", e);
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie =
      "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  } catch (e) {
    console.warn("Failed to clear token", e);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

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
