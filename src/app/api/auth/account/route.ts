import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request) {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const cleanName = typeof body.name === "string" ? body.name.trim() : "";
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    const dbUser = await prisma.user.findUnique({ where: { id: current.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    const updateData: { name?: string; password?: string } = {};

    if (cleanName && cleanName !== dbUser.name) {
      if (cleanName.length < 2) {
        return NextResponse.json({ error: "Nama minimal 2 karakter." }, { status: 400 });
      }
      updateData.name = cleanName;
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Masukkan password saat ini untuk mengganti password." },
          { status: 400 }
        );
      }
      const matches = await verifyPassword(currentPassword, dbUser.password);
      if (!matches) {
        return NextResponse.json({ error: "Password saat ini tidak cocok." }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
      }
      updateData.password = await hashPassword(newPassword);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan yang dikirim." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: dbUser.id },
      data: updateData,
      select: { id: true, name: true, email: true, balance: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: updateData.password ? "Password dan profil berhasil diperbarui." : "Profil diperbarui.",
      user: updated,
    });
  } catch (err: any) {
    console.error("Account update error:", err);
    return NextResponse.json({ error: "Gagal memperbarui akun." }, { status: 500 });
  }
}
