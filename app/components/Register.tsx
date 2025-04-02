"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";
import { generateRegisterOtp, registerUser } from "@/lib/apiController";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    otp: "",
  });
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, username, password } = formData;
    if (!email || !username || !password) {
      setStatus("Please fill in email, username, and password.");
      return;
    }
    setStatus("Sending OTP...");
    setLoading(true);
    try {
      const result = await generateRegisterOtp({ email });
      setStatus(result.message || "OTP sent!");
      setStep(2);
    } catch (error: any) {
      setStatus(error.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, username, password, otp } = formData;
    if (!otp) {
      setStatus("Please enter the OTP.");
      return;
    }
    setStatus("Registering...");
    setLoading(true);
    try {
      const result = await registerUser({ email, username, password, otp });
      setStatus(result.message || "Registered successfully!");
      setTimeout(() => router.push("/login"), 1500);
    } catch (error: any) {
      setStatus(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-md bg-white p-8 border border-solid border-[#e5e7eb]">
        <h1 className="mb-1 text-center text-xl font-bold text-gray-700">
          Register
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Get your Chaton account now.
        </p>
        {status && (
          <div className="mb-4 text-center text-sm text-gray-700">{status}</div>
        )}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <FaUser />
                </span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
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
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pl-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mb-4 w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {loading ? "Please wait..." : "Sign up"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                placeholder="Enter the OTP"
                value={formData.otp}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mb-4 w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {loading ? "Please wait..." : "Complete Registration"}
            </button>
          </form>
        )}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-purple-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
      <p className="mt-4 text-xs text-gray-400">
        &copy; {currentYear} Chaton. All rights reserved.
      </p>
    </div>
  );
}
