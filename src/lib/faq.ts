import { BRAND } from "./brand";

export interface FaqItem {
  question: string;
  answer: string;
}

export const HOME_FAQS: FaqItem[] = [
  {
    question: `Bagaimana cara membeli API Key Gemini 4 Hydrogen, GPT-6.2 Astra, dan Claude Opus 5.5 tanpa kartu kredit di ${BRAND.fullName}?`,
    answer: `Daftar akun gratis di ${BRAND.fullName}, lalu masuk ke menu Top Up QRIS. Anda bisa mengisi saldo mulai Rp 10.000 menggunakan m-Banking Indonesia apa saja (BCA, Mandiri, BRI, BNI, Jago, SeaBank) atau e-Wallet (GoPay, OVO, DANA, ShopeePay). Setelah pembayaran terverifikasi, satu API key Anda langsung bisa memanggil ratusan model AI terbaru.`,
  },
  {
    question: "Apakah model-model baru otomatis tersedia di gateway ini?",
    answer:
      "Ya. Katalog model Aksara API tersinkronisasi otomatis secara berkala dengan upstream OpenRouter, sehingga setiap peluncuran model baru seperti Google Gemini 4 Hydrogen/Neon, OpenAI GPT-6.2 Astra/Sol/Luna, Anthropic Claude Opus 5.5/Fable 5.2, DeepSeek V4.1, Qwen4 Max, hingga xAI Grok 4.7 langsung dapat Anda panggil tanpa menunggu update manual.",
  },
  {
    question: "Apakah API key ini bisa langsung dipakai di Cursor IDE, VS Code Cline, dan n8n?",
    answer: `Ya. Endpoint ${BRAND.fullName} menggunakan standar OpenAI v1 (/api/v1/chat/completions dan /api/v1/models). Cukup tempel Base URL dan API key sk-live-... Anda di pengaturan Cursor IDE, ekstensi VS Code Cline / Roo Code, n8n, LangChain, NextChat, maupun SDK resmi OpenAI di Python dan Node.js.`,
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
    question: "Bagaimana sistem penentuan tarif Rupiah untuk 330+ model AI?",
    answer:
      "Tarif dihitung transparan per 1.000 token berdasarkan harga resmi upstream dalam USD ditambah margin layanan yang kompetitif dan dikonversi ke Rupiah. Anda dapat memeriksa tarif setiap model di halaman Daftar Harga sebelum mengirim request.",
  },
];
