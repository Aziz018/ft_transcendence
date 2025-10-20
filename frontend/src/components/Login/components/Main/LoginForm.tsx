import Fuego from "../../../../index";
import EmailField from "./LoginForm/EmailField";
import PasswordField from "./LoginForm/PasswordField";
import ForgotPassword from "./LoginForm/ForgotPassword";
import LoginButton from "../../../ui/LoginButton";
import Divider from "./LoginForm/Divider";
import GoogleBtn from "../../../ui/SocialLoginButtons/GoogleBtn";
import IntraBtn from "../../../ui/SocialLoginButtons/IntraBtn";

import { saveToken } from "../../../../lib/auth";
import { redirect } from "../../../../library/Router/Router";

const LoginForm = () => {
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) return;

    const backend =
      (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3001";

    try {
      // Try login first
      const res = await fetch(`${backend}/v1/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // backend may return access_token, accessToken or token
        const token = data?.access_token || data?.accessToken || data?.token;
        if (token) {
          saveToken(token);
          redirect("/dashboard");
          return;
        }
      }

      // If login failed with 401 or 404, try register
      if (res.status === 401 || res.status === 404) {
        const regRes = await fetch(`${backend}/v1/user/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: email.split("@")[0] }),
        });

        if (regRes.ok) {
          const regData = await regRes.json();
          const token =
            regData?.access_token || regData?.accessToken || regData?.token;
          if (token) {
            saveToken(token);
            redirect("/dashboard");
            return;
          }
        }

        // If registration also failed, show error from registration response
        try {
          const err = await regRes.json();
          alert(
            err?.message ||
              "Unable to login or register. Please check your credentials."
          );
        } catch (_) {
          alert("Unable to login or register. Please check your credentials.");
        }
        return;
      }

      // For other status codes, show error
      try {
        const err = await res.json();
        alert(
          err?.message || "Unable to login. Please check your credentials."
        );
      } catch (_) {
        alert("Unable to login. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while trying to authenticate.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit as any} className="space-y-6">
        <EmailField />
        <PasswordField />
        <ForgotPassword />
        <LoginButton />
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
