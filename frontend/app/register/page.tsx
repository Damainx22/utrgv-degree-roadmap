"use client";

// Register page - allows new students to create an account
// On success saves the JWT token and redirects to dashboard

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call the FastAPI register endpoint
      const data = await register(email, password, name);
      // Save the JWT token to localStorage
      saveToken(data.access_token);
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 to-cyan-300 p-4">
    <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-teal-800 text-center mb-2">
        DegreePath
      </h1>

      <p className="text-center text-gray-800 mb-6 font-['Georgia','Times_New_Roman',serif] italic">
        Create your account
      </p>

      {error && (
        <div className="bg-red-500/20 border border-red-400 text-red-900 rounded-xl p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-gray-800 text-sm mb-1 block font-['Georgia','Times_New_Roman',serif]">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-white/40 bg-white/50 text-gray-900 placeholder-gray-600 px-4 py-3 rounded-xl hover:bg-white/70 focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        <div>
          <label className="text-gray-800 text-sm mb-1 block font-['Georgia','Times_New_Roman',serif]">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-white/40 bg-white/50 text-gray-900 placeholder-gray-600 px-4 py-3 rounded-xl hover:bg-white/70 focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        <div>
          <label className="text-gray-800 text-sm mb-1 block font-['Georgia','Times_New_Roman',serif]">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-white/40 bg-white/50 text-gray-900 placeholder-gray-600 px-4 py-3 rounded-xl hover:bg-white/70 focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="text-gray-800 text-center mt-4 text-sm font-['Georgia','Times_New_Roman',serif]">
        Already have an account?{" "}
        <a href="/" className="text-teal-700 font-semibold hover:underline">
          Log in
        </a>
      </p>
    </div>
  </div>
);
}