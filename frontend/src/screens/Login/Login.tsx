import { MyReact } from "../../lib/core";
import { Router, Link } from "../../lib/router";

function Login() {
  let currentEmail = "";
  let currentPassword = "";

  const handleLogin = async (e: Event) => {
    e.preventDefault();

    if (!currentEmail || !currentPassword) {
      alert("Please enter both email and password");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/v1/user/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentEmail,
          password: currentPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && (data.success || data.access_token)) {
        console.log("Login successful:", data);

        if (data.user?.name) {
          localStorage.setItem("userName", data.user.name);
        } else if (data.name) {
          localStorage.setItem("userName", data.name);
        }

        if (data.access_token) {
          console.log("Access token received");
        }

        window.dispatchEvent(
          new CustomEvent("navigate", { detail: "/dashboard" })
        );
      } else {
        alert("Login failed: " + (data.message || "Invalid credentials"));
      }
    } catch (err) {
      console.error("Network error during login:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              onInput={(e: any) => {
                currentEmail = e.target.value;
              }}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              onInput={(e: any) => {
                currentPassword = e.target.value;
              }}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
            Login
          </button>

          <div className="text-center text-sm text-gray-600">
            <Link to="/register" className="hover:underline">
              register
            </Link>
            <Link to="/" className="hover:underline ml-4">
              Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Login;