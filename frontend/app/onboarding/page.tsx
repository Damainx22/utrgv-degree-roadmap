"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Program = {
  id: number;
  name: string;
  colleges: { name: string };
};

type Course = {
  code: string;
  name: string;
  credits: number;
  status: string;
  section: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const fetchPrograms = useCallback(async () => {
    const res = await fetch(`${API_URL}/roadmap/programs`);
    if (res.ok) setPrograms(await res.json());
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }

    // If roadmap already exists, skip onboarding.
    fetch(`${API_URL}/roadmap/student/roadmap`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (res.ok) router.replace("/dashboard");
    });

    void fetchPrograms();
  }, [fetchPrograms, router]);

  async function saveMajor() {
    if (!selectedProgram) return;
    setSaving(true);

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/roadmap/student/major?program_id=${selectedProgram}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchCourses();
        setStep(2);
      }
    } finally {
      setSaving(false);
    }
  }

  async function fetchCourses() {
    const token = getToken();
    const res = await fetch(`${API_URL}/roadmap/student/roadmap`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCourses(data.courses);
    }
  }

  function toggleCourse(code: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function finishSetup() {
    setSaving(true);

    try {
      const token = getToken();
      for (const code of completed) {
        await fetch(`${API_URL}/roadmap/student/completed`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ course_code: code }),
        });
      }
      router.replace("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  // Group by course level to make bulk selection easier for students.
  function groupByLevel(courseList: Course[]) {
    const groups: Record<string, Course[]> = {
      "Year 1 (1000-level)": [],
      "Year 2 (2000-level)": [],
      "Year 3 (3000-level)": [],
      "Year 4 (4000-level)": [],
      Other: [],
    };

    for (const course of courseList) {
      const num = parseInt(course.code.split(" ")[1]);
      if (num >= 1000 && num < 2000) groups["Year 1 (1000-level)"].push(course);
      else if (num >= 2000 && num < 3000) groups["Year 2 (2000-level)"].push(course);
      else if (num >= 3000 && num < 4000) groups["Year 3 (3000-level)"].push(course);
      else if (num >= 4000) groups["Year 4 (4000-level)"].push(course);
      else groups.Other.push(course);
    }

    return groups;
  }

  const filteredPrograms = programs.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#B5D1CC] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-xl">
          <div className="mb-6">
            <div className="w-10 h-10 bg-[#00937C] rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4">D</div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome to DegreePath</h1>
            <p className="text-slate-500 text-sm mt-1">Let&apos;s start by selecting your major.</p>
          </div>

          <input
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#00937C]"
          />

          <div className="max-h-72 overflow-y-auto space-y-1 mb-6 border border-gray-100 rounded-lg p-2">
            {filteredPrograms.map((program) => (
              <button
                key={program.id}
                onClick={() => setSelectedProgram(program.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                  selectedProgram === program.id
                    ? "bg-[#DFF1ED] text-[#007A67] font-semibold"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="font-medium">{program.name}</div>
                <div className="text-xs text-slate-400">{program.colleges?.name}</div>
              </button>
            ))}
          </div>

          <button
            onClick={saveMajor}
            disabled={!selectedProgram || saving}
            className="w-full bg-[#00937C] hover:bg-[#007A67] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Continue →"}
          </button>
        </div>
      </div>
    );
  }

  const groups = groupByLevel(courses);

  return (
    <div className="min-h-screen bg-[#B5D1CC] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-4">
          <h1 className="text-xl font-bold text-slate-800">Which courses have you already taken?</h1>
          <p className="text-slate-500 text-sm mt-1">
            Select all courses you&apos;ve completed. <span className="font-semibold text-[#007A67]">{completed.size} selected</span>
          </p>
        </div>

        {Object.entries(groups).map(([year, yearCourses]) => {
          if (yearCourses.length === 0) return null;
          return (
            <div key={year} className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">{year}</h2>
              <div className="grid grid-cols-1 gap-2">
                {yearCourses.map((course) => (
                  <button
                    key={course.code}
                    onClick={() => toggleCourse(course.code)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      completed.has(course.code)
                        ? "bg-green-50 border-green-300 text-green-800"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{course.code}</span>
                      {completed.has(course.code) && <span className="text-xs">✓ Completed</span>}
                    </div>
                    <div className="text-xs opacity-70 mt-0.5">{course.name} · {course.credits} credits</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <button
            onClick={finishSetup}
            disabled={saving}
            className="w-full bg-[#00937C] hover:bg-[#007A67] text-white rounded-lg py-3 text-sm font-semibold disabled:opacity-50 transition"
          >
            {saving ? "Setting up your roadmap..." : `Finish Setup (${completed.size} courses selected)`}
          </button>
        </div>
      </div>
    </div>
  );
}
