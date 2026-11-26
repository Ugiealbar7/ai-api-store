"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { getModelDisplayPrices } from "@/lib/pricing";

export default function DashboardDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState(`${BRAND.siteUrl}/api/v1`);
  const models = getModelDisplayPrices();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setApiBaseUrl(`${window.location.origin}/api/v1`);
    }
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

  const codeSnippets = [
    {
      title: "1. Cursor IDE & VS Code Cline / Roo Code",
      desc: "Buka Settings di Cursor/Cline/Roo, pilih provider OpenAI / Custom OpenAI compatible:",
      code: `Base URL:  ${apiBaseUrl}
API Key:   sk-live-xxxxxxxxxxxxxxxxxxxx
Model:     deepseek-reasoner (atau gpt-4o, claude-3-7-sonnet)`,
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
    model="deepseek-reasoner",
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
    model: "gpt-4o-mini",
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
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "Halo dunia AI!"}
    ]
  }'`,
    },
    {
      title: "5. NextChat / LibreChat / n8n",
      desc: "Gunakan di aplikasi client AI atau workflow automation apa pun:",
      code: `Model Provider:  OpenAI
API Endpoint:    ${apiBaseUrl}
API Key:         sk-live-xxxxxxxxxxxxxxxxxxxx
Custom Models:   gpt-4o, gpt-4o-mini, claude-3-7-sonnet, deepseek-reasoner, deepseek-chat, gemini-2.5-flash`,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Panduan Integrasi API</h1>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-medium">
            OpenAI v1 Compatible
          </span>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Endpoint gateway {BRAND.fullName} 100% kompatibel dengan spesifikasi OpenAI v1 API. Cukup ganti Base URL & API Key.
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
        <h2 className="text-base font-bold text-zinc-100 mb-2">Model AI yang Tersedia & Tarif</h2>
        <p className="text-xs text-zinc-400 mb-4">
          Gunakan ID model di bawah ini pada parameter <code className="text-emerald-400">model</code> di request Anda.
        </p>

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
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-[#15151a] font-mono">
                  <td className="py-2.5 font-bold text-emerald-400">{m.id}</td>
                  <td className="py-2.5 font-sans font-medium text-zinc-100">{m.name}</td>
                  <td className="py-2.5 font-sans text-zinc-400">{m.provider}</td>
                  <td className="py-2.5 text-zinc-300 tabular-nums">{m.displayInputPrice.split("/")[0]}</td>
                  <td className="py-2.5 text-zinc-300 tabular-nums">{m.displayOutputPrice.split("/")[0]}</td>
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
