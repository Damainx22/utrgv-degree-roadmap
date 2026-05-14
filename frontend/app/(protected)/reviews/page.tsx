"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "@/lib/auth";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

type Review = {
  id: number;
  user_id: string | null;
  reviewer_name: string;
  reviewer_email: string | null;
  is_owner?: boolean;
  professor_name: string;
  department: string;
  course_code: string | null;
  course_name: string | null;
  rating: number;
  review_text: string;
  difficulty?: string | null;
  would_take_again?: boolean;
  created_at?: string;
};

type Professor = {
  id: number;
  name: string;
  department: string;
};

export default function ReviewsPage() {
  const router = useRouter();
  const PAGE_SIZE = 3;
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [minRating, setMinRating] = useState("1");
  const [sortBy, setSortBy] = useState("newest");
  const [onlyMine, setOnlyMine] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [newProfessor, setNewProfessor] = useState({
    name: "",
    department: "Computer Science",
    email: "",
  });
  const [professorNotListed, setProfessorNotListed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({
    professorId: "",
    courseCode: "",
    courseName: "",
    rating: "5",
    difficulty: "Medium",
    wouldTakeAgain: true,
    reviewText: "",
  });

  async function fetchReviews(departmentOverride?: string) {
    setLoading(true);
    // Optional override lets us refresh immediately into the newly-added department.
    const activeDepartment = departmentOverride ?? department;
    const params = new URLSearchParams({
      min_rating: minRating,
    });
    if (activeDepartment.trim()) params.set("department", activeDepartment.trim());

    const token = getToken();
    const res = await fetch(`${API_URL}/reviews?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
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
    // Keep review-form professor list unfiltered so users can always select
    // newly-added professors regardless of current review-search filters.
    const res = await fetch(`${API_URL}/reviews/professors`);
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
  // Client-side filters are instant and avoid extra server requests for each keystroke.
  const filteredReviews = reviews
    .filter((r) => (!nameQuery ? true : r.professor_name.toLowerCase().includes(nameQuery)))
    .filter((r) => (onlyMine ? Boolean(r.is_owner) : true));

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "rating_desc") return b.rating - a.rating;
    if (sortBy === "rating_asc") return a.rating - b.rating;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedReviews.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const visibleReviews = sortedReviews.slice(start, start + PAGE_SIZE);
  const professorOptions = professors.slice(0, 40);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const token = getToken();
    if (!token) {
      setSubmitError("You must be logged in to submit a review.");
      router.replace("/");
      return;
    }
    const professorId = newReview.professorId;
    if (professorNotListed && newProfessor.name.trim().length < 2) {
      setSubmitError("Enter the missing professor name.");
      return;
    }
    if (!professorId && !professorNotListed) {
      setSubmitError("Please select a professor, or check 'Professor not listed' and enter their name.");
      return;
    }
    if (newReview.reviewText.trim().length < 3) {
      setSubmitError("Review text must be at least 3 characters.");
      return;
    }

    setSubmitLoading(true);
    // Single submit handler supports both create and edit modes.
    const isEdit = editingReviewId !== null;
    const reviewPayload = {
      course_code: newReview.courseCode.trim() || null,
      course_name: newReview.courseName.trim() || null,
      rating: Number(newReview.rating),
      review_text: newReview.reviewText.trim(),
      difficulty: newReview.difficulty,
      would_take_again: newReview.wouldTakeAgain,
    };

    const endpoint = isEdit ? `${API_URL}/reviews/${editingReviewId}` : `${API_URL}/reviews`;
    const method = isEdit ? "PUT" : "POST";
    let payload: Record<string, unknown> = isEdit
      ? reviewPayload
      : professorNotListed
        ? {
            professor_id: null,
            professor_name: newProfessor.name.trim(),
            professor_department: newProfessor.department.trim() || "Computer Science",
            professor_email: newProfessor.email.trim() || null,
            ...reviewPayload,
          }
        : { professor_id: Number(professorId), ...reviewPayload };

    let res = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // If combined flow fails to resolve professor, recover by creating professor and retrying once.
    if (!res.ok && !isEdit && professorNotListed) {
      const err = await res.json().catch(() => ({}));
      const detail = String(err?.detail || "");
      if (
        res.status === 400 ||
        res.status === 404 ||
        detail.toLowerCase().includes("professor")
      ) {
        const createProf = await fetch(`${API_URL}/reviews/professors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newProfessor.name.trim(),
            department: newProfessor.department.trim() || "Computer Science",
            email: newProfessor.email.trim() || null,
          }),
        });
        if (createProf.ok) {
          const createdData = await createProf.json();
          const newProfessorId = createdData?.professor?.id;
          if (newProfessorId) {
            payload = { professor_id: Number(newProfessorId), ...reviewPayload };
            res = await fetch(`${API_URL}/reviews`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });
          }
        }
      }
    }

    if (!res.ok) {
      if (res.status === 401) {
        removeToken();
        setSubmitError("Session expired. Please log in again.");
        setSubmitLoading(false);
        router.replace("/");
        return;
      }
      const err = await res.json().catch(() => ({}));
      setSubmitError(err.detail || "Could not submit review.");
      setSubmitLoading(false);
      return;
    }

    setSubmitSuccess(isEdit ? "Review updated successfully." : "Review submitted successfully.");
    setPageMessage(isEdit ? "Review updated successfully." : "Review submitted successfully.");
    setNewReview({
      professorId: "",
      courseCode: "",
      courseName: "",
      rating: "5",
      difficulty: "Medium",
      wouldTakeAgain: true,
      reviewText: "",
    });
    setSubmitLoading(false);
    setShowReviewModal(false);
    setEditingReviewId(null);
    await fetchProfessors();
    // If user added a not-listed professor in another department, immediately
    // switch and fetch with that department so the new review appears right away.
    let nextDepartment = department;
    if (!isEdit && professorNotListed && newProfessor.department.trim()) {
      nextDepartment = newProfessor.department.trim();
      setDepartment(nextDepartment);
    }
    await fetchReviews(nextDepartment);
    setTimeout(() => setPageMessage(""), 3000);
  }

  function openEditReview(review: Review) {
    setSubmitError("");
    setSubmitSuccess("");
    setEditingReviewId(review.id);
    setNewReview({
      professorId: "",
      courseCode: review.course_code || "",
      courseName: review.course_name || "",
      rating: String(review.rating),
      difficulty: "Medium",
      wouldTakeAgain: true,
      reviewText: review.review_text,
    });
    setShowReviewModal(true);
  }

  async function handleDeleteReview(reviewId: number) {
    const token = getToken();
    if (!token) return;
    const ok = window.confirm("Delete this review?");
    if (!ok) return;
    const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchReviews();
    }
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
                setEditingReviewId(null);
                setNewReview({
                  professorId: "",
                  courseCode: "",
                  courseName: "",
                  rating: "5",
                  difficulty: "Medium",
                  wouldTakeAgain: true,
                  reviewText: "",
                });
                setProfessorNotListed(false);
                setNewProfessor({ name: "", department: "Computer Science", email: "" });
                setShowReviewModal(true);
              }}
              className="bg-[#00937C] text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-[#007A67] transition-all whitespace-nowrap"
            >
              Write Review
            </button>
          </div>
          {pageMessage && (
            <p className="mt-3 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 inline-block">
              {pageMessage}
            </p>
          )}
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
                >
                  <option value="newest">Newest</option>
                  <option value="rating_desc">Highest Rating</option>
                  <option value="rating_asc">Lowest Rating</option>
                </select>
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyMine}
                  onChange={(e) => {
                    setOnlyMine(e.target.checked);
                    setPage(1);
                  }}
                  className="h-4 w-4 rounded border-[#CFE4DF] text-[#00937C] focus:ring-[#00937C]"
                />
                Show only my reviews
              </label>

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
            ) : sortedReviews.length === 0 ? (
              <div>
                <p className="text-slate-500 text-sm">No reviews found for current filters.</p>
                <button
                  onClick={() => {
                    setSubmitError("");
                    setSubmitSuccess("");
                    setEditingReviewId(null);
                    setShowReviewModal(true);
                  }}
                  className="mt-3 bg-[#00937C] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#007A67] transition"
                >
                  Write the first review
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl bg-[#EEF6F4] p-5 border border-[#D9ECE7]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">{review.professor_name}</h3>
                      <span className="text-sm font-semibold text-[#007A67]">{review.rating.toFixed(1)} ★</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Posted by {review.reviewer_name}
                      {review.reviewer_email ? ` (${review.reviewer_email})` : ""} · {timeAgo(review.created_at)}
                    </p>
                    <p className="text-sm text-slate-600 mt-2">{review.review_text}</p>
                    <p className="text-xs text-slate-500 mt-3">
                      Course: {review.course_code || "N/A"} {review.course_name ? `· ${review.course_name}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {review.difficulty && (
                        <span className="text-[11px] font-semibold text-slate-600 bg-white border border-[#D9ECE7] rounded-full px-2.5 py-1">
                          {review.difficulty}
                        </span>
                      )}
                      {review.would_take_again !== undefined && (
                        <span className="text-[11px] font-semibold text-slate-600 bg-white border border-[#D9ECE7] rounded-full px-2.5 py-1">
                          {review.would_take_again ? "Would take again" : "Would not take again"}
                        </span>
                      )}
                    </div>
                    {review.is_owner && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openEditReview(review)}
                          className="px-3 py-1.5 rounded-lg border border-[#CFE4DF] text-xs font-semibold text-slate-700 hover:bg-white transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => void handleDeleteReview(review.id)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Showing {start + 1}-{Math.min(start + PAGE_SIZE, sortedReviews.length)} of {sortedReviews.length}
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
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-[#CFE4DF] shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">{editingReviewId ? "Edit Your Review" : "Submit a Review"}</h2>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setEditingReviewId(null);
                  }}
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
                disabled={editingReviewId !== null || professorNotListed}
                className="w-full rounded-xl border border-[#CFE4DF] bg-[#EEF6F4] px-4 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
              >
                <option value="">Select professor</option>
                {professorOptions.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">Showing first 40 professors.</p>
              {!editingReviewId && (
                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={professorNotListed}
                      onChange={(e) => {
                        setProfessorNotListed(e.target.checked);
                        if (e.target.checked) {
                          setNewReview((prev) => ({ ...prev, professorId: "" }));
                        }
                      }}
                      className="h-4 w-4 rounded border-[#CFE4DF] text-[#00937C] focus:ring-[#00937C]"
                    />
                    Professor not listed
                  </label>
                  {professorNotListed && (
                    <div className="mt-2 grid grid-cols-1 gap-2 rounded-xl border border-[#CFE4DF] bg-[#F7FBFA] p-3">
                    <input
                      type="text"
                      placeholder="Professor full name"
                      value={newProfessor.name}
                      onChange={(e) => setNewProfessor((p) => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-lg border border-[#CFE4DF] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
                    />
                    <input
                      type="text"
                      placeholder="Department"
                      value={newProfessor.department}
                      onChange={(e) => setNewProfessor((p) => ({ ...p, department: e.target.value }))}
                      className="w-full rounded-lg border border-[#CFE4DF] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={newProfessor.email}
                      onChange={(e) => setNewProfessor((p) => ({ ...p, email: e.target.value }))}
                      className="w-full rounded-lg border border-[#CFE4DF] bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#00937C]"
                    />
                    <div className="flex items-center justify-between">
                      <div />
                      <p className="text-xs text-slate-500">Will be added automatically on submit.</p>
                    </div>
                  </div>
                  )}
                </div>
              )}
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
                    {submitLoading ? "Saving..." : editingReviewId ? "Save Changes" : "Submit Review"}
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
  function timeAgo(value?: string): string {
    if (!value) return "just now";
    const d = new Date(value);
    const diffSec = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  }
