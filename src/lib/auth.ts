import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-me-in-production-12345678"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: { userId: string; email: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      balance: true,
      createdAt: true,
    },
  });

  return user;
}

export async function validateApiKey(keyString: string) {
  if (!keyString || !keyString.startsWith("sk-")) return null;

  const apiKey = await prisma.apiKey.findUnique({
    where: { key: keyString },
    include: { user: true },
  });

  if (!apiKey || !apiKey.isActive) return null;
  return apiKey;
}
