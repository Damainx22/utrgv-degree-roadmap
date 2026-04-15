"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { login } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit =
    formData.email.trim().length > 0 &&
    formData.password.trim().length > 0 &&
    !loading;

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error && err.message) return err.message;
    return "Invalid email or password.";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
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
      <div className="w-full max-w-[1180px] flex-col overflow-hidden rounded-[40px] bg-white shadow-[0_24px_70px_rgba(21,62,56,0.22)] md:flex md:min-h-[680px] md:flex-row md:rounded-[48px]">
        <div className="w-full bg-gradient-to-b from-[#D7EAE6] to-[#C8E0DC] p-6 sm:p-8 md:w-[44%] md:p-10">
          <div className="mx-auto flex h-full w-full max-w-[360px] items-center">
            <div className="w-full rounded-[36px] bg-white p-8 shadow-[0_12px_35px_rgba(0,0,0,0.08)] sm:p-10">
              <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-[#00937C]">DegreePath</h1>
                <p className="mt-2 text-xs font-medium italic text-gray-500">Sign in to continue</p>
              </header>

              <form onSubmit={handleLogin} className="space-y-5" noValidate>
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
                    htmlFor="email"
                    className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    inputMode="email"
                    disabled={loading}
                    aria-invalid={Boolean(error)}
                    className="w-full rounded-2xl border border-transparent bg-[#F3F7F6] px-5 py-3 text-sm text-[#111827] placeholder:text-gray-400 caret-[#00937C] transition-all outline-none focus:border-[#00937C]/30 focus:ring-4 focus:ring-[#00937C]/10 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      disabled={loading}
                      aria-invalid={Boolean(error)}
                      className="w-full rounded-2xl border border-transparent bg-[#F3F7F6] px-5 py-3 pr-11 text-sm text-[#111827] placeholder:text-gray-400 caret-[#00937C] transition-all outline-none focus:border-[#00937C]/30 focus:ring-4 focus:ring-[#00937C]/10 disabled:cursor-not-allowed disabled:opacity-70"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00937C] py-3.5 font-bold text-white shadow-lg transition-all hover:bg-[#007A67] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#7DB6AD] disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Signing in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </button>
              </form>

              <footer className="mt-8 text-center text-xs">
                <p className="text-gray-500">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="font-bold text-[#00937C] hover:underline">
                    Sign up
                  </Link>
                </p>
              </footer>
            </div>
          </div>
        </div>

        <div className="relative hidden flex-1 overflow-hidden bg-[#F3F7F6] p-12 md:flex md:items-end md:justify-center">
          <Image
            src="/cat.webp"
            alt=""
            fill
            aria-hidden="true"
            className="object-cover object-center blur-sm scale-110 opacity-45"
            sizes="(min-width: 768px) 56vw, 0vw"
          />
          <Image
            src="/cat.webp"
            alt="Graduation Cat"
            fill
            className="object-contain object-center"
            sizes="(min-width: 768px) 56vw, 0vw"
            priority
          />
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

          <div className="relative z-20 text-center">
            <h2 className="text-3xl font-extrabold text-white [text-shadow:0_4px_12px_rgba(0,0,0,0.45)]">
              Simplify Your Journey.
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-sm font-medium text-white/95 [text-shadow:0_2px_8px_rgba(0,0,0,0.45)]">
              DegreePath gives students the perfect, automated course map to graduate on time, every time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
