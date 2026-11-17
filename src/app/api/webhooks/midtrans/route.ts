import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const notification = await req.json();

    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Verifikasi Signature Key Midtrans (SHA512(order_id + status_code + gross_amount + ServerKey))
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (serverKey && !serverKey.includes("demo-key")) {
      const hash = crypto
        .createHash("sha512")
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest("hex");

      if (hash !== signatureKey) {
        return NextResponse.json({ error: "Invalid signature key" }, { status: 403 });
      }
    }

    const transaction = await prisma.transaction.findUnique({
      where: { orderId },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Jika sudah pernah diproses, lewati
    if (transaction.status === "PAID") {
      return NextResponse.json({ status: "already_paid" });
    }

    let isSuccess = false;

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") isSuccess = true;
    } else if (transactionStatus === "settlement") {
      isSuccess = true;
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ status: "failed_updated" });
    }

    if (isSuccess) {
      // Tambah saldo user & tandai transaksi PAID secara atomic
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            paymentType: notification.payment_type || transaction.paymentType,
          },
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        }),
      ]);

      console.log(`✅ Saldo user ${transaction.user.email} bertambah Rp ${transaction.amount}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}

// Endpoint simulasi instan untuk testing saat belum pasang server key asli
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json({ error: "order_id required" }, { status: 400 });
  }

  const transaction = await prisma.transaction.findUnique({
    where: { orderId },
  });

  if (!transaction || transaction.status === "PAID") {
    return NextResponse.json({ message: "Transaksi tidak ditemukan atau sudah dibayar." });
  }

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "PAID", paidAt: new Date(), paymentType: "qris_simulated" },
    }),
    prisma.user.update({
      where: { id: transaction.userId },
      data: { balance: { increment: transaction.amount } },
    }),
  ]);

  return NextResponse.json({ success: true, message: `Saldo Rp ${transaction.amount} berhasil ditambahkan!` });
}
