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

  private positiveInt(value: any, label: string): number {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) throw new BadRequestError(`Invalid ${label}.`);
    return n;
  }

  private addDays(value: Date, days: number): Date {
    const next = new Date(value);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }

  private async usableLots(teacherId: number, tx: any = this.db, now = new Date()) {
    if (!tx.teacher_wallet_credit_lots?.findMany) return [];
    return tx.teacher_wallet_credit_lots.findMany({
      where: {
        teacher_id: teacherId,
        remaining_amount: { gt: 0 },
        expires_at: { gt: now },
      },
      orderBy: [{ expires_at: "asc" }, { created_at: "asc" }, { id: "asc" }],
    });
  }

  private usableBalance(lots: any[]): number {
    return lots.reduce((sum, lot) => sum + this.number(lot.remaining_amount, "remaining wallet credit"), 0);
  }

  private async refreshWalletBalance(teacherId: number, tx: any = this.db) {
    const wallet = await tx.teacher_wallets.upsert({
      where: { teacher_id: teacherId },
      create: { teacher_id: teacherId, balance: 0 },
      update: {},
    });
    const lots = await this.usableLots(teacherId, tx);
    const balance = this.usableBalance(lots);
    if (this.number(wallet.balance, "wallet balance") !== balance) {
      return tx.teacher_wallets.update({
        where: { id: wallet.id },
        data: { balance, updated_at: new Date() },
      });
    }
    return wallet;
  }

  async getWallet(teacherId: number) {
    return this.refreshWalletBalance(teacherId);
  }

  async listLedger(teacherId: number) {
    return this.db.teacher_wallet_ledger.findMany({
      where: { teacher_id: teacherId },
      orderBy: { created_at: "desc" },
    });
  }

  async listRewardLots(teacherId: number) {
    if (!this.db.teacher_wallet_credit_lots?.findMany) return [];
    return this.db.teacher_wallet_credit_lots.findMany({
      where: { teacher_id: teacherId, remaining_amount: { gt: 0 } },
      orderBy: [{ expires_at: "asc" }, { created_at: "asc" }, { id: "asc" }],
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
    const wallet = await this.refreshWalletBalance(input.teacherId);
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
    rewardExpiryDays?: number | null;
    claimedAt?: Date | string | null;
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
    if (existingLedger) {
      const wallet = await this.getWallet(input.teacherId);
      await this.ensureCreditLot({
        wallet,
        ledger: existingLedger,
        teacherId: input.teacherId,
        milestoneAchievementId: input.milestoneAchievementId,
        amount: this.number(existingLedger.amount, "wallet credit amount"),
        rewardExpiryDays: input.rewardExpiryDays,
        claimedAt: input.claimedAt ?? existingLedger.created_at ?? new Date(),
      });
      return { wallet: await this.getWallet(input.teacherId), ledger: existingLedger, alreadyCredited: true };
    }

    const amount = this.number(input.amount, "wallet credit amount");
    if (amount <= 0) throw new BadRequestError("Wallet credit amount must be greater than zero.");
    const rewardExpiryDays = this.positiveInt(input.rewardExpiryDays ?? 120, "reward expiry days");
    const claimedAt = input.claimedAt ? new Date(input.claimedAt) : new Date();
    if (Number.isNaN(claimedAt.getTime())) throw new BadRequestError("Invalid reward claim date.");
    const expiresAt = this.addDays(claimedAt, rewardExpiryDays);
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
    await this.createCreditLot({
      wallet,
      ledger,
      teacherId: input.teacherId,
      milestoneAchievementId: input.milestoneAchievementId,
      amount,
      expiresAt,
    });
    return { wallet: await this.refreshWalletBalance(input.teacherId), ledger };
  }

  private async ensureCreditLot(input: {
    wallet: any;
    ledger: any;
    teacherId: number;
    milestoneAchievementId: number;
    amount: number;
    rewardExpiryDays?: number | null;
    claimedAt?: Date | string | null;
  }) {
    if (!this.db.teacher_wallet_credit_lots?.findUnique) return null;
    const existing = await this.db.teacher_wallet_credit_lots.findUnique({
      where: { credit_ledger_id: input.ledger.id },
    });
    if (existing) return existing;
    const rewardExpiryDays = this.positiveInt(input.rewardExpiryDays ?? 120, "reward expiry days");
    const claimedAt = input.claimedAt ? new Date(input.claimedAt) : new Date();
    if (Number.isNaN(claimedAt.getTime())) throw new BadRequestError("Invalid reward claim date.");
    return this.createCreditLot({
      wallet: input.wallet,
      ledger: input.ledger,
      teacherId: input.teacherId,
      milestoneAchievementId: input.milestoneAchievementId,
      amount: input.amount,
      expiresAt: this.addDays(claimedAt, rewardExpiryDays),
    });
  }

  private async createCreditLot(input: {
    wallet: any;
    ledger: any;
    teacherId: number;
    milestoneAchievementId: number;
    amount: number;
    expiresAt: Date;
  }) {
    if (!this.db.teacher_wallet_credit_lots?.create) return null;
    return this.db.teacher_wallet_credit_lots.create({
      data: {
        wallet_id: input.wallet.id,
        teacher_id: input.teacherId,
        credit_ledger_id: input.ledger.id,
        milestone_achievement_id: input.milestoneAchievementId,
        original_amount: input.amount,
        remaining_amount: input.amount,
        expires_at: input.expiresAt,
      },
    });
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

      const wallet = await this.refreshWalletBalance(input.teacherId, tx);
      const usableLots = await this.usableLots(input.teacherId, tx);
      const balance = this.usableBalance(usableLots);
      const requested = this.number(input.requestedAmount, "wallet credit amount");
      const purchaseTotal = this.number(purchase.price, "purchase price");
      if (balance < 0) throw new BadRequestError("Invalid wallet balance.");
      if (purchaseTotal < 0) throw new BadRequestError("Invalid purchase price.");
      if (requested <= 0) throw new BadRequestError("Wallet credit amount must be greater than zero.");
      const walletCreditApplied = Math.min(balance, requested, purchaseTotal);
      if (!wallet?.id || walletCreditApplied <= 0) throw new ForbiddenError("Teacher wallet has no available credit.");
      const finalTotal = purchaseTotal - walletCreditApplied;
      const balanceAfter = balance - walletCreditApplied;

      let remainingToSpend = walletCreditApplied;
      const allocations: Array<{ lotId: number; amount: number }> = [];
      for (const lot of usableLots) {
        if (remainingToSpend <= 0) break;
        const lotRemaining = this.number(lot.remaining_amount, "remaining wallet credit");
        const amount = Math.min(lotRemaining, remainingToSpend);
        if (amount <= 0) continue;
        const updatedLot = await tx.teacher_wallet_credit_lots.updateMany({
          where: {
            id: lot.id,
            remaining_amount: { gte: amount },
            expires_at: { gt: new Date() },
          },
          data: {
            remaining_amount: { decrement: amount },
            updated_at: new Date(),
          },
        });
        if (updatedLot.count !== 1) throw new ForbiddenError("Teacher wallet has no available credit.");
        allocations.push({ lotId: lot.id, amount });
        remainingToSpend -= amount;
      }
      if (remainingToSpend > 0.000001) throw new ForbiddenError("Teacher wallet has no available credit.");

      const debitLedger = await tx.teacher_wallet_ledger.create({
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
      if (tx.teacher_wallet_spend_allocations?.createMany && allocations.length > 0) {
        await tx.teacher_wallet_spend_allocations.createMany({
          data: allocations.map((allocation) => ({
            wallet_id: wallet.id,
            teacher_id: input.teacherId,
            credit_lot_id: allocation.lotId,
            debit_ledger_id: debitLedger.id,
            amount: allocation.amount,
          })),
        });
      }
      await tx.teacher_wallets.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter, updated_at: new Date() },
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
