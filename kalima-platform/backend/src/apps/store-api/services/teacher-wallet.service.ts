import { BadRequestError, ForbiddenError, NotFoundError } from "../../../libs/errors";

export class TeacherWalletService {
  constructor(private readonly db: any) {}

  private transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    if (typeof this.db.$transaction === "function") return this.db.$transaction(callback, { isolationLevel: "Serializable" });
    return callback(this.db);
  }

  private number(value: any, label = "amount"): number {
    const numberValue = value && typeof value.toNumber === "function" ? value.toNumber() : Number(value ?? 0);
    if (!Number.isFinite(numberValue)) {
      throw new BadRequestError(`Invalid ${label}.`);
    }
    return numberValue;
  }

  async getWallet(teacherId: number) {
    return this.db.teacher_wallets.upsert({
      where: { teacher_id: teacherId },
      create: { teacher_id: teacherId, balance: 0 },
      update: {},
    });
  }

  async listLedger(teacherId: number) {
    return this.db.teacher_wallet_ledger.findMany({
      where: { teacher_id: teacherId },
      orderBy: { created_at: "desc" },
    });
  }

  async previewPurchase(input: {
    teacherId: number;
    purchaseTotal: number;
    requestedAmount: number;
    couponApplied?: boolean;
  }) {
    if (input.couponApplied) {
      throw new BadRequestError("Wallet credit cannot be stacked with coupons.");
    }
    const wallet = await this.db.teacher_wallets.findUnique({ where: { teacher_id: input.teacherId } });
    const balance = this.number(wallet?.balance, "wallet balance");
    const requested = this.number(input.requestedAmount, "wallet credit amount");
    const purchaseTotal = this.number(input.purchaseTotal, "purchase total");
    if (balance < 0) throw new BadRequestError("Invalid wallet balance.");
    if (purchaseTotal < 0) throw new BadRequestError("Invalid purchase total.");
    if (requested <= 0) throw new BadRequestError("Wallet credit amount must be greater than zero.");
    const walletCreditApplied = Math.min(balance, requested, purchaseTotal);
    return {
      balance,
      walletCreditApplied,
      finalTotal: purchaseTotal - walletCreditApplied,
      canApply: Boolean(wallet?.id) && walletCreditApplied > 0,
    };
  }

  async creditMilestone(input: {
    teacherId: number;
    amount: number;
    milestoneAchievementId: number;
    notes?: string | null;
  }) {
    const existingLedger = await this.db.teacher_wallet_ledger.findFirst({
      where: {
        teacher_id: input.teacherId,
        milestone_achievement_id: input.milestoneAchievementId,
        source: "milestone_reward",
        type: "credit",
      },
    });
    if (existingLedger) return { wallet: await this.getWallet(input.teacherId), ledger: existingLedger, alreadyCredited: true };

    const amount = this.number(input.amount, "wallet credit amount");
    if (amount <= 0) throw new BadRequestError("Wallet credit amount must be greater than zero.");
    const wallet = await this.db.teacher_wallets.upsert({
      where: { teacher_id: input.teacherId },
      create: { teacher_id: input.teacherId, balance: amount },
      update: { balance: { increment: amount } },
    });
    const balanceAfter = this.number(wallet.balance);
    const ledger = await this.db.teacher_wallet_ledger.create({
      data: {
        wallet_id: wallet.id,
        teacher_id: input.teacherId,
        type: "credit",
        source: "milestone_reward",
        amount,
        balance_after: balanceAfter,
        milestone_achievement_id: input.milestoneAchievementId,
        notes: input.notes ?? null,
      },
    });
    return { wallet, ledger };
  }

  async applyToPurchase(input: {
    teacherId: number;
    purchaseId: number;
    purchaseTotal: number;
    requestedAmount: number;
    couponApplied?: boolean;
  }) {
    if (input.couponApplied) {
      throw new BadRequestError("Wallet credit cannot be stacked with coupons.");
    }

    return this.transaction(async (tx) => {
      const purchase = await tx.e_booklet_purchases.findFirst({
        where: { id: input.purchaseId, teacher_id: input.teacherId },
      });
      if (!purchase) throw new NotFoundError("E-booklet purchase not found.");

      const existingDebit = await tx.teacher_wallet_ledger.findFirst({
        where: {
          teacher_id: input.teacherId,
          e_booklet_purchase_id: input.purchaseId,
          type: "debit",
          source: "order_spend",
        },
      });
      if (existingDebit) {
        const alreadyApplied = Math.abs(this.number(existingDebit.amount));
        const structuredFinalTotal = purchase.final_payable_price === null || purchase.final_payable_price === undefined
          ? Math.max(0, this.number(purchase.price) - alreadyApplied)
          : this.number(purchase.final_payable_price, "final payable price");
        return {
          purchase,
          walletCreditApplied: alreadyApplied,
          finalTotal: structuredFinalTotal,
          alreadyApplied: true,
        };
      }

      const wallet = await tx.teacher_wallets.findUnique({ where: { teacher_id: input.teacherId } });
      const balance = this.number(wallet?.balance, "wallet balance");
      const requested = this.number(input.requestedAmount, "wallet credit amount");
      const purchaseTotal = this.number(purchase.price, "purchase price");
      if (balance < 0) throw new BadRequestError("Invalid wallet balance.");
      if (purchaseTotal < 0) throw new BadRequestError("Invalid purchase price.");
      if (requested <= 0) throw new BadRequestError("Wallet credit amount must be greater than zero.");
      const walletCreditApplied = Math.min(balance, requested, purchaseTotal);
      if (!wallet?.id || walletCreditApplied <= 0) throw new ForbiddenError("Teacher wallet has no available credit.");
      const finalTotal = purchaseTotal - walletCreditApplied;
      const balanceAfter = balance - walletCreditApplied;

      const debit = await tx.teacher_wallets.updateMany({
        where: { teacher_id: input.teacherId, balance: { gte: walletCreditApplied } },
        data: { balance: { decrement: walletCreditApplied } },
      });
      if (debit.count !== 1) throw new ForbiddenError("Teacher wallet has no available credit.");

      await tx.teacher_wallet_ledger.create({
        data: {
          wallet_id: wallet.id,
          teacher_id: input.teacherId,
          type: "debit",
          source: "order_spend",
          amount: -walletCreditApplied,
          balance_after: balanceAfter,
          e_booklet_purchase_id: input.purchaseId,
          notes: "Wallet credit applied to e-booklet purchase",
        },
      });
      const updatedPurchase = await tx.e_booklet_purchases.update({
        where: { id: input.purchaseId },
        data: {
          wallet_credit_applied: walletCreditApplied,
          final_payable_price: finalTotal,
          admin_notes: "Wallet credit applied: " + walletCreditApplied,
        },
      });

      return { purchase: updatedPurchase, walletCreditApplied, finalTotal };
    });
  }
}
