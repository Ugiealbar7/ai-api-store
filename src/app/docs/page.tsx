import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PublicDocsClient from "@/components/PublicDocsClient";
import { BRAND } from "@/lib/brand";
import { getLiveDisplayModels } from "@/lib/openrouter-catalog";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Dokumentasi API — Cara Pakai Gemini 4 Hydrogen, GPT-6.2 Astra & Claude Opus 5.5",
  description:
    "Panduan lengkap cara memakai API Key Aksara API di Cursor IDE, VS Code Cline, n8n, Python SDK, dan Node.js untuk 330+ model AI terbaru tanpa kartu kredit.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: `Dokumentasi Integrasi API | ${BRAND.fullName}`,
    description:
      "Kompatibel 100% dengan OpenAI v1 SDK. Cukup ganti Base URL dan API Key untuk memanggil 330+ model AI terbaru.",
    url: `${BRAND.siteUrl}/docs`,
  },
};

export default async function PublicDocsPage() {
  const models = await getLiveDisplayModels();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <header className="space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block">
            DOKUMENTASI PUBLIK • OPENAI V1 STANDARD
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-50 tracking-tight">
            Panduan Integrasi {BRAND.fullName}
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Seluruh endpoint {BRAND.fullName} mengikuti spesifikasi resmi{" "}
            <code className="text-zinc-200">/v1/chat/completions</code> dan{" "}
            <code className="text-zinc-200">/v1/models</code> dengan sinkronisasi otomatis ke {models.length}+ model terbaru.
          </p>
        </header>

        <PublicDocsClient models={models} />
      </main>

      <Footer />
    </div>
  );
}
