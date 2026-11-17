import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
  } catch (error: any) {
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

    // Kode unik 3 digit acak (100 - 999) agar mudah dicocokkan saat mutasi rekening/merchant masuk
    const uniqueCode = Math.floor(100 + Math.random() * 899);
    const totalAmount = nominal + uniqueCode;

    const orderId = `TOPUP-${Date.now()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

    // Buat transaksi di database
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
      transactionId: transaction.id,
      orderId,
      baseAmount: nominal,
      uniqueCode,
      totalAmount,
      merchantName: "Aiugi, Service",
      nmid: "ID1026641373646",
      qrImageUrl: "/qris.jpg",
      createdAt: transaction.createdAt,
    });
  } catch (error: any) {
    console.error("Topup Charge error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat tagihan pembayaran." }, { status: 500 });
  }
}
