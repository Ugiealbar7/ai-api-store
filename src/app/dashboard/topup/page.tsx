"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Wallet,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Copy,
  Clock,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface ActiveInvoice {
  orderId: string;
  totalAmount: number;
  baseAmount: number;
  uniqueCode: number;
  merchantName: string;
  nmid: string;
  qrImageUrl: string;
}

export default function TopUpPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<ActiveInvoice | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const presets = [10000, 20000, 50000, 100000, 250000, 500000];

  const fetchHistory = () => {
    fetch("/api/topup/charge")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.transactions) {
          setHistory(data.transactions);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCreateInvoice = async () => {
    const amount = customAmount ? Number(customAmount) : selectedAmount;
    if (!amount || amount < 10000) {
      setError("Minimal top up adalah Rp 10.000.");
      return;
    }

    setLoading(true);
    setError("");
    setConfirmed(false);

    try {
      const res = await fetch("/api/topup/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat tagihan pembayaran.");
      }

      setActiveInvoice(data);
      fetchHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!activeInvoice) return;
    setConfirmLoading(true);

    try {
      const res = await fetch("/api/topup/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: activeInvoice.orderId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengonfirmasi pembayaran.");

      setConfirmed(true);
      fetchHistory();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const copyAmount = () => {
    if (!activeInvoice) return;
    navigator.clipboard.writeText(activeInvoice.totalAmount.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppUrl = () => {
    if (!activeInvoice) return "#";
    const msg = `Halo Admin Aiugi Service, saya sudah transfer pembayaran Top Up Saldo API sebesar Rp ${activeInvoice.totalAmount.toLocaleString("id-ID")} dengan Order ID: ${activeInvoice.orderId}. Mohon segera diverifikasi. Terima kasih!`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>Top Up Saldo API</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            QRIS Nasional All-Payment
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Scan QRIS menggunakan BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, atau DANA. Saldo masuk setelah konfirmasi.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ACTIVE INVOICE VIEW */}
      {activeInvoice ? (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-indigo-400 tracking-wider">TAGIHAN PEMBAYARAN</span>
              <h2 className="text-lg font-bold text-white mt-0.5">Order ID: {activeInvoice.orderId}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Merchant: <span className="font-semibold text-slate-200">{activeInvoice.merchantName}</span> • NMID: {activeInvoice.nmid}
              </p>
            </div>
            <button
              onClick={() => setActiveInvoice(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              ← Ganti Nominal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 items-center">
            {/* QRIS Image Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner border border-slate-200">
              <div className="relative w-64 h-80 sm:w-72 sm:h-96">
                <Image
                  src={activeInvoice.qrImageUrl}
                  alt="QRIS Aiugi Service"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="text-[11px] text-slate-500 text-center font-medium mt-2">
                SATU QRIS UNTUK SEMUA BANK & E-WALLET
              </p>
            </div>

            {/* Transfer Instructions & Amount */}
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Total yang Harus Ditransfer:</span>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                    Rp {activeInvoice.totalAmount.toLocaleString("id-ID")}
                  </div>
                  <button
                    onClick={copyAmount}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copied ? "Disalin!" : "Salin"}</span>
                  </button>
                </div>
                <div className="mt-2 text-[11px] text-amber-400/90 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Termasuk kode unik <b>Rp {activeInvoice.uniqueCode}</b> agar verifikasi cepat dan otomatis.</span>
                </div>
              </div>

              {/* Step by step */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <h4 className="font-semibold text-white text-sm">Langkah Pembayaran:</h4>
                <ol className="space-y-2 list-decimal list-inside text-slate-400">
                  <li>Buka <b>BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, atau DANA</b>.</li>
                  <li>Pilih menu <b>Scan QRIS</b> dan arahkan ke barcode di samping.</li>
                  <li>Masukkan nominal persis <b>Rp {activeInvoice.totalAmount.toLocaleString("id-ID")}</b>.</li>
                  <li>Selesaikan pembayaran dan klik tombol konfirmasi di bawah.</li>
                </ol>
              </div>

              {confirmed ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <div>
                    <p className="font-semibold">Konfirmasi Berhasil Dikirim!</p>
                    <p className="text-slate-400 mt-0.5">Admin sedang memverifikasi mutasi. Saldo Anda akan otomatis bertambah sebentar lagi.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={confirmLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {confirmLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Saya Sudah Bayar (Konfirmasi)</span>
                      </>
                    )}
                  </button>

                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium text-xs flex items-center justify-center gap-2 transition border border-slate-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Konfirmasi Cepat via WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* NOMINAL SELECTOR VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4">Pilih Nominal Top Up</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {presets.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-600/20 text-indigo-300 shadow-md shadow-indigo-500/10"
                        : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    Rp {amt.toLocaleString("id-ID")}
                  </button>
                );
              })}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Atau Masukkan Nominal Khusus (Min. Rp 10.000)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  min="10000"
                  step="5000"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(0);
                  }}
                  placeholder="Contoh: 150000"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              onClick={handleCreateInvoice}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  <span>
                    Lanjut ke Pembayaran QRIS (Rp {(customAmount ? Number(customAmount) : selectedAmount).toLocaleString("id-ID")})
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Didukung QRIS Nasional</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Satu barcode resmi untuk seluruh bank dan aplikasi pembayaran di Indonesia:
              </p>
              <ul className="text-xs text-slate-300 space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>BCA, Mandiri Livin, BRImo, BNI</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>GoPay, OVO, ShopeePay, DANA</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Bank Jago, SeaBank, Line Bank</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
              💡 Saldo tidak pernah kedaluwarsa dan terpotong otomatis hanya saat API key dipanggil.
            </div>
          </div>
        </div>
      )}

      {/* RECENT TOPUP TRANSACTIONS TABLE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>Riwayat Top Up Terakhir</span>
          </h3>
          <button
            onClick={fetchHistory}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Belum ada transaksi top up.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Nominal</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-medium text-slate-200">{tx.orderId}</td>
                    <td className="py-3 font-mono font-semibold text-emerald-400">
                      Rp {tx.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3">
                      {tx.status === "PAID" && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                          ✓ Berhasil
                        </span>
                      )}
                      {tx.status === "WAITING_CONFIRMATION" && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium text-[11px]">
                          ⏳ Menunggu Verifikasi
                        </span>
                      )}
                      {tx.status === "PENDING" && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium text-[11px]">
                          Menunggu Bayar
                        </span>
                      )}
                      {tx.status === "FAILED" && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium text-[11px]">
                          Dibatalkan
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
