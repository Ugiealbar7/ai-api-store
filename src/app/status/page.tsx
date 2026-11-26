import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { getLiveModelsCatalog } from "@/lib/openrouter-catalog";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Status Layanan & Ketersediaan Gateway",
  description: `Pantau status operasional real-time endpoint API, database, dan katalog model ${BRAND.fullName}.`,
  alternates: {
    canonical: "/status",
  },
};

export default async function StatusPage() {
  let dbOk = false;
  let dbLatencyMs = 0;
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
    dbLatencyMs = Date.now() - dbStart;
  } catch {
    dbOk = false;
    dbLatencyMs = Date.now() - dbStart;
  }

  const models = await getLiveModelsCatalog();
  const upstreamConfigured = Boolean(process.env.UPSTREAM_API_KEY);
  const allOk = dbOk && upstreamConfigured && models.length > 0;

  const checks = [
    {
      name: "OpenAI Compatible Chat Completions (/v1/chat/completions)",
      ok: upstreamConfigured,
      detail: upstreamConfigured ? "Operational" : "Upstream belum dikonfigurasi",
    },
    {
      name: "Anthropic Messages API (/v1/messages • Claude Code Ready)",
      ok: upstreamConfigured,
      detail: upstreamConfigured ? "Operational" : "Upstream belum dikonfigurasi",
    },
    {
      name: "OpenAI Responses API (/v1/responses • OpenClaw Ready)",
      ok: upstreamConfigured,
      detail: upstreamConfigured ? "Operational" : "Upstream belum dikonfigurasi",
    },
    {
      name: "Live Model Sync Engine (/v1/models)",
      ok: models.length > 0,
      detail: `${models.length} model aktif tersinkronisasi`,
    },
    {
      name: "Database & Billing Engine (PostgreSQL)",
      ok: dbOk,
      detail: dbOk ? `Connected (${dbLatencyMs} ms)` : "Gangguan koneksi database",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <header className="space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block">
            SYSTEM STATUS
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-50 tracking-tight">
            Status Operasional {BRAND.fullName}
          </h1>
        </header>

        <div
          className={`p-5 rounded-xl border flex items-center gap-3 ${
            allOk
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}
        >
          {allOk ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          )}
          <div className="text-sm font-semibold">
            {allOk
              ? "Seluruh sistem berjalan normal dan siap menerima request."
              : "Sebagian komponen mengalami gangguan."}
          </div>
        </div>

        <div className="surface-card rounded-xl divide-y divide-zinc-800/80">
          {checks.map((item, idx) => (
            <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-medium text-zinc-100">{item.name}</span>
              <span
                className={`text-xs font-mono font-semibold ${
                  item.ok ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {item.ok ? "● " : "✕ "}
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
