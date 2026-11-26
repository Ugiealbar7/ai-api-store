import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { BRAND } from "@/lib/brand";

export default function Footer() {
  const waUrl = `https://wa.me/${BRAND.adminWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Halo Admin ${BRAND.fullName}, saya ingin bertanya mengenai API key dan top up saldo QRIS.`
  )}`;

  return (
    <footer className="border-t border-zinc-800/80 bg-[#09090b] py-12 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-800/70">
          <div className="md:col-span-2 space-y-3">
            <BrandLogo href="/" size="sm" />
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Gerbang API AI terpadu untuk developer, mahasiswa, dan bisnis di Indonesia.
              Akses model OpenAI, Anthropic, DeepSeek, dan Google dengan pembayaran QRIS Rupiah.
            </p>
            <p className="text-[11px] font-mono text-zinc-500">
              Merchant Resmi: {BRAND.merchantName} • NMID {BRAND.nmid}
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Produk & Tarif
            </div>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link href="/#models" className="hover:text-zinc-100 transition">
                  Katalog 14+ Model AI
                </Link>
              </li>
              <li>
                <Link href="/harga" className="hover:text-zinc-100 transition">
                  Daftar Harga Token & Paket QRIS
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-zinc-100 transition">
                  Dokumentasi Integrasi API
                </Link>
              </li>
              <li>
                <Link href="/cursor-ide" className="hover:text-zinc-100 transition">
                  Panduan Cursor IDE & Cline
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Akun & Bantuan
            </div>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link href="/register" className="hover:text-zinc-100 transition">
                  Daftar Akun Baru
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-zinc-100 transition">
                  Masuk ke Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/topup" className="hover:text-zinc-100 transition">
                  Top Up Saldo QRIS
                </Link>
              </li>
              <li>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition"
                >
                  Hubungi Admin via WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <span>© {new Date().getFullYear()} {BRAND.fullName}. Semua hak dilindungi.</span>
          <span className="font-mono">OpenAI v1 Compatible • Pay-as-you-go IDR</span>
        </div>
      </div>
    </footer>
  );
}
