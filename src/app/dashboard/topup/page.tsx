"use client";

import { useState, useEffect } from "react";
import { Wallet, QrCode, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function TopUpPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const presets = [20000, 50000, 100000, 250000, 500000];

  useEffect(() => {
    // Check if redirected from simulated payment
    const urlParams = new URLSearchParams(window.location.search);
    const isSimulated = urlParams.get("simulated_success");
    const orderId = urlParams.get("order_id");

    if (isSimulated && orderId) {
      fetch(`/api/webhooks/midtrans?order_id=${orderId}`)
        .then((res) => res.json())
        .then((d) => {
          if (d.success) {
            setSuccessMsg("Pembayaran berhasil diverifikasi! Saldo akun Anda telah bertambah.");
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        });
    }
  }, []);

  const handleCharge = async () => {
    const amount = customAmount ? Number(customAmount) : selectedAmount;
    if (!amount || amount < 10000) {
      setError("Minimal top up adalah Rp 10.000.");
      return;
    }

    setLoading(true);
    setError("");

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

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Top Up Saldo API</h1>
        <p className="text-sm text-slate-400 mt-1">
          Saldo digunakan otomatis setiap kali ada pemanggilan model AI melalui API key Anda.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TOPUP SELECTOR */}
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Pilih Nominal Top Up</h2>

          {/* Preset Buttons */}
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

          {/* Custom Amount Input */}
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
            onClick={handleCharge}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                <span>
                  Bayar Rp {(customAmount ? Number(customAmount) : selectedAmount).toLocaleString("id-ID")} via QRIS / VA
                </span>
              </>
            )}
          </button>
        </div>

        {/* INFO CARD */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Metode Pembayaran Instan</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Mendukung semua aplikasi e-wallet dan mobile banking di Indonesia:
            </p>
            <ul className="text-xs text-slate-300 space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>QRIS (BCA, Mandiri, BRI, BNI)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>GoPay, OVO, ShopeePay, DANA</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Virtual Account Bank Otomatis</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
            💡 Saldo tidak memiliki masa kedaluwarsa dan dapat digunakan kapan saja.
          </div>
        </div>
      </div>
    </div>
  );
}
