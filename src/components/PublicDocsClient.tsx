"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Search } from "lucide-react";
import { BRAND } from "@/lib/brand";
import type { ModelPricing } from "@/lib/pricing";

type DisplayModel = ModelPricing & {
  displayInputPrice: string;
  displayOutputPrice: string;
};

export default function PublicDocsClient({ models }: { models: DisplayModel[] }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState(`${BRAND.siteUrl}/api/v1`);
  const [modelSearch, setModelSearch] = useState("");
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiBaseUrl(`${window.location.origin}/api/v1`);
    }
  }, []);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const copyBaseUrl = () => {
    navigator.clipboard.writeText(apiBaseUrl);
    setCopiedBaseUrl(true);
    setTimeout(() => setCopiedBaseUrl(false), 1800);
  };

  const filteredModels = useMemo(() => {
    const q = modelSearch.trim().toLowerCase();
    if (!q) return models;
    return models.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q)
    );
  }, [models, modelSearch]);

  const visibleModels = filteredModels.slice(0, limit);

  const snippets = [
    {
      title: "1. Cursor IDE & VS Code Cline / Roo Code",
      desc: "Buka Settings → Models → pilih OpenAI Compatible / Override OpenAI Base URL:",
      code: `Base URL:  ${apiBaseUrl}
API Key:   sk-live-xxxxxxxxxxxxxxxxxxxx
Model ID:  google/gemini-4-hydrogen (atau openai/gpt-6.2-astra, anthropic/claude-opus-5.5)`,
    },
    {
      title: "2. Python (OpenAI SDK Resmi)",
      desc: "Install paket resmi pip install openai lalu arahkan base_url ke gateway:",
      code: `from openai import OpenAI

client = OpenAI(
    base_url="${apiBaseUrl}",
    api_key="sk-live-xxxxxxxxxxxxxxxxxxxx"
)

response = client.chat.completions.create(
    model="google/gemini-4-hydrogen",
    messages=[{"role": "user", "content": "Jelaskan clean architecture dalam 3 poin."}],
    stream=True
)

for chunk in response:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`,
    },
    {
      title: "3. Node.js / TypeScript (OpenAI SDK)",
      desc: "Cocok untuk Next.js, Express, bot WhatsApp/Telegram, dan backend Node:",
      code: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${apiBaseUrl}",
  apiKey: "sk-live-xxxxxxxxxxxxxxxxxxxx",
});

const completion = await client.chat.completions.create({
  model: "openai/gpt-6.2-astra",
  messages: [{ role: "user", content: "Buatkan validasi Zod untuk form register." }],
});

console.log(completion.choices[0].message.content);`,
    },
    {
      title: "4. n8n AI Agent / Workflow Automation",
      desc: "Pada node OpenAI Chat Model atau HTTP Request di n8n, gunakan kredensial OpenAI API dengan Base URL kustom:",
      code: `Credential Type: OpenAI API
Base URL:        ${apiBaseUrl}
API Key:         sk-live-xxxxxxxxxxxxxxxxxxxx
Model:           deepseek/deepseek-v4.1-flash (atau anthropic/claude-opus-5.5)`,
    },
    {
      title: "5. OpenClaw & Hermes Agent (AI Agent CLI)",
      desc: "Mendukung endpoint OpenAI Chat Completions & Tool Calling untuk agent otonom (konteks 1M token):",
      code: `# --- OpenClaw (CLI) ---
openclaw onboard --auth-choice custom-api-key \\
  --custom-provider-id aksara-api \\
  --custom-compatibility openai \\
  --custom-base-url "${apiBaseUrl}" \\
  --custom-api-key "sk-live-xxxxxxxxxxxxxxxxxxxx" \\
  --custom-model-id "google/gemini-4-hydrogen"

# --- Hermes Agent (~/.hermes/config.yaml) ---
model:
  default: google/gemini-4-hydrogen
  provider: custom
providers:
  custom:
    base_url: ${apiBaseUrl}
    api_key: sk-live-xxxxxxxxxxxxxxxxxxxx`,
    },
    {
      title: "6. Anthropic Messages (/v1/messages) & Claude Code CLI",
      desc: "Endpoint native Anthropic tersedia untuk SDK Anthropic maupun Claude Code CLI:",
      code: `export ANTHROPIC_BASE_URL="${apiBaseUrl.replace(/\/api\/v1$/, "")}/api"
export ANTHROPIC_API_KEY="sk-live-xxxxxxxxxxxxxxxxxxxx"

# Atau panggil langsung POST ${apiBaseUrl}/messages
curl ${apiBaseUrl}/messages \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk-live-xxxxxxxxxxxxxxxxxxxx" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "anthropic/claude-opus-5.5",
    "max_tokens": 512,
    "messages": [{"role": "user", "content": "Halo Claude!"}]
  }'`,
    },
    {
      title: "7. cURL / Terminal Shell (OpenAI Chat & Responses)",
      desc: "Uji cepat endpoint langsung dari terminal (/chat/completions maupun /responses):",
      code: `curl ${apiBaseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-live-xxxxxxxxxxxxxxxxxxxx" \\
  -d '{
    "model": "anthropic/claude-opus-5.5",
    "messages": [{"role": "user", "content": "Halo!"}]
  }'`,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Base URL Strip */}
      <div className="surface-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-emerald-500/30">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
            Universal Base URL (OpenAI v1 Compatible)
          </span>
          <code className="text-sm sm:text-base font-mono text-emerald-400 font-semibold break-all">
            {apiBaseUrl}
          </code>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyBaseUrl}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-semibold transition"
          >
            {copiedBaseUrl ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Salin Base URL</span>
              </>
            )}
          </button>
          <Link
            href="/register"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition"
          >
            <span>Ambil API Key</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Snippets */}
      <section className="space-y-5">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-50">
          Panduan Integrasi Berdasarkan Platform
        </h2>

        <div className="space-y-5">
          {snippets.map((item, idx) => (
            <div key={idx} className="surface-card rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 bg-[#141418] border-b border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleCopy(item.code, idx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 transition shrink-0"
                >
                  {copiedIndex === idx ? (
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
              <pre className="p-5 bg-[#0c0c0f] text-xs text-zinc-300 font-mono overflow-x-auto leading-relaxed">
                <code>{item.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Endpoints & Models Reference */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-50">
            Referensi Model ID ({models.length}+ Live)
          </h2>
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => {
                setModelSearch(e.target.value);
                setLimit(25);
              }}
              placeholder="Cari Model ID..."
              className="w-full sm:w-64 pl-8 pr-3 py-2 rounded-lg bg-[#111114] border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>

        <div className="surface-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#141418] border-b border-zinc-800 text-zinc-400">
                  <th className="p-3.5">Model ID</th>
                  <th className="p-3.5">Nama</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Input / 1K</th>
                  <th className="p-3.5">Output / 1K</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {visibleModels.map((m) => (
                  <tr key={m.id} className="hover:bg-[#15151a]">
                    <td className="p-3.5 font-mono text-emerald-400 font-semibold">{m.id}</td>
                    <td className="p-3.5 text-zinc-100 font-medium">{m.name}</td>
                    <td className="p-3.5 text-zinc-400">{m.provider}</td>
                    <td className="p-3.5 font-mono text-zinc-300 tabular-nums">
                      {m.displayInputPrice.split("/")[0]}
                    </td>
                    <td className="p-3.5 font-mono text-zinc-300 tabular-nums">
                      {m.displayOutputPrice.split("/")[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredModels.length > limit && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setLimit((prev) => prev + 50)}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition"
            >
              Tampilkan Lebih Banyak ({filteredModels.length - limit} lagi)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
