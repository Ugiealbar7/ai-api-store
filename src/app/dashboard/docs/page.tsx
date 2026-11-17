"use client";

import { useState } from "react";
import { Terminal, Copy, Check, Code, Settings, Laptop } from "lucide-react";

export default function DocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = [
    {
      title: "1. Pengaturan di Cursor IDE / VS Code Cline",
      desc: "Buka Settings di Cursor atau Cline, lalu masukkan konfigurasi OpenAI Custom:",
      code: `Base URL:  https://api.nusantara-ai.com/api/v1
API Key:   sk-live-xxxxxxxxxxxxxxxxxxxx
Model:     deepseek-reasoner (atau gpt-4o, claude-3-7-sonnet)`,
    },
    {
      title: "2. Python (OpenAI SDK Resmi)",
      desc: "Gunakan library standard openai di Python:",
      code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.nusantara-ai.com/api/v1",
    api_key="sk-live-xxxxxxxxxxxxxxxxxxxx"
)

response = client.chat.completions.create(
    model="claude-3-7-sonnet",
    messages=[
        {"role": "user", "content": "Tuliskan kode scraping web sederhana dengan Python."}
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`,
    },
    {
      title: "3. Node.js / TypeScript",
      desc: "Gunakan paket resmi openai di Javascript:",
      code: `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.nusantara-ai.com/api/v1",
  apiKey: "sk-live-xxxxxxxxxxxxxxxxxxxx",
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Halo, apa kabar?" }],
  });

  console.log(completion.choices[0].message.content);
}

main();`,
    },
    {
      title: "4. cURL / Terminal Langsung",
      desc: "Request langsung via shell terminal:",
      code: `curl https://api.nusantara-ai.com/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-live-xxxxxxxxxxxxxxxxxxxx" \\
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "Halo dunia!"}
    ]
  }'`,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Panduan Integrasi API</h1>
        <p className="text-sm text-slate-400 mt-1">
          Endpoint gateway Nusantara AI sepenuhnya kompatibel dengan spesifikasi OpenAI v1 API.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed">
        <strong>Endpoint API Gateway:</strong>{" "}
        <code className="font-mono bg-indigo-950/60 px-2 py-0.5 rounded text-indigo-200">
          https://api.nusantara-ai.com/api/v1
        </code>
      </div>

      <div className="space-y-6">
        {codeSnippets.map((item, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
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
