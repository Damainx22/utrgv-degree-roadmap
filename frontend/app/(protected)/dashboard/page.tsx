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
      // No major selected yet: load majors and force selection modal.
      await fetchPrograms();
      setShowMajorModal(true);
      setLoading(false);
      return;
    }

    if (res.ok) {
      const data = await res.json();
      const byCode = new Map<string, string>();
      for (const c of data.courses as { code: string; status: string }[]) {
        // Keep strongest status priority: completed > unlocked > locked
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
    // The initial page load intentionally hydrates client data after mount.
    void fetchStats();
  }, [fetchStats]);


  async function openMajorModal() {
    if (!programs.length) {
      await fetchPrograms();
    }
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00937C]" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
      {showMajorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Select your major</h2>
            <p className="text-slate-500 text-sm mb-4">Choose the degree program you are working toward.</p>
            <input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#00937C] text-slate-800"
            />
            <div className="max-h-64 overflow-y-auto space-y-1 mb-4 border border-gray-100 rounded-lg p-2">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProgram(p.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                    selectedProgram === p.id
                      ? "bg-[#DFF1ED] text-[#007A67] font-semibold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.colleges?.name}</div>
                </button>
              ))}
            </div>
            <button
              onClick={saveMajor}
              disabled={!selectedProgram || saving}
              className="w-full bg-[#00937C] hover:bg-[#007A67] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Confirm major"}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Student Dashboard</h1>
            <p className="text-slate-500 mt-1">Track your progress toward graduation.</p>
          </div>
          <button
            onClick={() => void openMajorModal()}
            className="bg-white border border-[#BFD7D2] text-slate-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-[#EEF6F4] transition-all text-sm"
          >
            Change Major
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl border border-[#CFE4DF] p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats?.completed_count ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-1">courses finished</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#CFE4DF] p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available Now</p>
            <p className="text-3xl font-bold text-blue-600">{stats?.available_count ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-1">courses you can take</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#CFE4DF] p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Remaining</p>
            <p className="text-3xl font-bold text-slate-600">{stats?.remaining_count ?? "—"}</p>
            <p className="text-xs text-slate-400 mt-1">courses to graduate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <button
            onClick={() => router.push("/roadmap")}
            className="bg-white rounded-2xl border border-[#CFE4DF] p-8 text-left hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-3">🗺️</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Degree Roadmap</h3>
            <p className="text-slate-500 text-sm">View your semester-by-semester degree plan with locked and unlocked courses.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
