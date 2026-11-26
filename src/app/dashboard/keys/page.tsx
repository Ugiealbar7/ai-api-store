"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Shield,
  Loader2,
  Power,
  Eye,
  EyeOff,
  SlidersHorizontal,
} from "lucide-react";

export default function KeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyLimit, setNewKeyLimit] = useState("");
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const fetchKeys = () => {
    fetch("/api/keys")
      .then((res) => res.json())
      .then((d) => {
        if (d.keys) setKeys(d.keys);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          spendingLimit: newKeyLimit ? Number(newKeyLimit) : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.key) {
        setJustCreatedKey(data.key.key);
        setNewKeyName("");
        setNewKeyLimit("");
        fetchKeys();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchKeys();
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleEditLimit = async (k: any) => {
    const current = k.spendingLimit ? String(k.spendingLimit) : "";
    const input = prompt(
      `Atur batas maksimal pengeluaran (Rp) untuk key "${k.name}". Kosongkan atau isi 0 untuk tanpa batas:`,
      current
    );
    if (input === null) return;
    const num = Number(input.trim());
    const nextLimit = !input.trim() || isNaN(num) || num <= 0 ? null : Math.round(num);

    const res = await fetch(`/api/keys/${k.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spendingLimit: nextLimit }),
    });
    if (res.ok) fetchKeys();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus API key ini? Key ini tidak dapat digunakan lagi.")) return;

    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    fetchKeys();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Kelola API Key</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Buat beberapa API key dan atur batas pengeluaran opsional per proyek (Cursor, OpenClaw, Hermes, atau Bot).
        </p>
      </div>

      {/* CREATE NEW KEY CARD */}
      <div className="surface-card rounded-xl p-6">
        <h2 className="text-base font-semibold text-zinc-100 mb-3">Buat API Key Baru</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <input
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Nama Key (mis. Cursor IDE / OpenClaw)"
            className="sm:col-span-6 px-4 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-zinc-600"
          />
          <input
            type="number"
            min="0"
            step="5000"
            value={newKeyLimit}
            onChange={(e) => setNewKeyLimit(e.target.value)}
            placeholder="Batas Limit Rp (Opsional)"
            className="sm:col-span-3 px-4 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 text-sm font-mono focus:outline-none focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={creating}
            className="sm:col-span-3 px-5 py-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>Buat Key Baru</span>
          </button>
        </form>

        {justCreatedKey && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
            <div className="flex items-center gap-2 text-xs font-semibold mb-1">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Kunci Berhasil Dibuat — Simpan kunci ini:</span>
            </div>
            <div className="flex items-center justify-between bg-[#0c0c0f] p-2.5 rounded-lg border border-emerald-500/30 mt-2">
              <code className="text-xs font-mono text-emerald-400 break-all">{justCreatedKey}</code>
              <button
                onClick={() => handleCopy(justCreatedKey)}
                className="ml-3 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-md transition shrink-0"
              >
                {copiedKey === justCreatedKey ? "Tersalin!" : "Salin"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KEY TABLE */}
      <div className="surface-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-100">Daftar API Key ({keys.length})</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-zinc-500 text-sm">Memuat data kunci...</div>
        ) : keys.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm">Belum ada API key yang dibuat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#141418] text-zinc-400 uppercase tracking-wider text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="p-4">Nama Key</th>
                  <th className="p-4">Secret Key</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Terpakai / Limit</th>
                  <th className="p-4">Terakhir Dipakai</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {keys.map((k) => {
                  const isRevealed = revealedKeys[k.id];
                  return (
                    <tr key={k.id} className="hover:bg-[#15151a] transition">
                      <td className="p-4 font-semibold text-zinc-100">{k.name}</td>
                      <td className="p-4 font-mono text-zinc-400">
                        <div className="flex items-center gap-2">
                          <span>
                            {isRevealed
                              ? k.key
                              : `${k.key.slice(0, 10)}••••••••••••••••${k.key.slice(-4)}`}
                          </span>
                          <button
                            onClick={() => toggleReveal(k.id)}
                            className="text-zinc-500 hover:text-zinc-200 transition"
                            title={isRevealed ? "Sembunyikan" : "Tampilkan"}
                          >
                            {isRevealed ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(k.id, k.isActive)}
                          disabled={togglingId === k.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                            k.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                          }`}
                        >
                          <Power className="h-3 w-3" />
                          <span>{k.isActive ? "Aktif" : "Nonaktif"}</span>
                        </button>
                      </td>
                      <td className="p-4 font-mono tabular-nums">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400">
                            Rp {k.totalSpent?.toLocaleString("id-ID") || 0}
                          </span>
                          <span className="text-zinc-500">
                            / {k.spendingLimit ? `Rp ${k.spendingLimit.toLocaleString("id-ID")}` : "∞"}
                          </span>
                          <button
                            onClick={() => handleEditLimit(k)}
                            title="Atur Batas Limit"
                            className="text-zinc-400 hover:text-zinc-100 transition"
                          >
                            <SlidersHorizontal className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-500">
                        {k.lastUsedAt
                          ? new Date(k.lastUsedAt).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Belum pernah"}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopy(k.key)}
                            title="Salin Key"
                            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition"
                          >
                            {copiedKey === k.key ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(k.id)}
                            title="Hapus Key"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
