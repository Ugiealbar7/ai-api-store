import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nusantara AI API Gateway — Satu API Key untuk Semua Model AI",
  description: "Beli dan gunakan API Key AI (GPT-4o, Claude 3.7, DeepSeek R1, Gemini) dengan pembayaran instan QRIS dan Rupiah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
