import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const body = await req.json();

  const existing = await prisma.apiKey.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "API key tidak ditemukan." }, { status: 404 });
  }

  const updated = await prisma.apiKey.update({
    where: { id },
    data: {
      isActive: typeof body.isActive === "boolean" ? body.isActive : existing.isActive,
      name: body.name ? body.name.trim() : existing.name,
    },
  });

  return NextResponse.json({ success: true, key: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  const existing = await prisma.apiKey.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "API key tidak ditemukan." }, { status: 404 });
  }

  await prisma.apiKey.delete({ where: { id } });

  return NextResponse.json({ success: true, message: "API key berhasil dihapus." });
}
