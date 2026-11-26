import nodemailer from "nodemailer";
import { BRAND } from "./brand";

export function isEmailConfigured(): boolean {
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  return hasResend || hasSmtp;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const from = process.env.EMAIL_FROM || `${BRAND.fullName} <onboarding@resend.dev>`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Resend HTTP ${res.status}: ${errBody}`);
    }
    return;
  }

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpUser && smtpPass) {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const from = process.env.EMAIL_FROM || `${BRAND.fullName} <${smtpUser}>`;
    await transporter.sendMail({ from, to, subject, html, text });
    return;
  }

  throw new Error("EMAIL_NOT_CONFIGURED");
}
