import React from "react";
import EmailField from "./LoginForm/EmailField";
import PasswordField from "./LoginForm/PasswordField";
import ForgotPassword from "./LoginForm/ForgotPassword";
import LoginButton from "../../../ui/LoginButton";
import Divider from "./LoginForm/Divider";
import GoogleBtn from "../../../ui/SocialLoginButtons/GoogleBtn";
import IntraBtn from "../../../ui/SocialLoginButtons/IntraBtn";

import { saveToken } from "../../../../lib/auth";
import { redirect, Link } from "../../../../router";
import { useState } from "react";
import API_CONFIG from "../../../../config/api";

const LoginForm = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setLoading(false);
      return;
    }

    const backend =
      (import.meta as any).env?.VITE_API_URL || "/api";

    // Try direct backend endpoint
    const loginUrl = `${backend}/v1/user/login`;
    console.log("[Login] Attempting login to:", loginUrl);
    console.log("[Login] Backend origin:", backend);
    console.log("[Login] Email:", email);

    try {
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      console.log("[Login] Response status:", res.status, res.statusText);
      console.log("[Login] Response headers:", {
        contentType: res.headers.get("content-type"),
        origin: res.headers.get("access-control-allow-origin"),
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          console.error("[Login] Response is not JSON:", contentType);
          setError("Server returned non-JSON response. Backend issue.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log("[Login] Success, received data");

        const token = data?.access_token || data?.accessToken || data?.token;
        if (token) {
          saveToken(token);
          if (data.message && data.message.includes("2fa")) {
            redirect("/secondary-login");
          } else {
            redirect("/dashboard");
          }
          return;
        } else {
          console.error("[Login] No token in response:", data);
          setError("Login succeeded but no token received");
          setLoading(false);
          return;
        }
      }

      // Handle specific error status codes
      /// NOTE: @Ibnoukhalkanezakaria - this is fixed now!
      ///       404 means the user is not found
      ///       not page not found !!!
      /// TODO: check the previouse commit
      ///       clone, test and spot the difference
      ///       -> e8f29b5786a900538ec4ba80c0dc789f6217994c
      if (res.status === 404) {
        const contentType = res.headers.get("content-type") || "";
        let errorMsg = "Endpoint not found. Is the backend running?";
        if (contentType.includes("application/json")) {
          try {
            const errData = await res.json();
            if (errData?.message === "not found!") {
              setError("invalid_credentials");
              setLoading(false);
              return;
            }
          } catch (_) {}
        }
        setError(errorMsg);
        setLoading(false);
        return;
      }

      if (res.status === 401 || res.status === 400) {
        const contentType = res.headers.get("content-type") || "";
        let errorMsg = "Invalid email or password";
        if (contentType.includes("application/json")) {
          try {
            const errData = await res.json();
            errorMsg = errData?.message || errorMsg;
          } catch (_) {}
        }
        setError(res.status === 401 ? "invalid_credentials" : errorMsg);
        setLoading(false);
        return;
      }

      if (res.status >= 500) {
        console.error("[Login] Server error:", res.status);
        let errorMsg = `Server error: ${res.status}`;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          try {
            const errData = await res.json();
            errorMsg = errData?.message || errorMsg;
          } catch (_) {}
        }
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Generic error
      console.error("[Login] Unexpected response status:", res.status);
      let errorMsg = "Unable to login. Please try again.";
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          const errData = await res.json();
          errorMsg = errData?.message || errorMsg;
        } catch (_) {}
      }
      setError(errorMsg);
    } catch (err) {
      console.error("[Login] Network/fetch error:", err);
      console.error("[Login] Error details:", {
        name: (err as any)?.name,
        message: (err as any)?.message,
      });
      setError(
        `Network error. Backend not reachable at ${backend}. Check that it's running: npm run dev`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit as any} className="space-y-6">
        {/* Error Messages */}
        {error === "user_not_found" && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-sm font-medium mb-3">
              📋 User not found
            </p>
            <p className="text-red-300 text-xs mb-4">
              No account exists with this email. Please create an account to get
              started.
            </p>
            <Link to="/signup">
              <button
                type="button"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                Create Account →
              </button>
            </Link>
          </div>
        )}

        {error === "invalid_credentials" && (
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4">
            <p className="text-orange-400 text-sm font-medium mb-2">
              🔐 Invalid credentials
            </p>
            <p className="text-orange-300 text-xs">
              The email or password you entered is incorrect. Please try again.
            </p>
          </div>
        )}

        {error &&
          error !== "user_not_found" &&
          error !== "invalid_credentials" && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <p className="text-yellow-400 text-sm font-medium mb-2">
                ⚠️ Login failed
              </p>
              <p className="text-yellow-300 text-xs">{error}</p>
            </div>
          )}

        <EmailField />
        <PasswordField />
        <ForgotPassword />
        <LoginButton
          disabled={loading}
          text={loading ? "Logging in..." : "Login"}
        />
        <Divider />
        <div className="grid grid-cols-2 gap-3">
          <GoogleBtn />
          <IntraBtn />
        </div>
      </form>
    </>
  );
};

export default LoginForm;
