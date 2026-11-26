import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND, TOPUP_PACKAGES } from "@/lib/brand";
import { getModelDisplayPrices, USD_TO_IDR } from "@/lib/pricing";
import { ArrowRight, CheckCircle2, QrCode } from "lucide-react";

export const metadata: Metadata = {
  title: "Harga API AI Indonesia — Daftar Tarif Token & Paket Top Up QRIS",
  description:
    "Daftar harga transparan API Claude 3.7 Sonnet, DeepSeek R1, GPT-4o, OpenAI o3-mini, dan Gemini 2.5 Pro dalam Rupiah. Top up QRIS mulai Rp 10.000 dengan bonus hingga 5%.",
  alternates: {
    canonical: "/harga",
  },
  openGraph: {
    title: `Harga API AI Indonesia (Rupiah) | ${BRAND.fullName}`,
    description:
      "Bandingkan tarif input & output token 14+ model AI terpopuler dalam Rupiah. Bayar via QRIS tanpa kartu kredit.",
    url: `${BRAND.siteUrl}/harga`,
  },
};

export default function HargaPage() {
  const models = getModelDisplayPrices();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        <header className="max-w-3xl space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block">
            DAFTAR HARGA RESMI (IDR)
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-50 tracking-tight leading-tight">
            Tarif Token AI Transparan dalam Rupiah
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Tidak ada biaya langganan bulanan atau biaya tersembunyi. Saldo Anda dipotong sesuai jumlah token aktual per request dengan konversi transparan dalam Rupiah.
          </p>
        </header>

        {/* TOP UP PACKAGES */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-50">
                Paket Top Up Saldo via QRIS
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Mendukung seluruh m-Banking dan e-Wallet Indonesia. Bonus masuk otomatis saat pembayaran disetujui.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">Min. Top Up Bebas: Rp 10.000</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOPUP_PACKAGES.map((pkg) => {
              const bonusAmount = Math.round((pkg.amount * pkg.bonusPercent) / 100);
              const totalReceived = pkg.amount + bonusAmount;
              return (
                <div
                  key={pkg.amount}
                  className={`rounded-xl p-6 flex flex-col justify-between ${
                    pkg.highlight
                      ? "bg-[#141418] border border-emerald-500/50"
                      : "surface-card surface-card-hover"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                        {pkg.label}
                      </span>
                      {pkg.badge && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-50 tabular-nums">
                      Rp {pkg.amount.toLocaleString("id-ID")}
                    </div>
                    <div className="mt-2 text-xs font-mono text-emerald-400">
                      {pkg.bonusPercent > 0
                        ? `+${pkg.bonusPercent}% Bonus (Total Rp ${totalReceived.toLocaleString("id-ID")})`
                        : `Total saldo Rp ${pkg.amount.toLocaleString("id-ID")}`}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-4 mb-6">
                      {pkg.description}
                    </p>
                  </div>

                  <Link
                    href={`/register?redirect=${encodeURIComponent(`/dashboard/topup?amount=${pkg.amount}`)}`}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      pkg.highlight
                        ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800"
                    }`}
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Pilih Paket</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* FULL PRICING TABLE */}
        <section className="space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-50">
              Tabel Tarif per 1.000 Token & 1 Juta Token
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Sebagai gambaran, 1.000 token setara sekitar 750 kata bahasa Inggris atau ~500–650 kata bahasa Indonesia.
            </p>
          </div>

          <div className="surface-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#141418] border-b border-zinc-800 text-zinc-400 font-medium text-xs">
                    <th className="p-4">Model & Provider</th>
                    <th className="p-4">Model ID</th>
                    <th className="p-4">Context</th>
                    <th className="p-4 text-right">Input / 1K Token</th>
                    <th className="p-4 text-right">Output / 1K Token</th>
                    <th className="p-4 text-right">Est. per 1M Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {models.map((m) => {
                    const outPer1mIdr = Math.round(
                      m.outputCostPer1MUsd * USD_TO_IDR * m.markupMultiplier
                    );
                    return (
                      <tr key={m.id} className="hover:bg-[#15151a] transition">
                        <td className="p-4">
                          <div className="font-semibold text-zinc-100">{m.name}</div>
                          <div className="text-[11px] text-zinc-500">{m.provider}</div>
                        </td>
                        <td className="p-4 font-mono text-xs text-emerald-400">{m.id}</td>
                        <td className="p-4 font-mono text-xs text-zinc-400">{m.contextWindow}</td>
                        <td className="p-4 text-right font-mono text-xs text-zinc-200 tabular-nums">
                          {m.displayInputPrice.replace(" / 1K token", "")}
                        </td>
                        <td className="p-4 text-right font-mono text-xs text-zinc-200 tabular-nums">
                          {m.displayOutputPrice.replace(" / 1K token", "")}
                        </td>
                        <td className="p-4 text-right font-mono text-xs text-zinc-400 tabular-nums">
                          Rp {outPer1mIdr.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* TRUST SUMMARY */}
        <section className="surface-card rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-lg font-bold text-zinc-50">
              Butuh Bantuan Hitung Estimasi Biaya Aplikasi Anda?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Daftar akun gratis untuk mencoba Playground API langsung di dashboard, lalu isi saldo sesuai kebutuhan tanpa komitmen bulanan.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Saldo Aktif Selamanya
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Log Pemakaian Real-Time
              </span>
            </div>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold px-6 py-3 rounded-lg text-xs sm:text-sm transition shrink-0"
          >
            <span>Daftar & Mulai Sekarang</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
