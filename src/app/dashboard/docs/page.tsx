"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Search } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { getModelDisplayPrices } from "@/lib/pricing";

export default function DashboardDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState(`${BRAND.siteUrl}/api/v1`);
  const [query, setQuery] = useState("");
  const [models, setModels] = useState<any[]>(getModelDisplayPrices());

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiBaseUrl(`${window.location.origin}/api/v1`);
    }

    fetch("/api/v1/models")
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d?.data) && d.data.length > 0) {
          setModels(
            d.data.map((m: any) => ({
              id: m.id,
              name: m.name || m.id,
              provider: m.provider || m.owned_by || "",
              displayInputPrice: m.display_input_idr_1k || "-",
              displayOutputPrice: m.display_output_idr_1k || "-",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyBaseUrl = () => {
    navigator.clipboard.writeText(apiBaseUrl);
    setCopiedBaseUrl(true);
    setTimeout(() => setCopiedBaseUrl(false), 2000);
  };

  const filteredModels = models
    .filter((m) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        m.id.toLowerCase().includes(q) ||
        (m.name || "").toLowerCase().includes(q) ||
        (m.provider || "").toLowerCase().includes(q)
      );
    })
    .slice(0, 40);

  const codeSnippets = [
    {
      title: "1. Cursor IDE & VS Code Cline / Roo Code",
      desc: "Buka Settings di Cursor/Cline/Roo, pilih provider OpenAI / Custom OpenAI compatible:",
      code: `Base URL:  ${apiBaseUrl}
API Key:   sk-live-xxxxxxxxxxxxxxxxxxxx
Model:     google/gemini-4-hydrogen (atau openai/gpt-6.2-astra, anthropic/claude-opus-5.5)`,
    },
    {
      title: "2. Python (OpenAI SDK Resmi)",
      desc: "Gunakan library resmi openai di Python (pip install openai):",
      code: `from openai import OpenAI

client = OpenAI(
    base_url="${apiBaseUrl}",
    api_key="sk-live-xxxxxxxxxxxxxxxxxxxx"
)

response = client.chat.completions.create(
    model="google/gemini-4-hydrogen",
    messages=[
        {"role": "user", "content": "Jelaskan prinsip clean code dalam 3 poin singkat."}
    ],
    stream=True
)

for chunk in response:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`,
    },
    {
      title: "3. Node.js & TypeScript (OpenAI SDK)",
      desc: "Gunakan paket resmi npm i openai di JavaScript/TypeScript:",
      code: `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "${apiBaseUrl}",
  apiKey: "sk-live-xxxxxxxxxxxxxxxxxxxx",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-6.2-astra",
    messages: [{ role: "user", content: "Halo! Bantu buatkan outline artikel teknologi." }],
  });

  console.log(completion.choices[0].message.content);
}

main();`,
    },
    {
      title: "4. cURL / Terminal Shell",
      desc: "Kirim request langsung melalui terminal cURL:",
      code: `curl ${apiBaseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-live-xxxxxxxxxxxxxxxxxxxx" \\
  -d '{
    "model": "anthropic/claude-opus-5.5",
    "messages": [
      {"role": "user", "content": "Halo dunia AI!"}
    ]
  }'`,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Panduan Integrasi API</h1>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-medium">
            {models.length}+ Model Live
          </span>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Endpoint gateway {BRAND.fullName} kompatibel penuh dengan OpenAI v1 API dan otomatis menyinkronkan model terbaru.
        </p>
      </div>

      {/* QUICK BASE URL CARD */}
      <div className="p-4 rounded-xl surface-card border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs text-zinc-400 block mb-0.5 font-medium">Universal Base URL:</span>
          <code className="text-sm sm:text-base font-mono text-emerald-400 font-semibold break-all">
            {apiBaseUrl}
          </code>
        </div>
        <button
          onClick={copyBaseUrl}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition shrink-0 self-start sm:self-auto"
        >
          {copiedBaseUrl ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Salin Base URL</span>
            </>
          )}
        </button>
      </div>

      {/* AVAILABLE MODELS TABLE */}
      <div className="surface-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-100">Model AI Tersedia ({models.length}+)</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cari ID model terbaru untuk dimasukkan ke parameter <code className="text-emerald-400">model</code>.
            </p>
          </div>
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari model..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0c0c0f] border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="pb-3">Model ID</th>
                <th className="pb-3">Nama Model</th>
                <th className="pb-3">Provider</th>
                <th className="pb-3">Input / 1K Token</th>
                <th className="pb-3">Output / 1K Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-zinc-300">
              {filteredModels.map((m) => (
                <tr key={m.id} className="hover:bg-[#15151a] font-mono">
                  <td className="py-2.5 font-bold text-emerald-400">{m.id}</td>
                  <td className="py-2.5 font-sans font-medium text-zinc-100">{m.name}</td>
                  <td className="py-2.5 font-sans text-zinc-400">{m.provider}</td>
                  <td className="py-2.5 text-zinc-300 tabular-nums">
                    {String(m.displayInputPrice).split("/")[0]}
                  </td>
                  <td className="py-2.5 text-zinc-300 tabular-nums">
                    {String(m.displayOutputPrice).split("/")[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CODE EXAMPLES */}
      <div className="space-y-5">
        <h2 className="text-base font-bold text-zinc-100">Contoh Kode Integrasi</h2>
        {codeSnippets.map((item, idx) => (
          <div key={idx} className="surface-card rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 bg-[#141418] border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => handleCopy(item.code, idx)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition shrink-0 ml-4"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs text-zinc-300 font-mono overflow-x-auto bg-[#0c0c0f] leading-relaxed">
              {item.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
