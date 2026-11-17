import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createMidtransTransaction } from "@/lib/midtrans";
import crypto from "crypto";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount } = await req.json();
    const nominal = Number(amount);

    if (!nominal || nominal < 10000) {
      return NextResponse.json({ error: "Minimal top up adalah Rp 10.000." }, { status: 400 });
    }

    const orderId = `TOPUP-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // Buat transaksi di database
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        orderId,
        amount: nominal,
        status: "PENDING",
        paymentType: "qris",
      },
    });

    // Panggil Midtrans Snap
    const payment = await createMidtransTransaction({
      orderId,
      amount: nominal,
      userEmail: user.email,
      userName: user.name,
    });

    if (payment.redirectUrl) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          paymentUrl: payment.redirectUrl,
          snapToken: payment.token,
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: nominal,
      redirectUrl: payment.redirectUrl,
      snapToken: payment.token,
      isSimulated: payment.isSimulated,
    });
  } catch (error: any) {
    console.error("Topup Charge error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat tagihan pembayaran." }, { status: 500 });
  }
}
