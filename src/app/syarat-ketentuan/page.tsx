import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan Layanan",
  description: `Ketentuan penggunaan layanan API AI, kebijakan saldo, dan pembayaran QRIS di ${BRAND.fullName}.`,
  alternates: { canonical: "/syarat-ketentuan" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <header className="space-y-2 border-b border-zinc-800 pb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block">
            LEGAL & KEBIJAKAN
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="text-xs text-zinc-500 font-mono">Terakhir diperbarui: November 2026</p>
        </header>

        <section className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">1. Ruang Lingkup Layanan</h2>
            <p className="text-zinc-400">
              {BRAND.fullName} menyediakan layanan API gateway terpadu berbasis Rupiah untuk mengakses model kecerdasan buatan (LLM) dari penyedia upstream resmi melalui satu antarmuka kompatibel OpenAI & Anthropic.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">2. Saldo, Pembayaran QRIS & Masa Berlaku</h2>
            <p className="text-zinc-400">
              Minimal pengisian saldo adalah Rp 10.000 melalui QRIS merchant resmi ({BRAND.merchantName}). Saldo yang sudah terisi aktif selamanya tanpa masa hangus dan dipotong sesuai penggunaan aktual token per permintaan. Pembelian saldo bersifat final dan tidak dapat diuangkan kembali kecuali terjadi kegagalan sistem yang dapat diverifikasi.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">3. Penggunaan yang Dilarang</h2>
            <p className="text-zinc-400">
              Pengguna dilarang menyalahgunakan saldo uji coba dengan membuat akun duplikat massal, mengirim konten ilegal/penipuan/malware, maupun melakukan serangan spam atau bypass pembatasan keamanan sistem. Akun yang terbukti melanggar dapat dinonaktifkan sepihak.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">4. Ketersediaan & Dukungan</h2>
            <p className="text-zinc-400">
              Kami berupaya menjaga ketersediaan gateway setinggi mungkin, namun ketersediaan masing-masing model bergantung pula pada layanan upstream. Bantuan kendala top up atau akun dapat menghubungi Admin WhatsApp resmi melalui tautan pada halaman bantuan/footer.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
