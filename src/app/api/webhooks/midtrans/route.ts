import { NextResponse } from "next/server";
import { calculateTopupBonus } from "@/lib/brand";
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

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    // Verifikasi Signature Key Midtrans: SHA512(order_id + status_code + gross_amount + ServerKey)
    if (serverKey && !serverKey.includes("demo-key")) {
      const hash = crypto
        .createHash("sha512")
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest("hex");

      if (hash !== signatureKey) {
        console.warn(`[Midtrans Webhook] Invalid signature key for order: ${orderId}`);
        return NextResponse.json({ error: "Invalid signature key" }, { status: 403 });
      }
    } else if (process.env.NODE_ENV === "production" && (!serverKey || serverKey.includes("demo-key"))) {
      console.warn("[Midtrans Webhook] MIDTRANS_SERVER_KEY belum diatur di production.");
      return NextResponse.json({ error: "Gateway server key not configured" }, { status: 500 });
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
      const { bonusAmount } = calculateTopupBonus(transaction.amount);
      const totalCredited = transaction.amount + bonusAmount;

      // Tambah saldo user (+ bonus tier jika memenuhi syarat) & tandai transaksi PAID secara atomic
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
              increment: totalCredited,
            },
          },
        }),
      ]);

      console.log(
        `[Midtrans Webhook] Saldo user ${transaction.user.email} bertambah Rp ${totalCredited}`
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
