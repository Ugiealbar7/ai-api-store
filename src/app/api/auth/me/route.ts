import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateReferralCode } from "@/lib/settle-transaction";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  let referralCode = user.referralCode;
  if (!referralCode) {
    referralCode = generateReferralCode();
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode },
      });
    } catch {
      referralCode = generateReferralCode();
    }
  }

  const invitedCount = await prisma.user.count({
    where: { referredById: user.id },
  });

  return NextResponse.json({
    authenticated: true,
    user: {
      ...user,
      referralCode,
      invitedCount,
    },
  });
}
