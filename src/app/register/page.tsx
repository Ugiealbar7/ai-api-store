"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Gift, ArrowRight, Users } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { STARTER_TRIAL_BALANCE_IDR } from "@/lib/brand";

function getSafeRedirectUrl(): string {
  if (typeof window === "undefined") return "/dashboard";
  const param = new URLSearchParams(window.location.search).get("redirect");
  if (param && param.startsWith("/") && !param.startsWith("//")) {
    return param;
  }
  return "/dashboard";
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [hasUrlRef, setHasUrlRef] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const refParam = new URLSearchParams(window.location.search).get("ref");
      if (refParam) {
        setReferralCode(refParam.trim().toUpperCase());
        setHasUrlRef(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, referralCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftar.");
      }

      window.location.href = getSafeRedirectUrl();
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
        <div className="text-center mb-6">
          <div className="flex justify-center mb-5">
            <BrandLogo href="/" size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Buat Akun Developer</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Dapatkan API key standar OpenAI siap pakai dalam hitungan detik
          </p>
        </div>

        <div className="mb-4 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5">
          <Gift className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-200 leading-relaxed">
            <strong>Saldo Uji Coba:</strong> Gratis Rp{" "}
            {STARTER_TRIAL_BALANCE_IDR.toLocaleString("id-ID")} untuk mengetes API di akun baru Anda.
          </p>
        </div>

        {hasUrlRef && referralCode && (
          <div className="mb-5 p-3 rounded-lg bg-[#141418] border border-zinc-700 flex items-center gap-2.5">
            <Users className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-zinc-200">
              Undangan aktif (<span className="font-mono text-emerald-400">{referralCode}</span>):
              Dapatkan <strong>ekstra +3% saldo</strong> saat top up pertama Anda!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Nama Lengkap / Tim
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Budi Santoso"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Kode Referral (Opsional — +3% Top Up Pertama)
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Contoh: AKS-A1B2C3"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 placeholder-zinc-600 text-xs font-mono focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Daftar & Ambil API Key</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
