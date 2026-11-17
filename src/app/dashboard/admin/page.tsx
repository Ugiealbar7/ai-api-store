"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  PlusCircle,
  Filter,
} from "lucide-react";

interface AdminTx {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  paymentType: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    balance: number;
  };
}

export default function AdminPage() {
  const [data, setData] = useState<{
    stats: { totalUsers: number; totalRevenue: number; pendingCount: number };
    transactions: AdminTx[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/transactions");
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal memuat data admin.");
      setData(d);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (txId: string) => {
    if (!confirm("Setujui pembayaran ini dan tambahkan saldo ke pengguna?")) return;
    setActionLoading(txId);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/approve`, {
        method: "POST",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menyetujui transaksi.");
      alert(d.message);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (txId: string) => {
    if (!confirm("Tolak transaksi ini?")) return;
    setActionLoading(txId);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/reject`, {
        method: "POST",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menolak transaksi.");
      alert(d.message);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualBalance = async (userId: string, userEmail: string) => {
    const input = prompt(`Masukkan jumlah saldo bonus (Rp) yang ingin ditambahkan ke ${userEmail}:`, "50000");
    if (!input) return;
    const amount = Number(input);
    if (isNaN(amount) || amount <= 0) {
      alert("Jumlah saldo tidak valid.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, action: "add" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal menambahkan saldo.");
      alert(d.message);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredTxs =
    data?.transactions.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch =
        t.orderId.toLowerCase().includes(q) ||
        t.user?.email.toLowerCase().includes(q) ||
        t.user?.name.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === "PENDING") {
        return t.status === "PENDING" || t.status === "WAITING_CONFIRMATION";
      }
      if (statusFilter === "PAID") return t.status === "PAID";
      if (statusFilter === "FAILED") return t.status === "FAILED";

      return true;
    }) || [];

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
        <h2 className="text-base font-bold mb-1">Akses Ditolak</h2>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Admin Management Panel</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              Owner / Admin
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Verifikasi mutasi pembayaran QRIS DANA dan masukkan saldo ke akun pengguna secara instan.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ALERT BANNER IF PENDING TRANSACTIONS EXIST */}
      {(data?.stats.pendingCount ?? 0) > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-amber-400 animate-ping shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              Perhatian: Ada <strong className="text-white underline">{data?.stats.pendingCount} transaksi</strong> menunggu konfirmasi dan approval saldo Anda!
            </p>
          </div>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shrink-0"
          >
            Lihat Transaksi
          </button>
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Total Pengguna Terdaftar</span>
            <span className="text-2xl font-bold text-white">{data?.stats.totalUsers ?? 0} Pengguna</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Total Pendapatan Terverifikasi</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              Rp {data?.stats.totalRevenue.toLocaleString("id-ID") ?? 0}
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Menunggu Konfirmasi Admin</span>
            <span className="text-2xl font-bold text-amber-400">{data?.stats.pendingCount ?? 0} Transaksi</span>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[
              { key: "ALL", label: "Semua" },
              { key: "PENDING", label: `Perlu Verifikasi (${data?.stats.pendingCount || 0})` },
              { key: "PAID", label: "Berhasil" },
              { key: "FAILED", label: "Ditolak" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  statusFilter === tab.key
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari email / order ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {filteredTxs.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">Tidak ada transaksi yang cocok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3">Order ID & Waktu</th>
                  <th className="pb-3">Pengguna</th>
                  <th className="pb-3">Nominal Masuk</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5">
                      <div className="font-mono font-medium text-white">{tx.orderId}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-medium text-slate-200">{tx.user?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tx.user?.email}</div>
                      <div className="text-[10px] text-indigo-400 mt-0.5 flex items-center gap-1.5">
                        <span>Saldo: Rp {tx.user?.balance.toLocaleString("id-ID")}</span>
                        <button
                          onClick={() => handleManualBalance(tx.user.id, tx.user.email)}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 underline"
                          title="Beri bonus saldo manual"
                        >
                          + Bonus
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="text-sm font-bold text-emerald-400 font-mono">
                        Rp {tx.amount.toLocaleString("id-ID")}
                      </div>
                      <div className="text-[10px] text-slate-500">QRIS All-Payment</div>
                    </td>
                    <td className="py-3.5">
                      {tx.status === "PAID" && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                          ✓ Berhasil Disetujui
                        </span>
                      )}
                      {tx.status === "WAITING_CONFIRMATION" && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium text-[11px] animate-pulse">
                          🔔 User Sudah Bayar
                        </span>
                      )}
                      {tx.status === "PENDING" && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium text-[11px]">
                          Menunggu Bayar
                        </span>
                      )}
                      {tx.status === "FAILED" && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium text-[11px]">
                          Ditolak
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      {tx.status !== "PAID" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(tx.id)}
                            disabled={actionLoading === tx.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-emerald-600/20"
                          >
                            {actionLoading === tx.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Approve Saldo</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleReject(tx.id)}
                            disabled={actionLoading === tx.id}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs transition"
                            title="Tolak Transaksi"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">Selesai</span>
                      )}
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
