"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    // Login validation
    if (!formData.username.trim()) {
      setError("Please enter your username or email");
      return;
    }
    if (!formData.password.trim()) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "The username or password is incorrect");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-100 via-white to-teal-50 relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-teal-200/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-20 left-20 w-16 h-16 border-4 border-yellow-200 rounded-full"></div>
      <div className="absolute top-10 right-20 w-20 h-20 bg-teal-300/30 rounded-full"></div>
      <div className="absolute top-32 right-32 w-12 h-12 border-4 border-yellow-200 rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-200/40 rounded-full -translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute bottom-32 left-32 w-24 h-24 bg-teal-300/20 rounded-full"></div>

      {/* Left Image Section */}
      <div className="hidden lg:flex lg:w-1/2 h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100 via-white to-blue-100 opacity-80"></div>
        <img
          src="/image.png"
          alt="3D Doctor"
          className="object-cover w-full h-full z-10"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          {/* Back button */}
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              Back to Home
            </Link>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-teal-600">CAREMATE</h2>
            <p className="text-gray-600 mt-2">Welcome back! Please log in</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Username / Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Aya_99@gmail.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 border ${
                    error ? "border-red-500" : "border-gray-300"
                  } rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                    error ? "focus:ring-red-500" : "focus:ring-teal-500"
                  } focus:border-transparent transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-full transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : "Log In"}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-teal-500 hover:text-teal-600 font-medium transition-colors"
              >
                Forget Password?
              </Link>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Do Not Have Account?{" "}
                <Link
                  href="/auth/register"
                  className="text-teal-500 hover:text-teal-600 font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}