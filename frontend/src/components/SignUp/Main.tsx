import Fuego from "../../index";
import { useState } from "../../index";
import { redirect } from "../../library/Router/Router";
import { saveToken } from "../../lib/auth";
import SignUpFormContainer from "./components/SignUpFormContainer";
import API_CONFIG from "../../config/api";

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
      const registerUrl = API_CONFIG.AUTH.REGISTER;

      console.log("[SignUp] Registering user at:", registerUrl);

      const response = await fetch(registerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      console.log("[SignUp] Response status:", response.status);

      let data: any = {};
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (parseErr) {
          console.error("[SignUp] Failed to parse JSON response");
          data = { message: "Invalid response from server" };
        }
      }

      if (!response.ok) {
        console.error("[SignUp] Registration failed:", data);

        // Handle specific error codes
        if (response.status === 409) {
          setError("This email is already registered. Please log in or use a different email.");
        } else if (data.error === "password_invalid") {
          setError("Password must be at least 6 characters.");
        } else if (data.error === "email_required") {
          setError("Email is required.");
        } else if (data.error === "name_required") {
          setError("Name is required.");
        } else {
          setError(data.message || data.error || "Registration failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      if (data.access_token) {
        console.log("[SignUp] Registration successful, redirecting to dashboard");
        saveToken(data.access_token);
        setTimeout(() => {
          redirect("/dashboard");
        }, 100);
      } else {
        console.error("[SignUp] No token in response:", data);
        setError("Registration successful but no token received. Please log in.");
        setLoading(false);
      }
    } catch (err) {
      console.error("[SignUp] Network error:", err);
      setError(
        "Network error. Please check your connection and ensure the backend is running."
      );
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
