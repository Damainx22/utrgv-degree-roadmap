"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { register } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit =
    formData.name.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.password.trim().length > 0 &&
    !loading;

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error && err.message) return err.message;
    return "Could not create your account. Please try again.";
  };

  const handleInputChange =
    (field: "name" | "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (error) setError("");
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register(formData.email, formData.password, formData.name);
      saveToken(data.access_token);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#B5D1CC] flex items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-[1180px] overflow-hidden rounded-[40px] bg-white shadow-[0_24px_70px_rgba(21,62,56,0.22)] md:flex md:min-h-[680px] md:rounded-[48px]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#86BFB5] via-[#72AA9F] to-[#5E968B] p-12 md:flex md:w-[46%]">
          <Image
            src="/cat.webp"
            alt=""
            fill
            aria-hidden="true"
            className="object-cover object-center opacity-20"
            sizes="(min-width: 768px) 46vw, 0vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 to-black/55" />
          <div className="relative z-10 flex w-full flex-col justify-between">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                New Student Setup
              </p>
              <h2 className="max-w-sm text-4xl font-black leading-tight text-white [text-shadow:0_6px_16px_rgba(0,0,0,0.35)]">
                Build your degree plan in minutes.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/90">
              Create your account to unlock a personalized roadmap, graduation timeline, and smarter semester planning.
            </p>
          </div>
        </div>

        <div className="w-full bg-gradient-to-b from-[#EEF6F4] to-[#DDEEEA] p-6 sm:p-8 md:w-[54%] md:p-12">
          <div className="mx-auto flex h-full w-full max-w-[430px] items-center">
            <div className="w-full rounded-[36px] bg-white p-8 shadow-[0_12px_35px_rgba(0,0,0,0.08)] sm:p-10">
              <header className="mb-8 text-left">
                <h1 className="text-3xl font-bold tracking-tight text-[#00937C]">Create Account</h1>
                <p className="mt-2 text-sm text-gray-500">Join DegreePath and start planning smarter.</p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <div
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    role="alert"
                    aria-live="assertive"
                  >
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="name"
                      type="text"
                      placeholder="Jordan Smith"
                      value={formData.name}
                      onChange={handleInputChange("name")}
                      required
                      autoComplete="name"
                      disabled={loading}
                      aria-invalid={Boolean(error)}
                      className="w-full rounded-2xl border border-transparent bg-[#F3F7F6] py-3 pl-11 pr-4 text-sm text-[#111827] placeholder:text-gray-400 caret-[#00937C] transition-all outline-none focus:border-[#00937C]/30 focus:ring-4 focus:ring-[#00937C]/10 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@university.edu"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      required
                      autoComplete="email"
                      inputMode="email"
                      disabled={loading}
                      aria-invalid={Boolean(error)}
                      className="w-full rounded-2xl border border-transparent bg-[#F3F7F6] py-3 pl-11 pr-4 text-sm text-[#111827] placeholder:text-gray-400 caret-[#00937C] transition-all outline-none focus:border-[#00937C]/30 focus:ring-4 focus:ring-[#00937C]/10 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      required
                      autoComplete="new-password"
                      disabled={loading}
                      aria-invalid={Boolean(error)}
                      className="w-full rounded-2xl border border-transparent bg-[#F3F7F6] py-3 pl-11 pr-12 text-sm text-[#111827] placeholder:text-gray-400 caret-[#00937C] transition-all outline-none focus:border-[#00937C]/30 focus:ring-4 focus:ring-[#00937C]/10 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#00937C] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00937C] py-3.5 font-bold text-white shadow-lg transition-all hover:bg-[#007A67] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#7DB6AD] disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <footer className="mt-8 text-center text-xs">
                <p className="text-gray-500">
                  Already have an account?{" "}
                  <Link href="/" className="font-bold text-[#00937C] hover:underline">
                    Log in
                  </Link>
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
