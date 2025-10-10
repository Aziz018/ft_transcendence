import Fuego from "../../index";
import { useState } from "../../index";
import { redirect } from "../../library/Router/Router";
import { saveToken } from "../../lib/auth";
import SignUpFormContainer from "./components/SignUpFormContainer";

const BACKEND_ORIGIN =
  (import.meta as any).env?.VITE_BACKEND_ORIGIN || "http://localhost:3000";

const Main = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: Event) => {
    e.preventDefault();

    // Reset error
    setError("");

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      console.log("[SignUp] Attempting registration...", { name, email });

      const response = await fetch(`${BACKEND_ORIGIN}/v1/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      console.log(
        "[SignUp] Response status:",
        response.status,
        response.statusText
      );
      console.log(
        "[SignUp] Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log("[SignUp] Response data:", data);

      if (!response.ok) {
        console.error("[SignUp] Registration failed:", data);
        setError(data.error || data.message || "Registration failed");
        setLoading(false);
        return;
      }

      console.log("[SignUp] Registration successful, checking for token...");
      console.log("[SignUp] data.access_token exists?", !!data.access_token);
      console.log("[SignUp] data keys:", Object.keys(data));

      // Save token to localStorage
      if (data.access_token) {
        console.log(
          "[SignUp] Found access_token, length:",
          data.access_token.length
        );
        saveToken(data.access_token);
        console.log("[SignUp] Token saved, redirecting to dashboard...");

        // Redirect to dashboard
        setTimeout(() => {
          redirect("/dashboard");
        }, 100);
      } else {
        setError("Registration successful but no token received");
        setLoading(false);
      }
    } catch (err) {
      console.error("[SignUp] Error during registration:", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <SignUpFormContainer
        name={name}
        email={email}
        password={password}
        confirmPassword={confirmPassword}
        setName={setName}
        setEmail={setEmail}
        setPassword={setPassword}
        setConfirmPassword={setConfirmPassword}
        onSubmit={handleSignup}
        error={error}
        loading={loading}
      />
    </>
  );
};

export default Main;
