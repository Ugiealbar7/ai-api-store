import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from "@/lib/pricing";

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
  const models = Object.values(AVAILABLE_MODELS).map((m) => ({
    id: m.id,
    object: "model",
    created: 1700000000,
    owned_by: m.provider.toLowerCase(),
    permission: [],
    root: m.id,
    parent: null,
  }));

  return NextResponse.json(
    {
      object: "list",
      data: models,
    },
    { headers: corsHeaders }
  );
}
