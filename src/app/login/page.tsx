"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { BRAND, STARTER_TRIAL_BALANCE_IDR } from "@/lib/brand";

function getSafeRedirectUrl(): string {
  if (typeof window === "undefined") return "/dashboard";
  const param = new URLSearchParams(window.location.search).get("redirect");
  if (param && param.startsWith("/") && !param.startsWith("//")) {
    return param;
  }
  return "/dashboard";
}

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
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <BrandLogo href="/" size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Masuk ke Akun Anda</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola API key, pantau pemakaian token, dan isi saldo QRIS
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Akun</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
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
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 transition"
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
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Daftar (Bonus Uji Rp {STARTER_TRIAL_BALANCE_IDR.toLocaleString("id-ID")})
          </Link>
        </p>
        <p className="text-center text-[11px] text-zinc-500 mt-2">
          Lupa password?{" "}
          <a
            href={`https://wa.me/${BRAND.adminWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
              `Halo Admin ${BRAND.fullName}, saya lupa password akun saya.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-200 underline"
          >
            Hubungi Admin WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
