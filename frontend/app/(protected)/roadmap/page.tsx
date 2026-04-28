export default function RoadmapPage() {
    return ( 
    <div className="min-h-screen bg-[#B5D1CC] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Degree Roadmap
          </h1>
          <p className="text-slate-600 mt-2">
            Plan your courses semester by semester and stay on track for graduation.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Freshman Year</h2>
            <ul className="space-y-3 text-slate-600">
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Intro to Programming</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">College Algebra</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">English Composition</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">University Seminar</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Sophomore Year</h2>
            <ul className="space-y-3 text-slate-600">
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Data Structures</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Discrete Math</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Physics I</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Technical Writing</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Junior Year</h2>
            <ul className="space-y-3 text-slate-600">
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Operating Systems</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Database Systems</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Software Engineering</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Computer Networks</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Senior Year</h2>
            <ul className="space-y-3 text-slate-600">
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Capstone Project</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Machine Learning</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Cybersecurity</li>
              <li className="bg-[#EEF6F4] rounded-xl px-4 py-3">Electives</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
