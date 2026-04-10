"use client";

// Dashboard page - the home page after a student logs in
// Protected - redirects to login if no token found

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, removeToken } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in when page loads
    // If not, redirect to login page
    if (!isLoggedIn()) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [router]);

  function handleLogout() {
    // Remove token and redirect to login
    removeToken();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation bar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">DegreePath</h1>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm"
        >
          Log out
        </button>
      </nav>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
        <p className="text-gray-400 mb-8">
          Here is your degree planning dashboard.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">My Roadmap</h3>
            <p className="text-gray-400 text-sm">
              View your personalized path to graduation.
            </p>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Build Schedule</h3>
            <p className="text-gray-400 text-sm">
              Generate a conflict-free schedule for next semester.
            </p>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Professor Reviews</h3>
            <p className="text-gray-400 text-sm">
              Read and submit reviews to help other students.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}