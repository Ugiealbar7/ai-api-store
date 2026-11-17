"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-white">Nusantara AI</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Selamat Datang Kembali</h2>
          <p className="text-sm text-slate-400 mt-1">Masuk untuk mengelola API key dan saldo Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md shadow-indigo-500/20"
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
