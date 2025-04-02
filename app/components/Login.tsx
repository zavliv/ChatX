"use client";
import Link from "next/link";
import Cookies from "js-cookie";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock } from "react-icons/fa";
import { loginUser } from "@/lib/apiController";

export default function Login() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const currentYear = new Date().getFullYear();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setStatus("Please fill in username and password.");
      return;
    }
    setStatus("Logging in...");
    setLoading(true);
    try {
      const result = await loginUser({ identifier, password });
      setStatus(result.message || "Logged in successfully!");
      Cookies.set("token", result.token, { expires: 1 });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      setStatus(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-md bg-white p-8 border border-solid border-[#e5e7eb]">
        <h1 className="mb-1 text-center text-xl font-bold text-gray-700">
          Login
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          to continue to Chaton
        </p>
        {status && (
          <div className="mb-4 text-center text-sm text-gray-700">{status}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="identifier"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Username or Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FaUser />
              </span>
              <input
                type="text"
                id="identifier"
                name="identifier"
                placeholder="Enter Username or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FaLock />
              </span>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <Link href="#" className="text-sm text-purple-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mb-4 w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {loading ? "Please wait..." : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-purple-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
      <p className="mt-4 text-xs text-gray-400">
        &copy; {currentYear} Chaton. All rights reserved.
      </p>
    </div>
  );
}
