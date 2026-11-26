"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = new URLSearchParams(window.location.search).get("token") || "";
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token reset tidak ditemukan di URL. Minta ulang link reset password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah password.");

      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-hairline-grid mask-radial pointer-events-none" />

      <div className="w-full max-w-md surface-card p-8 rounded-xl relative z-10">
        <div className="text-center mb-7">
          <div className="flex justify-center mb-5">
            <BrandLogo href="/" size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Buat Password Baru</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Masukkan password baru yang aman untuk akun Anda
          </p>
        </div>

        {done ? (
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <p className="font-semibold">Password berhasil diperbarui!</p>
            </div>
            <Link
              href="/login"
              className="w-full py-3 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Password Baru (Min. 6 Karakter)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Ulangi Password Baru
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Simpan Password Baru</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
