import "reflect-metadata";

const { TeacherWalletService } = require("./teacher-wallet.service");

const daysFrom = (base: Date, days: number) => {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const createMockDb = (seed: any = {}) => {
  const state = {
    wallets: seed.wallets ?? [{ id: 1, teacher_id: 10, balance: 0, currency: "EGP" }],
    lots: seed.lots ?? [],
    ledger: seed.ledger ?? [],
    purchases: seed.purchases ?? [{ id: 20, teacher_id: 10, price: 100, final_payable_price: null }],
    allocations: [] as any[],
  };
  let ledgerId = 100;
  let lotId = 200;

  const db: any = {
    $transaction: jest.fn((callback: any) => callback(db)),
    teacher_wallets: {
      upsert: jest.fn(async ({ where, create, update }: any) => {
        let wallet = state.wallets.find((item: any) => item.teacher_id === where.teacher_id);
        if (!wallet) {
          wallet = { id: state.wallets.length + 1, ...create };
          state.wallets.push(wallet);
        } else if (update?.balance?.increment) {
          wallet.balance = Number(wallet.balance) + Number(update.balance.increment);
        }
        return { ...wallet };
      }),
      findUnique: jest.fn(async ({ where }: any) => {
        const wallet = where.teacher_id !== undefined
          ? state.wallets.find((item: any) => item.teacher_id === where.teacher_id)
          : state.wallets.find((item: any) => item.id === where.id);
        return wallet ? { ...wallet } : null;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const wallet = state.wallets.find((item: any) => item.id === where.id || item.teacher_id === where.teacher_id);
        if (!wallet) throw new Error("wallet not found");
        if (data.balance !== undefined) wallet.balance = Number(data.balance);
        if (data.updated_at !== undefined) wallet.updated_at = data.updated_at;
        return { ...wallet };
      }),
    },
    teacher_wallet_credit_lots: {
      findMany: jest.fn(async ({ where, orderBy }: any = {}) => {
        let lots = [...state.lots];
        if (where?.teacher_id !== undefined) lots = lots.filter((lot: any) => lot.teacher_id === where.teacher_id);
        if (where?.remaining_amount?.gt !== undefined) lots = lots.filter((lot: any) => Number(lot.remaining_amount) > where.remaining_amount.gt);
        if (where?.expires_at?.gt !== undefined) lots = lots.filter((lot: any) => new Date(lot.expires_at) > where.expires_at.gt);
        if (orderBy) {
          lots.sort((a: any, b: any) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime() || new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime() || a.id - b.id);
        }
        return lots.map((lot: any) => ({ ...lot }));
      }),
      findUnique: jest.fn(async ({ where }: any) => {
        const lot = state.lots.find((item: any) => item.credit_ledger_id === where.credit_ledger_id);
        return lot ? { ...lot } : null;
      }),
      create: jest.fn(async ({ data }: any) => {
        const lot = { id: lotId++, created_at: new Date(), ...data };
        state.lots.push(lot);
        return { ...lot };
      }),
      updateMany: jest.fn(async ({ where, data }: any) => {
        const lot = state.lots.find((item: any) => item.id === where.id);
        if (!lot) return { count: 0 };
        if (where.remaining_amount?.gte !== undefined && Number(lot.remaining_amount) < Number(where.remaining_amount.gte)) return { count: 0 };
        if (where.expires_at?.gt !== undefined && !(new Date(lot.expires_at) > where.expires_at.gt)) return { count: 0 };
        if (data.remaining_amount?.decrement !== undefined) lot.remaining_amount = Number(lot.remaining_amount) - Number(data.remaining_amount.decrement);
        if (data.updated_at !== undefined) lot.updated_at = data.updated_at;
        return { count: 1 };
      }),
    },
    teacher_wallet_ledger: {
      findMany: jest.fn(async ({ where }: any) => state.ledger.filter((entry: any) => entry.teacher_id === where.teacher_id).map((entry: any) => ({ ...entry }))),
      findFirst: jest.fn(async ({ where }: any) => {
        const entry = state.ledger.find((item: any) => (
          (where.teacher_id === undefined || item.teacher_id === where.teacher_id)
          && (where.milestone_achievement_id === undefined || item.milestone_achievement_id === where.milestone_achievement_id)
          && (where.e_booklet_purchase_id === undefined || item.e_booklet_purchase_id === where.e_booklet_purchase_id)
          && (where.source === undefined || item.source === where.source)
          && (where.type === undefined || item.type === where.type)
        ));
        return entry ? { ...entry } : null;
      }),
      create: jest.fn(async ({ data }: any) => {
        const entry = { id: ledgerId++, created_at: new Date(), ...data };
        state.ledger.push(entry);
        return { ...entry };
      }),
    },
    teacher_wallet_spend_allocations: {
      createMany: jest.fn(async ({ data }: any) => {
        state.allocations.push(...data);
        return { count: data.length };
      }),
    },
    e_booklet_purchases: {
      findFirst: jest.fn(async ({ where }: any) => {
        const purchase = state.purchases.find((item: any) => item.id === where.id && item.teacher_id === where.teacher_id);
        return purchase ? { ...purchase } : null;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const purchase = state.purchases.find((item: any) => item.id === where.id);
        if (!purchase) throw new Error("purchase not found");
        Object.assign(purchase, data);
        return { ...purchase };
      }),
    },
    __state: state,
  };
  return db;
};

describe("TeacherWalletService reward expiry lots", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-06-25T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("excludes expired lots from preview balance and refreshes the aggregate wallet balance", async () => {
    const now = new Date();
    const db = createMockDb({
      wallets: [{ id: 1, teacher_id: 10, balance: 150, currency: "EGP" }],
      lots: [
        { id: 1, wallet_id: 1, teacher_id: 10, remaining_amount: 100, expires_at: daysFrom(now, -1), created_at: daysFrom(now, -10) },
        { id: 2, wallet_id: 1, teacher_id: 10, remaining_amount: 50, expires_at: daysFrom(now, 10), created_at: daysFrom(now, -2) },
      ],
    });

    const service = new TeacherWalletService(db);
    await expect(service.previewPurchase({ teacherId: 10, purchaseTotal: 200, requestedAmount: 200 })).resolves.toEqual(
      expect.objectContaining({ balance: 50, walletCreditApplied: 50, finalTotal: 150 }),
    );
    expect(db.__state.wallets[0].balance).toBe(50);
  });

  it("spends unexpired lots by earliest expiry first", async () => {
    const now = new Date();
    const db = createMockDb({
      wallets: [{ id: 1, teacher_id: 10, balance: 100, currency: "EGP" }],
      lots: [
        { id: 1, wallet_id: 1, teacher_id: 10, remaining_amount: 60, expires_at: daysFrom(now, 30), created_at: daysFrom(now, -4) },
        { id: 2, wallet_id: 1, teacher_id: 10, remaining_amount: 50, expires_at: daysFrom(now, 5), created_at: daysFrom(now, -3) },
      ],
    });

    const service = new TeacherWalletService(db);
    await service.applyToPurchase({ teacherId: 10, purchaseId: 20, purchaseTotal: 100, requestedAmount: 70 });

    expect(db.__state.lots.find((lot: any) => lot.id === 2).remaining_amount).toBe(0);
    expect(db.__state.lots.find((lot: any) => lot.id === 1).remaining_amount).toBe(40);
    expect(db.__state.allocations.map((allocation: any) => ({ lot: allocation.credit_lot_id, amount: allocation.amount }))).toEqual([
      { lot: 2, amount: 50 },
      { lot: 1, amount: 20 },
    ]);
  });

  it("does not spend expired lots even without a cleanup job", async () => {
    const now = new Date();
    const db = createMockDb({
      wallets: [{ id: 1, teacher_id: 10, balance: 100, currency: "EGP" }],
      lots: [
        { id: 1, wallet_id: 1, teacher_id: 10, remaining_amount: 100, expires_at: daysFrom(now, -1), created_at: daysFrom(now, -5) },
      ],
    });

    const service = new TeacherWalletService(db);
    await expect(service.applyToPurchase({ teacherId: 10, purchaseId: 20, purchaseTotal: 100, requestedAmount: 10 })).rejects.toThrow("no available credit");
    expect(db.__state.lots[0].remaining_amount).toBe(100);
    expect(db.__state.wallets[0].balance).toBe(0);
  });

  it("does not create duplicate credit lots for duplicate milestone reward credit calls", async () => {
    const db = createMockDb({
      wallets: [{ id: 1, teacher_id: 10, balance: 25, currency: "EGP" }],
      ledger: [
        {
          id: 44,
          wallet_id: 1,
          teacher_id: 10,
          type: "credit",
          source: "milestone_reward",
          amount: 25,
          balance_after: 25,
          milestone_achievement_id: 99,
          created_at: new Date("2026-06-20T00:00:00.000Z"),
        },
      ],
      lots: [
        {
          id: 55,
          wallet_id: 1,
          teacher_id: 10,
          credit_ledger_id: 44,
          milestone_achievement_id: 99,
          original_amount: 25,
          remaining_amount: 25,
          expires_at: new Date("2026-10-18T00:00:00.000Z"),
          created_at: new Date("2026-06-20T00:00:00.000Z"),
        },
      ],
    });

    const service = new TeacherWalletService(db);
    await service.creditMilestone({ teacherId: 10, amount: 25, milestoneAchievementId: 99, rewardExpiryDays: 120 });

    expect(db.teacher_wallet_credit_lots.create).not.toHaveBeenCalled();
    expect(db.__state.lots).toHaveLength(1);
  });
});
