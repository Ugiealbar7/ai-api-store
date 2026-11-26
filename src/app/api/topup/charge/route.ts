import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { BRAND, calculateTopupBonus } from "@/lib/brand";
import { createMidtransTransaction } from "@/lib/midtrans";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json({ success: true, transactions });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil riwayat transaksi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount } = await req.json();
    const nominal = Math.floor(Number(amount));

    if (!nominal || nominal < 10000) {
      return NextResponse.json({ error: "Minimal top up adalah Rp 10.000." }, { status: 400 });
    }

    const { bonusPercent, bonusAmount } = calculateTopupBonus(nominal);
    const orderId = `TOPUP-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

    // Jika Midtrans production/sandbox server key valid sudah terpasang, gunakan QRIS/Snap dinamis otomatis
    const midtransKey = process.env.MIDTRANS_SERVER_KEY || "";
    const isMidtransReady =
      Boolean(midtransKey) &&
      !midtransKey.includes("demo-key") &&
      !midtransKey.includes("xxxxxxxx");

    if (isMidtransReady) {
      const midtrans = await createMidtransTransaction({
        orderId,
        amount: nominal,
        userEmail: user.email,
        userName: user.name,
      });

      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          orderId,
          amount: nominal,
          status: "PENDING",
          paymentType: "midtrans_snap",
          paymentUrl: midtrans.redirectUrl || null,
          snapToken: midtrans.token || null,
        },
      });

      return NextResponse.json({
        success: true,
        mode: "midtrans",
        transactionId: transaction.id,
        orderId,
        baseAmount: nominal,
        uniqueCode: 0,
        totalAmount: nominal,
        bonusPercent,
        bonusAmount,
        totalCreditedAmount: nominal + bonusAmount,
        paymentUrl: midtrans.redirectUrl,
        snapToken: midtrans.token,
        merchantName: BRAND.merchantName,
        nmid: BRAND.nmid,
        qrImageUrl: "/qris.jpg",
        createdAt: transaction.createdAt,
      });
    }

    // Mode QRIS Merchant + Webhook Otomatis: pastikan kode unik 3 digit tidak tabrakan dalam 24 jam
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activePending = await prisma.transaction.findMany({
      where: {
        status: { in: ["PENDING", "WAITING_CONFIRMATION"] },
        createdAt: { gte: since },
      },
      select: { amount: true },
    });
    const usedAmounts = new Set(activePending.map((t) => Math.round(t.amount)));

    let uniqueCode = Math.floor(100 + Math.random() * 899);
    for (let attempt = 0; attempt < 40; attempt++) {
      const candidate = Math.floor(100 + Math.random() * 899);
      if (!usedAmounts.has(nominal + candidate)) {
        uniqueCode = candidate;
        break;
      }
    }
    // Fallback linear scan jika random kebetulan penuh
    if (usedAmounts.has(nominal + uniqueCode)) {
      for (let c = 100; c <= 999; c++) {
        if (!usedAmounts.has(nominal + c)) {
          uniqueCode = c;
          break;
        }
      }
    }

    const totalAmount = nominal + uniqueCode;

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        orderId,
        amount: totalAmount,
        status: "PENDING",
        paymentType: "qris_merchant",
        qrString: "/qris.jpg",
      },
    });

    return NextResponse.json({
      success: true,
      mode: "qris_merchant",
      transactionId: transaction.id,
      orderId,
      baseAmount: nominal,
      uniqueCode,
      totalAmount,
      bonusPercent,
      bonusAmount,
      totalCreditedAmount: totalAmount + bonusAmount,
      merchantName: BRAND.merchantName,
      nmid: BRAND.nmid,
      qrImageUrl: "/qris.jpg",
      createdAt: transaction.createdAt,
    });
  } catch (error: any) {
    console.error("Topup Charge error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat tagihan pembayaran." }, { status: 500 });
  }
}
