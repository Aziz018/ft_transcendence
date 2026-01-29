import React from "react";
import { saveToken } from "../../../lib/auth";
import { redirect } from "../../../router";
import API_CONFIG from "../../../config/api";

function openGooglePopup() {
  const w = 520;
  const h = 640;
  const left = window.screenX + (window.innerWidth - w) / 2;
  const top = window.screenY + (window.innerHeight - h) / 2;
  const authEndpoint = `${API_CONFIG.BASE_URL}/v1/auth/google`;
  const popup = window.open(
    authEndpoint,
    "Google Login",
    `width=${w},height=${h},left=${left},top=${top}`
  );

  function handleMessage(e: MessageEvent) {
    // Ignore messages from the app itself (e.g. Vite HMR, extensions)
    if (e.origin === window.location.origin) {
      return;
    }

    // Check against the expected backend origin
    if (
      !e.origin.startsWith(new URL(API_CONFIG.BASE_URL).origin) &&
      !e.origin.startsWith("http://localhost:3000")
    ) {
      console.warn("OAuth Origin mismatch:", {
        expected: new URL(API_CONFIG.BASE_URL).origin,
        received: e.origin,
      });
      return;
    }
    const data = e.data as any;
    if (data && data.access_token) {
      saveToken(data.access_token);
      try {
        window.removeEventListener("message", handleMessage);
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (e) { }

      // Check if 2FA is required based on the token payload or response message
      // Since we only get the token here, we might need to decode it or check the message if passed
      // But typically the backend authHelper returns a token.
      // If the token has mfa_required: true, the dashboard/protected routes will redirect to secondary-login.
      // So redirecting to dashboard is fine, as dashboard will redirect to secondary-login if needed.

      redirect("/dashboard");
    }
  }

  window.addEventListener("message", handleMessage, false);
}

const GoogleBtn = () => {
  return (
    <button
      type="button"
      onClick={openGooglePopup}
      className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-light rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-light dark:hover:bg-gray-700">
      Google
    </button>
  );
};

export default GoogleBtn;
