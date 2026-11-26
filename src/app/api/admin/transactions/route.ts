import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isEmailConfigured } from "@/lib/mailer";
import { resolveLiveModel } from "@/lib/openrouter-catalog";
import { USD_TO_IDR } from "@/lib/pricing";
import { prisma } from "@/lib/db";

interface UpstreamKeyMonitor {
  connected: boolean;
  label?: string;
  limitUsd?: number | null;
  limitRemainingUsd?: number | null;
  usageTotalUsd?: number;
  usageDailyUsd?: number;
  usageMonthlyUsd?: number;
  error?: string;
}

async function fetchOpenRouterKeyStats(): Promise<UpstreamKeyMonitor> {
  const upstreamBase = (process.env.UPSTREAM_BASE_URL || "https://openrouter.ai/api/v1").replace(
    /\/+$/,
    ""
  );
  const upstreamKey = process.env.UPSTREAM_API_KEY || "";

  if (!upstreamKey || !upstreamBase.includes("openrouter.ai")) {
    return {
      connected: false,
      error: "Upstream bukan OpenRouter atau UPSTREAM_API_KEY belum diset.",
    };
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/key", {
      headers: {
        Authorization: `Bearer ${upstreamKey}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        connected: false,
        error: `OpenRouter HTTP ${res.status}`,
      };
    }

    const json = await res.json();
    const d = json?.data;
    if (!d) {
      return { connected: false, error: "Format respons OpenRouter tidak dikenali." };
    }

    return {
      connected: true,
      label: d.label,
      limitUsd: d.limit ?? null,
      limitRemainingUsd: d.limit_remaining ?? null,
      usageTotalUsd: typeof d.usage === "number" ? d.usage : 0,
      usageDailyUsd: typeof d.usage_daily === "number" ? d.usage_daily : 0,
      usageMonthlyUsd: typeof d.usage_monthly === "number" ? d.usage_monthly : 0,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err?.message || "Gagal mengambil status kredit OpenRouter.",
    };
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak. Khusus Admin." }, { status: 403 });
  }

  try {
    const [transactions, totalUsers, balanceAgg, usageAgg, recentLogs, upstream] = await Promise.all([
      prisma.transaction.findMany({
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
      }),
      prisma.user.count(),
      prisma.user.aggregate({
        where: { balance: { gt: 0 } },
        _sum: { balance: true },
      }),
      prisma.usageLog.aggregate({
        _sum: { costIdr: true, totalTokens: true },
        _count: { id: true },
      }),
      prisma.usageLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          model: true,
          promptTokens: true,
          completionTokens: true,
          costIdr: true,
        },
      }),
      fetchOpenRouterKeyStats(),
    ]);

    const paidTransactions = transactions.filter((t) => t.status === "PAID");
    const totalRevenue = paidTransactions.reduce((acc, t) => acc + t.amount, 0);
    const pendingCount = transactions.filter(
      (t) => t.status === "PENDING" || t.status === "WAITING_CONFIRMATION"
    ).length;

    // Estimasi profit kotor dari 200 log pemakaian terakhir berdasarkan margin masing-masing model
    let sampleBilledIdr = 0;
    let sampleEstProfitIdr = 0;
    for (const log of recentLogs) {
      sampleBilledIdr += log.costIdr;
      const resolved = await resolveLiveModel(log.model);
      if (resolved.modelConfig) {
        const rawUsd =
          (log.promptTokens / 1_000_000) * resolved.modelConfig.inputCostPer1MUsd +
          (log.completionTokens / 1_000_000) * resolved.modelConfig.outputCostPer1MUsd;
        const rawIdr = rawUsd * USD_TO_IDR;
        sampleEstProfitIdr += Math.max(0, log.costIdr - rawIdr);
      } else {
        sampleEstProfitIdr += log.costIdr * 0.2;
      }
    }

    const avgMarginRatio = sampleBilledIdr > 0 ? sampleEstProfitIdr / sampleBilledIdr : 0.22;
    const totalBilledUsageIdr = Math.round(usageAgg._sum.costIdr || 0);
    const estimatedGrossProfitIdr = Math.round(totalBilledUsageIdr * avgMarginRatio);

    const midtransKey = process.env.MIDTRANS_SERVER_KEY || "";
    const automation = {
      qrisWebhookConfigured: Boolean(process.env.QRIS_WEBHOOK_SECRET),
      midtransConfigured:
        Boolean(midtransKey) &&
        !midtransKey.includes("demo-key") &&
        !midtransKey.includes("xxxxxxxx"),
      telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      emailResetConfigured: isEmailConfigured(),
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalRevenue,
        pendingCount,
        totalCustomerBalancesIdr: Math.round(balanceAgg._sum.balance || 0),
        totalBilledUsageIdr,
        estimatedGrossProfitIdr,
        totalApiRequests: usageAgg._count.id || 0,
        totalTokensServed: usageAgg._sum.totalTokens || 0,
      },
      upstream,
      automation,
      transactions,
    });
  } catch (error: any) {
    console.error("Admin Transactions error:", error);
    return NextResponse.json({ error: "Gagal mengambil data transaksi." }, { status: 500 });
  }
}
