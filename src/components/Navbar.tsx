"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Key, Wallet, LogOut, ArrowRight, Menu, X } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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

  const navLinks = [
    { label: "Model AI", href: "/#models" },
    { label: "Harga & Paket", href: "/harga" },
    { label: "Dokumentasi", href: "/docs" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <BrandLogo href="/" size="md" />

            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Gateway v1 Online</span>
            </div>
          </div>

          <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition ${
                    active ? "text-zinc-50 font-semibold" : "hover:text-zinc-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard/topup"
                  className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition tabular-nums"
                  title="Isi Saldo QRIS"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Rp {user.balance?.toLocaleString("id-ID") || 0}</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Keluar"
                  className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="text-xs font-medium text-zinc-300 hover:text-zinc-50 px-3 py-2 transition"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-50 hover:bg-zinc-200 text-zinc-950 px-3.5 py-2 rounded-lg transition"
                >
                  <span>Mulai Gratis</span>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-700" />
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu navigasi"
              className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-50 rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800 space-y-1.5 text-xs">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-zinc-300 hover:bg-zinc-900 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/dashboard/topup"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-emerald-400 font-mono hover:bg-zinc-900 rounded-lg"
              >
                Saldo: Rp {user.balance?.toLocaleString("id-ID") || 0} • Top Up
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
