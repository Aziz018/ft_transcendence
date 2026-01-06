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
    setError("");

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_ORIGIN}/v1/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Registration failed");
        setLoading(false);
        return;
      }

      if (data.access_token) {
        saveToken(data.access_token);
        setTimeout(() => {
          redirect("/dashboard");
        }, 100);
      } else {
        setError("Registration successful but no token received");
        setLoading(false);
      }
    } catch (err) {
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
