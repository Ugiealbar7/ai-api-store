export const BRAND = {
  name: "Aksara",
  fullName: "Aksara API",
  shortTag: "API",
  tagline: "Gerbang API AI Indonesia — 330+ Model Terbaru Bayar QRIS",
  description:
    "Satu API key standar OpenAI untuk akses 330+ model AI terbaru termasuk Gemini 4 Hydrogen, GPT-6.2 Astra, Claude Opus 5.5, DeepSeek V4.1, dan Grok 4.7. Tanpa kartu kredit, bayar QRIS mulai Rp 10.000.",
  siteUrl: (process.env.NEXT_PUBLIC_APP_URL || "https://ai-api-store-iota.vercel.app").replace(/\/+$/, ""),
  merchantName: "Aiugi, Service",
  nmid: "ID1026641373646",
  adminWhatsapp: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "62895325852554",
} as const;

export const STARTER_TRIAL_BALANCE_IDR = 2500;

export interface TopupPackage {
  amount: number;
  label: string;
  bonusPercent: number;
  badge?: string;
  description: string;
  highlight?: boolean;
}

export const TOPUP_PACKAGES: TopupPackage[] = [
  {
    amount: 25000,
    label: "Starter",
    bonusPercent: 0,
    description: "Cocok untuk skrip Python, automasi n8n, dan proyek pribadi ringan.",
  },
  {
    amount: 100000,
    label: "Developer",
    bonusPercent: 3,
    badge: "PALING LARIS",
    highlight: true,
    description: "Ideal untuk pemakaian harian di Cursor IDE, Cline, Roo Code, atau chatbot aktif.",
  },
  {
    amount: 250000,
    label: "Pro Studio",
    bonusPercent: 4,
    description: "Untuk refactoring codebase besar dengan Claude 3.7 Sonnet & DeepSeek R1.",
  },
  {
    amount: 500000,
    label: "Tim & Bisnis",
    bonusPercent: 5,
    badge: "BONUS TERBESAR",
    description: "Skala produksi SaaS, agen AI multi-step, dan layanan pelanggan otomatis.",
  },
];

export const TOPUP_PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

/**
 * Menghitung bonus saldo berjenjang berdasarkan nominal dasar top-up (tidak termasuk kode unik 3 digit).
 */
export function calculateTopupBonus(amount: number): {
  baseAmount: number;
  bonusPercent: number;
  bonusAmount: number;
} {
  // Ekstrak kelipatan 1.000 agar kode unik 3 digit (100..999) tidak mempengaruhi tier
  const baseAmount = Math.floor(Math.max(0, amount) / 1000) * 1000;
  let bonusPercent = 0;

  if (baseAmount >= 500000) {
    bonusPercent = 5;
  } else if (baseAmount >= 250000) {
    bonusPercent = 4;
  } else if (baseAmount >= 100000) {
    bonusPercent = 3;
  }

  const bonusAmount = Math.round((baseAmount * bonusPercent) / 100);
  return { baseAmount, bonusPercent, bonusAmount };
}

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "guerrillamail.com",
  "guerrillamail.net",
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.fr",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "mohmal.com",
  "sharklasers.com",
]);
