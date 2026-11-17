"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, Key, Wallet, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

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
    <nav className="border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Nusantara AI
            </span>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium ml-1">
              Gateway
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/topup"
                  className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Rp {user.balance?.toLocaleString("id-ID") || 0}</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
                >
                  <Key className="h-4 w-4 text-indigo-400" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800/50 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-indigo-500/20 transition"
                >
                  Daftar (Bonus Rp 10rb)
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
