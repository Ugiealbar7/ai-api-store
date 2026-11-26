import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    const cleanToken = typeof token === "string" ? token.trim() : "";

    if (!cleanToken) {
      return NextResponse.json({ error: "Token reset password tidak ditemukan." }, { status: 400 });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(cleanToken).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Tautan reset password tidak valid atau sudah kedaluwarsa." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah! Silakan masuk menggunakan password baru Anda.",
    });
  } catch (err: any) {
    console.error("[Reset Password Error]:", err);
    return NextResponse.json({ error: "Gagal mengatur ulang password." }, { status: 500 });
  }
}
