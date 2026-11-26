"use client";

import { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  Copy,
  Check,
  Webhook,
  Megaphone,
} from "lucide-react";
import { BRAND, calculateTopupBonus } from "@/lib/brand";

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

interface AutomationStatus {
  qrisWebhookConfigured: boolean;
  midtransConfigured: boolean;
  telegramConfigured: boolean;
}

export default function AdminPage() {
  const [data, setData] = useState<{
    stats: { totalUsers: number; totalRevenue: number; pendingCount: number };
    automation?: AutomationStatus;
    transactions: AdminTx[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeSection, setActiveSection] = useState<"transactions" | "automation" | "promo">(
    "transactions"
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const originUrl = typeof window !== "undefined" ? window.location.origin : BRAND.siteUrl;

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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

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
    const input = prompt(`Masukkan jumlah saldo bonus (Rp) untuk ${userEmail}:`, "50000");
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

  const promoTemplates = [
    {
      id: "twitter",
      title: "Postingan X / Twitter / Threads",
      content: `Mau pakai API Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5, & DeepSeek V4.1 tapi terhalang kartu kredit USD?

Saya baru rilis ${BRAND.fullName}:
- 1 API key untuk 330+ model AI terbaru (standar OpenAI SDK)
- Langsung jalan di Cursor IDE, VS Code Cline, n8n, Python
- Top up via QRIS mulai Rp 10.000 (BCA, Mandiri, GoPay, DANA, OVO)
- Saldo aktif selamanya, gratis saldo uji coba saat daftar!

Coba langsung: ${originUrl}`,
    },
    {
      id: "community",
      title: "Grup Telegram / Discord / Facebook Programmer Indonesia",
      content: `[SHARE TOOL] Buat teman-teman dev yang butuh API AI untuk Cursor IDE, VS Code Cline, bot WA/Telegram, atau workflow n8n tanpa kartu kredit:

Coba ${BRAND.fullName} (${originUrl})
✓ 330+ model AI terbaru sudah live (Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5, DeepSeek V4.1, Qwen4 Max)
✓ Bayar pakai QRIS Rupiah mulai Rp 10.000 (bonus saldo s.d. +5%)
✓ Drop-in replacement OpenAI SDK — tinggal ganti Base URL & API Key

Panduan Cursor IDE: ${originUrl}/cursor-ide`,
    },
    {
      id: "tiktok",
      title: "Script Video Pendek TikTok / Reels (30 Detik)",
      content: `HOOK (0-3 detik): "Cara pakai Claude Opus 5.5, GPT-6.2 Astra, dan Gemini 4 Hydrogen di Cursor IDE bayar pakai QRIS cuma 10 ribuan!"
ISI (3-20 detik): "Biasanya beli API OpenAI atau Anthropic harus pakai kartu kredit dolar dan minimal top up ratusan ribu. Di ${BRAND.fullName}, cukup daftar dalam 30 detik, dapat 1 API key yang langsung nyambung ke 330+ model AI terbaru. Scan QRIS dari GoPay, DANA, atau m-Banking apa aja, saldo nggak pernah hangus."
CTA (20-30 detik): "Cek link di bio / kunjungi ${originUrl.replace(/^https?:\/\//, "")}!"`,
    },
  ];

  const macroDroidJson = `{
  "title": "{not_title}",
  "text": "{notification}"
}`;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
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
            <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Admin Management Panel</h1>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-mono font-semibold">
              Owner
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Kelola transaksi QRIS, pantau status otomatisasi webhook, dan ambil materi promosi siap pakai.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#111114] border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* SECTION NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
        <button
          onClick={() => setActiveSection("transactions")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeSection === "transactions"
              ? "bg-zinc-50 text-zinc-950"
              : "bg-[#111114] text-zinc-400 hover:text-zinc-100 border border-zinc-800"
          }`}
        >
          Transaksi ({data?.stats.pendingCount || 0} Pending)
        </button>
        <button
          onClick={() => setActiveSection("automation")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeSection === "automation"
              ? "bg-zinc-50 text-zinc-950"
              : "bg-[#111114] text-zinc-400 hover:text-zinc-100 border border-zinc-800"
          }`}
        >
          <Webhook className="h-3.5 w-3.5" />
          <span>Otomatisasi Pembayaran</span>
        </button>
        <button
          onClick={() => setActiveSection("promo")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            activeSection === "promo"
              ? "bg-zinc-50 text-zinc-950"
              : "bg-[#111114] text-zinc-400 hover:text-zinc-100 border border-zinc-800"
          }`}
        >
          <Megaphone className="h-3.5 w-3.5" />
          <span>Kit Promosi Publik</span>
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card rounded-xl p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Total Pengguna</span>
            <span className="text-2xl font-bold text-zinc-50 font-mono tabular-nums">
              {data?.stats.totalUsers ?? 0}
            </span>
          </div>
        </div>

        <div className="surface-card rounded-xl p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Pendapatan Terverifikasi</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
              Rp {data?.stats.totalRevenue.toLocaleString("id-ID") ?? 0}
            </span>
          </div>
        </div>

        <div className="surface-card rounded-xl p-5 flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block">Perlu Verifikasi</span>
            <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
              {data?.stats.pendingCount ?? 0}
            </span>
          </div>
        </div>
      </div>

      {activeSection === "transactions" && (
        <>
          {(data?.stats.pendingCount ?? 0) > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <p className="text-xs sm:text-sm font-medium">
                  Ada <strong className="text-zinc-50 underline">{data?.stats.pendingCount} transaksi</strong> menunggu verifikasi. (Aktifkan QRIS Webhook di tab Otomatisasi agar langsung lunas tanpa approve manual.)
                </p>
              </div>
              <button
                onClick={() => setStatusFilter("PENDING")}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shrink-0"
              >
                Lihat Pending
              </button>
            </div>
          )}

          <div className="surface-card rounded-xl p-6">
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
                        ? "bg-zinc-50 text-zinc-950 font-semibold"
                        : "bg-[#0c0c0f] text-zinc-400 hover:text-zinc-100 border border-zinc-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari email / order ID..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            {filteredTxs.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">Tidak ada transaksi yang cocok.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                      <th className="pb-3">Order ID & Waktu</th>
                      <th className="pb-3">Pengguna</th>
                      <th className="pb-3">Mutasi / Saldo Masuk</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 text-zinc-300">
                    {filteredTxs.map((tx) => {
                      const { bonusAmount, bonusPercent } = calculateTopupBonus(tx.amount);
                      return (
                        <tr key={tx.id} className="hover:bg-[#15151a]">
                          <td className="py-3.5">
                            <div className="font-mono font-medium text-zinc-100">{tx.orderId}</div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              {new Date(tx.createdAt).toLocaleString("id-ID")}
                            </div>
                          </td>
                          <td className="py-3.5">
                            <div className="font-medium text-zinc-200">{tx.user?.name}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{tx.user?.email}</div>
                            <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1.5">
                              <span>Saldo: Rp {tx.user?.balance.toLocaleString("id-ID")}</span>
                              <button
                                onClick={() => handleManualBalance(tx.user.id, tx.user.email)}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 underline"
                              >
                                + Bonus
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                              Rp {tx.amount.toLocaleString("id-ID")}
                            </div>
                            {bonusAmount > 0 ? (
                              <div className="text-[10px] font-mono text-zinc-400">
                                +{bonusPercent}% bonus = Rp {(tx.amount + bonusAmount).toLocaleString("id-ID")}
                              </div>
                            ) : (
                              <div className="text-[10px] text-zinc-500">{tx.paymentType || "QRIS"}</div>
                            )}
                          </td>
                          <td className="py-3.5">
                            {tx.status === "PAID" && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                                ✓ Disetujui
                              </span>
                            )}
                            {tx.status === "WAITING_CONFIRMATION" && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium text-[11px]">
                                User Sudah Bayar
                              </span>
                            )}
                            {tx.status === "PENDING" && (
                              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium text-[11px]">
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
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                                >
                                  {actionLoading === tx.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      <span>Approve</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleReject(tx.id)}
                                  disabled={actionLoading === tx.id}
                                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 border border-zinc-800 text-zinc-400 hover:text-red-400 text-xs transition"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-500 font-mono">Selesai</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeSection === "automation" && (
        <div className="space-y-6">
          {/* Status Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="surface-card rounded-xl p-4">
              <div className="text-xs text-zinc-400 mb-1">QRIS Auto-Webhook (MacroDroid)</div>
              <div
                className={`text-sm font-mono font-bold ${
                  data?.automation?.qrisWebhookConfigured ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {data?.automation?.qrisWebhookConfigured
                  ? "✓ AKTIF (QRIS_WEBHOOK_SECRET terpasang)"
                  : "Perlu Set QRIS_WEBHOOK_SECRET di Vercel"}
              </div>
            </div>

            <div className="surface-card rounded-xl p-4">
              <div className="text-xs text-zinc-400 mb-1">Midtrans QRIS Dinamis (Opsional)</div>
              <div
                className={`text-sm font-mono font-bold ${
                  data?.automation?.midtransConfigured ? "text-emerald-400" : "text-zinc-400"
                }`}
              >
                {data?.automation?.midtransConfigured ? "✓ AKTIF" : "Belum Dikonfigurasi"}
              </div>
            </div>

            <div className="surface-card rounded-xl p-4">
              <div className="text-xs text-zinc-400 mb-1">Notifikasi Telegram Admin</div>
              <div
                className={`text-sm font-mono font-bold ${
                  data?.automation?.telegramConfigured ? "text-emerald-400" : "text-zinc-400"
                }`}
              >
                {data?.automation?.telegramConfigured ? "✓ AKTIF" : "Opsional (Belum Diset)"}
              </div>
            </div>
          </div>

          {/* MacroDroid Setup Guide */}
          <div className="surface-card rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold text-zinc-50">
              Cara Aktifkan Otomatisasi Saldo QRIS via Android (0% Biaya Tambahan)
            </h2>
            <ol className="space-y-3 text-xs sm:text-sm text-zinc-300 list-decimal list-inside">
              <li>
                Tambahkan Environment Variable <code className="text-emerald-400">QRIS_WEBHOOK_SECRET</code> di Vercel (misal password rahasia acak sepanjang 32 karakter) lalu <b>Redeploy</b>.
              </li>
              <li>
                Install aplikasi <b>MacroDroid</b> di HP Android yang menerima notifikasi merchant QRIS <b>{BRAND.merchantName}</b>.
              </li>
              <li>
                Buat Macro baru → <b>Trigger:</b> <i>Notification Received</i> → pilih <b>hanya aplikasi merchant QRIS Anda</b> (misal GoPay Merchant / DANA Bisnis / Livin' Merchant / OrderKuota).
              </li>
              <li>
                Tambahkan <b>Action:</b> <i>HTTP Request (POST)</i> dengan konfigurasi berikut:
              </li>
            </ol>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-[#0c0c0f] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400">ENDPOINT URL (POST)</span>
                  <button
                    onClick={() => handleCopy(`${originUrl}/api/webhooks/qris`, "url")}
                    className="text-[11px] font-mono text-emerald-400 flex items-center gap-1"
                  >
                    {copiedId === "url" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedId === "url" ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
                <code className="block text-xs font-mono text-emerald-400 break-all">
                  {originUrl}/api/webhooks/qris
                </code>
                <div className="text-[11px] font-mono text-zinc-400 pt-2">
                  Header: <code className="text-zinc-200">x-qris-secret: &lt;QRIS_WEBHOOK_SECRET Anda&gt;</code>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0c0c0f] border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400">CONTENT BODY (application/json)</span>
                  <button
                    onClick={() => handleCopy(macroDroidJson, "json")}
                    className="text-[11px] font-mono text-emerald-400 flex items-center gap-1"
                  >
                    {copiedId === "json" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedId === "json" ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-zinc-200 overflow-x-auto">{macroDroidJson}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "promo" && (
        <div className="space-y-5">
          <div className="surface-card rounded-xl p-5 text-xs sm:text-sm text-zinc-300 space-y-2">
            <h2 className="font-bold text-zinc-50">Langkah Cepat Promosi Publik & Google</h2>
            <p className="text-zinc-400">
              1. Daftarkan sitemap <code className="text-emerald-400">{originUrl}/sitemap.xml</code> ke{" "}
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 underline"
              >
                Google Search Console
              </a>{" "}
              agar seluruh halaman (`/`, `/harga`, `/docs`, `/cursor-ide`) cepat terindeks Google.
            </p>
            <p className="text-zinc-400">
              2. Bagikan naskah siap pakai di bawah ke grup developer, X/Twitter, TikTok, dan komunitas AI Indonesia.
            </p>
          </div>

          {promoTemplates.map((tpl) => (
            <div key={tpl.id} className="surface-card rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 bg-[#141418] border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-100">{tpl.title}</h3>
                <button
                  onClick={() => handleCopy(tpl.content, tpl.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition"
                >
                  {copiedId === tpl.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedId === tpl.id ? "Tersalin!" : "Salin Naskah"}</span>
                </button>
              </div>
              <pre className="p-5 text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed bg-[#0c0c0f]">
                {tpl.content}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
