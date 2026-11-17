import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nama, email, dan password wajib diisi." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan login." }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Saldo gratis awal: Rp 10.000 untuk mencoba API
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        balance: 10000,
        apiKeys: {
          create: {
            name: "Default Key",
            key: `sk-live-${crypto.randomBytes(16).toString("hex")}`,
          },
        },
      },
    });

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({
      success: true,
      message: "Registrasi berhasil! Anda mendapatkan saldo awal Rp 10.000 gratis.",
      user: { id: user.id, name: user.name, email: user.email, balance: user.balance },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
