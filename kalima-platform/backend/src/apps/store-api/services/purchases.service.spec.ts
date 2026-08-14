import type { PrismaClient } from "../../../libs/db/prisma";
import { PurchasesService } from "./purchases.service";

jest.mock("../../../libs/db/prisma", () => ({
  prisma: {},
}));

jest.mock("./notification.service", () => ({
  notificationService: { sendToUser: jest.fn().mockResolvedValue(null) },
  notification_key_enum: { ORDER_DELETED: "ORDER_DELETED", ORDER_ITEM_DELETED: "ORDER_ITEM_DELETED" },
  NOTIFICATION_CATEGORY: { ORDER_DELETED: "ORDER_DELETED", ORDER_ITEM_DELETED: "ORDER_ITEM_DELETED" },
}));

jest.mock("../emails/email.service", () => ({
  getEmailService: () => ({
    sendOrderDeletedEmail: jest.fn().mockResolvedValue(true),
    sendOrderItemDeletedEmail: jest.fn().mockResolvedValue(true),
  }),
}));

describe("PurchasesService.getConfirmedStats", () => {
  it("sums active product quantities without treating one order as one product", async () => {
    const db = {
      users: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 17,
            name: "Mariam",
            email: "mariam@kalima.test",
            phone: null,
            user_roles: [{ role: "Admin" }],
          },
        ]),
      },
      purchases: {
        groupBy: jest.fn().mockResolvedValue([
          { confirmed_by: 17, _count: { _all: 1 } },
        ]),
        findMany: jest.fn().mockResolvedValue([
          {
            confirmed_by: 17,
            purchase_items: [{ quantity: 2 }, { quantity: 3 }],
          },
        ]),
      },
    };

    const service = new PurchasesService(db as unknown as PrismaClient);

    await expect(service.getConfirmedStats(1, 10, 7, 2026)).resolves.toEqual({
      stats: [
        {
          id: 17,
          name: "Mariam",
          email: "mariam@kalima.test",
          phone: null,
          role: "Admin",
          count: 1,
          productsSold: 5,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      pages: 1,
    });

    expect(db.purchases.findMany).toHaveBeenCalledWith({
      where: {
        confirmed_by: { in: [17] },
        status: "confirmed",
        deleted_at: null,
        confirmed_at: {
          gte: new Date(2026, 6, 1),
          lt: new Date(2026, 7, 1),
        },
      },
      select: {
        confirmed_by: true,
        purchase_items: {
          where: { is_deleted: false },
          select: { quantity: true },
        },
      },
    });
  });
});

describe("PurchasesService.getConfirmedEmployeeProducts", () => {
  it("returns detailed item rows and correctly splits normal products vs ebooklets", async () => {
    const db = {
      users: {
        findUnique: jest.fn().mockResolvedValue({
          id: 17,
          name: "Mariam",
          email: "mariam@kalima.test",
          phone: "0100000000",
          user_roles: [{ role: "Admin" }],
        }),
      },
      purchases: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 101,
            purchase_serial: "ORD-101",
            total: 250,
            confirmed_at: new Date("2026-07-10T12:00:00Z"),
            created_at: new Date("2026-07-10T10:00:00Z"),
            users: { id: 50, name: "Student A", email: "a@kalima.test", phone: "0111" },
            e_booklet_student_purchase_link: null,
            purchase_items: [
              {
                id: 1,
                quantity: 2,
                price_at_purchase: 50,
                discount: 0,
                final_price: 100,
                created_at: new Date("2026-07-10T10:00:00Z"),
                products: {
                  id: 1,
                  title: "Arabic Grammar Book",
                  type: "Product",
                  serial: "PROD-1",
                  price: 50,
                  thumbnail_image: null,
                  product_categories: [],
                },
              },
              {
                id: 2,
                quantity: 1,
                price_at_purchase: 150,
                discount: 0,
                final_price: 150,
                created_at: new Date("2026-07-10T10:00:00Z"),
                products: {
                  id: 2,
                  title: "Digital Booklet 1",
                  type: "Book",
                  serial: "BK-1",
                  price: 150,
                  thumbnail_image: null,
                  product_categories: [{ categories: { id: 1, title: "كراسة إلكترونية" } }],
                },
              },
            ],
          },
        ]),
      },
    };

    const service = new PurchasesService(db as unknown as PrismaClient);
    const result = await service.getConfirmedEmployeeProducts(17, { month: 7, year: 2026 });

    expect(result.employee).toEqual({
      id: 17,
      name: "Mariam",
      email: "mariam@kalima.test",
      phone: "0100000000",
      role: "Admin",
    });
    expect(result.summary).toEqual({
      totalOrders: 1,
      totalProductsSold: 3,
      totalRevenue: 250,
      normalProductsCount: 2,
      ebookletsCount: 1,
    });
    expect(result.items).toHaveLength(2);
    expect(result.items[0].itemType).toBe("normal");
    expect(result.items[1].itemType).toBe("ebooklet");
  });
});

describe("PurchasesService analytics adjustments on deletion", () => {
  it("decrements both total_spent and number_of_purchases when deleting a purchase", async () => {
    const db: any = {
      purchases: {
        findUnique: jest.fn().mockResolvedValue({
          id: 10,
          user_id: 42,
          total: 300,
          status: "confirmed",
          users: { id: 42, name: "Test", email: null },
          purchase_items: [{ is_deleted: false, quantity: 1, products: { title: "Book" } }],
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      coupon_usages: {
        deleteMany: jest.fn().mockResolvedValue({}),
      },
      user_analytics: {
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn(async (cb) => cb(db)),
    };

    const service = new PurchasesService(db as unknown as PrismaClient);
    await service.deletePurchase(10);

    expect(db.user_analytics.update).toHaveBeenCalledWith({
      where: { user_id: 42 },
      data: {
        total_spent: { decrement: 300 },
        number_of_purchases: { decrement: 1 },
      },
    });
  });

  it("decrements total_spent when an item is deleted from a purchase", async () => {
    const db: any = {
      purchases: {
        findUnique: jest.fn().mockResolvedValue({
          id: 10,
          user_id: 42,
          discount: 0,
          total: 300,
          users: { id: 42, name: "Test", email: null },
          purchase_items: [
            { id: 1, is_deleted: false, price_at_purchase: 100, quantity: 1, products: { title: "Item 1" } },
            { id: 2, is_deleted: false, price_at_purchase: 200, quantity: 1, products: { title: "Item 2" } },
          ],
        }),
        update: jest.fn().mockResolvedValue({ id: 10, total: 200 }),
      },
      purchase_items: {
        update: jest.fn().mockResolvedValue({}),
      },
      user_analytics: {
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn(async (cb) => cb(db)),
    };

    const service = new PurchasesService(db as unknown as PrismaClient);
    await service.deleteItem(10, 1);

    // Item 1 (price 100) was deleted -> remaining total is 200 -> priceDiff is 100
    expect(db.user_analytics.update).toHaveBeenCalledWith({
      where: { user_id: 42 },
      data: {
        total_spent: { decrement: 100 },
      },
    });
  });
});

