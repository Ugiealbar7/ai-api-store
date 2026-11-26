import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { DISPOSABLE_EMAIL_DOMAINS, STARTER_TRIAL_BALANCE_IDR } from "@/lib/brand";
import crypto from "crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanName || !cleanEmail || !password) {
      return NextResponse.json({ error: "Nama, email, dan password wajib diisi." }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    const emailDomain = cleanEmail.split("@")[1] || "";
    if (DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        { error: "Mohon gunakan email permanen (Gmail, Outlook, atau email kantor/pribadi)." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        balance: STARTER_TRIAL_BALANCE_IDR,
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
      message: `Registrasi berhasil! Saldo uji coba Rp ${STARTER_TRIAL_BALANCE_IDR.toLocaleString("id-ID")} sudah aktif.`,
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
