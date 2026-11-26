import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak. Khusus Admin." }, { status: 403 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
          },
        },
      },
    });

    const totalUsers = await prisma.user.count();
    const paidTransactions = transactions.filter((t) => t.status === "PAID");
    const totalRevenue = paidTransactions.reduce((acc, t) => acc + t.amount, 0);
    const pendingCount = transactions.filter(
      (t) => t.status === "PENDING" || t.status === "WAITING_CONFIRMATION"
    ).length;

    const midtransKey = process.env.MIDTRANS_SERVER_KEY || "";
    const automation = {
      qrisWebhookConfigured: Boolean(process.env.QRIS_WEBHOOK_SECRET),
      midtransConfigured:
        Boolean(midtransKey) &&
        !midtransKey.includes("demo-key") &&
        !midtransKey.includes("xxxxxxxx"),
      telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalRevenue,
        pendingCount,
      },
      automation,
      transactions,
    });
  } catch (error: any) {
    console.error("Admin Transactions error:", error);
    return NextResponse.json({ error: "Gagal mengambil data transaksi." }, { status: 500 });
  }
}
