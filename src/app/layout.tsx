import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: `${BRAND.fullName} — 330+ Model AI API (Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5) Bayar QRIS`,
    template: `%s | ${BRAND.fullName}`,
  },
  description: BRAND.description,
  keywords: [
    "Aksara API",
    "Jual API Key AI Indonesia",
    "Gemini 4 Hydrogen API",
    "GPT-6.2 Astra API Indonesia",
    "GPT-6 Astra API",
    "Claude Opus 5.5 API",
    "Claude Fable 5.2 API",
    "Claude Sonnet 5.5 API",
    "DeepSeek V4.1 API Indonesia",
    "Grok 4.7 API",
    "OpenAI API Tanpa Kartu Kredit",
    "Beli API ChatGPT Pakai QRIS",
    "Cursor IDE API Key Indonesia",
    "VS Code Cline API Indonesia",
    "Alternatif OpenRouter QRIS",
    "Gateway LLM Indonesia",
    "Pay-as-you-go AI API Rupiah",
  ],
  authors: [{ name: BRAND.fullName, url: BRAND.siteUrl }],
  creator: BRAND.fullName,
  publisher: BRAND.fullName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${BRAND.fullName} — Akses 330+ Model AI Terbaru Pakai QRIS Rupiah`,
    description:
      "Satu API key kompatibel OpenAI untuk Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5, DeepSeek V4.1, & Grok 4.7. Tanpa kartu kredit, saldo aktif selamanya.",
    url: BRAND.siteUrl,
    siteName: BRAND.fullName,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.fullName} — Gateway 330+ Model AI Indonesia Bayar QRIS`,
    description:
      "Gunakan Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5, dan DeepSeek V4.1 di Cursor IDE, Cline, atau Python SDK. Bayar QRIS mulai Rp 10.000.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`dark scroll-smooth ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#09090b] text-zinc-50 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
