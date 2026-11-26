import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import { ArrowRight, CheckCircle2, QrCode, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "Cara Pakai API Key di OpenClaw & Hermes Agent Bayar QRIS Indonesia",
  description:
    "Panduan lengkap menghubungkan OpenClaw dan Nous Research Hermes Agent ke Gemini 4 Hydrogen, GPT-6.2 Astra, & Claude Opus 5.5 menggunakan pembayaran QRIS tanpa kartu kredit.",
  alternates: {
    canonical: "/openclaw-hermes",
  },
  openGraph: {
    title: `Panduan OpenClaw & Hermes Agent API Key QRIS | ${BRAND.fullName}`,
    description:
      "Satu API key untuk OpenClaw dan Hermes Agent (context 1M token). Top up via QRIS Rupiah mulai Rp 10.000.",
    url: `${BRAND.siteUrl}/openclaw-hermes`,
  },
};

export default function OpenClawHermesPage() {
  const apiBase = `${BRAND.siteUrl}/api/v1`;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <header className="space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block">
            PANDUAN AGEN AI • OPENCLAW & HERMES AGENT
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-50 tracking-tight leading-tight">
            Gunakan API Key {BRAND.fullName} di OpenClaw & Hermes Agent
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Jalankan agent otonom di <strong className="text-zinc-200">OpenClaw</strong> maupun{" "}
            <strong className="text-zinc-200">Hermes Agent (Nous Research)</strong> dengan akses 330+ model terbaru
            (Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5, DeepSeek V4.1) — bayar pakai QRIS dalam Rupiah tanpa kartu kredit USD.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold px-5 py-3 rounded-lg text-xs sm:text-sm transition"
            >
              <span>Daftar & Buat API Key</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/harga"
              className="inline-flex items-center gap-2 bg-[#111114] hover:bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium px-5 py-3 rounded-lg text-xs sm:text-sm transition"
            >
              <span>Lihat Tarif 330+ Model</span>
            </Link>
          </div>
        </header>

        {/* OPENCLAW */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-50">
            1. Setup OpenClaw (`models.json` atau CLI `onboard`)
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Pastikan tipe API diset ke <code className="text-emerald-400">openai-completions</code> dan arahkan{" "}
            <code className="text-zinc-200">baseUrl</code> ke <code className="text-emerald-400">{apiBase}</code> (atau{" "}
            <code className="text-emerald-400">{BRAND.siteUrl}/v1</code>).
          </p>

          <div className="surface-card rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-[#141418] border-b border-zinc-800 text-xs font-mono text-zinc-300">
              CLI Onboarding (Tercepat)
            </div>
            <pre className="p-4 bg-[#0c0c0f] text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
{`openclaw onboard --non-interactive --accept-risk \\
  --auth-choice custom-api-key \\
  --custom-provider-id aksara-api \\
  --custom-compatibility openai \\
  --custom-base-url "${apiBase}" \\
  --custom-api-key "sk-live-xxxxxxxxxxxxxxxxxxxx" \\
  --custom-model-id "google/gemini-4-hydrogen"`}
            </pre>
          </div>

          <div className="surface-card rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-[#141418] border-b border-zinc-800 text-xs font-mono text-zinc-300">
              ~/.openclaw/agents/&lt;agentId&gt;/agent/models.json
            </div>
            <pre className="p-4 bg-[#0c0c0f] text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
{`{
  "models": {
    "mode": "merge",
    "providers": {
      "aksara-api": {
        "baseUrl": "${apiBase}",
        "apiKey": "sk-live-xxxxxxxxxxxxxxxxxxxx",
        "api": "openai-completions",
        "models": [
          {
            "id": "google/gemini-4-hydrogen",
            "name": "Gemini 4 Hydrogen",
            "reasoning": true,
            "input": ["text"],
            "contextWindow": 1048576,
            "maxTokens": 16384
          },
          {
            "id": "anthropic/claude-opus-5.5",
            "name": "Claude Opus 5.5",
            "reasoning": true,
            "input": ["text"],
            "contextWindow": 1000000,
            "maxTokens": 16384
          }
        ]
      }
    }
  }
}`}
            </pre>
          </div>
        </section>

        {/* HERMES AGENT */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-50">
            2. Setup Hermes Agent (`hermes model` atau `config.yaml`)
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Hermes Agent membutuhkan model dengan context window minimal <strong>64.000 token</strong>. Model unggulan kami seperti{" "}
            <code className="text-emerald-400">google/gemini-4-hydrogen</code>,{" "}
            <code className="text-emerald-400">openai/gpt-6.2-astra</code>, dan{" "}
            <code className="text-emerald-400">deepseek/deepseek-v4.1-flash</code> mendukung konteks <strong>1 juta token</strong>.
          </p>

          <div className="surface-card rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-[#141418] border-b border-zinc-800 text-xs font-mono text-zinc-300">
              ~/.hermes/config.yaml
            </div>
            <pre className="p-4 bg-[#0c0c0f] text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
{`model:
  default: google/gemini-4-hydrogen
  provider: custom

providers:
  custom:
    base_url: ${apiBase}
    api_key: sk-live-xxxxxxxxxxxxxxxxxxxx`}
            </pre>
          </div>
        </section>

        <section className="surface-card rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Terminal className="h-4 w-4" />
              <span>MULTI-AGENT READY</span>
            </div>
            <h2 className="text-lg font-bold text-zinc-50">
              Mendukung Tool Calling, Streaming & Dual Base URL (`/api/v1` atau `/v1`)
            </h2>
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-zinc-300">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Top Up QRIS Mulai Rp 10.000
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Bonus Saldo hingga +5%
              </span>
            </div>
          </div>
          <Link
            href="/register?redirect=%2Fdashboard%2Ftopup%3Famount%3D100000"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-5 py-3 rounded-lg text-xs sm:text-sm transition shrink-0"
          >
            <QrCode className="h-4 w-4" />
            <span>Isi Saldo QRIS</span>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
