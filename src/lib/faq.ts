import { BRAND } from "./brand";

export interface FaqItem {
  question: string;
  answer: string;
}

export const HOME_FAQS: FaqItem[] = [
  {
    question: `Bagaimana cara membeli API Key OpenAI, Claude, dan DeepSeek tanpa kartu kredit di ${BRAND.fullName}?`,
    answer: `Daftar akun gratis di ${BRAND.fullName}, lalu masuk ke menu Top Up QRIS. Anda bisa mengisi saldo mulai Rp 10.000 menggunakan m-Banking Indonesia apa saja (BCA, Mandiri, BRI, BNI, Jago, SeaBank) atau e-Wallet (GoPay, OVO, DANA, ShopeePay). Setelah pembayaran terverifikasi, satu API key Anda langsung bisa memanggil seluruh model AI.`,
  },
  {
    question: "Apakah API key ini bisa langsung dipakai di Cursor IDE, VS Code Cline, dan n8n?",
    answer: `Ya. Endpoint ${BRAND.fullName} menggunakan standar OpenAI v1 (/api/v1/chat/completions). Cukup tempel Base URL dan API key sk-live-... Anda di pengaturan Cursor IDE, ekstensi VS Code Cline / Roo Code, n8n, LangChain, NextChat, maupun SDK resmi OpenAI di Python dan Node.js.`,
  },
  {
    question: "Berapa minimal top up dan apakah saldo bisa kedaluwarsa?",
    answer:
      "Minimal top up hanya Rp 10.000. Berbeda dengan langganan bulanan atau provider luar negeri, saldo di akun Anda aktif selamanya tanpa masa hangus dan hanya terpotong sesuai token yang benar-benar dipakai.",
  },
  {
    question: "Apakah ada bonus saldo untuk top up nominal lebih besar?",
    answer:
      "Ya. Top up mulai Rp 100.000 mendapatkan bonus saldo +3%, Rp 250.000 mendapatkan bonus +4%, dan Rp 500.000 ke atas mendapatkan bonus +5% secara otomatis saat transaksi disetujui.",
  },
  {
    question: "Model AI apa saja yang sudah tersedia dengan satu API key?",
    answer:
      "Saat ini tersedia 14+ model unggulan termasuk Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku, DeepSeek R1 (deepseek-reasoner), DeepSeek V3, OpenAI o3-mini, o1, GPT-4o, GPT-4o Mini, Gemini 2.5 Pro, Gemini 2.5 Flash, Qwen 2.5 Coder 32B, Mistral Codestral 2501, dan Llama 3.3 70B.",
  },
  {
    question: "Berapa biaya rata-rata penggunaan API per bulan dibanding langganan ChatGPT Plus atau Claude Pro?",
    answer:
      "Jika pemakaian Anda sekitar 250.000 token per bulan menggunakan model efisien seperti GPT-4o Mini, DeepSeek V3, atau Gemini 2.5 Flash, estimasi biayanya hanya beberapa ribu hingga puluhan ribu Rupiah per bulan — jauh lebih hemat dibanding langganan tetap ~Rp 350.000/bulan.",
  },
];
