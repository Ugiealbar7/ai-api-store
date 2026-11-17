import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
    const { amount, action } = await req.json(); // action: "add" | "set"
    const numericAmount = Number(amount);

    if (isNaN(numericAmount)) {
      return NextResponse.json({ error: "Nominal tidak valid." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    let updatedUser;
    if (action === "set") {
      updatedUser = await prisma.user.update({
        where: { id },
        data: { balance: Math.max(0, numericAmount) },
      });
    } else {
      updatedUser = await prisma.user.update({
        where: { id },
        data: { balance: { increment: numericAmount } },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Saldo ${targetUser.email} berhasil diperbarui menjadi Rp ${updatedUser.balance.toLocaleString("id-ID")}`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Adjust balance error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengubah saldo." }, { status: 500 });
  }
}
