import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND, TOPUP_PACKAGES } from "@/lib/brand";
import { ArrowRight, CheckCircle2, QrCode, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "Cara Pakai Cursor IDE & Cline dengan Claude Opus 5.5 & Gemini 4 Hydrogen Bayar QRIS",
  description:
    "Panduan langkah demi langkah setting API Key di Cursor IDE, VS Code Cline, dan Roo Code tanpa kartu kredit. Gunakan Claude Opus 5.5, GPT-6.2 Astra, dan Gemini 4 Hydrogen bayar QRIS Rupiah.",
  alternates: {
    canonical: "/cursor-ide",
  },
  openGraph: {
    title: `Panduan Cursor IDE & Cline Bayar QRIS | ${BRAND.fullName}`,
    description:
      "Hemat biaya coding AI tanpa langganan bulanan USD. Pakai Claude Opus 5.5, GPT-6.2 Astra, & Gemini 4 Hydrogen langsung di Cursor IDE.",
    url: `${BRAND.siteUrl}/cursor-ide`,
  },
};

export default function CursorIdeGuidePage() {
  const apiBase = `${BRAND.siteUrl}/api/v1`;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <header className="space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block">
            PANDUAN DEVELOPER INDONESIA • TANPA KARTU KREDIT
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-50 tracking-tight leading-tight">
            Cara Pakai Cursor IDE, Cline & Roo Code dengan Pembayaran QRIS
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Tidak punya kartu kredit internasional untuk berlangganan Cursor Pro atau membeli API key OpenAI/Anthropic? Dengan{" "}
            <strong className="text-zinc-200">{BRAND.fullName}</strong>, Anda bisa memakai model coding terbaik seperti{" "}
            <strong className="text-zinc-200">Claude Opus 5.5, GPT-6.2 Astra, Gemini 4 Hydrogen,</strong> dan{" "}
            <strong className="text-zinc-200">DeepSeek V4.1</strong> secara pay-as-you-go memakai QRIS bank lokal atau e-Wallet.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold px-5 py-3 rounded-lg text-xs sm:text-sm transition"
            >
              <span>Ambil API Key Gratis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/harga"
              className="inline-flex items-center gap-2 bg-[#111114] hover:bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium px-5 py-3 rounded-lg text-xs sm:text-sm transition"
            >
              <span>Cek Tarif 330+ Model</span>
            </Link>
          </div>
        </header>

        <section className="space-y-5">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-50">
            3 Langkah Setup di Cursor IDE / VS Code Cline
          </h2>

          <div className="space-y-4">
            <div className="surface-card rounded-xl p-6 space-y-2">
              <div className="text-xs font-mono text-emerald-400">LANGKAH 1</div>
              <h3 className="text-base font-bold text-zinc-100">
                Daftar Akun & Salin API Key (`sk-live-...`)
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Buat akun gratis di{" "}
                <Link href="/register" className="text-emerald-400 underline">
                  halaman pendaftaran
                </Link>
                . API key default langsung dibuat otomatis dan siap diuji menggunakan saldo uji coba.
              </p>
            </div>

            <div className="surface-card rounded-xl p-6 space-y-3">
              <div className="text-xs font-mono text-emerald-400">LANGKAH 2</div>
              <h3 className="text-base font-bold text-zinc-100">
                Isi Pengaturan OpenAI Base URL di Cursor / Cline
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Buka <strong className="text-zinc-200">Settings → Models</strong> (di Cursor) atau pengaturan{" "}
                <strong className="text-zinc-200">OpenAI Compatible</strong> (di Cline / Roo Code), lalu tempel konfigurasi berikut:
              </p>
              <pre className="p-4 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
{`Provider:  OpenAI Compatible
Base URL:  ${apiBase}
API Key:   sk-live-xxxxxxxxxxxxxxxxxxxx
Models:    anthropic/claude-opus-5.5
           openai/gpt-6.2-astra
           google/gemini-4-hydrogen
           deepseek/deepseek-v4.1-flash`}
              </pre>
            </div>

            <div className="surface-card rounded-xl p-6 space-y-2">
              <div className="text-xs font-mono text-emerald-400">LANGKAH 3</div>
              <h3 className="text-base font-bold text-zinc-100">
                Top Up Saldo Kapan Saja via QRIS (Mulai Rp 10.000)
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Saat butuh pemakaian lebih intensif, scan QRIS bisnis menggunakan BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, atau DANA. Saldo tidak punya masa hangus dan mendapat bonus hingga +5%.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Terminal className="h-4 w-4" />
              <span>REKOMENDASI DEVELOPER</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-50">
              Paket Developer Rp {TOPUP_PACKAGES[1].amount.toLocaleString("id-ID")} (+{TOPUP_PACKAGES[1].bonusPercent}% Bonus)
            </h2>
            <p className="text-xs text-zinc-400 max-w-lg">
              Pilihan terlaris untuk pemakaian coding harian di Cursor IDE & Cline dengan kombinasi Claude Sonnet/Opus 5.5 dan DeepSeek V4.1.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Semua Bank & e-Wallet
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                330+ Model Aktif
              </span>
            </div>
          </div>
          <Link
            href="/register?redirect=%2Fdashboard%2Ftopup%3Famount%3D100000"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-5 py-3 rounded-lg text-xs sm:text-sm transition shrink-0"
          >
            <QrCode className="h-4 w-4" />
            <span>Top Up Sekarang</span>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
