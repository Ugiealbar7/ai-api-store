import Navbar from "@/components/Navbar";
import { getModelDisplayPrices } from "@/lib/pricing";
import Link from "next/link";
import { Sparkles, Zap, ShieldCheck, QrCode, Terminal, CheckCircle2, ArrowRight } from "lucide-react";

export default function Home() {
  const models = getModelDisplayPrices();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ai-api-store-iota.vercel.app";

  return (
    <div className="min-h-screen bg-[#090d16]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 border-b border-slate-800/60">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-8 shadow-inner shadow-indigo-500/10">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Gratis Saldo Uji Coba Rp 10.000 untuk Pendaftar Baru</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Satu API Key untuk{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Semua Model AI
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Gunakan GPT-4o, Claude 3.7 Sonnet, DeepSeek R1, dan Gemini dalam satu endpoint standar OpenAI.
            Tanpa kartu kredit internasional — bayar instan via <strong>QRIS, GoPay, OVO, BCA, dan Transfer Bank</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition text-base"
            >
              <span>Dapatkan API Key Sekarang</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#pricing"
              className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-xl border border-slate-800 transition text-base"
            >
              Lihat Tarif Model
            </Link>
          </div>
        </div>
      </section>

      {/* CODE PREVIEW SECTION */}
      <section className="py-20 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">100% Kompatibel dengan SDK OpenAI</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Cukup ganti <code className="text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded">baseURL</code> dan langsung gunakan di Cursor, Cline, NextChat, Python, atau Node.js.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d1322] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0a0f1b] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-slate-500 ml-2 font-mono">cURL Contoh Request</span>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                OpenAI Standard Format
              </span>
            </div>
            <pre className="p-5 text-xs sm:text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed">
{`curl ${appUrl}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-live-xxxxxxxxxxxxxxxxxxxx" \\
  -d '{
    "model": "deepseek-reasoner",
    "messages": [
      {"role": "user", "content": "Jelaskan cara kerja quantum computing secara ringkas."}
    ],
    "stream": true
  }'`}
            </pre>
          </div>
        </div>
      </section>

      {/* MODEL CATALOG & PRICING */}
      <section id="pricing" className="py-24 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Katalog Model & Tarif Transparan</h2>
            <p className="text-slate-400">
              Biaya hanya dihitung per-token sesuai pemakaian nyata (Pay-as-you-go). Tidak ada biaya langganan bulanan tersembunyi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((m) => (
              <div
                key={m.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                      {m.provider}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{m.id}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition mb-2">
                    {m.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {m.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Input Token:</span>
                    <span className="font-mono text-slate-200 font-medium">{m.displayInputPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Output Token:</span>
                    <span className="font-mono text-slate-200 font-medium">{m.displayOutputPrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION / FEATURES */}
      <section className="py-24 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Mengapa Memilih Nusantara AI?</h2>
            <p className="text-slate-400">Solusi terbaik bagi developer, mahasiswa, dan bisnis di Indonesia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Bayar Instan QRIS & Rupiah</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tidak butuh kartu kredit berlogo Visa/Mastercard luar negeri. Top-up saldo mulai Rp 10.000 dengan QRIS dari BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, atau DANA.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Satu Akun Multi-Model</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tidak perlu membuat akun terpisah di OpenAI, Anthropic, Google, dan DeepSeek. Cukup kelola satu saldo untuk semua model favorit Anda.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Aman & Terpantau</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pantau setiap token dan rupiah yang terpotong melalui log riwayat pemakaian real-time. Buat dan cabut API key sesuka hati kapan saja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center text-xs text-slate-500">
        <p>© 2026 Nusantara AI Gateway. Seluruh hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}
