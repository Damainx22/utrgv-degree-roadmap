export default function MessagesPage() {
    return (
        <div className="min-h-screen bg-[#B5D1CC] p-8 lg:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Messages
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Chat with classmates and discuss professors, schedules, and classes.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Conversations List */}
                    <div className="lg:col-span-1 bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">
                            Conversations
                        </h2>

                        <div className="space-y-4">
                            <div className="rounded-2xl bg-[#EEF6F4] p-4 border border-[#D9ECE7] cursor-pointer hover:bg-[#E5F1EE] transition-all">
                                <h3 className="font-bold text-slate-800">Class Group Chat</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    5 new messages
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#EEF6F4] p-4 border border-[#D9ECE7] cursor-pointer hover:bg-[#E5F1EE] transition-all">
                                <h3 className="font-bold text-slate-800">Professor Reviews Team</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    2 new messages
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#EEF6F4] p-4 border border-[#D9ECE7] cursor-pointer hover:bg-[#E5F1EE] transition-all">
                                <h3 className="font-bold text-slate-800">Schedule Planning</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Last message 10 min ago
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">
                                Class Group Chat
                            </h2>
                            <span className="text-xs font-bold text-[#007A67] bg-[#DFF1ED] px-3 py-1 rounded-full uppercase">
                                Live
                            </span>
                        </div>

                        <div className="flex-1 space-y-4 mb-6">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-full shrink-0" />
                                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none text-sm text-slate-600 max-w-md">
                                    <strong>Mark:</strong> Has anyone taken Dr. Smith for Calc 2?
                                </div>
                            </div>

                            <div className="flex gap-3 flex-row-reverse">
                                <div className="w-8 h-8 bg-blue-100 rounded-full shrink-0" />
                                <div className="bg-[#00937C] p-4 rounded-2xl rounded-tr-none text-sm text-white max-w-md">
                                    <strong>You:</strong> I heard he gives a lot of homework but explains well.
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full shrink-0" />
                                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none text-sm text-slate-600 max-w-md">
                                    <strong>Ana:</strong> Yeah, his exams are fair if you do the practice problems.
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-[#D9ECE7] pt-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
                                />
                                <button className="bg-[#00937C] text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:bg-[#007A67] transition-all">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}