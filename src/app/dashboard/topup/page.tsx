"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Copy,
  Clock,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { BRAND, TOPUP_PRESET_AMOUNTS, calculateTopupBonus } from "@/lib/brand";

interface ActiveInvoice {
  transactionId?: string;
  orderId: string;
  totalAmount: number;
  baseAmount: number;
  uniqueCode: number;
  bonusPercent?: number;
  bonusAmount?: number;
  totalCreditedAmount?: number;
  merchantName: string;
  nmid: string;
  qrImageUrl: string;
}

export default function TopUpPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<ActiveInvoice | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHistory = () => {
    fetch("/api/topup/charge")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.transactions) {
          setHistory(data.transactions);

          if (activeInvoice) {
            const currentTx = data.transactions.find(
              (t: any) => t.orderId === activeInvoice.orderId
            );
            if (currentTx?.status === "PAID") {
              setIsPaidSuccess(true);
            }
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    // Cek pre-selected amount dari link paket di halaman utama / harga
    if (typeof window !== "undefined") {
      const amtParam = Number(new URLSearchParams(window.location.search).get("amount"));
      if (amtParam >= 10000) {
        if (TOPUP_PRESET_AMOUNTS.includes(amtParam)) {
          setSelectedAmount(amtParam);
          setCustomAmount("");
        } else {
          setCustomAmount(String(amtParam));
          setSelectedAmount(0);
        }
      }
    }
    fetchHistory();
  }, []);

  useEffect(() => {
    if (activeInvoice && !isPaidSuccess) {
      pollingRef.current = setInterval(() => {
        fetchHistory();
      }, 5000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeInvoice, isPaidSuccess]);

  const handleCreateInvoice = async () => {
    const amount = customAmount ? Number(customAmount) : selectedAmount;
    if (!amount || amount < 10000) {
      setError("Minimal top up adalah Rp 10.000.");
      return;
    }

    setLoading(true);
    setError("");
    setConfirmed(false);
    setIsPaidSuccess(false);

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

  const copyOrderId = () => {
    if (!activeInvoice) return;
    navigator.clipboard.writeText(activeInvoice.orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const getWhatsAppUrl = () => {
    if (!activeInvoice) return "#";
    const adminPhone = BRAND.adminWhatsapp;
    const msg = `Halo Admin ${BRAND.fullName}, saya sudah transfer pembayaran Top Up Saldo QRIS sebesar Rp ${activeInvoice.totalAmount.toLocaleString(
      "id-ID"
    )} dengan Order ID: ${activeInvoice.orderId}. Mohon segera diverifikasi. Terima kasih!`;
    return `https://wa.me/${adminPhone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  };

  const effectiveAmount = customAmount ? Number(customAmount) || 0 : selectedAmount;
  const previewBonus = calculateTopupBonus(effectiveAmount);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Top Up Saldo API</h1>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-medium">
            QRIS Bisnis (Semua Bank & e-Wallet)
          </span>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Scan menggunakan m-Banking apa pun (BCA, Mandiri, BRI, BNI, Jago, SeaBank) atau e-Wallet (GoPay, OVO, ShopeePay, DANA).
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ACTIVE INVOICE VIEW */}
      {activeInvoice ? (
        <div className="surface-card rounded-xl p-6 sm:p-8 border-emerald-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 tracking-wider">
                TAGIHAN PEMBAYARAN QRIS
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-lg font-bold text-zinc-50">Order ID: {activeInvoice.orderId}</h2>
                <button
                  onClick={copyOrderId}
                  className="p-1 text-zinc-400 hover:text-zinc-100 rounded transition"
                  title="Salin Order ID"
                >
                  {copiedOrderId ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Merchant: <span className="font-semibold text-zinc-200">{activeInvoice.merchantName}</span> • NMID:{" "}
                {activeInvoice.nmid}
              </p>
            </div>
            <button
              onClick={() => {
                setActiveInvoice(null);
                setIsPaidSuccess(false);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-100 underline"
            >
              ← Ubah Nominal
            </button>
          </div>

          {isPaidSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-50">Pembayaran Sukses!</h3>
              <p className="text-zinc-300 text-sm max-w-md mx-auto">
                Saldo sebesar{" "}
                <strong className="text-emerald-400">
                  Rp {(activeInvoice.totalCreditedAmount || activeInvoice.totalAmount).toLocaleString("id-ID")}
                </strong>{" "}
                telah ditambahkan ke akun Anda.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setActiveInvoice(null);
                    setIsPaidSuccess(false);
                    window.location.reload();
                  }}
                  className="px-6 py-2.5 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 items-center">
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-zinc-300">
                <div className="relative w-64 h-80 sm:w-72 sm:h-96">
                  <Image
                    src={activeInvoice.qrImageUrl}
                    alt={`QRIS ${activeInvoice.merchantName}`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <p className="text-[11px] text-zinc-600 text-center font-semibold mt-2">
                  SATU QRIS UNTUK SEMUA BANK & E-WALLET
                </p>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[#0c0c0f] border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">Total yang Harus Ditransfer:</span>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                      Rp {activeInvoice.totalAmount.toLocaleString("id-ID")}
                    </div>
                    <button
                      onClick={copyAmount}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copied ? "Disalin!" : "Salin"}</span>
                    </button>
                  </div>
                  <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Termasuk kode unik <b>Rp {activeInvoice.uniqueCode}</b> untuk verifikasi otomatis.
                    </span>
                  </div>
                  {(activeInvoice.bonusAmount ?? 0) > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-800 text-[11px] font-mono text-emerald-400">
                      + Bonus {activeInvoice.bonusPercent}%: Anda akan menerima total{" "}
                      <strong>Rp {activeInvoice.totalCreditedAmount?.toLocaleString("id-ID")}</strong>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <h4 className="font-semibold text-zinc-100 text-sm">Langkah Pembayaran:</h4>
                  <ol className="space-y-2 list-decimal list-inside text-zinc-400">
                    <li>Buka m-Banking atau e-Wallet favorit Anda dan pilih <b>Scan QRIS</b>.</li>
                    <li>Masukkan nominal persis <b>Rp {activeInvoice.totalAmount.toLocaleString("id-ID")}</b>.</li>
                    <li>Setelah berhasil bayar, klik tombol konfirmasi di bawah.</li>
                  </ol>
                </div>

                {confirmed ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    <div>
                      <p className="font-semibold">Konfirmasi Pembayaran Diterima</p>
                      <p className="text-zinc-400 mt-0.5">
                        Admin sedang mencocokkan mutasi. Halaman ini otomatis update begitu saldo masuk.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      onClick={handleConfirmPayment}
                      disabled={confirmLoading}
                      className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
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
                      className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-400 font-medium text-xs flex items-center justify-center gap-2 transition border border-zinc-800"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Kirim Bukti via WhatsApp (Opsional)</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* NOMINAL SELECTOR VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 surface-card rounded-xl p-6">
            <h2 className="text-base font-semibold text-zinc-100 mb-4">Pilih Nominal Top Up</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {TOPUP_PRESET_AMOUNTS.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                const { bonusPercent } = calculateTopupBonus(amt);
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-3 px-4 rounded-lg border text-left transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-zinc-50"
                        : "border-zinc-800 bg-[#0c0c0f] text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    <div className="text-sm font-bold font-mono tabular-nums">
                      Rp {amt.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[10px] font-mono mt-0.5">
                      {bonusPercent > 0 ? (
                        <span className="text-emerald-400">+{bonusPercent}% Bonus Saldo</span>
                      ) : (
                        <span className="text-zinc-500">Tanpa kedaluwarsa</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-zinc-400 mb-2">
                Atau Masukkan Nominal Khusus (Min. Rp 10.000)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-mono">
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
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-zinc-100 text-sm font-mono focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            {previewBonus.bonusAmount > 0 && (
              <div className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 font-mono">
                Bonus +{previewBonus.bonusPercent}% aktif: +Rp {previewBonus.bonusAmount.toLocaleString("id-ID")} ekstra saldo!
              </div>
            )}

            <button
              onClick={handleCreateInvoice}
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  <span>
                    Lanjut ke Pembayaran QRIS (Rp {effectiveAmount.toLocaleString("id-ID")})
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="surface-card rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mb-2">QRIS Bisnis Resmi</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Standar nasional Bank Indonesia & ASPI untuk semua bank dan e-Wallet:
              </p>
              <ul className="text-xs text-zinc-300 space-y-2 mb-4">
                <li>• BCA, Mandiri, BRI, BNI, BTN</li>
                <li>• GoPay, OVO, ShopeePay, DANA, LinkAja</li>
                <li>• Bank Jago, SeaBank, Jenius, Allo Bank</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-[11px] text-zinc-400">
              Saldo tidak pernah kedaluwarsa dan otomatis bertambah bonus untuk top up ≥ Rp 100.000.
            </div>
          </div>
        </div>
      )}

      {/* RECENT TRANSACTIONS */}
      <div className="surface-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-400" />
            <span>Riwayat Top Up Terakhir</span>
          </h3>
          <button
            onClick={fetchHistory}
            className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">Belum ada transaksi top up.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Nominal</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70 text-zinc-300">
                {history.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#15151a]">
                    <td className="py-3 font-mono font-medium text-zinc-200">{tx.orderId}</td>
                    <td className="py-3 font-mono font-semibold text-emerald-400 tabular-nums">
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
                          Menunggu Verifikasi
                        </span>
                      )}
                      {tx.status === "PENDING" && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium text-[11px]">
                          Menunggu Bayar
                        </span>
                      )}
                      {tx.status === "FAILED" && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium text-[11px]">
                          Dibatalkan
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-zinc-400">
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
