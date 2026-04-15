"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, removeToken } from "@/lib/auth";

// --- UI Sub-components ---
const SidebarLink = ({ label, active = false }) => (
  <div className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
    active 
      ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  }`}>
    <span className="text-sm font-semibold">{label}</span>
  </div>
);

const StatCard = ({ label, value, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
    <p className="text-xs text-emerald-500 font-medium mt-2">{trend}</p>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) router.push("/");
    else setLoading(false);
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 p-8 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">DegreePath</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <SidebarLink label="Overview" active />
          <SidebarLink label="Degree Roadmap" />
          <SidebarLink label="Schedule Builder" />
          <SidebarLink label="Professor Reviews" />
          <SidebarLink label="Messages" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-14 overflow-y-auto">
        <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Dashboard</h2>
            <p className="text-slate-500 mt-1 font-medium">Welcome back! You're on track to graduate by Spring 2027.</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all">
              Change Major
            </button>
            <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all">
              Build Schedule
            </button>
          </div>
        </header>

        <section className="max-w-6xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard label="Credits Earned" value="72 / 120" trend="+12 this semester" />
            <StatCard label="Current GPA" value="3.82" trend="Top 10% of Major" />
            <StatCard label="Saved Profs" value="14 Reviews" trend="3 new updates" />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Schedule Section */}
            <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-slate-800">Top Rated Classes for You</h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Based on Reviews</span>
              </div>
              
              <div className="space-y-6">
                {[
                  { name: "Advanced UI Design", prof: "Sarah Jenkins", score: "4.9" },
                  { name: "Systems Architecture", prof: "Marcus Aris", score: "4.7" },
                  { name: "Ethics in Tech", prof: "Julian Vane", score: "4.5" }
                ].map((item, i) => (
                  <div key={i} className="group flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {item.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.prof}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{item.score} ★</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Difficulty: Low</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Cards */}
            <div className="col-span-12 lg:col-span-5 space-y-8">
              <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-2">Major Insight</h4>
                  <p className="text-indigo-200 text-sm leading-relaxed">
                    Students in <strong>Computer Science</strong> who took "Systems Architecture" in their Junior year had a 20% higher hire rate.
                  </p>
                  <button className="mt-6 text-sm font-bold border-b border-indigo-400 pb-1 hover:text-indigo-300 transition-colors">Read Full Report →</button>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-800 rounded-full blur-3xl opacity-50"></div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-widest">Live Professor Chat</h4>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full shrink-0" />
                    <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none text-xs text-slate-600">
                      <strong>Mark:</strong> Has anyone taken Dr. Smith for Calc 2? Is he really that bad?
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 bg-blue-100 rounded-full shrink-0" />
                    <div className="bg-indigo-600 p-3 rounded-2xl rounded-tr-none text-xs text-white">
                      <strong>You:</strong> He's okay, just a lot of homework!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}