"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Course = {
  code: string;
  name: string;
  credits: number;
  status: "completed" | "unlocked" | "locked";
  display_order?: number;
  notes?: string;
  section?: string | null;
  requirement_type?: string | null;
};

type Semester = {
  year: number;
  semester: string;
  courses: Course[];
  total_credits: number;
};

const STYLE = {
  completed: "bg-[#DFF1ED]/90 border-[#00937C] text-[#005C4B] cursor-pointer hover:bg-[#DFF1ED] shadow-sm",
  unlocked: "bg-blue-50/90 border-blue-400 text-blue-800 cursor-pointer hover:bg-blue-50 shadow-sm",
  locked: "bg-white/40 border-slate-200 text-slate-400 cursor-not-allowed opacity-60 backdrop-blur-[2px]",
};

const ICON = {
  completed: "✓",
  unlocked: "→",
  locked: "🔒",
};

export default function RoadmapPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [programName, setProgramName] = useState("");
  const [hasPlan, setHasPlan] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }

    setLoading(true);
    try {
      const [roadmapRes, planRes] = await Promise.all([
        fetch(`${API_URL}/roadmap/student/roadmap`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/roadmap/student/degree-plan`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (roadmapRes.ok && planRes.ok) {
        const roadmapData = await roadmapRes.json();
        const planData = await planRes.json();

        const map: Record<string, Course> = {};
        roadmapData.courses.forEach((c: any) => {
          map[c.code] = {
            code: c.code,
            name: c.name,
            credits: c.credits,
            status: c.status,
            section: c.section ?? null,
            requirement_type: c.requirement_type ?? null,
          };
        });
        
        setCourses(map);
        setProgramName(planData.program_name ?? "");
        setHasPlan(planData.has_plan ?? false);
        setSemesters(planData.semesters ?? []);
      } else if (roadmapRes.status === 400) {
        setError("no_major");
      } else {
        setError("load_failed");
      }
    } catch (err) {
      setError("load_failed");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchRoadmap();
  }, [fetchRoadmap]);

  async function toggleCourse(code: string, currentStatus: string) {
    if (currentStatus === "locked") return;
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }
    
    const newStatus = currentStatus === "completed" ? "unlocked" : "completed";
    setCourses(prev => ({ ...prev, [code]: { ...prev[code], status: newStatus as any } }));

    if (currentStatus === "completed") {
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

    await fetchRoadmap();
  }

  const displayedCodes = new Set<string>();
  for (const sem of semesters) {
    for (const c of sem.courses) displayedCodes.add(c.code);
  }
  const displayedStatuses = Array.from(displayedCodes).map((code) => courses[code]?.status).filter(Boolean) as Array<"completed" | "unlocked" | "locked">;
  const completed = displayedStatuses.filter((s) => s === "completed").length;
  const available = displayedStatuses.filter((s) => s === "unlocked").length;
  const remaining = displayedStatuses.filter((s) => s !== "completed").length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00937C]" />
      </div>
    );
  }

  if (error === "no_major") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#CFE4DF]">
          <p className="text-slate-600 mb-4">No major selected yet.</p>
          <button onClick={() => router.push("/dashboard")} className="bg-[#00937C] text-white px-6 py-2.5 rounded-lg text-sm font-semibold">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (error === "load_failed") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#CFE4DF]">
          <p className="text-slate-600">Could not load roadmap right now. Please try again.</p>
        </div>
      </div>
    );
  }

  const years = Array.from(new Set(semesters.map((s) => s.year))).sort((a, b) => a - b);
  const exportAsPdf = () => window.print();

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto roadmap-print-root">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Degree Roadmap</h1>
              <p className="text-slate-500 mt-1 text-sm">{programName || "Degree Program"} · Click a course to mark it completed.</p>
            </div>
            <button
              onClick={exportAsPdf}
              className="bg-white border border-[#BFD7D2] text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-[#EEF6F4] transition-all"
            >
              Export PDF
            </button>
          </div>
          
          <div className="hidden print:block">
            <h1 className="text-3xl font-extrabold text-slate-900">Degree Roadmap</h1>
            <p className="text-slate-500 mt-1 text-sm">{programName || "Degree Program"}</p>
          </div>
          
          {!hasPlan && (
            <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg inline-block px-3 py-1">
              Semester plan not available for this major yet — showing by course level
            </p>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-8 no-print">
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

        {/* NAVIGATION */}
        <button 
          onClick={() => router.push('/dashboard')}
          className="no-print group flex items-center justify-center gap-2 w-full py-4 text-[10px] font-black text-slate-400 hover:text-[#00937C] border-t border-slate-200/60 uppercase tracking-[0.2em] transition-all mb-10"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
        </button>

        {/* ROADMAP CONTENT */}
        <div className="space-y-20">
          {years.map((year) => {
            const yearSemesters = semesters.filter(s => s.year === year);
            return (
              <section key={year} className="relative">
                <div className="flex items-center gap-6 mb-10">
                  <h2 className="text-6xl font-black text-slate-900/5 select-none absolute -left-16 -top-4">0{year}</h2>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-[0.3em] relative z-10">Academic Year {year}</h2>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                </div>

                <div className={`grid grid-cols-1 ${hasPlan ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4`}>
                  {yearSemesters.map((sem) => {
                    const semCourses = sem.courses
                      .map((course) => ({ ...course, ...(courses[course.code] ?? {}) }))
                      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
                    const semCredits = semCourses.reduce((sum, c) => sum + (c.credits || 0), 0);

                    return (
                      <div key={`${sem.year}-${sem.semester}`} className="bg-white rounded-2xl border border-[#CFE4DF] shadow-sm overflow-hidden roadmap-semester">
                        <div className="bg-[#0E6A5C] px-5 py-3 flex justify-between items-center">
                          <span className="text-white font-semibold">{hasPlan ? `${sem.semester} Semester` : sem.semester}</span>
                          <span className="text-[#8DD0C4] text-xs">{semCredits} credit hrs</span>
                        </div>

                        <div className="p-3 space-y-2">
                          {semCourses.map((course) => (
                            <button
                              key={course.code}
                              onClick={() => toggleCourse(course.code, course.status)}
                              disabled={course.status === "locked"}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all roadmap-course ${STYLE[course.status as keyof typeof STYLE]}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold">{course.code}</span>
                                <span className="text-xs font-medium">{ICON[course.status as keyof typeof ICON]} {course.credits}cr</span>
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
              </section>
            );
          })}
        </div>

        {/* LEGEND */}
        <div className="flex gap-6 mt-12 pb-12 justify-center no-print">
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

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
          }
          .roadmap-print-root {
            max-width: 100% !important;
            margin: 0 !important;
          }
          .roadmap-semester {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 12px;
          }
          .roadmap-course {
            background: #ffffff !important;
            border-color: #d1d5db !important;
            color: #111827 !important;
          }
        }
      `}</style>
    </div>
  );
}