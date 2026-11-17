import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from "@/lib/pricing";

export async function GET() {
  const models = Object.values(AVAILABLE_MODELS).map((m) => ({
    id: m.id,
    object: "model",
    created: Math.floor(Date.now() / 1000),
    owned_by: m.provider.toLowerCase(),
    permission: [],
    root: m.id,
    parent: null,
  }));

  return NextResponse.json({
    object: "list",
    data: models,
  });
}
