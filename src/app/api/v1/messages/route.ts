import { NextResponse } from "next/server";
import { gatewayCorsHeaders, handleGatewayProxy } from "@/lib/gateway-proxy";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: gatewayCorsHeaders,
  });
}

export async function POST(req: Request) {
  return handleGatewayProxy(req, "anthropic_messages");
}
