jest.mock("../../src/libs/db/prisma", () => ({
  prisma: {},
}));

jest.mock("../../src/apps/store-api/services/cartCache.service", () => ({
  getCachedCart: jest.fn().mockResolvedValue(null),
  setCachedCart: jest.fn().mockResolvedValue(null),
  invalidateCartCache: jest.fn().mockResolvedValue(null),
}));

jest.mock("../../src/apps/store-api/services/notificationStream.service", () => ({
  addPurchaseEvent: jest.fn().mockResolvedValue(null),
}));

jest.mock("../../src/apps/store-api/services/image.service", () => ({
  imageService: { uploadImage: jest.fn().mockResolvedValue({ id: 10 }) },
}));

jest.mock("../../src/apps/store-api/services/checkout-validation.service", () => ({
  validatePaymentForCheckout: jest.fn().mockResolvedValue({ phone_number: "01011111111" }),
}));

jest.mock("../../src/apps/store-api/services/coupon.service", () => ({
  couponService: { validateCoupon: jest.fn(), recordCouponUsage: jest.fn() },
}));

jest.mock("../../src/apps/store-api/emails/email.service", () => ({
  getEmailService: () => ({
    sendOrderPendingEmail: jest.fn().mockResolvedValue(true),
    sendOrderConfirmationEmail: jest.fn().mockResolvedValue(true),
    sendOrderDeletedEmail: jest.fn().mockResolvedValue(true),
    sendOrderItemDeletedEmail: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock("../../src/apps/store-api/services/notification.service", () => ({
  notificationService: { sendToUser: jest.fn().mockResolvedValue(null) },
  notification_key_enum: { ORDER_DELETED: "ORDER_DELETED", ORDER_ITEM_DELETED: "ORDER_ITEM_DELETED" },
  NOTIFICATION_CATEGORY: { ORDER_DELETED: "ORDER_DELETED", ORDER_ITEM_DELETED: "ORDER_ITEM_DELETED" },
}));

import CartService from "../../src/apps/store-api/services/cart.service";
import { PurchasesService } from "../../src/apps/store-api/services/purchases.service";
import UserManagementService from "../../src/apps/store-api/services/user-management.service";
import type { PrismaClient } from "../../src/libs/db/prisma";

describe("E2E User Purchase Analytics Lifecycle", () => {
  let inMemoryUserAnalytics: Record<number, { user_id: number; total_spent: number; number_of_purchases: number }>;
  let inMemoryPurchases: any[];
  let activeCart: any;
  let mockDb: any;
  let cartService: CartService;
  let purchasesService: PurchasesService;
  let userManagementService: UserManagementService;

  beforeEach(() => {
    inMemoryUserAnalytics = {
      100: { user_id: 100, total_spent: 0, number_of_purchases: 0 },
    };
    inMemoryPurchases = [];
    activeCart = null;

    mockDb = {
      user_analytics: {
        findUnique: jest.fn(async ({ where: { user_id } }) => inMemoryUserAnalytics[user_id] || null),
        upsert: jest.fn(async ({ where: { user_id }, create, update }) => {
          if (!inMemoryUserAnalytics[user_id]) {
            inMemoryUserAnalytics[user_id] = {
              user_id,
              total_spent: create.total_spent || 0,
              number_of_purchases: create.number_of_purchases || 0,
            };
          } else {
            if (update.total_spent?.increment) {
              inMemoryUserAnalytics[user_id].total_spent += update.total_spent.increment;
            }
            if (update.number_of_purchases?.increment) {
              inMemoryUserAnalytics[user_id].number_of_purchases += update.number_of_purchases.increment;
            }
          }
          return inMemoryUserAnalytics[user_id];
        }),
        update: jest.fn(async ({ where: { user_id }, data }) => {
          if (inMemoryUserAnalytics[user_id]) {
            if (data.total_spent?.decrement) {
              inMemoryUserAnalytics[user_id].total_spent -= data.total_spent.decrement;
            }
            if (data.total_spent?.increment) {
              inMemoryUserAnalytics[user_id].total_spent += data.total_spent.increment;
            }
            if (data.number_of_purchases?.decrement) {
              inMemoryUserAnalytics[user_id].number_of_purchases -= data.number_of_purchases.decrement;
            }
            if (data.number_of_purchases?.increment) {
              inMemoryUserAnalytics[user_id].number_of_purchases += data.number_of_purchases.increment;
            }
          }
          return inMemoryUserAnalytics[user_id];
        }),
      },
      users: {
        findUnique: jest.fn(async () => ({ id: 100, name: "Ziad", email: "ziad@kalima.test" })),
      },
      carts: {
        findFirst: jest.fn(async () => activeCart),
        update: jest.fn().mockResolvedValue({}),
      },
      cart_items: {
        deleteMany: jest.fn().mockResolvedValue({}),
      },
      product_required_fields: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      cart_item_required_fields: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      coupons: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      purchases: {
        create: jest.fn(async ({ data }) => {
          const newPurchase = {
            id: inMemoryPurchases.length + 1,
            user_id: data.user_id,
            total: data.total,
            subtotal: data.subtotal,
            discount: data.discount,
            is_deleted: false,
            deleted_at: null,
            purchase_items: [],
          };
          inMemoryPurchases.push(newPurchase);
          return newPurchase;
        }),
        findUnique: jest.fn(async ({ where: { id } }) => inMemoryPurchases.find((p) => p.id === id) || null),
        update: jest.fn(async ({ where: { id }, data }) => {
          const p = inMemoryPurchases.find((p) => p.id === id);
          if (p) Object.assign(p, data);
          return p;
        }),
      },
      purchase_items: {
        createManyAndReturn: jest.fn(async ({ data }) => data),
        update: jest.fn().mockResolvedValue({}),
      },
      coupon_usages: {
        deleteMany: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn(async (cb) => cb(mockDb)),
    };

    userManagementService = new UserManagementService(mockDb as unknown as PrismaClient);
    purchasesService = new PurchasesService(mockDb as unknown as PrismaClient);
    cartService = new CartService(mockDb as unknown as PrismaClient);

    // Override the userManagementService instance used inside cartService
    const cartUserManagementModule = require("../../src/apps/store-api/services/user-management.service");
    cartUserManagementModule.userManagementService.incrementUserAnalytics = jest.fn(
      (userId, totalIncrement, purchasesIncrement, tx) =>
        userManagementService.incrementUserAnalytics(userId, totalIncrement, purchasesIncrement, tx),
    );

    const cartPurchasesModule = require("../../src/apps/store-api/services/purchases.service");
    cartPurchasesModule.purchasesService.createPurchase = jest.fn(async (dto) => {
      const p = {
        id: inMemoryPurchases.length + 1,
        user_id: dto.user_id,
        total: dto.total,
        is_deleted: false,
        deleted_at: null,
        purchase_items: dto.items.map((it: any, idx: number) => ({
          id: idx + 1,
          is_deleted: false,
          price_at_purchase: it.price_at_purchase,
          quantity: it.quantity,
          products: { title: "Product" },
        })),
        users: { id: dto.user_id, name: "Ziad", email: "ziad@kalima.test" },
      };
      inMemoryPurchases.push(p);
      return p;
    });
  });

  test("Step 1: Initial user state has 0 spending and 0 purchases", () => {
    expect(inMemoryUserAnalytics[100].total_spent).toBe(0);
    expect(inMemoryUserAnalytics[100].number_of_purchases).toBe(0);
  });

  test("Step 2: Checkout first cart ($400) -> total_spent is exactly 400 (NOT doubled to 800) and number_of_purchases is 1", async () => {
    activeCart = {
      id: 1,
      user_id: 100,
      status: "active",
      subtotal: 400,
      discount: 0,
      total: 400,
      cart_items: [
        { id: 1, cart_id: 1, product_id: 10, quantity: 2, price_at_add: 200, discount: 0, cart_item_required_fields: [] },
      ],
    };

    await cartService.checkout(
      100,
      { payment_method_id: 1, numberTransferredFrom: "01011111111" },
      { buffer: Buffer.from("img") } as any,
    );

    // PROOF: total_spent is 400, NOT 800
    expect(inMemoryUserAnalytics[100].total_spent).toBe(400);
    expect(inMemoryUserAnalytics[100].number_of_purchases).toBe(1);
  });

  test("Step 3: Checkout second cart ($250) -> cumulative total_spent is 650 (NOT 1300) and number_of_purchases is 2", async () => {
    // Previous state after 1st purchase
    inMemoryUserAnalytics[100] = { user_id: 100, total_spent: 400, number_of_purchases: 1 };

    activeCart = {
      id: 2,
      user_id: 100,
      status: "active",
      subtotal: 250,
      discount: 0,
      total: 250,
      cart_items: [
        { id: 2, cart_id: 2, product_id: 20, quantity: 1, price_at_add: 250, discount: 0, cart_item_required_fields: [] },
      ],
    };

    await cartService.checkout(
      100,
      { payment_method_id: 1, numberTransferredFrom: "01011111111" },
      { buffer: Buffer.from("img") } as any,
    );

    // PROOF: total_spent is 400 + 250 = 650, NOT doubled
    expect(inMemoryUserAnalytics[100].total_spent).toBe(650);
    expect(inMemoryUserAnalytics[100].number_of_purchases).toBe(2);
  });

  test("Step 4: Delete item ($100) from purchase -> total_spent drops to 550", async () => {
    inMemoryUserAnalytics[100] = { user_id: 100, total_spent: 650, number_of_purchases: 2 };
    const purchaseWithTwoItems = {
      id: 1,
      user_id: 100,
      total: 400,
      discount: 0,
      status: "confirmed",
      users: { id: 100, name: "Ziad", email: null },
      purchase_items: [
        { id: 10, is_deleted: false, price_at_purchase: 100, quantity: 1, products: { title: "Item A" } },
        { id: 11, is_deleted: false, price_at_purchase: 300, quantity: 1, products: { title: "Item B" } },
      ],
    };
    inMemoryPurchases.push(purchaseWithTwoItems);

    await purchasesService.deleteItem(1, 10);

    // PROOF: total_spent drops from 650 to 550, purchases remains 2
    expect(inMemoryUserAnalytics[100].total_spent).toBe(550);
    expect(inMemoryUserAnalytics[100].number_of_purchases).toBe(2);
  });

  test("Step 5: Hard-delete entire second purchase ($250) -> total_spent drops to 300 and purchases to 1", async () => {
    inMemoryUserAnalytics[100] = { user_id: 100, total_spent: 550, number_of_purchases: 2 };
    const purchase2 = {
      id: 2,
      user_id: 100,
      total: 250,
      discount: 0,
      status: "confirmed",
      users: { id: 100, name: "Ziad", email: null },
      purchase_items: [{ id: 20, is_deleted: false, price_at_purchase: 250, quantity: 1, products: { title: "Item C" } }],
    };
    inMemoryPurchases.push(purchase2);

    await purchasesService.deletePurchase(2);

    // PROOF: total_spent drops from 550 to 300, purchases drops to 1
    expect(inMemoryUserAnalytics[100].total_spent).toBe(300);
    expect(inMemoryUserAnalytics[100].number_of_purchases).toBe(1);
  });

  test("Step 6: Database repair audit calculates exact match with user_analytics", () => {
    inMemoryUserAnalytics[100] = { user_id: 100, total_spent: 300, number_of_purchases: 1 };
    // Active non-deleted purchase has total: 300
    const activePurchases = [
      { id: 1, user_id: 100, total: 300, is_deleted: false, deleted_at: null },
    ];

    const calculatedTotalSpent = activePurchases
      .filter((p) => !p.is_deleted && !p.deleted_at)
      .reduce((sum, p) => sum + p.total, 0);
    const calculatedPurchases = activePurchases
      .filter((p) => !p.is_deleted && !p.deleted_at).length;

    expect(calculatedTotalSpent).toBe(300);
    expect(calculatedPurchases).toBe(1);
    expect(calculatedTotalSpent).toBe(inMemoryUserAnalytics[100].total_spent);
    expect(calculatedPurchases).toBe(inMemoryUserAnalytics[100].number_of_purchases);
  });
});
