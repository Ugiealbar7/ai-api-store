"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function DashboardSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setUser(d.user);
          setName(d.user.name || "");
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui akun.");

      setMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");
      if (data.user) setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Pengaturan Akun</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Perbarui nama tampilan dan ubah password akun Anda.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="surface-card rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Terdaftar</label>
          <input
            type="email"
            disabled
            value={user?.email || ""}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#09090b] border border-zinc-800 text-zinc-500 text-xs font-mono cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">Nama Lengkap / Tim</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">Ganti Password (Opsional)</h2>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Password Saat Ini
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Kosongkan jika tidak ingin mengganti password"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Password Baru (Min. 6 Karakter)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span>Simpan Perubahan</span>
        </button>
      </form>
    </div>
  );
}
