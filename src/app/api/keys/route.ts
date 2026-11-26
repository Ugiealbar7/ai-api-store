import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      key: true,
      isActive: true,
      totalSpent: true,
      spendingLimit: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });

  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const name = body.name?.trim() || "API Key Baru";
    const rawLimit = Number(body.spendingLimit);
    const spendingLimit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.round(rawLimit) : null;

    const key = `sk-live-${crypto.randomBytes(16).toString("hex")}`;

    const newKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name,
        key,
        spendingLimit,
      },
    });

    return NextResponse.json({ success: true, key: newKey });
  } catch (error: any) {
    console.error("Create API Key error:", error);
    return NextResponse.json({ error: "Gagal membuat API key." }, { status: 500 });
  }
}
