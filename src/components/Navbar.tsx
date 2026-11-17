"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, Key, Wallet, LogOut, ArrowRight, Menu, X, Cpu } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#040711]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Operational Status */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
                <Cpu className="h-4 w-4" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-200 transition">
                  Nusantara AI
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                  Gateway
                </span>
              </div>
            </Link>

            {/* Live Status Badge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Normal</span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <Link href="/#models" className="hover:text-white transition">
              Katalog Model
            </Link>
            <Link href="/#pricing" className="hover:text-white transition">
              Kalkulator Tarif
            </Link>
            <Link href="/#comparison" className="hover:text-white transition">
              Keunggulan
            </Link>
            <Link href="/dashboard/docs" className="hover:text-white transition">
              Dokumentasi
            </Link>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/topup"
                  className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-mono font-medium hover:bg-emerald-500/20 transition"
                  title="Isi Saldo QRIS"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Rp {user.balance?.toLocaleString("id-ID") || 0}</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-sm shadow-indigo-600/30 transition"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-950 px-3.5 py-1.5 rounded-lg shadow-sm font-semibold transition hover:scale-[1.02]"
                >
                  <span>Daftar Gratis</span>
                  <ArrowRight className="h-3 w-3 text-slate-600" />
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/[0.08] space-y-2 text-xs">
            <Link
              href="/#models"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg"
            >
              Katalog Model
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg"
            >
              Kalkulator Tarif
            </Link>
            <Link
              href="/#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg"
            >
              Keunggulan
            </Link>
            <Link
              href="/dashboard/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg"
            >
              Dokumentasi
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
