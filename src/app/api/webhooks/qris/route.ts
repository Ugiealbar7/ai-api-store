import { NextResponse } from "next/server";
import { settlePaidTransaction } from "@/lib/settle-transaction";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function safeCompareSecret(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Ekstrak semua kandidat nominal integer (IDR) dari teks notifikasi Android/Bank/Merchant QRIS.
 * Mendukung format: "Rp 50.437", "Rp50.437,00", "IDR 100,821", "50437", dll.
 */
function extractCandidateAmounts(rawText: string): number[] {
  const text = rawText.replace(/,\d{2}(?=\D|$)/g, ""); // hapus sen ",00" di akhir nominal Indonesia
  const results = new Set<number>();

  // Pola 1: Berawalan Rp / IDR atau berpemisah ribuan titik/koma
  const currencyRegex = /(?:rp|idr)?\s*([1-9]\d{0,2}(?:[.,]\d{3})+|[1-9]\d{3,8})/gi;
  let match: RegExpExecArray | null;
  while ((match = currencyRegex.exec(text)) !== null) {
    const digitsOnly = match[1].replace(/[.,]/g, "");
    const num = Number(digitsOnly);
    if (Number.isInteger(num) && num >= 10000 && num <= 50000000) {
      results.add(num);
    }
  }

  return Array.from(results);
}

function looksLikeOutgoingOrFailed(text: string): boolean {
  const lower = text.toLowerCase();
  const negativeSignals = [
    "pembayaran gagal",
    "transaksi gagal",
    "dibatalkan",
    "kadaluarsa",
    "saldo keluar",
    "transfer keluar",
    "tarik tunai",
    "debit ke",
  ];
  return negativeSignals.some((kw) => lower.includes(kw));
}

export async function POST(req: Request) {
  const expectedSecret = process.env.QRIS_WEBHOOK_SECRET || "";
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "QRIS_WEBHOOK_SECRET belum dikonfigurasi di environment server." },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  const providedSecret =
    req.headers.get("x-qris-secret")?.trim() ||
    bearerToken ||
    url.searchParams.get("secret")?.trim() ||
    "";

  if (!providedSecret || !safeCompareSecret(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized webhook secret." }, { status: 403 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let combinedText = "";
    let explicitAmount = 0;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      if (typeof body.amount === "number" && body.amount >= 10000) {
        explicitAmount = Math.round(body.amount);
      } else if (typeof body.amount === "string") {
        const parsed = Number(body.amount.replace(/[^0-9]/g, ""));
        if (parsed >= 10000) explicitAmount = parsed;
      }

      combinedText = [body.title, body.text, body.message, body.notification, body.body]
        .filter((v) => typeof v === "string" && v.trim().length > 0)
        .join(" ");
    } else {
      combinedText = await req.text();
    }

    if (!combinedText && explicitAmount <= 0) {
      return NextResponse.json({ error: "Payload notifikasi kosong." }, { status: 400 });
    }

    if (combinedText && looksLikeOutgoingOrFailed(combinedText)) {
      return NextResponse.json(
        { matched: false, skipped: true, reason: "Notifikasi bukan dana masuk berhasil." },
        { status: 200 }
      );
    }

    const candidates = explicitAmount > 0 ? [explicitAmount] : extractCandidateAmounts(combinedText);
    if (candidates.length === 0) {
      return NextResponse.json(
        { matched: false, reason: "Nominal top up valid (>= Rp 10.000) tidak ditemukan di teks." },
        { status: 200 }
      );
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const matches = await prisma.transaction.findMany({
      where: {
        status: { in: ["PENDING", "WAITING_CONFIRMATION"] },
        amount: { in: candidates },
        createdAt: { gte: since },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    if (matches.length === 0) {
      return NextResponse.json(
        {
          matched: false,
          candidates,
          reason: "Tidak ada tagihan PENDING/WAITING_CONFIRMATION yang cocok dengan nominal.",
        },
        { status: 200 }
      );
    }

    if (matches.length > 1) {
      return NextResponse.json(
        {
          matched: false,
          reason: "Lebih dari satu tagihan memiliki nominal identik; verifikasi manual diperlukan.",
        },
        { status: 409 }
      );
    }

    const tx = matches[0];
    const settled = await settlePaidTransaction(tx.id);

    return NextResponse.json({
      success: true,
      matched: true,
      orderId: tx.orderId,
      userEmail: tx.user.email,
      amountPaid: tx.amount,
      bonusPercent: settled.bonusPercent,
      bonusAmount: settled.bonusAmount,
      buyerWelcomeBonus: settled.buyerWelcomeBonus,
      referrerCommission: settled.referrerCommission,
      totalCredited: settled.totalCreditedToBuyer,
      newBalance: settled.newBuyerBalance,
    });
  } catch (error: any) {
    console.error("[QRIS Webhook Error]:", error);
    return NextResponse.json({ error: "Gagal memproses webhook QRIS." }, { status: 500 });
  }
}
