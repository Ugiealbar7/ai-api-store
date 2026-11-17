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
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    if (transaction.status === "PAID") {
      return NextResponse.json({ error: "Transaksi yang sudah PAID tidak dapat dibatalkan." }, { status: 400 });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: { status: "FAILED" },
    });

    return NextResponse.json({
      success: true,
      message: "Transaksi telah ditolak.",
      transaction: updated,
    });
  } catch (error: any) {
    console.error("Reject transaction error:", error);
    return NextResponse.json({ error: error.message || "Gagal menolak transaksi." }, { status: 500 });
  }
}
