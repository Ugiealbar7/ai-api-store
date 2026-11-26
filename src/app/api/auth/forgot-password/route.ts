import { NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { isEmailConfigured, sendTransactionalEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          error:
            "Layanan pengiriman email otomatis (RESEND_API_KEY / Gmail SMTP) belum diaktifkan di server.",
        },
        { status: 503 }
      );
    }

    const { email } = await req.json();
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Masukkan alamat email yang valid." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" } },
    });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiry = new Date(Date.now() + 30 * 60 * 1000); // Berlaku 30 menit

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: tokenHash,
          resetTokenExpiry: expiry,
        },
      });

      const resetLink = `${BRAND.siteUrl}/reset-password?token=${rawToken}`;
      const html = `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #09090b; color: #fafafa; border-radius: 12px; border: 1px solid #27272a;">
          <h2 style="margin-top: 0; color: #fafafa;">Reset Password ${BRAND.fullName}</h2>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">
            Kami menerima permintaan untuk mengatur ulang password akun <strong>${user.email}</strong>.
            Klik tombol di bawah ini untuk membuat password baru (berlaku 30 menit):
          </p>
          <p style="margin: 24px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #10b981; color: #09090b; font-weight: 700; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-size: 14px;">
              Atur Ulang Password
            </a>
          </p>
          <p style="color: #71717a; font-size: 12px; word-break: break-all;">
            Atau salin tautan ini ke browser Anda:<br/>${resetLink}
          </p>
          <p style="color: #71717a; font-size: 12px; margin-top: 20px;">
            Jika Anda tidak merasa meminta reset password, abaikan saja email ini.
          </p>
        </div>
      `;
      const text = `Reset Password ${BRAND.fullName}\n\nBuka tautan berikut dalam 30 menit untuk mengganti password Anda:\n${resetLink}\n\nJika bukan Anda, abaikan email ini.`;

      await sendTransactionalEmail({
        to: user.email,
        subject: `Reset Password Akun ${BRAND.fullName}`,
        html,
        text,
      });
    }

    // Pesan generik agar tidak membocorkan apakah email terdaftar atau tidak
    return NextResponse.json({
      success: true,
      message:
        "Jika email terdaftar di sistem kami, tautan reset password sudah dikirim. Periksa kotak masuk atau folder spam Anda.",
    });
  } catch (err: any) {
    console.error("[Forgot Password Error]:", err);
    return NextResponse.json(
      { error: "Gagal mengirim email reset password. Coba lagi beberapa saat." },
      { status: 500 }
    );
  }
}
