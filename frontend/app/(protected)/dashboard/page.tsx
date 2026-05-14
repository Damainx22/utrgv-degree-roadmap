"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Program = { id: number; name: string; colleges: { name: string } };

type RoadmapStats = {
  completed_count: number;
  remaining_count: number;
  available_count: number;
};

function isMajorProgram(name: string): boolean {
  const n = name.toLowerCase();
  return !n.includes("minor") && !n.includes("certificate") && !n.includes("concentration");
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<RoadmapStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPrograms = useCallback(async () => {
    const res = await fetch(`${API_URL}/roadmap/programs`);
    if (!res.ok) return [] as Program[];
    const data: Program[] = await res.json();
    setPrograms(data);
    return data;
  }, []);

  const fetchStats = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }

    const res = await fetch(`${API_URL}/roadmap/student/roadmap`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      router.replace("/");
      return;
    }

    if (res.status === 400) {
      await fetchPrograms();
      setShowMajorModal(true);
      setLoading(false);
      return;
    }

    if (res.ok) {
      const data = await res.json();
      const byCode = new Map<string, string>();
      for (const c of data.courses as { code: string; status: string }[]) {
        const prev = byCode.get(c.code);
        if (!prev) {
          byCode.set(c.code, c.status);
          continue;
        }
        if (prev === "completed") continue;
        if (prev === "unlocked" && c.status === "locked") continue;
        byCode.set(c.code, c.status);
      }

      const statuses = Array.from(byCode.values());
      setStats({
        completed_count: statuses.filter((s) => s === "completed").length,
        available_count: statuses.filter((s) => s === "unlocked").length,
        remaining_count: statuses.filter((s) => s !== "completed").length,
      });
    }

    setLoading(false);
  }, [fetchPrograms, router]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  async function openMajorModal() {
    if (!programs.length) await fetchPrograms();
    setShowMajorModal(true);
  }

  async function saveMajor() {
    if (!selectedProgram) return;
    setSaving(true);
    const token = getToken();

    try {
      const res = await fetch(`${API_URL}/roadmap/student/major?program_id=${selectedProgram}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setShowMajorModal(false);
        await fetchStats();
      }
    } finally {
      setSaving(false);
    }
  }

  const filtered = programs.filter(
    (p) => isMajorProgram(p.name) && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCourses = (stats?.completed_count || 0) + (stats?.remaining_count || 0);
  const progressPercent = totalCourses > 0 ? Math.round((stats!.completed_count / totalCourses) * 100) : 0;

  if (loading) {
    return (
      <div className="flex-1 p-8 lg:p-12 animate-pulse">
        <div className="max-w-5xl mx-auto">
          <div className="h-10 w-48 bg-slate-200 rounded mb-4" />
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-2xl border border-slate-200" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-48 bg-slate-100 rounded-2xl" />
            <div className="h-48 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-[radial-gradient(at_0%_0%,#f0f9f6_0,transparent_50%),radial-gradient(at_100%_100%,#eef2ff_0,transparent_50%)]">
      {showMajorModal && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowMajorModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 transform transition-all relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Icon */}
            <button 
              onClick={() => setShowMajorModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 className="text-xl font-bold text-slate-800 mb-1">Select your major</h2>
            <p className="text-slate-500 text-sm mb-4">Choose the degree program you are working toward.</p>
            
            <input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#00937C]/20 focus:border-[#00937C] text-slate-800 transition-all"
            />

            <div className="max-h-64 overflow-y-auto space-y-1 mb-6 border border-slate-50 rounded-lg p-2 bg-slate-50/50">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProgram(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                    selectedProgram === p.id
                      ? "bg-[#00937C] text-white shadow-md font-semibold"
                      : "hover:bg-white hover:shadow-sm text-slate-700"
                  }`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className={`text-xs ${selectedProgram === p.id ? "text-white/80" : "text-slate-400"}`}>
                    {p.colleges?.name}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMajorModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-3 text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveMajor}
                disabled={!selectedProgram || saving}
                className="flex-[2] bg-[#00937C] hover:bg-[#007A67] text-white rounded-lg py-3 text-sm font-bold disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
              >
                {saving ? "Saving..." : "Confirm Selection"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1 font-medium">Welcome back, Karyme. Here is your progress.</p>
          </div>
          <button
            onClick={() => void openMajorModal()}
            className="group flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:border-[#00937C] hover:text-[#00937C] transition-all text-sm"
          >
            <span>Change Major</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="md:col-span-1 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
             <div className="relative h-24 w-24 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-90">
                  <circle cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <circle cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 38} 
                    strokeDashoffset={2 * Math.PI * 38 * (1 - progressPercent / 100)} 
                    className="text-[#00937C] transition-all duration-1000" 
                  />
                </svg>
                <span className="absolute text-xl font-black text-slate-800">{progressPercent}%</span>
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-4 tracking-tighter text-center">Degree Completed</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:scale-[1.02] transition-transform">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-4xl font-black text-[#00937C]">{stats?.completed_count ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">courses finished</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:scale-[1.02] transition-transform">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available Now</p>
            <p className="text-4xl font-black text-blue-600">{stats?.available_count ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">ready to enroll</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:scale-[1.02] transition-transform">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Remaining</p>
            <p className="text-4xl font-black text-slate-400">{stats?.remaining_count ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">classes left</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <button
            onClick={() => router.push("/roadmap")}
            className="group relative bg-white rounded-3xl border border-slate-100 p-10 text-left shadow-sm hover:shadow-xl transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">🗺️</div>
            <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl mb-6 border border-slate-100">🗺️</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Degree Roadmap</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Visualize your path to graduation with an interactive semester-by-semester guide.</p>
          </button>

          <button
            onClick={() => router.push("/schedule")}
            className="group relative bg-[#0E6A5C] rounded-3xl p-10 text-left shadow-lg hover:shadow-2xl hover:bg-[#0c5c50] transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-4xl opacity-10">📅</div>
            <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl mb-6 backdrop-blur-sm border border-white/10">📅</div>
            <h3 className="text-xl font-bold text-white mb-2">Schedule Builder</h3>
            <p className="text-[#C9EAE3] text-sm leading-relaxed">Generate your ideal weekly schedule based on available course sections and ratings.</p>
          </button>
        </div>
      </div>
    </div>
  );
}