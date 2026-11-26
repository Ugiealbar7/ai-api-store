import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected",
      upstreamConfigured: Boolean(process.env.UPSTREAM_API_KEY),
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Health Check] DB Error:", err?.message || err);
    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
