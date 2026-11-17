"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Copy, Check, Trash2, Shield, AlertCircle, Loader2 } from "lucide-react";

export default function KeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await res.json();
      if (res.ok && data.key) {
        setJustCreatedKey(data.key.key);
        setNewKeyName("");
        fetchKeys();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus API key ini?")) return;

    await fetch(`/api/keys/${id}`, { method: "DELETE" });
    fetchKeys();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola API Key</h1>
          <p className="text-sm text-slate-400 mt-1">
            Gunakan API key ini di aplikasi, bot, atau Cursor IDE Anda.
          </p>
        </div>
      </div>

      {/* CREATE NEW KEY CARD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-2">Buat API Key Baru</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Contoh: Cursor IDE / Bot WhatsApp / Web App"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shrink-0"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>Buat Key Baru</span>
          </button>
        </form>

        {justCreatedKey && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <div className="flex items-center gap-2 text-xs font-semibold mb-1">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Kunci Berhasil Dibuat! Simpan kunci ini sekarang:</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-emerald-500/30 mt-2">
              <code className="text-xs font-mono text-emerald-400 break-all">{justCreatedKey}</code>
              <button
                onClick={() => handleCopy(justCreatedKey)}
                className="ml-3 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-md transition shrink-0"
              >
                {copiedKey === justCreatedKey ? "Tersalin!" : "Salin"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* KEY TABLE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Daftar API Key ({keys.length})</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Memuat data kunci...</div>
        ) : keys.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">Belum ada API key yang dibuat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Nama Key</th>
                  <th className="p-4">Secret Key</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Total Pemakaian</th>
                  <th className="p-4">Dibuat Pada</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-semibold text-white">{k.name}</td>
                    <td className="p-4 font-mono text-slate-400">
                      {k.key.slice(0, 10)}••••••••••••••••{k.key.slice(-4)}
                    </td>
                    <td className="p-4">
                      {k.isActive ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono">Rp {k.totalSpent?.toLocaleString("id-ID") || 0}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(k.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopy(k.key)}
                          title="Salin Key"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
