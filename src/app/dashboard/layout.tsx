"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sparkles,
  LayoutDashboard,
  Key,
  Wallet,
  BookOpen,
  Activity,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) window.location.href = "/login";
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const navItems = [
    { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
    { label: "Kelola API Key", href: "/dashboard/keys", icon: Key },
    { label: "Top Up Saldo", href: "/dashboard/topup", icon: Wallet },
    { label: "Dokumentasi", href: "/dashboard/docs", icon: BookOpen },
    { label: "Riwayat Penggunaan", href: "/dashboard/usage", icon: Activity },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col md:flex-row text-slate-100">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 border-r border-slate-800/80 bg-slate-950/60 p-4 flex flex-col justify-between shrink-0">
        <div>
          <Link href="/" className="flex items-center gap-2 px-2 py-3 mb-6">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              Nusantara AI
            </span>
          </Link>

          {/* User Balance Snippet */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 mb-6">
            <span className="text-xs text-slate-400 block mb-1">Saldo Tersedia:</span>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              Rp {user?.balance?.toLocaleString("id-ID") ?? "..."}
            </div>
            <Link
              href="/dashboard/topup"
              className="mt-2.5 block text-center text-xs font-medium py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition"
            >
              + Top Up Saldo QRIS
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="pt-4 border-t border-slate-800/80 mt-6">
          <div className="flex items-center justify-between px-2">
            <div className="overflow-hidden mr-2">
              <span className="block text-xs font-semibold text-white truncate">{user?.name}</span>
              <span className="block text-[11px] text-slate-500 truncate">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
