import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { prisma } from "@/lib/db";

async function notifyAdminChannels(text: string) {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHAT_ID;
  if (tgToken && tgChatId) {
    try {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: tgChatId, text }),
      });
    } catch {}
  }

  const webhookUrl = process.env.ADMIN_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, text }),
      });
    } catch {}
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID diperlukan." }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { orderId },
    });

    if (!transaction || transaction.userId !== user.id) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    if (transaction.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Transaksi sudah berhasil diverifikasi sebelumnya.",
        status: "PAID",
      });
    }

    const updated = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "WAITING_CONFIRMATION",
      },
    });

    // Kirim notifikasi instan jika Telegram / Webhook admin dikonfigurasi
    await notifyAdminChannels(
      `🔔 [${BRAND.fullName}] Konfirmasi Pembayaran QRIS!\nOrder: ${transaction.orderId}\nNominal: Rp ${transaction.amount.toLocaleString("id-ID")}\nEmail: ${user.email}\nApprove di: ${BRAND.siteUrl}/dashboard/admin`
    );

    return NextResponse.json({
      success: true,
      message: "Konfirmasi pembayaran diterima! Saldo akan masuk setelah diverifikasi admin.",
      transaction: updated,
    });
  } catch (error: any) {
    console.error("Topup Confirm error:", error);
    return NextResponse.json({ error: error.message || "Gagal konfirmasi pembayaran." }, { status: 500 });
  }
}
