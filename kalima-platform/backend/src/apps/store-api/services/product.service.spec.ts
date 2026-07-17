import "reflect-metadata";

jest.mock("../../../libs/db/prisma", () => ({
  prisma: {},
}));

jest.mock("./image.service", () => ({
  imageService: {},
}));

jest.mock("./review.service", () => ({
  reviewService: {
    getAggregatedRating: jest.fn().mockResolvedValue({
      averageRating: 0,
      reviewCount: 0,
    }),
  },
}));

jest.mock("./sample.service", () => ({
  sampleService: {},
}));

import { ProductService } from "./product.service";

describe("ProductService category filtering", () => {
  it("includes products attached to a selected category's descendants", async () => {
    const db = {
      categories: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce([{ id: 2 }])
          .mockResolvedValueOnce([{ id: 3 }])
          .mockResolvedValueOnce([]),
      },
      products: {
        findMany: jest.fn().mockResolvedValue([{ id: 101 }]),
        count: jest.fn().mockResolvedValue(1),
      },
    } as any;
    const service = new ProductService(db);

    const result = await service.getAllProducts(undefined, {
      category_id: 1,
      page: 1,
      limit: 8,
    });

    expect(result.data).toEqual([
      expect.objectContaining({
        id: 101,
        isPurchased: false,
        averageRating: 0,
        reviewCount: 0,
      }),
    ]);
    expect(db.products.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          product_categories: {
            some: { category_id: { in: [1, 2, 3] } },
          },
        }),
      }),
    );
    expect(db.products.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        product_categories: {
          some: { category_id: { in: [1, 2, 3] } },
        },
      }),
    });
  });
});
