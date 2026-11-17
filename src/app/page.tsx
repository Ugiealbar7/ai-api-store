"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { getModelDisplayPrices } from "@/lib/pricing";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  QrCode,
  Terminal,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  Layers,
  Cpu,
  Coins,
  Code2,
  CheckCircle,
  HelpCircle,
  Play,
} from "lucide-react";

export default function Home() {
  const models = getModelDisplayPrices();
  const [activeTab, setActiveTab] = useState<"curl" | "python" | "node" | "cursor">("curl");
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "reasoning" | "fast">("all");
  const [tokenMonthlyEstimate, setTokenMonthlyEstimate] = useState<number>(250000); // 250k token / bulan

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://ai-api-store-iota.vercel.app";

  const codeExamples = {
    curl: `curl ${appUrl}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-live-xxxxxxxxxxxxxxxx" \\
  -d '{
    "model": "deepseek-reasoner",
    "messages": [{"role": "user", "content": "Jelaskan arsitektur Transformer"}],
    "stream": true
  }'`,
    python: `from openai import OpenAI

client = OpenAI(
    base_url="${appUrl}/api/v1",
    api_key="sk-live-xxxxxxxxxxxxxxxx"
)

response = client.chat.completions.create(
    model="claude-3-7-sonnet",
    messages=[{"role": "user", "content": "Review kode Python berikut..."}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")`,
    node: `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "${appUrl}/api/v1",
  apiKey: "sk-live-xxxxxxxxxxxxxxxx",
});

const res = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: "Halo! Bantu optimasi SQL query." }],
});

console.log(res.choices[0].message.content);`,
    cursor: `// Di Cursor IDE: Settings -> Models -> OpenAI API Key
Base URL: ${appUrl}/api/v1
API Key:  sk-live-xxxxxxxxxxxxxxxx
Models:   deepseek-reasoner, claude-3-7-sonnet, gpt-4o`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Hitung estimasi pengeluaran per bulan
  // Rata-rata biaya campuran: Rp 12 per 1k token
  const estimatedCostIdr = Math.round((tokenMonthlyEstimate / 1000) * 12);
  const chatGptPlusCostIdr = 350000;
  const savingsPercent = Math.max(0, Math.round(((chatGptPlusCostIdr - estimatedCostIdr) / chatGptPlusCostIdr) * 100));

  const filteredModels = models.filter((m) => {
    if (selectedCategory === "reasoning") {
      return ["deepseek-reasoner", "claude-3-7-sonnet", "gpt-4o"].includes(m.id);
    }
    if (selectedCategory === "fast") {
      return ["gpt-4o-mini", "deepseek-chat", "claude-3-5-haiku", "gemini-2.5-flash"].includes(m.id);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden border-b border-white/[0.08]">
        {/* Subtle grid background with mask */}
        <div className="absolute inset-0 bg-grid-pattern mask-radial opacity-60 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/[0.12] blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Universal OpenAI v1 Standard Gateway</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Bayar via QRIS</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
              Akses Semua AI Dunia.{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-indigo-100 to-violet-300 bg-clip-text text-transparent">
                Tanpa Kartu Kredit.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Satu API key untuk <strong>GPT-4o, Claude 3.7 Sonnet, DeepSeek R1, dan Gemini</strong>. 
              Kompatibel dengan Cursor, Cline, NextChat, dan script coding Anda. Top-up saldo mulai Rp 10.000 dengan QRIS.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-7 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition text-sm hover:scale-[1.01]"
              >
                <span>Daftar & Klaim Saldo Rp 10.000</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#pricing"
                className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-medium px-6 py-3 rounded-xl border border-white/[0.08] transition text-sm"
              >
                Kalkulator Tarif
              </Link>
            </div>
          </div>

          {/* INTERACTIVE CODE CONSOLE SHOWCASE */}
          <div className="max-w-4xl mx-auto glass-panel rounded-2xl overflow-hidden">
            {/* Terminal Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-[#080d1b] border-b border-white/[0.08] gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {(["curl", "python", "node", "cursor"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-md text-xs font-mono transition ${
                        activeTab === tab
                          ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab === "curl"
                        ? "cURL"
                        : tab === "python"
                        ? "Python"
                        : tab === "node"
                        ? "Node.js"
                        : "Cursor IDE"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  200 OK • Stream Ready
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
                  title="Salin cuplikan kode"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-5 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto leading-relaxed bg-[#030611]">
              <pre>{codeExamples[activeTab]}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* COMPATIBILITY STRIP */}
      <section className="py-10 border-b border-white/[0.08] bg-[#030611]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-mono uppercase tracking-wider text-slate-500 mb-6">
            Dapat langsung digunakan tanpa adaptasi kode di
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-slate-400 font-medium text-xs sm:text-sm">
            <span className="hover:text-white transition flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" /> Cursor IDE
            </span>
            <span className="hover:text-white transition flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500" /> VS Code Cline & Roo
            </span>
            <span className="hover:text-white transition flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> NextChat & Chatbox
            </span>
            <span className="hover:text-white transition flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Python openai SDK
            </span>
            <span className="hover:text-white transition flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> LangChain & Dify
            </span>
          </div>
        </div>
      </section>

      {/* MODEL CATALOG SECTION */}
      <section id="models" className="py-24 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2 block">
                KATALOG MODEL AI
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Model Terkuat dari OpenAI, Anthropic, DeepSeek, & Google
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xl">
                Cukup tentukan nama model di body request Anda. Biaya dihitung per-token dengan kurs transparan.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-white/[0.08] rounded-xl self-start md:self-auto">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedCategory === "all"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Semua ({models.length})
              </button>
              <button
                onClick={() => setSelectedCategory("reasoning")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedCategory === "reasoning"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Penalaran & Koding
              </button>
              <button
                onClick={() => setSelectedCategory("fast")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedCategory === "fast"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Super Cepat & Hemat
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModels.map((m) => (
              <div
                key={m.id}
                className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {m.provider}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{m.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{m.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {m.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.08] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Input Token:</span>
                    <span className="font-mono text-slate-200 font-medium">{m.displayInputPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Output Token:</span>
                    <span className="font-mono text-slate-200 font-medium">{m.displayOutputPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE ESTIMATOR & PRICING */}
      <section id="pricing" className="py-24 border-b border-white/[0.08] bg-[#030611] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2 block">
              KALKULATOR RUPIAH TRANSPARAN
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Hemat Hingga 90% Dibandingkan Langganan Bulanan
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Dengan sistem <strong>Pay-as-you-go</strong>, saldo Anda hanya terpotong saat prompt dikirim. Tanpa biaya hangus setiap bulan.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 sm:p-10">
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="text-sm font-semibold text-white">
                  Estimasi Konsumsi Token per Bulan:
                </label>
                <span className="text-base font-bold font-mono text-indigo-300">
                  {tokenMonthlyEstimate.toLocaleString("id-ID")} Token (~{Math.round(tokenMonthlyEstimate * 0.75).toLocaleString("id-ID")} Kata)
                </span>
              </div>

              <input
                type="range"
                min="50000"
                max="2000000"
                step="25000"
                value={tokenMonthlyEstimate}
                onChange={(e) => setTokenMonthlyEstimate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2">
                <span>50K Token (Ringan)</span>
                <span>500K Token (Menengah)</span>
                <span>2M Token (Coding Berat)</span>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.08]">
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-mono text-slate-500 block mb-1">Langganan AI Tradisional (Plus/Pro)</span>
                <div className="text-2xl font-bold text-slate-400 font-mono">Rp 350.000 / bln</div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Harus dibayar penuh tiap bulan meski jarang dipakai. Wajib kartu kredit USD luar negeri.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-500/40 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Hemat {savingsPercent}%
                </div>
                <span className="text-xs font-mono text-indigo-300 block mb-1">Nusantara AI Gateway (Pay-per-token)</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  ~Rp {estimatedCostIdr.toLocaleString("id-ID")} / bln
                </div>
                <p className="text-xs text-indigo-200/80 mt-2 leading-relaxed">
                  Hanya bayar token yang Anda konsumsi. Saldo tidak pernah kedaluwarsa dan bisa diisi via QRIS mulai Rp 10.000.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US VS DIRECT COMPARISON TABLE */}
      <section id="comparison" className="py-24 border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2 block">
              PERBANDINGAN LANGSUNG
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Mengapa Lebih Nyaman Lewat Nusantara AI?
            </h2>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400 font-medium bg-[#060a16]">
                    <th className="p-4 sm:p-5">Fitur & Kemudahan</th>
                    <th className="p-4 sm:p-5 text-slate-500">Beli Langsung ke OpenAI/Anthropic</th>
                    <th className="p-4 sm:p-5 text-indigo-400 font-semibold bg-indigo-950/20">
                      Nusantara AI Gateway
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Metode Pembayaran</td>
                    <td className="p-4 sm:p-5 text-slate-400">Kartu Kredit Visa/Mastercard (USD)</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-indigo-950/10">
                      ✓ QRIS (BCA, Mandiri, GoPay, DANA, dll)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Minimal Top Up</td>
                    <td className="p-4 sm:p-5 text-slate-400">$10 - $20 (Rp 170.000 - Rp 340.000)</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-indigo-950/10">
                      ✓ Mulai Rp 10.000 saja
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Akses Multi-Model</td>
                    <td className="p-4 sm:p-5 text-slate-400">Harus buat 4 akun terpisah & bayar masing-masing</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-indigo-950/10">
                      ✓ 1 Akun & 1 Saldo untuk semua model
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Masa Berlaku Saldo</td>
                    <td className="p-4 sm:p-5 text-slate-400">Sering hangus per 12 bulan</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-indigo-950/10">
                      ✓ Aktif selamanya tanpa kedaluwarsa
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-white">Dukungan Cursor & Cline</td>
                    <td className="p-4 sm:p-5 text-slate-400">Perlu key terpisah untuk tiap provider</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-semibold bg-indigo-950/10">
                      ✓ Cukup 1 API Key, ganti model bebas
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/[0.15] blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="h-12 w-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-6">
            <Cpu className="h-6 w-6" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Mulai Koding dengan AI Kelas Dunia Sekarang
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8">
            Daftar dalam 30 detik tanpa kartu kredit. Saldo gratis uji coba Rp 10.000 sudah disiapkan di akun Anda.
          </p>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3.5 rounded-xl shadow-xl shadow-indigo-600/30 transition text-sm hover:scale-[1.02]"
          >
            <span>Daftar Sekarang & Dapatkan Kunci API</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/[0.08] text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Nusantara AI Gateway</span>
            <span>•</span>
            <span>Infrastruktur AI untuk Pengembang Indonesia</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/dashboard/docs" className="hover:text-white transition">
              Dokumentasi
            </Link>
            <Link href="/dashboard/topup" className="hover:text-white transition">
              Top Up QRIS
            </Link>
            <Link href="/login" className="hover:text-white transition">
              Masuk
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
