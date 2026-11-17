import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ai-api-store-iota.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Nusantara AI — Gateway AI API Universal Tanpa Kartu Kredit",
  description:
    "Akses 14+ model AI terbaik dunia (Claude 3.7 Sonnet, DeepSeek R1, OpenAI o3-mini & GPT-4o, Gemini 2.5 Pro) dalam satu API Key standar OpenAI. Bayar instan via QRIS Rupiah.",
  keywords: [
    "AI API Store",
    "Jual API Key AI",
    "OpenAI API Indonesia",
    "Claude 3.7 Sonnet API",
    "Claude 3.5 Sonnet",
    "DeepSeek R1 API",
    "DeepSeek V3",
    "OpenAI o3-mini",
    "Gemini 2.5 Pro API",
    "API Key Tanpa Kartu Kredit",
    "Top Up QRIS AI",
    "Cursor IDE Indonesia",
    "Cline AI Gateway",
    "LLM Proxy Indonesia",
  ],
  authors: [{ name: "Nusantara AI Gateway" }],
  openGraph: {
    title: "Nusantara AI — Akses Semua AI Dunia Tanpa Kartu Kredit",
    description:
      "Satu API Key kompatibel OpenAI untuk Claude 3.7, DeepSeek R1, o3-mini, GPT-4o, dan Gemini. Top-up saldo mulai Rp 10.000 via QRIS.",
    url: siteUrl,
    siteName: "Nusantara AI Gateway",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nusantara AI — Gateway AI API Universal Indonesia",
    description:
      "Gunakan GPT-4o, Claude 3.7 Sonnet, DeepSeek R1, dan Gemini langsung di Cursor IDE atau Python. Bayar mudah via QRIS Rupiah.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark scroll-smooth">
      <body className="min-h-screen bg-[#040711] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
