// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store checkout validation service.
const AppError = require("../../../utils/appError");
const PaymentMethod = require("../../../models/paymentMethodModel");

// Encapsulates all validation rules for checkout to allow future expansion
const CheckoutValidator = {
  ensureCartNotEmpty(cartItems) {
    if (!cartItems || cartItems.length === 0) {
      throw new AppError("Cart is empty", 400);
    }
  },

  ensureBookFieldsIfNeeded(cartItems, body) {
    const hasBooks = cartItems.some((item) => item.product?.__t === "ECBook");
    if (!hasBooks) return;

    const missing = [];
    if (!body.nameOnBook) missing.push("nameOnBook");
    if (!body.numberOnBook) missing.push("numberOnBook");
    if (!body.seriesName) missing.push("seriesName");

    if (missing.length) {
      throw new AppError(
        `Missing required fields: ${missing.join(", ")}`,
        400,
      );
    }
  },

  async validatePayment({ total, body, paymentFile }) {
    if (total <= 0) {
      return {
        paymentMethodDoc: null,
        numberTransferredFrom: null,
        paymentScreenShot: null,
      };
    }

    if (!body.numberTransferredFrom || !paymentFile) {
      throw new AppError(
        "Payment Screenshot and Number Transferred From are required",
        400,
      );
    }

    if (!body.paymentMethod) {
      throw new AppError("Payment Method is required", 400);
    }

    const paymentMethodDoc = await PaymentMethod.findById(body.paymentMethod);
    if (!paymentMethodDoc) {
      throw new AppError("Invalid Payment Method Selected", 400);
    }

    if (paymentMethodDoc.phoneNumber === body.numberTransferredFrom) {
      throw new AppError(
        "Please enter the number that you used to pay not the number of the payment method",
        400,
      );
    }

    return {
      paymentMethodDoc,
      numberTransferredFrom: body.numberTransferredFrom,
      paymentScreenShot: paymentFile.path,
    };
  },
};

module.exports = CheckoutValidator;
