import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { settlePaidTransaction } from "@/lib/settle-transaction";

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
    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    if (existing.status === "PAID") {
      return NextResponse.json({ error: "Transaksi ini sudah disetujui sebelumnya." }, { status: 400 });
    }

    const result = await settlePaidTransaction(id);

    const extraNotes: string[] = [];
    if (result.bonusAmount > 0) {
      extraNotes.push(
        `bonus tier +${result.bonusPercent}% Rp ${result.bonusAmount.toLocaleString("id-ID")}`
      );
    }
    if (result.buyerWelcomeBonus > 0) {
      extraNotes.push(
        `welcome bonus referral +Rp ${result.buyerWelcomeBonus.toLocaleString("id-ID")}`
      );
    }
    const bonusText =
      extraNotes.length > 0
        ? ` (+ ${extraNotes.join(", ")} = total Rp ${result.totalCreditedToBuyer.toLocaleString("id-ID")})`
        : "";

    return NextResponse.json({
      success: true,
      message: `Berhasil menyetujui transaksi! Saldo Rp ${existing.amount.toLocaleString(
        "id-ID"
      )}${bonusText} telah ditambahkan ke ${existing.user.email}.`,
      transaction: result.transaction,
      newBalance: result.newBuyerBalance,
      referrerCommission: result.referrerCommission,
    });
  } catch (error: any) {
    console.error("Approve transaction error:", error);
    return NextResponse.json({ error: error.message || "Gagal menyetujui transaksi." }, { status: 500 });
  }
}
