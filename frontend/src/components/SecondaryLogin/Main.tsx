import React, { useState } from "react";
import Button from "../ui/PrimaryButton";

import { Link, redirect } from "../../router";
import PrimaryButton from "../ui/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton";
import { saveToken } from "../../lib/auth";
import { getToken } from "../../lib/auth";
import API_CONFIG from "../../config/api";

const Main = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if MFA is not required
  React.useEffect(() => {
    const token = getToken();
    if (token) {
      // Need to import decodeTokenPayload or move it to a shared lib if not available here
      // Fortunately saveToken is imported from lib/auth, likely decodeTokenPayload is there too
      // Check imports above: import { saveToken } from "../../lib/auth";
      // We need to add decodeTokenPayload to imports.
      const payload = parseJwt(token);
      if (payload && !payload.mfa_required) {
        redirect("/dashboard");
      }
    }
  }, []);

  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleVerify = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch(`${API_CONFIG.AUTH.VERIFY_2FA}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mfa_code: code }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          saveToken(data.access_token);
          redirect("/dashboard");
        }
      } else {
        const err = await res.json();
        setError(err.message || "Invalid code");
      }
    } catch (err) {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[11%] pb-[9%] relative flex justify-center">
      <div className="w-full max-w-md bg-[#1a1c1e] border border-[#333] rounded-2xl p-8 shadow-2xl animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
        <h2 className="text-light text-2xl font-questrial mb-6 text-center">
          Two-Factor Authentication
        </h2>
        <p className="text-light/60 text-center mb-8 font-questrial">
          Please enter the 6-digit code from your authenticator app
        </p>

        <form onSubmit={handleVerify as any} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          <div>
            <input
              type="text"
              value={code}
              onChange={(e: any) => setCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] text-light font-mono focus:outline-none focus:border-accent-green transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-accent-green text-dark-950 font-semibold py-3 rounded-lg hover:bg-accent-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-questrial">
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("pongrush_token");
              document.cookie = "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              redirect("/login");
            }}
            className="w-full bg-white/10 text-light py-3 rounded-lg hover:bg-white/20 transition-colors font-questrial text-sm mt-4">
            Cancel / Log Out
          </button>
        </form>
      </div>
    </div>
  );
};

export default Main;
