"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND, STARTER_TRIAL_BALANCE_IDR, TOPUP_PACKAGES } from "@/lib/brand";
import type { FaqItem } from "@/lib/faq";
import type { ModelPricing } from "@/lib/pricing";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  QrCode,
  Search,
  Terminal,
} from "lucide-react";

type DisplayModel = ModelPricing & {
  displayInputPrice: string;
  displayOutputPrice: string;
};

interface HomeClientProps {
  models: DisplayModel[];
  faqs: FaqItem[];
}

export default function HomeClient({ models, faqs }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<"cursor" | "python" | "node" | "curl">("cursor");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "featured" | "all" | "Google" | "OpenAI" | "Anthropic" | "open"
  >("featured");
  const [modelQuery, setModelQuery] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(15);
  const [tokenMonthlyEstimate, setTokenMonthlyEstimate] = useState<number>(250000);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : BRAND.siteUrl;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setVisibleLimit(15);
  }, [selectedFilter, modelQuery]);

  const codeExamples = {
    cursor: `// Cursor IDE / VS Code Cline / Roo Code
Base URL: ${appUrl}/api/v1
API Key:  sk-live-xxxxxxxxxxxxxxxxxxxx
Model:    google/gemini-4-hydrogen
          openai/gpt-6.2-astra
          anthropic/claude-opus-5.5`,
    python: `from openai import OpenAI

client = OpenAI(
    base_url="${appUrl}/api/v1",
    api_key="sk-live-xxxxxxxxxxxxxxxxxxxx"
)

res = client.chat.completions.create(
    model="google/gemini-4-hydrogen",
    messages=[{"role": "user", "content": "Audit arsitektur backend ini"}],
    stream=True
)

for chunk in res:
    print(chunk.choices[0].delta.content or "", end="")`,
    node: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${appUrl}/api/v1",
  apiKey: "sk-live-xxxxxxxxxxxxxxxxxxxx",
});

const res = await client.chat.completions.create({
  model: "openai/gpt-6.2-astra",
  messages: [{ role: "user", content: "Buat REST handler Next.js" }],
});

console.log(res.choices[0].message.content);`,
    curl: `curl ${appUrl}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-live-xxxxxxxxxxxxxxxxxxxx" \\
  -d '{
    "model": "anthropic/claude-opus-5.5",
    "messages": [{"role": "user", "content": "Optimasi SQL query ini"}],
    "stream": true
  }'`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleCopyModel = (modelId: string) => {
    navigator.clipboard.writeText(modelId);
    setCopiedModelId(modelId);
    setTimeout(() => setCopiedModelId(null), 1600);
  };

  const getPackageHref = (amount: number) => {
    const target = `/dashboard/topup?amount=${amount}`;
    return isLoggedIn ? target : `/register?redirect=${encodeURIComponent(target)}`;
  };

  const estimatedCostIdr = Math.round((tokenMonthlyEstimate / 1000) * 12);
  const subscriptionCostIdr = 350000;
  const savingsPercent = Math.max(
    0,
    Math.round(((subscriptionCostIdr - estimatedCostIdr) / subscriptionCostIdr) * 100)
  );

  const filteredModels = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    return models.filter((m) => {
      if (q) {
        return (
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
        );
      }

      if (selectedFilter === "featured") return Boolean(m.featured);
      if (selectedFilter === "all") return true;
      if (selectedFilter === "open") {
        return !["Google", "OpenAI", "Anthropic"].includes(m.provider);
      }
      return m.provider === selectedFilter;
    });
  }, [models, modelQuery, selectedFilter]);

  const displayedModels = filteredModels.slice(0, visibleLimit);
  const hasMore = filteredModels.length > visibleLimit;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar />

      <main>
        {/* ASYMMETRIC EDITORIAL HERO */}
        <section className="relative border-b border-zinc-800/80 overflow-hidden">
          <div className="absolute inset-0 bg-hairline-grid mask-radial pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Editorial Copy */}
              <div className="lg:col-span-7 space-y-7">
                <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>AUTO-SYNC {models.length}+ MODEL LIVE</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-emerald-400">QRIS RUPIAH</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-zinc-50 leading-[1.06]">
                  Satu API Key untuk {models.length}+ Model AI Terbaru.{" "}
                  <span className="text-zinc-400">
                    Bayar <span className="text-zinc-50 underline decoration-emerald-500 decoration-2 underline-offset-8">QRIS dalam Rupiah.</span>
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
                  Pakai model paling fresh seperti <strong className="text-zinc-200 font-semibold">Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5, DeepSeek V4.1,</strong> dan <strong className="text-zinc-200 font-semibold">Grok 4.7</strong> langsung di Cursor IDE, VS Code Cline, n8n, atau Python/Node.js — tanpa kartu kredit USD.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Link
                    href={isLoggedIn ? "/dashboard" : "/register"}
                    className="inline-flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold px-6 py-3.5 rounded-lg text-sm transition"
                  >
                    <span>
                      {isLoggedIn
                        ? "Buka Dashboard API"
                        : `Buat API Key (Saldo Uji Rp ${STARTER_TRIAL_BALANCE_IDR.toLocaleString("id-ID")})`}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#models"
                    className="inline-flex items-center justify-center gap-2 bg-[#111114] hover:bg-zinc-900 text-zinc-200 font-medium px-6 py-3.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-sm transition"
                  >
                    <QrCode className="h-4 w-4 text-emerald-400" />
                    <span>Jelajahi {models.length}+ Model</span>
                  </Link>
                </div>

                {/* Crisp Spec Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800/80 max-w-xl">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-50 tabular-nums">
                      {models.length}+
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">Model Live Auto-Sync</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                      Rp 10rb
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">Minimal Top Up QRIS</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-50 tabular-nums">
                      Bonus 5%
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">Saldo Aktif Selamanya</div>
                  </div>
                </div>
              </div>

              {/* Right Interactive Gateway Workbench */}
              <div className="lg:col-span-5">
                <div className="surface-card rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#141418] border-b border-zinc-800">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {(["cursor", "python", "node", "curl"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono transition whitespace-nowrap ${
                            activeTab === tab
                              ? "bg-zinc-50 text-zinc-950 font-semibold"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {tab === "cursor"
                            ? "Cursor / Cline"
                            : tab === "python"
                            ? "Python"
                            : tab === "node"
                            ? "Node.js"
                            : "cURL"}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 hover:text-zinc-50 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 transition shrink-0 ml-2"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 bg-[#0c0c0f] font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed min-h-[260px]">
                    <pre>{codeExamples[activeTab]}</pre>
                  </div>

                  <div className="px-4 py-2.5 bg-[#111114] border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Terminal className="h-3.5 w-3.5" />
                      <span>200 OK • Model Baru Auto-Ready</span>
                    </span>
                    <span className="text-zinc-500">Drop-in OpenAI SDK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPATIBILITY STRIP */}
        <section className="border-b border-zinc-800/80 bg-[#0c0c0f] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Otomatis terbaca di /v1/models untuk
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs font-mono text-zinc-300">
              <span>Cursor IDE</span>
              <span className="text-zinc-700">•</span>
              <span>VS Code Cline / Roo</span>
              <span className="text-zinc-700">•</span>
              <Link href="/openclaw-hermes" className="hover:text-emerald-400 transition">
                OpenClaw & Hermes Agent
              </Link>
              <span className="text-zinc-700">•</span>
              <span>n8n AI Agent</span>
              <span className="text-zinc-700">•</span>
              <span>OpenAI Python & TS SDK</span>
            </div>
          </div>
        </section>

        {/* CONVERSION SECTION: PAKET TOP UP QRIS BERJENJANG */}
        <section id="paket" className="py-20 border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block mb-2">
                  TOP UP CEPAT VIA QRIS BISNIS
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
                  Pilih Paket Saldo & Dapatkan Bonus Ekstra
                </h2>
                <p className="text-sm text-zinc-400 mt-2 max-w-xl">
                  Terima BCA, Mandiri, BRI, BNI, Jago, SeaBank, GoPay, OVO, DANA, hingga ShopeePay. Tidak ada biaya langganan bulanan.
                </p>
              </div>
              <Link
                href={getPackageHref(10000)}
                className="text-xs font-mono text-zinc-300 hover:text-emerald-400 underline underline-offset-4 transition self-start md:self-auto"
              >
                Atau isi nominal bebas mulai Rp 10.000 →
              </Link>
            </div>

            {/* VALUE TRANSLATOR: RP 25.000 DAPAT APA SAJA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="surface-card rounded-xl p-5">
                <span className="text-[11px] font-mono text-emerald-400 block mb-1">ESTIMASI DENGAN RP 25.000</span>
                <div className="text-lg font-bold text-zinc-50">~1.500+ ChatGPT / GPT-6 Luna</div>
                <p className="text-xs text-zinc-400 mt-1">
                  Cocok untuk tanya-jawab harian, bot WhatsApp/Telegram, dan riset cepat.
                </p>
              </div>
              <div className="surface-card rounded-xl p-5">
                <span className="text-[11px] font-mono text-emerald-400 block mb-1">ESTIMASI DENGAN RP 25.000</span>
                <div className="text-lg font-bold text-zinc-50">~500+ Sesi Coding DeepSeek V4.1</div>
                <p className="text-xs text-zinc-400 mt-1">
                  Hemat berkali-kali lipat dibanding langganan AI tetap Rp 350.000/bulan.
                </p>
              </div>
              <div className="surface-card rounded-xl p-5 border-emerald-500/30">
                <span className="text-[11px] font-mono text-emerald-400 block mb-1">PROGRAM AJAK TEMAN</span>
                <div className="text-lg font-bold text-zinc-50">Komisi Saldo 5% + Bonus 3%</div>
                <p className="text-xs text-zinc-400 mt-1">
                  Bagikan link referral Anda — dapat bonus saldo otomatis setiap teman Anda top up pertama.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {TOPUP_PACKAGES.map((pkg) => {
                const bonusAmount = Math.round((pkg.amount * pkg.bonusPercent) / 100);
                const totalReceived = pkg.amount + bonusAmount;
                return (
                  <div
                    key={pkg.amount}
                    className={`rounded-xl p-6 flex flex-col justify-between transition ${
                      pkg.highlight
                        ? "bg-[#141418] border border-emerald-500/50"
                        : "surface-card surface-card-hover"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
                          {pkg.label}
                        </span>
                        {pkg.badge && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {pkg.badge}
                          </span>
                        )}
                      </div>

                      <div className="text-3xl font-extrabold text-zinc-50 font-mono tabular-nums">
                        Rp {pkg.amount.toLocaleString("id-ID")}
                      </div>

                      <div className="mt-2 min-h-[24px]">
                        {pkg.bonusPercent > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400">
                            +{pkg.bonusPercent}% Bonus → Saldo Rp {totalReceived.toLocaleString("id-ID")}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-zinc-500">
                            Saldo masuk Rp {pkg.amount.toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed mt-4 mb-6">
                        {pkg.description}
                      </p>
                    </div>

                    <Link
                      href={getPackageHref(pkg.amount)}
                      className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        pkg.highlight
                          ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                          : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800"
                      }`}
                    >
                      <span>Beli via QRIS</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* MODEL CATALOG LEDGER (LIVE 330+ MODELS) */}
        <section id="models" className="py-20 border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-2">
                  SINKRONISASI LIVE OPENROUTER • {models.length}+ MODEL
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
                  Semua Model AI Terbaru Tersedia Otomatis
                </h2>
                <p className="text-sm text-zinc-400 mt-2 max-w-xl">
                  Cari model apa pun dari Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5, DeepSeek V4.1, hingga model open-source terbaru. Klik ID untuk menyalin.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={modelQuery}
                    onChange={(e) => setModelQuery(e.target.value)}
                    placeholder={`Cari dari ${models.length}+ model...`}
                    className="w-full sm:w-64 pl-8 pr-3 py-2 rounded-lg bg-[#111114] border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#111114] border border-zinc-800 rounded-lg">
                  {[
                    { key: "featured", label: "Unggulan Terbaru" },
                    { key: "all", label: `Semua (${models.length})` },
                    { key: "Google", label: "Gemini" },
                    { key: "OpenAI", label: "OpenAI" },
                    { key: "Anthropic", label: "Claude" },
                    { key: "open", label: "DeepSeek & Lainnya" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedFilter(tab.key as any)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                        selectedFilter === tab.key && !modelQuery
                          ? "bg-zinc-50 text-zinc-950 font-semibold"
                          : "text-zinc-400 hover:text-zinc-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedModels.map((m) => (
                <article
                  key={m.id}
                  className="surface-card surface-card-hover rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                        {m.provider}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                        Ctx {m.contextWindow}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold text-zinc-50 line-clamp-1">{m.name}</h3>
                      {m.badge && (
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded shrink-0">
                          {m.badge}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyModel(m.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 mb-3 transition text-left break-all"
                      title="Klik untuk menyalin Model ID"
                    >
                      <span>{m.id}</span>
                      {copiedModelId === m.id ? (
                        <Check className="h-3 w-3 shrink-0" />
                      ) : (
                        <Copy className="h-3 w-3 opacity-70 shrink-0" />
                      )}
                    </button>

                    <p className="text-xs text-zinc-400 leading-relaxed mb-5 line-clamp-3">
                      {m.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-zinc-800/80 space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-zinc-500 block">Input / 1K token</span>
                        <span className="font-mono text-zinc-200 font-medium tabular-nums">
                          {m.displayInputPrice.replace(" / 1K token", "")}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-zinc-500 block">Output / 1K token</span>
                        <span className="font-mono text-zinc-200 font-medium tabular-nums">
                          {m.displayOutputPrice.replace(" / 1K token", "")}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-zinc-800/50 flex justify-end">
                      <Link
                        href={`/models/${m.id}`}
                        className="text-[11px] font-mono text-zinc-400 hover:text-emerald-400 transition"
                      >
                        Detail Tarif & Kode →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredModels.length === 0 && (
              <div className="text-center py-12 surface-card rounded-xl text-xs text-zinc-400">
                Tidak ada model yang cocok dengan pencarian Anda.
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setVisibleLimit((prev) => prev + 24)}
                  className="inline-flex items-center gap-2 text-xs font-semibold bg-zinc-50 hover:bg-zinc-200 text-zinc-950 px-5 py-2.5 rounded-lg transition"
                >
                  <span>
                    Tampilkan Lebih Banyak ({filteredModels.length - visibleLimit} model lagi)
                  </span>
                </button>
              )}
              <Link
                href="/harga"
                className="inline-flex items-center gap-2 text-xs font-mono text-zinc-300 hover:text-zinc-50 border border-zinc-800 hover:border-zinc-700 bg-[#111114] px-4 py-2.5 rounded-lg transition"
              >
                <span>Buka Tabel Pencarian Lengkap {models.length}+ Model</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* INTERACTIVE CALCULATOR & COMPARISON */}
        <section id="pricing" className="py-20 border-b border-zinc-800/80 bg-[#0c0c0f]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block mb-2">
                  SIMULASI BIAYA PEMAKAIAN
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
                  Bayar Sesuai Pemakaian, Bukan Biaya Bulanan
                </h2>
                <p className="text-sm text-zinc-400 mt-2">
                  Geser estimasi pemakaian bulanan Anda untuk melihat penghematan dibanding langganan tetap USD.
                </p>
              </div>

              <div className="surface-card rounded-xl p-6 sm:p-8">
                <div className="mb-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <label htmlFor="token-slider" className="text-sm font-semibold text-zinc-100">
                      Estimasi Konsumsi Token / Bulan
                    </label>
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                      {tokenMonthlyEstimate.toLocaleString("id-ID")} Token (~
                      {Math.round(tokenMonthlyEstimate * 0.75).toLocaleString("id-ID")} Kata)
                    </span>
                  </div>

                  <input
                    id="token-slider"
                    type="range"
                    min="50000"
                    max="2000000"
                    step="25000"
                    value={tokenMonthlyEstimate}
                    onChange={(e) => setTokenMonthlyEstimate(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-2">
                    <span>50K (Ringan)</span>
                    <span>500K (Developer Harian)</span>
                    <span>2M (Coding Intensif)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 border-t border-zinc-800">
                  <div className="p-5 rounded-lg bg-[#09090b] border border-zinc-800">
                    <span className="text-xs font-mono text-zinc-500 block mb-1">
                      Langganan AI Plus / Pro (Tetap)
                    </span>
                    <div className="text-2xl font-bold text-zinc-400 font-mono tabular-nums">
                      Rp 350.000 / bln
                    </div>
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                      Tetap tertagih penuh tiap bulan walau jarang dipakai. Membutuhkan kartu kredit internasional.
                    </p>
                  </div>

                  <div className="p-5 rounded-lg bg-[#141418] border border-emerald-500/40 relative">
                    <div className="inline-block sm:absolute sm:top-4 sm:right-4 mb-2 sm:mb-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Hemat {savingsPercent}%
                    </div>
                    <span className="text-xs font-mono text-zinc-300 block mb-1">
                      {BRAND.fullName} (Pay-as-you-go)
                    </span>
                    <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                      ~Rp {estimatedCostIdr.toLocaleString("id-ID")} / bln
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      Saldo tidak pernah hangus dan dapat diisi via QRIS bank lokal atau e-Wallet mulai Rp 10.000.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COMPARISON TABLE */}
            <div id="comparison">
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 tracking-tight mb-6">
                Perbandingan Praktis untuk Developer Indonesia
              </h2>

              <div className="surface-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 font-medium bg-[#141418]">
                        <th className="p-4 sm:p-5">Aspek</th>
                        <th className="p-4 sm:p-5 text-zinc-500">Daftar Provider Asing Langsung</th>
                        <th className="p-4 sm:p-5 text-emerald-400 font-semibold">{BRAND.fullName}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70 text-zinc-300">
                      <tr>
                        <td className="p-4 sm:p-5 font-medium text-zinc-100">Pembayaran</td>
                        <td className="p-4 sm:p-5 text-zinc-500">Kartu Kredit Visa/Mastercard (USD)</td>
                        <td className="p-4 sm:p-5 text-emerald-400 font-medium">
                          QRIS Nasional (BCA, Mandiri, BRI, GoPay, DANA, OVO)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 sm:p-5 font-medium text-zinc-100">Minimal Deposit</td>
                        <td className="p-4 sm:p-5 text-zinc-500">$5 – $20 (~Rp 85.000 – Rp 340.000)</td>
                        <td className="p-4 sm:p-5 text-emerald-400 font-medium">Mulai Rp 10.000</td>
                      </tr>
                      <tr>
                        <td className="p-4 sm:p-5 font-medium text-zinc-100">Ketersediaan Model</td>
                        <td className="p-4 sm:p-5 text-zinc-500">Top up terpisah tiap vendor AI</td>
                        <td className="p-4 sm:p-5 text-emerald-400 font-medium">
                          1 API Key untuk {models.length}+ Model Terbaru (Auto-Sync)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4 sm:p-5 font-medium text-zinc-100">Masa Aktif Saldo</td>
                        <td className="p-4 sm:p-5 text-zinc-500">Sebagian hangus setelah 12 bulan</td>
                        <td className="p-4 sm:p-5 text-emerald-400 font-medium">Aktif selamanya</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO FAQ SECTION */}
        <section id="faq" className="py-20 border-b border-zinc-800/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block mb-2">
                PERTANYAAN UMUM
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 tracking-tight">
                Hal yang Sering Ditanyakan Developer
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={idx} className="surface-card rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#15151a] transition"
                    >
                      <span className="text-sm font-semibold text-zinc-100">{faq.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-emerald-400" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 bg-[#0c0c0f]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight mb-4">
              Siap Integrasikan AI Terbaru ke Aplikasi atau IDE Anda?
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-8">
              Buat akun dalam 30 detik, dapatkan API key instan dan saldo uji coba Rp{" "}
              {STARTER_TRIAL_BALANCE_IDR.toLocaleString("id-ID")}, lalu isi ulang kapan saja via QRIS.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold px-7 py-3.5 rounded-lg text-sm transition"
              >
                <span>{isLoggedIn ? "Ke Dashboard Sekarang" : "Daftar & Ambil API Key"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 bg-[#111114] hover:bg-zinc-900 text-zinc-200 font-medium px-6 py-3.5 rounded-lg border border-zinc-800 text-sm transition"
              >
                <span>Baca Dokumentasi API</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* STICKY MOBILE CONVERSION BAR */}
      {!isLoggedIn && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#09090b]/95 backdrop-blur border-t border-zinc-800 px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-zinc-50 truncate">Gratis Saldo Uji Rp 2.500</div>
            <div className="text-[11px] text-zinc-400 truncate">337+ Model AI · QRIS Rp 10rb</div>
          </div>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shrink-0 transition"
          >
            Daftar 30 Detik
          </Link>
        </div>
      )}
    </div>
  );
}
