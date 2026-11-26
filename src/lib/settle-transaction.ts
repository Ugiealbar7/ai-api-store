import crypto from "crypto";
import { calculateTopupBonus } from "./brand";
import { prisma } from "./db";

export function generateReferralCode(): string {
  return `AKS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export interface SettlementResult {
  alreadyPaid: boolean;
  transaction: any;
  baseAmount: number;
  bonusPercent: number;
  bonusAmount: number;
  buyerWelcomeBonus: number;
  referrerCommission: number;
  totalCreditedToBuyer: number;
  newBuyerBalance: number;
}

/**
 * Menyelesaikan transaksi top-up yang sudah dibayar secara atomik:
 * - Menandai status PAID
 * - Menambah nominal + bonus berjenjang ke saldo pembeli
 * - Jika pembeli berasal dari referral & ini top-up PAID pertamanya,
 *   berikan +3% ekstra welcome bonus ke pembeli dan +5% komisi ke pengajak.
 */
export async function settlePaidTransaction(
  transactionId: string,
  overridePaymentType?: string
): Promise<SettlementResult> {
  return prisma.$transaction(async (db) => {
    const tx = await db.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!tx) {
      throw new Error("Transaksi tidak ditemukan.");
    }

    if (tx.status === "PAID") {
      return {
        alreadyPaid: true,
        transaction: tx,
        baseAmount: Math.floor(tx.amount / 1000) * 1000,
        bonusPercent: 0,
        bonusAmount: 0,
        buyerWelcomeBonus: 0,
        referrerCommission: 0,
        totalCreditedToBuyer: 0,
        newBuyerBalance: tx.user.balance,
      };
    }

    const { baseAmount, bonusPercent, bonusAmount } = calculateTopupBonus(tx.amount);

    let buyerWelcomeBonus = 0;
    let referrerCommission = 0;

    if (tx.user.referredById && tx.user.referredById !== tx.userId) {
      const priorPaidCount = await db.transaction.count({
        where: {
          userId: tx.userId,
          status: "PAID",
        },
      });

      if (priorPaidCount === 0) {
        const referrerExists = await db.user.findUnique({
          where: { id: tx.user.referredById },
          select: { id: true },
        });

        if (referrerExists) {
          buyerWelcomeBonus = Math.round(baseAmount * 0.03); // +3% ekstra pembeli pertama
          referrerCommission = Math.round(baseAmount * 0.05); // +5% komisi pengajak
        }
      }
    }

    const totalCreditedToBuyer = tx.amount + bonusAmount + buyerWelcomeBonus;

    const updatedTx = await db.transaction.update({
      where: { id: tx.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        ...(overridePaymentType ? { paymentType: overridePaymentType } : {}),
        ...(referrerCommission > 0 ? { referralBonusPaid: true } : {}),
      },
    });

    const updatedBuyer = await db.user.update({
      where: { id: tx.userId },
      data: {
        balance: { increment: totalCreditedToBuyer },
      },
    });

    if (referrerCommission > 0 && tx.user.referredById) {
      await db.user.update({
        where: { id: tx.user.referredById },
        data: {
          balance: { increment: referrerCommission },
          referralEarnings: { increment: referrerCommission },
        },
      });
    }

    return {
      alreadyPaid: false,
      transaction: updatedTx,
      baseAmount,
      bonusPercent,
      bonusAmount,
      buyerWelcomeBonus,
      referrerCommission,
      totalCreditedToBuyer,
      newBuyerBalance: updatedBuyer.balance,
    };
  });
}
