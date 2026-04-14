"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  return (
    <main className="min-h-screen bg-orange-500 flex flex-col items-center px-6 py-12">

      {/* HERO SECTION */}
      <div className="text-center max-w-3xl">

        <h1 className="text-5xl font-bold text-white mb-4">
          UTRGV Degree Roadmap
        </h1>

        <p className="text-white/90 text-lg mb-8">
          Plan your graduation journey by tracking courses, viewing requirements,
          and exploring professor reviews — all in one place.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex justify-center gap-4 mb-10">
          <a
            href="/login"
            className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 active:scale-95 transition"
          >
            Login
          </a>

          <a
            href="/register"
            className="bg-orange-700 text-white px-6 py-3 rounded-xl hover:bg-orange-800 active:scale-95 transition"
          >
            Register
          </a>
        </div>
      </div>

      {/* INTERACTIVE SECTION */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-8 text-center">

        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          Quick Actions
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-6">

          <button
            onClick={() => setMessage("Tracking completed courses")}
            className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Track Courses
          </button>

          <button
            onClick={() => setMessage("Viewing degree roadmap")}
            className="bg-orange-400 text-white px-5 py-2 rounded-lg hover:bg-orange-500 transition"
          >
            View Roadmap
          </button>

        </div>

        {message && (
          <p className="text-gray-700 font-medium">
            {message}
          </p>
        )}
      </div>

      {/* FEATURES SECTION */}
      <div className="w-full max-w-5xl mt-12">

        <h2 className="text-center text-2xl font-bold text-white mb-6">
          Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {[
            "Track completed courses",
            "View remaining degree requirements",
            "Generate personalized roadmap",
            "Read and post professor reviews"
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition text-gray-800 font-medium"
            >
              {feature}
            </div>
          ))}

        </div>
      </div>

    </main>
  );
}