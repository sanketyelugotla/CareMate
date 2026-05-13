"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
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

    // Signup validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!formData.password.trim()) {
      setError("Please enter your password");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: {
            first: formData.firstName,
            last: formData.lastName
          },
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Signup successful:", data);
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Something went wrong. Please try again.");
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

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          {/* Back button */}
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
              Back to Home
            </Link>
          </div>
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-teal-600">CAREMATE</h2>
            <p className="text-gray-600 mt-2">Create your account</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="example@gmail.com"
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
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-full transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-teal-500 hover:text-teal-600 font-semibold transition-colors"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}