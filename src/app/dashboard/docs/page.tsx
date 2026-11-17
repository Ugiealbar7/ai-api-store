"use client";

import { useState, useEffect } from "react";
import { Terminal, Copy, Check, Code, Settings, Laptop, Sparkles, BookOpen } from "lucide-react";
import { getModelDisplayPrices } from "@/lib/pricing";

export default function DocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState("https://ai-api-store-iota.vercel.app/api/v1");
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
      title: "1. Pengaturan di Cursor IDE & VS Code Cline / Roo Code",
      desc: "Buka Settings di Cursor/Cline/Roo, pilih provider 'OpenAI' atau 'Custom OpenAI compatible':",
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
      desc: "Gunakan paket resmi npm i openai di Javascript/Typescript:",
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
      title: "4. cURL / Terminal Langsung (Shell)",
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
      title: "5. NextChat / LibreChat / Web Client UI",
      desc: "Gunakan di aplikasi ChatGPT clone apa pun:",
      code: `Model Provider:  OpenAI
API Endpoint:    ${apiBaseUrl}
API Key:         sk-live-xxxxxxxxxxxxxxxxxxxx
Custom Models:   gpt-4o, gpt-4o-mini, claude-3-7-sonnet, deepseek-reasoner, deepseek-chat, gemini-2.5-flash`,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>Panduan Integrasi API</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            OpenAI v1 Compatible
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Endpoint gateway Nusantara AI 100% kompatibel dengan spesifikasi OpenAI v1 API. Cukup ganti Base URL & API Key.
        </p>
      </div>

      {/* QUICK BASE URL CARD */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-indigo-950/20">
        <div>
          <span className="text-xs text-slate-400 block mb-0.5 font-medium">Universal Base URL:</span>
          <code className="text-sm sm:text-base font-mono text-indigo-300 font-semibold break-all">
            {apiBaseUrl}
          </code>
        </div>
        <button
          onClick={copyBaseUrl}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shrink-0 self-start sm:self-auto"
        >
          {copiedBaseUrl ? (
            <>
              <Check className="h-3.5 w-3.5 text-white" />
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

      {/* AVAILABLE MODELS TABLE IN DOCS */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-2">Model AI yang Tersedia & Tarif</h2>
        <p className="text-xs text-slate-400 mb-4">
          Gunakan ID model di bawah ini pada parameter <code className="text-indigo-300">model</code> di request Anda.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Model ID</th>
                <th className="pb-3">Nama Model</th>
                <th className="pb-3">Provider</th>
                <th className="pb-3">Input / 1K Token</th>
                <th className="pb-3">Output / 1K Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 font-mono">
                  <td className="py-2.5 font-bold text-indigo-300">{m.id}</td>
                  <td className="py-2.5 font-sans font-medium text-white">{m.name}</td>
                  <td className="py-2.5 font-sans text-slate-400">{m.provider}</td>
                  <td className="py-2.5 text-slate-300">{m.displayInputPrice.split("/")[0]}</td>
                  <td className="py-2.5 text-slate-300">{m.displayOutputPrice.split("/")[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CODE EXAMPLES */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-white">Contoh Kode Integrasi</h2>
        {codeSnippets.map((item, idx) => (
          <div key={idx} className="glass-panel rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => handleCopy(item.code, idx)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition shrink-0 ml-4"
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
            <pre className="p-5 text-xs text-slate-300 font-mono overflow-x-auto bg-[#0a0e18] leading-relaxed">
              {item.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
