"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Course = {
  code: string;
  name: string;
  credits: number;
  status: "completed" | "unlocked" | "locked";
};

const CS_PLAN = [
  {
    year: 1, semester: "Fall",
    courses: ["MATH 2413", "CSCI 1101", "CSCI 1470"],
    hours: 12
  },
  {
    year: 1, semester: "Spring",
    courses: ["MATH 2414", "CSCI 2380", "COMM 1315"],
    hours: 13
  },
  {
    year: 2, semester: "Fall",
    courses: ["CSCI 2344", "CSCI 2333", "CSCI 3326"],
    hours: 16
  },
  {
    year: 2, semester: "Spring",
    courses: ["PHIL 2326", "CSCI 3310", "EECE 2106", "EECE 2306"],
    hours: 17
  },
  {
    year: 3, semester: "Fall",
    courses: ["CSCI 3333", "CSCI 3340", "ENGL 3342"],
    hours: 15
  },
  {
    year: 3, semester: "Spring",
    courses: ["CSCI 3336", "MATH 2318", "STAT 3337"],
    hours: 15
  },
  {
    year: 4, semester: "Fall",
    courses: ["CSCI 4325", "CSCI 4333", "CSCI 4334"],
    hours: 17
  },
  {
    year: 4, semester: "Spring",
    courses: ["CSCI 4390"],
    hours: 15
  },
];

const STYLE = {
  completed: "bg-[#DFF1ED] border-[#00937C] text-[#005C4B] cursor-pointer hover:opacity-80",
  unlocked:  "bg-blue-50 border-blue-400 text-blue-800 cursor-pointer hover:opacity-80",
  locked:    "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60",
};

const ICON = {
  completed: "✓",
  unlocked:  "→",
  locked:    "🔒",
};

export default function RoadmapPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoadmap = useCallback(async () => {
    const token = getToken();
    if (!token) { router.replace("/"); return; }

    const res = await fetch(`${API_URL}/roadmap/student/roadmap`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 400) { setError("no_major"); setLoading(false); return; }

    if (res.ok) {
      const data = await res.json();
      const map: Record<string, Course> = {};
      for (const c of data.courses) map[c.code] = c;
      setCourses(map);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchRoadmap(); }, [fetchRoadmap]);

  async function toggleCourse(code: string, status: string) {
    if (status === "locked") return;
    const token = getToken();
    if (status === "completed") {
      await fetch(`${API_URL}/roadmap/student/completed/${code}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await fetch(`${API_URL}/roadmap/student/completed`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ course_code: code }),
      });
    }
    fetchRoadmap();
  }

  const completed = Object.values(courses).filter(c => c.status === "completed").length;
  const available = Object.values(courses).filter(c => c.status === "unlocked").length;
  const remaining = Object.values(courses).filter(c => c.status !== "completed").length;

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00937C]" />
    </div>
  );

  if (error === "no_major") return (
    <div className="flex-1 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#CFE4DF]">
        <p className="text-slate-600 mb-4">No major selected yet.</p>
        <button onClick={() => router.push("/dashboard")} className="bg-[#00937C] text-white px-6 py-2.5 rounded-lg text-sm font-semibold">
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  // Group semesters by year for side-by-side layout
  const years = [1, 2, 3, 4];

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Degree Roadmap</h1>
          <p className="text-slate-500 mt-1 text-sm">BS Computer Science · Click a course to mark it completed.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[#CFE4DF] p-4 text-center">
            <div className="text-2xl font-bold text-[#00937C]">{completed}</div>
            <div className="text-xs text-slate-400 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-xl border border-[#CFE4DF] p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{available}</div>
            <div className="text-xs text-slate-400 mt-1">Available now</div>
          </div>
          <div className="bg-white rounded-xl border border-[#CFE4DF] p-4 text-center">
            <div className="text-2xl font-bold text-slate-500">{remaining}</div>
            <div className="text-xs text-slate-400 mt-1">Remaining</div>
          </div>
        </div>

        {/* Year by year — each year shows Fall + Spring side by side */}
        <div className="space-y-6">
          {years.map(year => {
            const semesters = CS_PLAN.filter(s => s.year === year);
            return (
              <div key={year}>
                {/* Year label */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-[#0E6A5C] text-white text-sm font-bold px-4 py-1.5 rounded-full">
                    Year {year}
                  </div>
                  <div className="flex-1 h-px bg-[#CFE4DF]" />
                </div>

                {/* Fall + Spring columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semesters.map(sem => {
                    const semCourses = sem.courses.map(code => courses[code]).filter(Boolean);
                    const semCredits = semCourses.reduce((sum, c) => sum + (c?.credits || 0), 0);

                    return (
                      <div key={sem.semester} className="bg-white rounded-2xl border border-[#CFE4DF] shadow-sm overflow-hidden">
                        {/* Semester header */}
                        <div className="bg-[#0E6A5C] px-5 py-3 flex justify-between items-center">
                          <span className="text-white font-semibold">{sem.semester} Semester</span>
                          <span className="text-[#8DD0C4] text-xs">{semCredits} credit hrs</span>
                        </div>

                        {/* Course list */}
                        <div className="p-3 space-y-2">
                          {semCourses.map(course => (
                            <button
                              key={course.code}
                              onClick={() => toggleCourse(course.code, course.status)}
                              disabled={course.status === "locked"}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${STYLE[course.status]}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold">{course.code}</span>
                                <span className="text-xs font-medium">
                                  {ICON[course.status]} {course.credits}cr
                                </span>
                              </div>
                              <div className="text-xs mt-0.5 opacity-70">{course.name}</div>
                            </button>
                          ))}

                          {semCourses.length === 0 && (
                            <p className="text-slate-400 text-xs text-center py-3">No courses loaded</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-8 justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-4 h-4 rounded bg-[#DFF1ED] border border-[#00937C]" />
            Completed
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-4 h-4 rounded bg-blue-50 border border-blue-400" />
            Available
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200" />
            Locked
          </div>
        </div>

      </div>
    </div>
  );
}