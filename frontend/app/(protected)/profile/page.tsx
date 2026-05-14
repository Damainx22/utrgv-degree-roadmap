"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Program = {
  id: number;
  name: string;
  colleges: { name: string };
};

type ProfileData = {
  email: string;
  program_name: string | null;
  completed_count: number;
  available_count: number;
  remaining_count: number;
};

function isMajorProgram(name: string): boolean {
  const n = name.toLowerCase();
  return !n.includes("minor") && !n.includes("certificate") && !n.includes("concentration");
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPrograms = useCallback(async (): Promise<Program[]> => {
    const res = await fetch(`${API_URL}/roadmap/programs`);
    if (!res.ok) return [];
    const data = await res.json();
    setPrograms(data);
    return data;
  }, []);

  const parseEmailFromToken = (token: string): string => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || "";
    } catch {
      return "";
    }
  };

  const fetchProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }

    try {
      const [roadmapRes, programsRes] = await Promise.all([
        fetch(`${API_URL}/roadmap/student/roadmap`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/roadmap/programs`),
      ]);

      const programsData: Program[] = programsRes.ok ? await programsRes.json() : [];
      setPrograms(programsData);

      const email = parseEmailFromToken(token);

      if (roadmapRes.ok) {
        const data = await roadmapRes.json();
        const program = programsData.find((p) => p.id === data.program_id);

        setProfile({
          email,
          program_name: program?.name || "Not selected",
          completed_count: data.completed_count,
          available_count: data.courses.filter((c: { status: string }) => c.status === "unlocked").length,
          remaining_count: data.remaining_count,
        });
      } else {
        setProfile({
          email,
          program_name: "Not selected",
          completed_count: 0,
          available_count: 0,
          remaining_count: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  async function openMajorModal() {
    if (!programs.length) {
      await fetchPrograms();
    }
    setShowMajorModal(true);
  }

  async function saveMajor() {
    if (!selectedProgram) return;
    const confirmed = window.confirm(
      "Changing your major will reset your completed-course progress for the new roadmap. Continue?"
    );
    if (!confirmed) return;
    setSaving(true);
    const token = getToken();

    try {
      const res = await fetch(`${API_URL}/roadmap/student/major?program_id=${selectedProgram}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setShowMajorModal(false);
        setSearch("");
        await fetchProfile();
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    const token = getToken();
    await fetch(`${API_URL}/roadmap/student/account`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    removeToken();
    router.replace("/");
  }

  async function resetProgress() {
    setResetting(true);
    const token = getToken();
    try {
      await fetch(`${API_URL}/roadmap/student/completed`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowResetConfirm(false);
      await fetchProfile();
    } finally {
      setResetting(false);
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
            <h2 className="text-xl font-bold text-slate-800 mb-1">Change your major</h2>
            <p className="text-slate-500 text-sm mb-4">Select a new degree program.</p>
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
            <div className="flex gap-3">
              <button
                onClick={() => setShowMajorModal(false)}
                className="flex-1 border border-gray-300 text-slate-700 rounded-lg py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveMajor}
                disabled={!selectedProgram || saving}
                className="flex-1 bg-[#00937C] hover:bg-[#007A67] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition"
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Delete account?</h2>
            <p className="text-slate-500 text-sm mb-6">
              This will permanently delete your account, completed courses, and all saved data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 text-slate-700 rounded-lg py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition"
              >
                {deleting ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Reset progress?</h2>
            <p className="text-slate-500 text-sm mb-6">
              This will clear all completed courses for your current major. Your account and reviews stay intact.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 border border-gray-300 text-slate-700 rounded-lg py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={resetProgress}
                disabled={resetting}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition"
              >
                {resetting ? "Resetting..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Profile</h1>

        <div className="bg-white rounded-2xl border border-[#CFE4DF] shadow-sm p-6 mb-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Account</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-slate-800 font-medium">{profile?.email}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="text-xs text-slate-400">Major</p>
                <p className="text-slate-800 font-medium">{profile?.program_name}</p>
              </div>
              <button
                onClick={() => void openMajorModal()}
                className="text-sm text-[#00937C] font-semibold hover:underline"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#CFE4DF] shadow-sm p-6 mb-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Progress</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{profile?.completed_count}</div>
              <div className="text-xs text-slate-400 mt-1">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{profile?.available_count}</div>
              <div className="text-xs text-slate-400 mt-1">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-500">{profile?.remaining_count}</div>
              <div className="text-xs text-slate-400 mt-1">Remaining</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">Danger zone</h2>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-slate-800 font-medium">Reset progress</p>
              <p className="text-slate-400 text-sm">Clear completed courses and start your roadmap over.</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Reset
            </button>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-red-100">
            <div>
              <p className="text-slate-800 font-medium">Delete account</p>
              <p className="text-slate-400 text-sm">Permanently remove your account and all data.</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
