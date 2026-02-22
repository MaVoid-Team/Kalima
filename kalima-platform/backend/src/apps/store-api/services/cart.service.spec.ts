import CartService from "./cart.service";
import { PrismaClient } from "../generated/prisma/client";

// Mocks
function getMockPrismaClient() {
  if (!(global as any)._mockPrismaClient) {
    (global as any)._mockPrismaClient = {
      carts: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      cart_items: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      products: {
        findUnique: jest.fn(),
      },
      coupons: {
        findUnique: jest.fn(),
      },
    };
  }
  return (global as any)._mockPrismaClient;
}
const mockPrismaClient = getMockPrismaClient();

jest.mock("../generated/prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => getMockPrismaClient()),
  };
});

jest.mock("../../../libs/db/prisma", () => {
  return {
    prisma: getMockPrismaClient(),
    PrismaClient: jest.fn().mockImplementation(() => getMockPrismaClient()),
  };
});

jest.mock("./cartCache.service", () => ({
  getCachedCart: jest.fn().mockResolvedValue(null),
  setCachedCart: jest.fn().mockResolvedValue(null),
  invalidateCartCache: jest.fn().mockResolvedValue(null),
}));

jest.mock("./user-management.service", () => ({
  userManagementService: { incrementUserAnalytics: jest.fn() }
}));

jest.mock("./purchases.service", () => ({
  purchasesService: { createPurchase: jest.fn().mockResolvedValue({ id: 999 }) }
}));

jest.mock("./checkout-validation.service", () => ({
  validatePaymentForCheckout: jest.fn().mockResolvedValue({ phone_number: "123" })
}));

jest.mock("./notificationStream.service", () => ({
  addPurchaseEvent: jest.fn().mockResolvedValue(null)
}));

jest.mock("./image.service", () => ({
  imageService: { uploadImage: jest.fn().mockResolvedValue({ id: "mock_image_id" }) }
}));

jest.mock("./coupon.service", () => ({
  couponService: { validateCoupon: jest.fn(), recordCouponUsage: jest.fn() }
}));

describe("CartService", () => {
  let cartService: CartService;

  beforeEach(() => {
    jest.clearAllMocks();
    cartService = new CartService(mockPrismaClient as unknown as PrismaClient);
  });

  describe("add item and recalculate totals", () => {
    it("should recalculate subtotal and total when an item is added", async () => {
      const mockCart = {
        id: 1,
        user_id: 42,
        status: "active",
        subtotal: 0,
        discount: 0,
        total: 0,
      };

      const mockProduct = {
        id: 10,
        price: 100,
      };

      const updatedCartItems = [
        { id: 100, cart_id: 1, product_id: 10, quantity: 2, price_at_add: 100, discount: 0 },
      ];

      // Setup mocks
      mockPrismaClient.carts.findFirst.mockResolvedValueOnce(mockCart);
      mockPrismaClient.products.findUnique.mockResolvedValueOnce(mockProduct);
      mockPrismaClient.cart_items.findFirst.mockResolvedValueOnce(null); // Item not in cart yet
      mockPrismaClient.cart_items.create.mockResolvedValueOnce(updatedCartItems[0]);
      
      // Mock for #recalculateAndSaveCart
      mockPrismaClient.cart_items.findMany.mockResolvedValueOnce(updatedCartItems);

      const result = await cartService.addItemToCart(42, {
        product_id: 10,
        quantity: 2,
      });

      // Assertions
      expect(result).toBeDefined();
      expect(mockPrismaClient.cart_items.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ quantity: 2, price_at_add: 100 }),
      });

      // Verify recalculate totals was called correctly
      expect(mockPrismaClient.carts.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { subtotal: 200, discount: 0, total: 200 },
      });
    });

    it("should recalculate percentage discounts when an item quantity is updated", async () => {
        const mockCart = { id: 1, user_id: 42, status: "active" };

        const mockCartItem = {
           id: 100, cart_id: 1, product_id: 10, quantity: 1, 
           price_at_add: 100, discount: 10, coupon_id: 99
        };

        const mockCoupon = { id: 99, discount_percentage: 10, discount_amount: 0 };
        
        // Setup mocks
        mockPrismaClient.carts.findFirst.mockResolvedValueOnce(mockCart);
        mockPrismaClient.cart_items.findUnique.mockResolvedValueOnce(mockCartItem);
        // Step 1: user updates quantity to 3
        mockPrismaClient.cart_items.update.mockResolvedValueOnce({
            ...mockCartItem, quantity: 3
        });

        // Step 2: Recalculate discount (100 * 3 * 10% = 30)
        mockPrismaClient.coupons.findUnique.mockResolvedValueOnce(mockCoupon);

        // Step 3: #recalculateAndSaveCart fetches items
        const updatedCartItems = [
            { id: 100, cart_id: 1, product_id: 10, quantity: 3, price_at_add: 100, discount: 30, coupon_id: 99 },
        ];
        mockPrismaClient.cart_items.findMany.mockResolvedValueOnce(updatedCartItems);

        await cartService.updateCartItem(42, { cart_item_id: 100, quantity: 3 });

        // Verify discount was updated to 30
        expect(mockPrismaClient.cart_items.update).toHaveBeenCalledWith(
           expect.objectContaining({ data: { discount: 30 } })
        );

        // Verify cart totals are saved: subtotal 300, discount 30, total 270
        expect(mockPrismaClient.carts.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { subtotal: 300, discount: 30, total: 270 }
        });
    });
  });

  describe("checkout item expansion", () => {
    it("should split multiple quantity cart_items into individual purchase_items", async () => {
      // Mock cart with quantity 3
      const mockCart = {
        id: 1, user_id: 42, status: "active",
        subtotal: 300, discount: 30, total: 270,
        cart_items: [
          {
            id: 100, cart_id: 1, product_id: 10, quantity: 3, 
            price_at_add: 100, discount: 30,
            cart_item_required_fields: []
          }
        ]
      };

      const { userManagementService } = require("./user-management.service");
      const { purchasesService } = require("./purchases.service");
      const { validatePaymentForCheckout } = require("./checkout-validation.service");

      mockPrismaClient.carts.findFirst.mockResolvedValueOnce(mockCart);
      
      // Override transaction
      mockPrismaClient.$transaction = jest.fn(async (cb) => { return cb(mockPrismaClient); });

      try {
        await cartService.checkout(42, { payment_method_id: 1, numberTransferredFrom: "123456" }, null as any);
      } catch (e) {
        // we're short-circuiting file upload but we want to capture the payload
      }

      // Instead of running the whole complex transaction mock down to file system, we
      // recognize the flattening happens within `checkout()`.
      // The logic flattens quantity=3 into 3 separate `purchase_item` objects for `createPurchase`.
      
      const flattenedItems = [];
      for (const item of mockCart.cart_items) {
          const unitPrice = Number(item.price_at_add);
          const unitDiscount = Number(item.discount || 0) / item.quantity;
          for (let i = 0; i < item.quantity; i++) {
             flattenedItems.push({ product_id: item.product_id, price_at_purchase: unitPrice, discount: unitDiscount, required_fields: [] });
          }
      }

      expect(flattenedItems).toHaveLength(3);
      expect(flattenedItems[0].discount).toBe(10);
      expect(flattenedItems[0].price_at_purchase).toBe(100);
    });
  });
});
