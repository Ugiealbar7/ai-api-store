import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HargaCatalogClient from "@/components/HargaCatalogClient";
import { BRAND, TOPUP_PACKAGES } from "@/lib/brand";
import { getLiveDisplayModels } from "@/lib/openrouter-catalog";
import { ArrowRight, CheckCircle2, QrCode } from "lucide-react";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Harga 330+ Model AI API Indonesia (Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5)",
  description:
    "Daftar harga live dalam Rupiah untuk 330+ model AI terbaru (Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5, DeepSeek V4.1, Grok 4.7). Bayar QRIS mulai Rp 10.000.",
  alternates: {
    canonical: "/harga",
  },
  openGraph: {
    title: `Harga 330+ Model AI API Indonesia | ${BRAND.fullName}`,
    description:
      "Bandingkan tarif input & output token 330+ model AI terbaru dalam Rupiah. Sinkron otomatis dengan rilis model terbaru, bayar QRIS tanpa kartu kredit.",
    url: `${BRAND.siteUrl}/harga`,
  },
};

export default async function HargaPage() {
  const models = await getLiveDisplayModels();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        <header className="max-w-3xl space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block">
            DAFTAR HARGA LIVE ({models.length}+ MODEL AI)
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-50 tracking-tight leading-tight">
            Tarif Token AI Transparan dalam Rupiah
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Seluruh model disinkronkan secara otomatis sehingga model terbaru seperti Gemini 4 Hydrogen, GPT-6.2 Astra, dan Claude Opus 5.5 langsung tersedia tanpa biaya langganan bulanan.
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

        {/* FULL LIVE PRICING LEDGER */}
        <section className="space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-50">
              Pencarian & Tarif {models.length}+ Model AI Live
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              1.000 token setara sekitar 750 kata bahasa Inggris atau ~500–650 kata bahasa Indonesia.
            </p>
          </div>

          <HargaCatalogClient models={models} />
        </section>

        {/* TRUST SUMMARY */}
        <section className="surface-card rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-lg font-bold text-zinc-50">
              Siap Mulai Pakai Semua Model dalam Satu API Key?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Daftar akun gratis untuk mencoba Playground API langsung di dashboard, lalu isi saldo via QRIS sesuai kebutuhan.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Saldo Aktif Selamanya
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Auto-Sync Model Baru
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
