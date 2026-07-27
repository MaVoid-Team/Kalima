import type { PrismaClient } from "../../../libs/db/prisma";
import { PurchasesService } from "./purchases.service";

jest.mock("../../../libs/db/prisma", () => ({
  prisma: {},
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
