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
    default: `${BRAND.fullName} — Gateway API AI Indonesia (Claude, GPT-4o, DeepSeek) Bayar QRIS`,
    template: `%s | ${BRAND.fullName}`,
  },
  description: BRAND.description,
  keywords: [
    "Aksara API",
    "API Key AI Indonesia",
    "OpenAI API Tanpa Kartu Kredit",
    "Beli API ChatGPT Pakai QRIS",
    "Claude 3.7 Sonnet API Indonesia",
    "DeepSeek R1 API Rupiah",
    "OpenAI o3-mini API",
    "Gemini 2.5 Pro API Indonesia",
    "Cursor IDE API Key Indonesia",
    "VS Code Cline API Indonesia",
    "Alternatif OpenRouter QRIS",
    "Gateway LLM Indonesia",
    "Pay-as-you-go AI API Rupiah",
    "Jual API Key OpenAI Murah",
  ],
  authors: [{ name: BRAND.fullName, url: BRAND.siteUrl }],
  creator: BRAND.fullName,
  publisher: BRAND.fullName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${BRAND.fullName} — Akses 14+ Model AI Dunia Pakai QRIS Rupiah`,
    description:
      "Satu API key kompatibel OpenAI untuk Claude 3.7 Sonnet, DeepSeek R1, o3-mini, GPT-4o, dan Gemini 2.5 Pro. Tanpa kartu kredit, saldo aktif selamanya.",
    url: BRAND.siteUrl,
    siteName: BRAND.fullName,
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.fullName} — Gateway API AI Indonesia Tanpa Kartu Kredit`,
    description:
      "Gunakan Claude 3.7, DeepSeek R1, GPT-4o, dan Gemini di Cursor IDE, Cline, atau Python SDK. Bayar mudah via QRIS mulai Rp 10.000.",
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
