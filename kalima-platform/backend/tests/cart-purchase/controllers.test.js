const AppError = require("../../utils/appError");

jest.mock("../../models/ec.cartPurchaseModel", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
  exists: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../../models/ec.cartModel", () => ({
  findOne: jest.fn(),
}));

jest.mock("../../models/ec.couponModel", () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../../models/notification", () => ({
  insertMany: jest.fn(),
}));

jest.mock("../../models/userModel", () => ({
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../../utils/emailVerification/emailService", () => ({
  sendEmail: jest.fn(),
}));

jest.mock("../../utils/bellNotification", () => ({
  emitBellNotification: jest.fn(),
}));

jest.mock("../../controllers/cart-purchase/services/checkoutValidator", () => ({
  ensureCartNotEmpty: jest.fn(),
  ensureBookFieldsIfNeeded: jest.fn(),
  validatePayment: jest.fn(),
}));

jest.mock("../../controllers/cart-purchase/services/priceCalculator", () => ({
  totalsFromCart: jest.fn(),
  buildLineItems: jest.fn(),
}));

jest.mock("../../controllers/cart-purchase/services/serialService", () => ({
  buildUserSerial: jest.fn(),
  generatePurchaseSerial: jest.fn(),
}));

jest.mock("../../controllers/cart-purchase/strategies/strategyFactory", () => ({
  getStrategy: jest.fn(),
}));

jest.mock("../../controllers/cart-purchase/helpers", () => ({
  getCurrentEgyptTime: jest.fn(),
}));

jest.mock(
  "../../controllers/cart-purchase/services/monthlyCountService",
  () => ({
    refreshMonthlyConfirmedCount: jest.fn(),
    isCacheStale: jest.fn(),
  }),
);

const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const ECCart = require("../../models/ec.cartModel");
const ECCoupon = require("../../models/ec.couponModel");
const Notification = require("../../models/notification");
const User = require("../../models/userModel");
const { sendEmail } = require("../../utils/emailVerification/emailService");
const { emitBellNotification } = require("../../utils/bellNotification");
const CheckoutValidator = require("../../controllers/cart-purchase/services/checkoutValidator");
const PriceCalculator = require("../../controllers/cart-purchase/services/priceCalculator");
const {
  buildUserSerial,
  generatePurchaseSerial,
} = require("../../controllers/cart-purchase/services/serialService");
const {
  getStrategy,
} = require("../../controllers/cart-purchase/strategies/strategyFactory");
const {
  getCurrentEgyptTime,
} = require("../../controllers/cart-purchase/helpers");
const {
  refreshMonthlyConfirmedCount,
  isCacheStale,
} = require("../../controllers/cart-purchase/services/monthlyCountService");

const createCartPurchase = require("../../controllers/cart-purchase/createCartPurchase");
const confirmCartPurchase = require("../../controllers/cart-purchase/confirmCartPurchase");
const receivePurchase = require("../../controllers/cart-purchase/receivePurchase");
const returnCartPurchase = require("../../controllers/cart-purchase/returnCartPurchase");
const deletePurchase = require("../../controllers/cart-purchase/deletePurchase");
const getCartPurchaseById = require("../../controllers/cart-purchase/getCartPurchaseById");
const getCartPurchases = require("../../controllers/cart-purchase/getCartPurchases");
const addAdminNote = require("../../controllers/cart-purchase/addAdminNote");
const getMonthlyConfirmedPurchasesCount = require("../../controllers/cart-purchase/getMonthlyConfirmedPurchasesCount");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const createSortQuery = (result) => ({
  sort: jest.fn().mockResolvedValue(result),
});

const createThenableQuery = (result) => ({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
});

describe("cart-purchase controllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCartPurchase", () => {
    test("throttles rapid purchases", async () => {
      ECCartPurchase.findOne.mockReturnValue(
        createSortQuery({ createdAt: new Date() }),
      );

      const req = { user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      createCartPurchase(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(ECCart.findOne).not.toHaveBeenCalled();
    });

    test("rejects when cart is empty", async () => {
      ECCartPurchase.findOne.mockReturnValue(createSortQuery(null));
      ECCart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const req = { user: { _id: "u1" }, body: {} };
      const res = createRes();
      const next = jest.fn();

      createCartPurchase(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(CheckoutValidator.ensureCartNotEmpty).not.toHaveBeenCalled();
    });

    test("creates purchase and clears cart", async () => {
      ECCartPurchase.findOne.mockReturnValue(createSortQuery(null));

      const cart = {
        _id: "c1",
        itemsWithDetails: [
          {
            product: { title: "P1" },
            couponCode: { _id: "cp1" },
          },
        ],
        subtotal: 100,
        discount: 10,
        total: 90,
        clear: jest.fn(),
      };

      ECCart.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(cart),
      });

      CheckoutValidator.ensureCartNotEmpty.mockReturnValue();
      CheckoutValidator.ensureBookFieldsIfNeeded.mockReturnValue();
      CheckoutValidator.validatePayment.mockResolvedValue({
        numberTransferredFrom: "123",
        paymentMethodDoc: { _id: "pm1", phoneNumber: "999" },
        paymentScreenShot: "file.png",
      });

      PriceCalculator.totalsFromCart.mockReturnValue({
        subtotal: 100,
        discount: 10,
        total: 90,
      });
      PriceCalculator.buildLineItems.mockReturnValue([{ product: "p1" }]);

      const strategy = {
        decorateItems: jest.fn().mockReturnValue([{ product: "p1" }]),
      };
      getStrategy.mockReturnValue(strategy);

      buildUserSerial.mockReturnValue("USR");
      generatePurchaseSerial.mockResolvedValue("SER-1");

      ECCartPurchase.create.mockResolvedValue({ _id: "pur1" });
      ECCoupon.findById.mockResolvedValue({
        isActive: true,
        markAsUsed: jest.fn(),
      });
      sendEmail.mockResolvedValue();
      User.find.mockResolvedValue([
        { _id: "a1", name: "Admin", role: "Admin" },
      ]);
      Notification.insertMany.mockResolvedValue();
      emitBellNotification.mockResolvedValue();
      User.findByIdAndUpdate.mockResolvedValue({});

      const req = {
        user: {
          _id: "u1",
          name: "User",
          email: "user@example.com",
          phoneNumber: "010",
        },
        body: {},
        app: { get: jest.fn().mockReturnValue({}) },
      };
      const res = createRes();
      const next = jest.fn();

      createCartPurchase(req, res, next);
      await flushPromises();

      expect(ECCartPurchase.create).toHaveBeenCalledTimes(1);
      expect(CheckoutValidator.validatePayment).toHaveBeenCalledTimes(1);
      expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(cart.clear).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("confirmCartPurchase", () => {
    test("rejects missing purchase", async () => {
      ECCartPurchase.findById.mockResolvedValue(null);

      const req = { params: { id: "p1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      confirmCartPurchase(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(ECCartPurchase.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("confirms purchase and refreshes cache", async () => {
      ECCartPurchase.findById.mockResolvedValue({ status: "received" });
      getCurrentEgyptTime.mockReturnValue({ toJSDate: () => new Date() });
      ECCartPurchase.findByIdAndUpdate.mockResolvedValue({});

      const req = { params: { id: "p1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      confirmCartPurchase(req, res, next);
      await flushPromises();

      expect(ECCartPurchase.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(refreshMonthlyConfirmedCount).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("receivePurchase", () => {
    test("rejects when status is not pending", async () => {
      ECCartPurchase.findById.mockResolvedValue({ status: "confirmed" });

      const req = { params: { id: "p1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      receivePurchase(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    test("marks purchase as received", async () => {
      ECCartPurchase.findById.mockResolvedValue({ status: "pending" });
      getCurrentEgyptTime.mockReturnValue({ toJSDate: () => new Date() });

      const req = { params: { id: "p1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      receivePurchase(req, res, next);
      await flushPromises();

      expect(ECCartPurchase.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("returnCartPurchase", () => {
    test("rejects when already returned", async () => {
      ECCartPurchase.findById.mockResolvedValue({ status: "returned" });

      const req = { params: { id: "p1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      returnCartPurchase(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    test("marks purchase as returned", async () => {
      ECCartPurchase.findById.mockResolvedValue({ status: "confirmed" });
      getCurrentEgyptTime.mockReturnValue({ toJSDate: () => new Date() });

      const req = { params: { id: "p1" }, user: { _id: "u1" } };
      const res = createRes();
      const next = jest.fn();

      returnCartPurchase(req, res, next);
      await flushPromises();

      expect(ECCartPurchase.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("deletePurchase", () => {
    test("returns 404 when purchase missing", async () => {
      ECCartPurchase.findById.mockResolvedValue(null);

      const req = { params: { id: "p1" } };
      const res = createRes();
      const next = jest.fn();

      deletePurchase(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    test("deletes confirmed purchase and refreshes cache twice", async () => {
      ECCartPurchase.findById.mockResolvedValue({
        status: "confirmed",
        couponCode: "cp1",
        confirmedBy: "admin1",
        createdBy: "u1",
        total: 50,
      });

      ECCoupon.findById.mockResolvedValue({});
      ECCoupon.findByIdAndUpdate.mockResolvedValue({});
      User.findByIdAndUpdate.mockResolvedValue({});
      ECCartPurchase.findByIdAndDelete.mockResolvedValue({});

      const req = { params: { id: "p1" } };
      const res = createRes();
      const next = jest.fn();

      deletePurchase(req, res, next);
      await flushPromises();

      expect(refreshMonthlyConfirmedCount).toHaveBeenCalledTimes(2);
      expect(ECCartPurchase.findByIdAndDelete).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getCartPurchaseById", () => {
    test("returns purchase when found", async () => {
      ECCartPurchase.findById.mockReturnValue(
        createThenableQuery({ _id: "p1" }),
      );

      const req = { params: { id: "p1" } };
      const res = createRes();
      const next = jest.fn();

      getCartPurchaseById(req, res, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: { purchase: { _id: "p1" } } }),
      );
    });
  });

  describe("getCartPurchases", () => {
    test("returns purchases for user", async () => {
      const purchases = [{ _id: "p1" }];
      ECCartPurchase.find.mockReturnValue(createThenableQuery(purchases));

      const req = { user: { _id: "u1" } };
      const res = createRes();

      getCartPurchases(req, res);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ results: 1 }),
      );
    });
  });

  describe("addAdminNote", () => {
    test("returns 404 when purchase missing", async () => {
      ECCartPurchase.exists.mockResolvedValue(false);

      const req = { params: { id: "p1" }, body: {}, user: { _id: "a1" } };
      const res = createRes();
      const next = jest.fn();

      addAdminNote(req, res, next);
      await flushPromises();

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(ECCartPurchase.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("updates admin note", async () => {
      ECCartPurchase.exists.mockResolvedValue(true);
      ECCartPurchase.findByIdAndUpdate.mockReturnValue(
        createThenableQuery({ _id: "p1" }),
      );

      const req = {
        params: { id: "p1" },
        body: { adminNotes: "note" },
        user: { _id: "a1" },
      };
      const res = createRes();
      const next = jest.fn();

      addAdminNote(req, res, next);
      await flushPromises();

      expect(ECCartPurchase.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getMonthlyConfirmedPurchasesCount", () => {
    test("refreshes count when cache is stale", async () => {
      User.findById.mockReturnValue(
        createThenableQuery({
          monthlyConfirmedCount: 0,
          lastConfirmedCountUpdate: null,
        }),
      );
      isCacheStale.mockReturnValue(true);
      refreshMonthlyConfirmedCount.mockResolvedValue(5);
      getCurrentEgyptTime.mockReturnValue({ toFormat: () => "February 2026" });

      const req = { user: { _id: "u1" } };
      const res = createRes();

      getMonthlyConfirmedPurchasesCount(req, res);
      await flushPromises();

      expect(refreshMonthlyConfirmedCount).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
