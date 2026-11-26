import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PublicDocsClient from "@/components/PublicDocsClient";
import { BRAND } from "@/lib/brand";
import { getModelDisplayPrices } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Dokumentasi API — Cara Integrasi Cursor IDE, Cline, n8n, Python & Node.js",
  description:
    "Panduan lengkap cara memakai API Key Aksara API di Cursor IDE, VS Code Cline, Roo Code, n8n, Python OpenAI SDK, dan Node.js tanpa kartu kredit.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: `Dokumentasi Integrasi API | ${BRAND.fullName}`,
    description:
      "Kompatibel 100% dengan OpenAI v1 SDK. Cukup ganti Base URL dan API Key untuk memanggil 14+ model AI.",
    url: `${BRAND.siteUrl}/docs`,
  },
};

export default function PublicDocsPage() {
  const models = getModelDisplayPrices();

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
            <code className="text-zinc-200">/v1/models</code>, sehingga Anda tidak perlu menulis ulang kode yang sudah memakai SDK OpenAI.
          </p>
        </header>

        <PublicDocsClient models={models} />
      </main>

      <Footer />
    </div>
  );
}
