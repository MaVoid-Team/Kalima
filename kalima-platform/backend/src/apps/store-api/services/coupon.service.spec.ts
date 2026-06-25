import "reflect-metadata";
import { CouponApplicabilityScope, DiscountType } from "../dtos/coupon.dto";

jest.mock("../../../libs/db/prisma", () => ({
  prisma: {},
}));

const { CouponService } = require("./coupon.service");

const createMockDb = () =>
  ({
    coupons: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    products: {
      findFirst: jest.fn(),
    },
    categories: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    product_categories: {
      findFirst: jest.fn(),
    },
    coupon_usages: {
      findUnique: jest.fn(),
    },
  }) as any;

describe("CouponService category applicability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an existing-compatible product-scoped coupon", async () => {
    const db = createMockDb();
    db.coupons.findUnique.mockResolvedValue(null);
    db.products.findFirst.mockResolvedValue({ id: 10, price: 100, is_archived: false });
    db.coupons.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 1, ...data }));

    const service = new CouponService(db);
    const coupon = await service.createCoupon(
      {
        code: "KLM-PROD1",
        product_id: 10,
        discount_type: DiscountType.PERCENTAGE,
        discount_percentage: 20,
        expires_at: new Date(Date.now() + 86400000),
      },
      1,
    );

    expect(coupon).toEqual(
      expect.objectContaining({
        product_id: 10,
        category_id: null,
        applicability_scope: CouponApplicabilityScope.PRODUCT,
      }),
    );
  });

  it("rejects coupons with both product and category targets", async () => {
    const db = createMockDb();
    db.coupons.findUnique.mockResolvedValue(null);
    const service = new CouponService(db);

    await expect(
      service.createCoupon(
        {
          code: "KLM-BOTH1",
          applicability_scope: CouponApplicabilityScope.PRODUCT,
          product_id: 10,
          category_id: 20,
          discount_type: DiscountType.PERCENTAGE,
          discount_percentage: 10,
          expires_at: new Date(Date.now() + 86400000),
        },
        1,
      ),
    ).rejects.toThrow("Product-scoped coupons require product_id");
  });

  it("rejects category-scoped coupons for inactive categories", async () => {
    const db = createMockDb();
    db.coupons.findUnique.mockResolvedValue(null);
    db.categories.findUnique.mockResolvedValue({ id: 20, active: false });
    const service = new CouponService(db);

    await expect(
      service.createCoupon(
        {
          code: "KLM-CAT01",
          applicability_scope: CouponApplicabilityScope.CATEGORY,
          category_id: 20,
          discount_type: DiscountType.AMOUNT,
          discount_amount: 250,
          expires_at: new Date(Date.now() + 86400000),
        },
        1,
      ),
    ).rejects.toThrow("inactive category");
  });

  it("validates category coupons for products directly in that category", async () => {
    const db = createMockDb();
    db.coupons.findUnique.mockResolvedValue({
      id: 1,
      code: "KLM-CAT02",
      product_id: null,
      category_id: 20,
      applicability_scope: CouponApplicabilityScope.CATEGORY,
      discount_amount: 0,
      discount_percentage: 15,
      active: true,
      starts_at: null,
      expires_at: new Date(Date.now() + 86400000),
      deleted_at: null,
    });
    db.categories.findMany.mockResolvedValue([]);
    db.product_categories.findFirst.mockResolvedValue({ id: 99 });

    const service = new CouponService(db);
    await expect(service.validateCoupon("KLM-CAT02", undefined, 10)).resolves.toEqual(
      expect.objectContaining({ isValid: true }),
    );
    expect(db.product_categories.findFirst).toHaveBeenCalledWith({
      where: { product_id: 10, category_id: { in: [20] } },
      select: { id: true },
    });
  });

  it("validates category coupons for products in descendant categories", async () => {
    const db = createMockDb();
    db.coupons.findUnique.mockResolvedValue({
      id: 1,
      code: "KLM-CAT03",
      product_id: null,
      category_id: 20,
      applicability_scope: CouponApplicabilityScope.CATEGORY,
      discount_amount: 0,
      discount_percentage: 15,
      active: true,
      starts_at: null,
      expires_at: new Date(Date.now() + 86400000),
      deleted_at: null,
    });
    db.categories.findMany
      .mockResolvedValueOnce([{ id: 21 }])
      .mockResolvedValueOnce([{ id: 22 }])
      .mockResolvedValueOnce([]);
    db.product_categories.findFirst.mockResolvedValue({ id: 100 });

    const service = new CouponService(db);
    await service.validateCoupon("KLM-CAT03", undefined, 10);

    expect(db.product_categories.findFirst).toHaveBeenCalledWith({
      where: { product_id: 10, category_id: { in: [20, 21, 22] } },
      select: { id: true },
    });
  });

  it("rejects category coupons for unrelated products", async () => {
    const db = createMockDb();
    db.coupons.findUnique.mockResolvedValue({
      id: 1,
      code: "KLM-CAT04",
      product_id: null,
      category_id: 20,
      applicability_scope: CouponApplicabilityScope.CATEGORY,
      discount_amount: 0,
      discount_percentage: 15,
      active: true,
      starts_at: null,
      expires_at: new Date(Date.now() + 86400000),
      deleted_at: null,
    });
    db.categories.findMany.mockResolvedValue([]);
    db.product_categories.findFirst.mockResolvedValue(null);

    const service = new CouponService(db);
    await expect(service.validateCoupon("KLM-CAT04", undefined, 10)).rejects.toThrow(
      "not valid for this product",
    );
  });
});
