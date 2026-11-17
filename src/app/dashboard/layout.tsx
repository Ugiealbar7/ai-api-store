"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Cpu,
  LayoutDashboard,
  Key,
  Wallet,
  BookOpen,
  Activity,
  LogOut,
  ShieldCheck,
  ChevronRight,
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
    ...(user?.role === "ADMIN"
      ? [{ label: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck }]
      : []),
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#040711] flex flex-col md:flex-row text-slate-100">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 border-r border-white/[0.08] bg-[#060a16] p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-3 mb-6 group">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">Nusantara AI</span>
              <span className="text-[10px] font-mono uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1 py-0.2 rounded">
                v1
              </span>
            </div>
          </Link>

          {/* User Balance Snippet */}
          <div className="bg-[#030611] border border-white/[0.08] rounded-xl p-3.5 mb-6 shadow-sm">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Saldo Tersedia</span>
            <div className="text-xl font-bold text-emerald-400 font-mono tracking-tight">
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
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3 w-3 text-indigo-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="pt-4 border-t border-white/[0.08] mt-6">
          <div className="flex items-center justify-between px-2">
            <div className="overflow-hidden mr-2">
              <span className="block text-xs font-semibold text-white truncate">{user?.name}</span>
              <span className="block text-[11px] text-slate-400 font-mono truncate">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
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
