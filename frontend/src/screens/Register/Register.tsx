import Fuego, { useEffect, useRender, useState } from "../../index";
import { Router, Link } from "../../library/Router/Router";

function Register() {
  let currentName = "";
  let currentEmail = "";
  let currentPassword = "";

  const handleRegister = async (e: Event) => {
    e.preventDefault();

    if (!currentEmail || !currentPassword || !currentName) {
      alert("Please enter both email and password");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/v1/user/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentEmail,
          password: currentPassword,
          name: currentName,
        }),
      });

      const data = await response.json();

      if (response.ok && (data.success || data.access_token)) {
        if (data.user?.name) {
          localStorage.setItem("userName", data.user.name);
        } else if (data.name) {
          localStorage.setItem("userName", data.name);
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
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              onInput={(e: any) => {
                currentName = e.target.value;
              }}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
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
            register
          </button>
          <Link to="/login" className="hover:underline">
            Login
          </Link>
          <br />
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Register;
