export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-[#B5D1CC] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Schedule Builder
          </h1>
          <p className="text-slate-600 mt-2">
            Create a class schedule that fits your availability and preferences.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preferences */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Preferences
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Preferred Days
                </label>
                <select className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]">
                  <option>Monday / Wednesday</option>
                  <option>Tuesday / Thursday</option>
                  <option>Any</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Preferred Time
                </label>
                <select className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]">
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                  <option>Any</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Credit Hours
                </label>
                <select className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]">
                  <option>12 Hours</option>
                  <option>15 Hours</option>
                  <option>18 Hours</option>
                </select>
              </div>

              <button className="w-full bg-[#00937C] text-white py-3 rounded-xl font-semibold shadow-md hover:bg-[#007A67] transition-all">
                Generate Schedule
              </button>
            </div>
          </div>

          {/* Schedule Results */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Suggested Schedule
              </h2>
              <span className="text-xs font-bold text-[#007A67] bg-[#DFF1ED] px-3 py-1 rounded-full uppercase">
                Draft
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-[#EEF6F4] p-5 border border-[#D9ECE7]">
                <h3 className="font-bold text-slate-800">Data Structures</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Monday / Wednesday • 9:00 AM - 10:15 AM
                </p>
                <p className="text-xs text-[#007A67] font-semibold mt-2">
                  Professor: Dr. Smith
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF6F4] p-5 border border-[#D9ECE7]">
                <h3 className="font-bold text-slate-800">Discrete Math</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Monday / Wednesday • 11:00 AM - 12:15 PM
                </p>
                <p className="text-xs text-[#007A67] font-semibold mt-2">
                  Professor: Prof. Johnson
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF6F4] p-5 border border-[#D9ECE7]">
                <h3 className="font-bold text-slate-800">Computer Organization</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Tuesday / Thursday • 1:00 PM - 2:15 PM
                </p>
                <p className="text-xs text-[#007A67] font-semibold mt-2">
                  Professor: Dr. Lee
                </p>
              </div>

              <div className="rounded-2xl bg-[#EEF6F4] p-5 border border-[#D9ECE7]">
                <h3 className="font-bold text-slate-800">Technical Writing</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Tuesday / Thursday • 3:00 PM - 4:15 PM
                </p>
                <p className="text-xs text-[#007A67] font-semibold mt-2">
                  Professor: Ms. Carter
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}