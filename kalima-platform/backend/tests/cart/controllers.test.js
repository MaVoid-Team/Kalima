const AppError = require("../../utils/appError");

jest.mock("../../models/ec.cartModel", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../../models/ec.cartItemModel", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../../models/ec.productModel", () => ({
  findById: jest.fn(),
}));

jest.mock("../../models/ec.couponModel", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../controllers/cart/helper", () => ({
  updateCartTotals: jest.fn(),
  removeItemFromCart: jest.fn(),
  clearCartItems: jest.fn(),
  validateCheckoutRules: jest.fn(),
  createPurchaseRecords: jest.fn(),
  getCheckoutRequirements: jest.fn(),
}));

jest.mock("mongoose", () => ({
  startSession: jest.fn(),
}));

const ECCart = require("../../models/ec.cartModel");
const ECCartItem = require("../../models/ec.cartItemModel");
const ECProduct = require("../../models/ec.productModel");
const ECCoupon = require("../../models/ec.couponModel");
const {
  updateCartTotals,
  removeItemFromCart,
  clearCartItems,
  validateCheckoutRules,
  createPurchaseRecords,
  getCheckoutRequirements,
} = require("../../controllers/cart/helper");
const mongoose = require("mongoose");

const addItemToCart = require("../../controllers/cart/add-to-cart");
const { removeFromCart } = require("../../controllers/cart/remove-from-cart");
const {
  updateItemQuantity,
} = require("../../controllers/cart/update-item-quantity");
const { clearCart } = require("../../controllers/cart/clear-cart");
const { applyCoupon } = require("../../controllers/cart/apply-coupon");
const { removeCoupon } = require("../../controllers/cart/remove-coupon");
const { getCart } = require("../../controllers/cart/get-cart");
const { getCheckoutPreview } = require("../../controllers/cart/get-preview");
const { checkout } = require("../../controllers/cart/checkout");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));
const createSelectQuery = (result) => ({
  select: jest.fn().mockResolvedValue(result),
});

describe("cart controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addItemToCart", () => {
    test("returns 404 when product not found", async () => {
      ECProduct.findById.mockResolvedValue(null);
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = { body: { productId: "p1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      addItemToCart(req, res, next);
      await flushPromises();

      expect(ECProduct.findById).toHaveBeenCalledTimes(1);
      expect(ECCart.findOne).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(updateCartTotals).not.toHaveBeenCalled();
    });

    test("creates cart when none exists and adds item", async () => {
      const product = { _id: "p1", title: "T", price: 100 };
      ECProduct.findById.mockResolvedValue(product);
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      ECCart.create.mockResolvedValue({ _id: "c1" });
      ECCartItem.findOne
        .mockReturnValueOnce(createSelectQuery(null))
        .mockResolvedValueOnce(null);
      ECCartItem.create.mockResolvedValue({ _id: "item1" });

      const req = {
        body: { productId: "p1", quantity: 2 },
        user: { _id: "u1" },
      };
      const res = createRes();
      const next = jest.fn();

      addItemToCart(req, res, next);
      await flushPromises();

      expect(ECCart.create).toHaveBeenCalledTimes(1);
      expect(ECCartItem.create).toHaveBeenCalledTimes(1);
      expect(updateCartTotals).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ action: "created" }),
      );
    });

    test("prevents mixing product types", async () => {
      const product = { _id: "p1", title: "T", price: 100, __t: "ECBook" };
      ECProduct.findById.mockResolvedValue(product);
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "c1" }),
      });
      ECCartItem.findOne.mockReturnValueOnce(
        createSelectQuery({ productType: "ECProduct" }),
      );

      const req = { body: { productId: "p1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      addItemToCart(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(ECCartItem.create).not.toHaveBeenCalled();
      expect(updateCartTotals).not.toHaveBeenCalled();
    });

    test("updates quantity when cart item exists", async () => {
      const product = { _id: "p1", title: "T", price: 100 };
      const cartItem = { quantity: 1, priceAtAdd: 100, save: jest.fn() };

      ECProduct.findById.mockResolvedValue(product);
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "c1" }),
      });
      ECCartItem.findOne
        .mockReturnValueOnce(createSelectQuery(null))
        .mockResolvedValueOnce(cartItem);

      const req = {
        body: { productId: "p1", quantity: 2 },
        user: { _id: "u1" },
      };
      const res = createRes();
      const next = jest.fn();

      addItemToCart(req, res, next);
      await flushPromises();

      expect(cartItem.save).toHaveBeenCalledTimes(1);
      expect(updateCartTotals).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ action: "updated" }),
      );
    });
  });

  describe("removeFromCart", () => {
    test("returns 404 when no active cart", async () => {
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = { params: { itemId: "i1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      removeFromCart(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(removeItemFromCart).not.toHaveBeenCalled();
    });

    test("removes item and responds", async () => {
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "c1" }),
      });
      removeItemFromCart.mockResolvedValue({ _id: "i1" });

      const req = { params: { itemId: "i1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      removeFromCart(req, res, next);
      await flushPromises();

      expect(removeItemFromCart).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success" }),
      );
    });
  });

  describe("updateItemQuantity", () => {
    test("rejects invalid quantity", async () => {
      const req = {
        params: { itemId: "i1" },
        body: { quantity: 0 },
        user: { _id: "u1" },
      };
      const res = createRes();
      const next = jest.fn();

      updateItemQuantity(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(ECCart.findOne).not.toHaveBeenCalled();
    });

    test("returns 404 when cart missing", async () => {
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = {
        params: { itemId: "i1" },
        body: { quantity: 2 },
        user: { _id: "u1" },
      };
      const res = createRes();
      const next = jest.fn();

      updateItemQuantity(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    test("updates item and totals", async () => {
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "c1" }),
      });
      const cartItem = { priceAtAdd: 50, quantity: 1, save: jest.fn() };
      ECCartItem.findOne.mockResolvedValue(cartItem);

      const req = {
        params: { itemId: "i1" },
        body: { quantity: 2 },
        user: { _id: "u1" },
      };
      const res = createRes();
      const next = jest.fn();

      updateItemQuantity(req, res, next);
      await flushPromises();

      expect(cartItem.save).toHaveBeenCalledTimes(1);
      expect(updateCartTotals).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("clearCart", () => {
    test("returns 404 when cart missing", async () => {
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = { user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      clearCart(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(clearCartItems).not.toHaveBeenCalled();
    });

    test("clears cart and returns empty cart", async () => {
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "c1" }),
      });
      clearCartItems.mockResolvedValue({ _id: "c1", items: [] });

      const req = { user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      clearCart(req, res, next);
      await flushPromises();

      expect(clearCartItems).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("applyCoupon", () => {
    test("requires coupon code and item id", async () => {
      const req = { body: {}, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      applyCoupon(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(ECCoupon.findOne).not.toHaveBeenCalled();
    });

    test("applies coupon and recalculates totals", async () => {
      ECCoupon.findOne.mockResolvedValue({
        _id: "cp1",
        isActive: true,
        value: 10,
      });
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "c1" }),
      });

      const cartItem = {
        _id: "i1",
        couponCode: null,
        discount: 0,
        save: jest.fn(),
      };

      ECCartItem.findOne
        .mockResolvedValueOnce(cartItem)
        .mockResolvedValueOnce(null);

      const req = {
        body: { couponCode: "SAVE", itemId: "i1" },
        user: { _id: "u1" },
      };
      const res = createRes();
      const next = jest.fn();

      applyCoupon(req, res, next);
      await flushPromises();

      expect(cartItem.save).toHaveBeenCalledTimes(1);
      expect(updateCartTotals).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(ECCoupon.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeCoupon", () => {
    test("rejects when item id missing", async () => {
      const req = { params: {}, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      removeCoupon(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    test("removes coupon and recalculates totals", async () => {
      ECCart.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "c1" }),
      });

      const cartItem = {
        _id: "i1",
        couponCode: "cp1",
        discount: 10,
        save: jest.fn(),
      };
      ECCartItem.findOne.mockResolvedValue(cartItem);

      const req = { params: { itemId: "i1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      removeCoupon(req, res, next);
      await flushPromises();

      expect(cartItem.save).toHaveBeenCalledTimes(1);
      expect(updateCartTotals).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getCart", () => {
    test("returns empty cart payload when no cart", async () => {
      ECCart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const req = { user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      getCart(req, res, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { cart: null, itemCount: 0 },
        }),
      );
    });
  });

  describe("getCheckoutPreview", () => {
    test("returns 404 when cart missing", async () => {
      ECCart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const req = { user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      getCheckoutPreview(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(getCheckoutRequirements).not.toHaveBeenCalled();
    });

    test("returns requirements and cart", async () => {
      const cart = { _id: "c1", items: [] };
      ECCart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(cart),
      });
      getCheckoutRequirements.mockReturnValue({
        hasBooks: false,
        requiredFields: { common: [], books: [] },
      });

      const req = { user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      getCheckoutPreview(req, res, next);
      await flushPromises();

      expect(getCheckoutRequirements).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("checkout", () => {
    test("returns 404 when cart missing", async () => {
      ECCart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const req = { user: { _id: "u1" }, body: {} };
      const res = createRes();
      const next = jest.fn();

      checkout(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    test("returns 400 when cart empty", async () => {
      ECCart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ items: [] }),
      });

      const req = { user: { _id: "u1" }, body: {} };
      const res = createRes();
      const next = jest.fn();

      checkout(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    test("completes checkout and commits transaction", async () => {
      const cart = { _id: "c1", items: [{ product: { _id: "p1" } }] };
      ECCart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(cart),
      });
      validateCheckoutRules.mockReturnValue();
      createPurchaseRecords.mockResolvedValue([{ _id: "pur1" }]);
      clearCartItems.mockResolvedValue({});

      const session = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      mongoose.startSession.mockResolvedValue(session);

      const req = { user: { _id: "u1" }, body: {} };
      const res = createRes();
      const next = jest.fn();

      checkout(req, res, next);
      await flushPromises();

      expect(createPurchaseRecords).toHaveBeenCalledTimes(1);
      expect(clearCartItems).toHaveBeenCalledTimes(1);
      expect(session.commitTransaction).toHaveBeenCalledTimes(1);
      expect(session.abortTransaction).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("aborts transaction on failure", async () => {
      const cart = { _id: "c1", items: [{ product: { _id: "p1" } }] };
      ECCart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(cart),
      });
      validateCheckoutRules.mockReturnValue();
      createPurchaseRecords.mockRejectedValue(new Error("fail"));

      const session = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      mongoose.startSession.mockResolvedValue(session);

      const req = { user: { _id: "u1" }, body: {} };
      const res = createRes();
      const next = jest.fn();

      checkout(req, res, next);
      await flushPromises();

      expect(session.abortTransaction).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
