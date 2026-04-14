"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Email: ${email}\nPassword: ${password}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 p-4">
      <div className="relative w-[1100px] h-[620px] rounded-3xl overflow-hidden shadow-2xl">
        <img
          src="/cat.jpg"
          alt="Graduation cat"
          className="w-full h-full object-cover"
        />

        <div className="absolute top-1/2 left-12 -translate-y-1/2 w-[380px] bg-cyan-200/30 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-teal-800 text-center mb-2">
            DegreePath
          </h1>

          <p className="text-center text-gray-800 mb-6 font-['Georgia','Times_New_Roman',serif] italic">
            Sign in to continue
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-800 font-['Georgia','Times_New_Roman',serif]">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-white/40 bg-white/40 text-gray-900 placeholder-gray-600 px-4 py-3 rounded-xl hover:bg-white/60 focus:bg-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-800 font-['Georgia','Times_New_Roman',serif]">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full border border-white/40 bg-white/40 text-gray-900 placeholder-gray-600 px-4 py-3 rounded-xl hover:bg-white/60 focus:bg-white/60 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition"
            >
              Log In
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-800 font-['Georgia','Times_New_Roman',serif]">
            Don&apos;t have an account?{" "}
            <span className="text-teal-700 font-semibold cursor-pointer hover:underline">
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}