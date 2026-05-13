"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Review = {
  id: number;
  professor_name: string;
  department: string;
  course_code: string | null;
  course_name: string | null;
  rating: number;
  review_text: string;
};

type Professor = {
  id: number;
  name: string;
  department: string;
};

export default function ReviewsPage() {
  const PAGE_SIZE = 3;
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [minRating, setMinRating] = useState("1");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    professorId: "",
    courseCode: "",
    courseName: "",
    rating: "5",
    difficulty: "Medium",
    wouldTakeAgain: true,
    reviewText: "",
  });

  async function fetchReviews() {
    setLoading(true);
    const params = new URLSearchParams({
      min_rating: minRating,
    });
    if (department.trim()) params.set("department", department.trim());

    const res = await fetch(`${API_URL}/reviews?${params.toString()}`);
    if (res.ok) {
      setReviews(await res.json());
      setPage(1);
    } else {
      setReviews([]);
      setPage(1);
    }
    setLoading(false);
  }

  async function fetchProfessors() {
    const params = new URLSearchParams();
    if (department.trim()) params.set("department", department.trim());
    const res = await fetch(`${API_URL}/reviews/professors?${params.toString()}`);
    if (res.ok) {
      setProfessors(await res.json());
    } else {
      setProfessors([]);
    }
  }

  useEffect(() => {
    void fetchReviews();
    void fetchProfessors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nameQuery = q.trim().toLowerCase();
  const filteredReviews = reviews.filter((r) =>
    !nameQuery ? true : r.professor_name.toLowerCase().includes(nameQuery)
  );

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visibleReviews = filteredReviews.slice(start, start + PAGE_SIZE);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const token = getToken();
    if (!token) {
      setSubmitError("You must be logged in to submit a review.");
      return;
    }
    if (!newReview.professorId) {
      setSubmitError("Please select a professor.");
      return;
    }
    if (newReview.reviewText.trim().length < 3) {
      setSubmitError("Review text must be at least 3 characters.");
      return;
    }

    setSubmitLoading(true);
    const res = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        professor_id: Number(newReview.professorId),
        course_code: newReview.courseCode.trim() || null,
        course_name: newReview.courseName.trim() || null,
        rating: Number(newReview.rating),
        review_text: newReview.reviewText.trim(),
        difficulty: newReview.difficulty,
        would_take_again: newReview.wouldTakeAgain,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setSubmitError(err.detail || "Could not submit review.");
      setSubmitLoading(false);
      return;
    }

    setSubmitSuccess("Review submitted successfully.");
    setNewReview({
      professorId: "",
      courseCode: "",
      courseName: "",
      rating: "5",
      difficulty: "Medium",
      wouldTakeAgain: true,
      reviewText: "",
    });
    await fetchReviews();
    setSubmitLoading(false);
    setShowReviewModal(false);
  }

  return (
    <div className="min-h-screen bg-[#B5D1CC] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Professor Reviews</h1>
              <p className="text-slate-600 mt-2">Browse professor feedback and ratings to help plan your classes.</p>
            </div>
            <button
              onClick={() => {
                setSubmitError("");
                setSubmitSuccess("");
                setShowReviewModal(true);
              }}
              className="bg-[#00937C] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-[#007A67] transition-all whitespace-nowrap"
            >
              Write Review
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Search Reviews</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Professor Name</label>
                <input
                  type="text"
                  placeholder="Search by name"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
                >
                  <option value="1">All Ratings</option>
                  <option value="4">4 Stars & Up</option>
                  <option value="3">3 Stars & Up</option>
                  <option value="2">2 Stars & Up</option>
                </select>
              </div>

              <button
                onClick={() => void fetchReviews()}
                className="w-full bg-[#00937C] text-white py-3 rounded-xl font-semibold shadow-md hover:bg-[#007A67] transition-all"
              >
                Search
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#CFE4DF] shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Recent Reviews</h2>
              <span className="text-xs font-bold text-[#007A67] bg-[#DFF1ED] px-3 py-1 rounded-full uppercase">Student Rated</span>
            </div>

            {loading ? (
              <p className="text-slate-500 text-sm">Loading reviews...</p>
            ) : filteredReviews.length === 0 ? (
              <p className="text-slate-500 text-sm">No reviews found for current filters.</p>
            ) : (
              <div className="space-y-4">
                {visibleReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl bg-[#EEF6F4] p-5 border border-[#D9ECE7]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">{review.professor_name}</h3>
                      <span className="text-sm font-semibold text-[#007A67]">{review.rating.toFixed(1)} ★</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{review.review_text}</p>
                    <p className="text-xs text-slate-500 mt-3">
                      Course: {review.course_code || "N/A"} {review.course_name ? `· ${review.course_name}` : ""}
                    </p>
                  </div>
                ))}

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Showing {start + 1}-{Math.min(start + PAGE_SIZE, filteredReviews.length)} of {filteredReviews.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg border border-[#CFE4DF] text-sm font-semibold text-slate-700 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EEF6F4] transition"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-semibold text-slate-600">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-[#CFE4DF] text-sm font-semibold text-slate-700 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#EEF6F4] transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showReviewModal && (
          <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#CFE4DF] shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Submit a Review</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-slate-500 hover:text-slate-700 text-sm font-semibold"
                >
                  Close
                </button>
              </div>
              <form onSubmit={handleSubmitReview} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Professor</label>
              <select
                required
                value={newReview.professorId}
                onChange={(e) => setNewReview((prev) => ({ ...prev, professorId: e.target.value }))}
                className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
              >
                <option value="">Select professor</option>
                {professors.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Course Code</label>
              <input
                type="text"
                placeholder="CSCI 1470"
                value={newReview.courseCode}
                onChange={(e) => setNewReview((prev) => ({ ...prev, courseCode: e.target.value.toUpperCase() }))}
                className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Course Name (optional)</label>
              <input
                type="text"
                placeholder="Data Structures and Algorithms"
                value={newReview.courseName}
                onChange={(e) => setNewReview((prev) => ({ ...prev, courseName: e.target.value }))}
                className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview((prev) => ({ ...prev, rating: e.target.value }))}
                className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
              >
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
              <select
                value={newReview.difficulty}
                onChange={(e) => setNewReview((prev) => ({ ...prev, difficulty: e.target.value }))}
                className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={newReview.wouldTakeAgain}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, wouldTakeAgain: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#CFE4DF] text-[#00937C] focus:ring-[#00937C]"
                />
                Would take again
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Review Text</label>
              <textarea
                required
                rows={4}
                value={newReview.reviewText}
                onChange={(e) => setNewReview((prev) => ({ ...prev, reviewText: e.target.value }))}
                placeholder="Share your experience with this professor..."
                className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
              />
            </div>

                <div className="md:col-span-2 flex items-center justify-between">
                  <div>
                    {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                    {submitSuccess && <p className="text-sm text-green-700">{submitSuccess}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-[#00937C] text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:bg-[#007A67] transition-all disabled:opacity-50"
                  >
                    {submitLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
