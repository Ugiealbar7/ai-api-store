import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
