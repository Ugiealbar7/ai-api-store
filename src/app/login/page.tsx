"use client";

import { useState } from "react";
import Link from "next/link";
import { Cpu, ArrowRight, Loader2, KeyRound } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk.");
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern mask-radial opacity-50 pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition">
              <Cpu className="h-4 w-4" />
            </div>
            <span className="font-bold text-base text-white">Nusantara AI</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Selamat Datang Kembali</h2>
          <p className="text-xs text-slate-400 mt-1">Masuk untuk mengelola API key dan saldo Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Akun</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#030611] border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#030611] border border-white/[0.08] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk ke Dashboard"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Daftar sekarang (Bonus Rp 10.000)
          </Link>
        </p>
      </div>
    </div>
  );
}
