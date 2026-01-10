import Fuego from "../../../../index";
import EmailField from "./LoginForm/EmailField";
import PasswordField from "./LoginForm/PasswordField";
import ForgotPassword from "./LoginForm/ForgotPassword";
import LoginButton from "../../../ui/LoginButton";
import Divider from "./LoginForm/Divider";
import GoogleBtn from "../../../ui/SocialLoginButtons/GoogleBtn";
import IntraBtn from "../../../ui/SocialLoginButtons/IntraBtn";

import { saveToken } from "../../../../lib/auth";
import { redirect, Link } from "../../../../library/Router/Router";
import { useState } from "../../../../index";
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
      (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";

    try {

      const res = await fetch(`${API_CONFIG.AUTH.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();

        const token = data?.access_token || data?.accessToken || data?.token;
        if (token) {
          saveToken(token);
          if (data.message && data.message.includes("2fa verification required")) {
            redirect("/secondary-login");
          } else {
            redirect("/dashboard");
          }
          return;
        }
      }

      if (res.status === 404) {
        setError("user_not_found");
        setLoading(false);
        return;
      }

      if (res.status === 401) {
        setError("invalid_credentials");
        setLoading(false);
        return;
      }

      try {
        const err = await res.json();
        setError(err?.message || "Unable to login. Please try again.");
      } catch (_) {
        setError("Unable to login. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "An error occurred. Please check your connection and try again."
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
