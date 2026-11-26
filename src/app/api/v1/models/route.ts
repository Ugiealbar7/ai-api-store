import { NextResponse } from "next/server";
import { getLiveModelsCatalog } from "@/lib/openrouter-catalog";
import { USD_TO_IDR } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  const liveCatalog = await getLiveModelsCatalog();

  const models = liveCatalog.map((m) => {
    const inputPer1kIdr = (m.inputCostPer1MUsd / 1000) * USD_TO_IDR * m.markupMultiplier;
    const outputPer1kIdr = (m.outputCostPer1MUsd / 1000) * USD_TO_IDR * m.markupMultiplier;
    return {
      id: m.id,
      object: "model",
      created: m.created || 1700000000,
      owned_by: m.provider.toLowerCase(),
      name: m.name,
      provider: m.provider,
      category: m.category,
      context_window: m.contextWindow,
      featured: Boolean(m.featured),
      display_input_idr_1k: `Rp ${inputPer1kIdr.toFixed(2)}`,
      display_output_idr_1k: `Rp ${outputPer1kIdr.toFixed(2)}`,
      permission: [],
      root: m.id,
      parent: null,
    };
  });

  return NextResponse.json(
    {
      object: "list",
      data: models,
    },
    { headers: corsHeaders }
  );
}
