import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: `Kebijakan perlindungan data pengguna, API key, dan log pemakaian di ${BRAND.fullName}.`,
  alternates: { canonical: "/privasi" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <header className="space-y-2 border-b border-zinc-800 pb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block">
            PRIVASI DATA
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight">Kebijakan Privasi</h1>
          <p className="text-xs text-zinc-500 font-mono">Terakhir diperbarui: November 2026</p>
        </header>

        <section className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">1. Data yang Kami Simpan</h2>
            <p className="text-zinc-400">
              Kami menyimpan informasi akun dasar (nama, email, hash password terenkripsi bcrypt), daftar API key, riwayat transaksi top up, serta metadata penggunaan token (nama model, waktu, jumlah prompt/completion token, dan biaya Rupiah) untuk keperluan penagihan.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">2. Kerahasiaan Isi Prompt</h2>
            <p className="text-zinc-400">
              {BRAND.fullName} <strong>tidak menyimpan isi teks prompt maupun respons AI Anda</strong> di tabel riwayat penggunaan database kami. Request diteruskan secara langsung melalui jalur terenkripsi HTTPS ke penyedia model upstream.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-zinc-100">3. Keamanan Kunci & Penghapusan Data</h2>
            <p className="text-zinc-400">
              Anda bertanggung jawab menjaga kerahasiaan API key (`sk-live-...`) milik Anda. Anda dapat menonaktifkan atau menghapus API key kapan saja melalui halaman Kelola API Key di dashboard.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
