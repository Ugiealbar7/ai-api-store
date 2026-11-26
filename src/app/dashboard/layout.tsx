"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Key,
  Wallet,
  BookOpen,
  Activity,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Settings,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

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
    { label: "Pengaturan Akun", href: "/dashboard/settings", icon: Settings },
    ...(user?.role === "ADMIN"
      ? [{ label: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck }]
      : []),
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col md:flex-row text-zinc-100">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-[#0c0c0f] p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="px-2 py-2.5 mb-5">
            <BrandLogo href="/" size="md" />
          </div>

          {/* Balance Card */}
          <div className="bg-[#111114] border border-zinc-800 rounded-xl p-3.5 mb-5">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">
              Saldo Tersedia
            </span>
            <div className="text-xl font-bold text-emerald-400 font-mono tracking-tight tabular-nums">
              Rp {user?.balance?.toLocaleString("id-ID") ?? "..."}
            </div>
            <Link
              href="/dashboard/topup"
              className="mt-2.5 block text-center text-xs font-semibold py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition"
            >
              + Top Up QRIS
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-zinc-900 text-zinc-50 border border-zinc-800 font-semibold"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3 w-3 text-emerald-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="pt-4 border-t border-zinc-800/80 mt-6">
          <div className="flex items-center justify-between px-2">
            <div className="overflow-hidden mr-2">
              <span className="block text-xs font-semibold text-zinc-100 truncate">{user?.name}</span>
              <span className="block text-[11px] text-zinc-500 font-mono truncate">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition"
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
