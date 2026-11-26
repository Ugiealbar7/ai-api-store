import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import { resolveLiveModel } from "@/lib/openrouter-catalog";
import { USD_TO_IDR } from "@/lib/pricing";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export const revalidate = 3600;

interface PageProps {
  params: { slug: string[] };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const rawId = decodeURIComponent((params.slug || []).join("/"));
  const { modelConfig } = await resolveLiveModel(rawId);

  if (!modelConfig) {
    return { title: "Model AI Tidak Ditemukan" };
  }

  const input1k = (modelConfig.inputCostPer1MUsd / 1000) * USD_TO_IDR * modelConfig.markupMultiplier;
  const output1k = (modelConfig.outputCostPer1MUsd / 1000) * USD_TO_IDR * modelConfig.markupMultiplier;

  return {
    title: `API Key ${modelConfig.name} (${modelConfig.id}) Indonesia — Harga Rp ${input1k.toFixed(
      2
    )}/1K`,
    description: `Akses API ${modelConfig.name} oleh ${modelConfig.provider} (Context ${modelConfig.contextWindow}) tanpa kartu kredit. Tarif input Rp ${input1k.toFixed(
      2
    )} & output Rp ${output1k.toFixed(2)} per 1K token, bayar via QRIS Rupiah.`,
    alternates: {
      canonical: `/models/${modelConfig.id}`,
    },
    openGraph: {
      title: `API ${modelConfig.name} Indonesia | ${BRAND.fullName}`,
      description: `Panggil ${modelConfig.id} langsung lewat Python, Node.js, Cursor IDE, OpenClaw, atau Hermes Agent. Bayar QRIS mulai Rp 10.000.`,
      url: `${BRAND.siteUrl}/models/${modelConfig.id}`,
    },
  };
}

export default async function ModelDetailPage({ params }: PageProps) {
  const rawId = decodeURIComponent((params.slug || []).join("/"));
  const { modelConfig } = await resolveLiveModel(rawId);

  if (!modelConfig) {
    notFound();
  }

  const input1kIdr = (modelConfig.inputCostPer1MUsd / 1000) * USD_TO_IDR * modelConfig.markupMultiplier;
  const output1kIdr =
    (modelConfig.outputCostPer1MUsd / 1000) * USD_TO_IDR * modelConfig.markupMultiplier;
  const input1mIdr = Math.round(
    modelConfig.inputCostPer1MUsd * USD_TO_IDR * modelConfig.markupMultiplier
  );
  const output1mIdr = Math.round(
    modelConfig.outputCostPer1MUsd * USD_TO_IDR * modelConfig.markupMultiplier
  );

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `API Access ${modelConfig.name} (${modelConfig.id})`,
    description: modelConfig.description,
    brand: { "@type": "Brand", name: modelConfig.provider },
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: Math.max(10000, Math.round(output1mIdr)),
      availability: "https://schema.org/InStock",
      url: `${BRAND.siteUrl}/models/${modelConfig.id}`,
    },
  };

  const pythonSnippet = `from openai import OpenAI

client = OpenAI(
    base_url="${BRAND.siteUrl}/api/v1",
    api_key="sk-live-xxxxxxxxxxxxxxxxxxxx"
)

res = client.chat.completions.create(
    model="${modelConfig.id}",
    messages=[{"role": "user", "content": "Halo! Jelaskan kelebihan arsitektur ini."}],
    stream=True
)

for chunk in res:
    print(chunk.choices[0].delta.content or "", end="")`;

  const curlSnippet = `curl ${BRAND.siteUrl}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-live-xxxxxxxxxxxxxxxxxxxx" \\
  -d '{
    "model": "${modelConfig.id}",
    "messages": [{"role": "user", "content": "Halo!"}]
  }'`;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div>
          <Link
            href="/harga"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-100 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Daftar Harga Semua Model</span>
          </Link>
        </div>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded">
              {modelConfig.provider}
            </span>
            <span className="text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
              Context: {modelConfig.contextWindow}
            </span>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded uppercase">
              {modelConfig.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-50 tracking-tight">
            {modelConfig.name} API Indonesia
          </h1>
          <div className="text-sm font-mono text-emerald-400 break-all">{modelConfig.id}</div>
          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            {modelConfig.description}
          </p>
        </header>

        {/* PRICING GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-card rounded-xl p-5">
            <span className="text-[11px] font-mono text-zinc-400 block mb-1">Input / 1K Token</span>
            <div className="text-xl font-bold font-mono text-zinc-50 tabular-nums">
              Rp {input1kIdr.toFixed(2)}
            </div>
          </div>
          <div className="surface-card rounded-xl p-5">
            <span className="text-[11px] font-mono text-zinc-400 block mb-1">Output / 1K Token</span>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              Rp {output1kIdr.toFixed(2)}
            </div>
          </div>
          <div className="surface-card rounded-xl p-5">
            <span className="text-[11px] font-mono text-zinc-400 block mb-1">Est. 1 Juta Input</span>
            <div className="text-xl font-bold font-mono text-zinc-200 tabular-nums">
              Rp {input1mIdr.toLocaleString("id-ID")}
            </div>
          </div>
          <div className="surface-card rounded-xl p-5">
            <span className="text-[11px] font-mono text-zinc-400 block mb-1">Est. 1 Juta Output</span>
            <div className="text-xl font-bold font-mono text-zinc-200 tabular-nums">
              Rp {output1mIdr.toLocaleString("id-ID")}
            </div>
          </div>
        </section>

        {/* INTEGRATION EXAMPLES */}
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-zinc-50">
            Contoh Pemanggilan Model `{modelConfig.id}`
          </h2>

          <div className="surface-card rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-[#141418] border-b border-zinc-800 text-xs font-mono text-zinc-300">
              Python (OpenAI SDK)
            </div>
            <pre className="p-4 bg-[#0c0c0f] text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
              {pythonSnippet}
            </pre>
          </div>

          <div className="surface-card rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-[#141418] border-b border-zinc-800 text-xs font-mono text-zinc-300">
              cURL / Terminal
            </div>
            <pre className="p-4 bg-[#0c0c0f] text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
              {curlSnippet}
            </pre>
          </div>
        </section>

        <section className="surface-card rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-zinc-50">
              Pakai `{modelConfig.id}` Sekarang Tanpa Kartu Kredit
            </h2>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Bayar QRIS Rupiah mulai Rp 10.000
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Cursor, Cline, OpenClaw & Hermes Ready
              </span>
            </div>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold px-5 py-3 rounded-lg text-xs transition shrink-0"
          >
            <span>Ambil API Key</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
