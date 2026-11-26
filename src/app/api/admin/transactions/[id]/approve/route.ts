import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { calculateTopupBonus } from "@/lib/brand";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak. Khusus Admin." }, { status: 403 });
  }

  const { id } = params;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    if (transaction.status === "PAID") {
      return NextResponse.json({ error: "Transaksi ini sudah disetujui sebelumnya." }, { status: 400 });
    }

    const { bonusAmount, bonusPercent } = calculateTopupBonus(transaction.amount);
    const totalCredited = transaction.amount + bonusAmount;

    const [updatedTx, updatedUser] = await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "PAID", paidAt: new Date() },
      }),
      prisma.user.update({
        where: { id: transaction.userId },
        data: { balance: { increment: totalCredited } },
      }),
    ]);

    const bonusText =
      bonusAmount > 0
        ? ` (+ bonus ${bonusPercent}% Rp ${bonusAmount.toLocaleString("id-ID")} = total Rp ${totalCredited.toLocaleString("id-ID")})`
        : "";

    return NextResponse.json({
      success: true,
      message: `Berhasil menyetujui transaksi! Saldo Rp ${transaction.amount.toLocaleString("id-ID")}${bonusText} telah ditambahkan ke ${transaction.user.email}.`,
      transaction: updatedTx,
      newBalance: updatedUser.balance,
    });
  } catch (error: any) {
    console.error("Approve transaction error:", error);
    return NextResponse.json({ error: error.message || "Gagal menyetujui transaksi." }, { status: 500 });
  }
}
