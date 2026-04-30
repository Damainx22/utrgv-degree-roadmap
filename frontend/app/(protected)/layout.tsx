"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn, removeToken } from "@/lib/auth";
import { useEffect, useState } from "react";


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  if (!isLoggedIn()) {
    router.replace("/");
  }
}, [router]);

if (!mounted) return null;

const handleLogout = () => {
  removeToken();
  router.replace("/");
};

  return (
    <div className="flex min-h-screen bg-[#B5D1CC] text-slate-900">
      <aside className="w-72 bg-gradient-to-b from-[#D7EAE6] to-[#C8E0DC] border-r border-[#BFD7D2] p-8 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-[#00937C] rounded-lg flex items-center justify-center text-white font-bold">
            D
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            DegreePath
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          <Link href="/dashboard" className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-[#EEF6F4] hover:text-slate-900">
            <span className="text-sm font-semibold">Overview</span>
          </Link>
          <Link href="/roadmap" className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-[#EEF6F4] hover:text-slate-900">
            <span className="text-sm font-semibold">Degree Roadmap</span>
          </Link>
          <Link href="/schedule" className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-[#EEF6F4] hover:text-slate-900">
            <span className="text-sm font-semibold">Schedule Builder</span>
          </Link>
          <Link href="/reviews" className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-[#EEF6F4] hover:text-slate-900">
            <span className="text-sm font-semibold">Professor Reviews</span>
          </Link>
          <Link href="/messages" className="flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-[#EEF6F4] hover:text-slate-900">
            <span className="text-sm font-semibold">Messages</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-[#BFD7D2]">
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}