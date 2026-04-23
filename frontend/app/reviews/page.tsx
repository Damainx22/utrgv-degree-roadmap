export default function ReviewsPage() {
    return (
        <div className="min-h-screen bg-[#B5D1CC] p-8 lg:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Professor Reviews
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Browse professor feedback and ratings to help plan your classes.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Search / Filter */}
                    <div className="lg:col-span-1 bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">
                            Search Reviews
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Professor Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by name"
                                    className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Department
                                </label>
                                <select className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]">
                                    <option>Computer Science</option>
                                    <option>Mathematics</option>
                                    <option>Engineering</option>
                                    <option>English</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Rating
                                </label>
                                <select className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]">
                                    <option>All Ratings</option>
                                    <option>4 Stars & Up</option>
                                    <option>3 Stars & Up</option>
                                    <option>2 Stars & Up</option>
                                </select>
                            </div>

                            <button className="w-full bg-[#00937C] text-white py-3 rounded-xl font-semibold shadow-md hover:bg-[#007A67] transition-all">
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">
                                Recent Reviews
                            </h2>
                            <span className="text-xs font-bold text-[#007A67] bg-[#DFF1ED] px-3 py-1 rounded-full uppercase">
                                Student Rated
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-2xl bg-[#EEF6F4] p-5 border border-[#D9ECE7]">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800">Dr. Sarah Jenkins</h3>
                                    <span className="text-sm font-semibold text-[#007A67]">
                                        4.9 ★
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-2">
                                    Great professor, explains clearly, and gives helpful study guides.
                                </p>
                                <p className="text-xs text-slate-500 mt-3">
                                    Course: Advanced UI Design
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#EEF6F4] p-5 border border-[#D9ECE7]">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800">Prof. Marcus Aris</h3>
                                    <span className="text-sm font-semibold text-[#007A67]">
                                        4.7 ★
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-2">
                                    Challenging class but very organized. If you study, you will do well.
                                </p>
                                <p className="text-xs text-slate-500 mt-3">
                                    Course: Systems Architecture
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#EEF6F4] p-5 border border-[#D9ECE7]">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-800">Dr. Julian Vane</h3>
                                    <span className="text-sm font-semibold text-[#007A67]">
                                        4.5 ★
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-2">
                                    Really engaging lectures and fair grading. Attendance matters.
                                </p>
                                <p className="text-xs text-slate-500 mt-3">
                                    Course: Ethics in Tech
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}