// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart purchase creation logic.
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const ECCart = require("../../models/ec.cartModel");
const ECCoupon = require("../../models/ec.couponModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const { sendEmail } = require("../../utils/emailVerification/emailService");
const Notification = require("../../models/notification");
const User = require("../../models/userModel");
const { emitBellNotification } = require("../../utils/bellNotification");
const CheckoutValidator = require("./services/checkoutValidator");
const PriceCalculator = require("./services/priceCalculator");
const {
  buildUserSerial,
  generatePurchaseSerial,
} = require("./services/serialService");
const { getStrategy } = require("./strategies/strategyFactory");

const pickPaymentFile = (req) =>
  req.file ||
  (req.files && req.files.paymentScreenShot && req.files.paymentScreenShot[0]);

const pickWatermarkFile = (req) =>
  req.files && req.files.watermark && req.files.watermark[0];

module.exports = catchAsync(async (req, res, next) => {
  const userSerial = buildUserSerial(req.user);

  const throttleWindow = new Date(Date.now() - 30000);
  const recentPurchase = await ECCartPurchase.findOne({
    createdBy: req.user._id,
    createdAt: { $gte: throttleWindow },
  }).sort({ createdAt: -1 });

  if (recentPurchase) {
    const timeSinceLastPurchase =
      Date.now() - new Date(recentPurchase.createdAt).getTime();
    const remainingSeconds = Math.ceil((30000 - timeSinceLastPurchase) / 1000);
    return next(
      new AppError(
        `Please wait ${remainingSeconds} seconds before making another purchase`,
        429,
      ),
    );
  }

  const cart = await ECCart.findOne({
    user: req.user._id,
    status: "active",
  }).populate({
    path: "itemsWithDetails",
    populate: [
      {
        path: "product",
        select:
          "title thumbnail priceAfterDiscount paymentNumber serial section __t",
      },
      {
        path: "couponCode",
        select: "couponCode value isActive",
      },
    ],
  });

  const cartItems = cart?.itemsWithDetails || [];
  if (!cart) {
    return next(new AppError("Cart is empty", 400));
  }

  CheckoutValidator.ensureCartNotEmpty(cartItems);
  CheckoutValidator.ensureBookFieldsIfNeeded(cartItems, req.body);

  const paymentFile = pickPaymentFile(req);
  const watermarkFile = pickWatermarkFile(req);

  const pricingTotals = PriceCalculator.totalsFromCart(cart);
  const strategy = getStrategy(cartItems);
  const items = strategy.decorateItems(
    PriceCalculator.buildLineItems(cartItems),
    req.body,
  );

  const paymentValidation = await CheckoutValidator.validatePayment({
    total: pricingTotals.total,
    body: req.body,
    paymentFile,
  });

  const purchaseSerial = await generatePurchaseSerial(userSerial);

  const purchase = await ECCartPurchase.create({
    userName: req.user.name,
    createdBy: req.user._id,
    items,
    numberTransferredFrom: paymentValidation.numberTransferredFrom,
    paymentNumber: paymentValidation.paymentMethodDoc
      ? paymentValidation.paymentMethodDoc.phoneNumber
      : null,
    paymentMethod: paymentValidation.paymentMethodDoc
      ? paymentValidation.paymentMethodDoc._id
      : null,
    paymentScreenShot: paymentValidation.paymentScreenShot,
    subtotal: pricingTotals.subtotal,
    discount: pricingTotals.discount,
    total: pricingTotals.total,
    notes: req.body.notes,
    purchaseSerial,
    watermark: watermarkFile ? watermarkFile.path : null,
  });

  // Mark per-item coupons as used
  for (const item of cartItems) {
    if (item.couponCode && item.couponCode._id) {
      const coupon = await ECCoupon.findById(item.couponCode._id);
      if (coupon && coupon.isActive) {
        await coupon.markAsUsed(purchase._id, req.user._id);
      }
    }
  }

  const productListHTML = cartItems
    .map(
      (item, index) => `
            <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 10px; text-align: center;">${index + 1}</td>
                <td style="padding: 10px;">${item.product.title}</td>
            </tr>`,
    )
    .join("");

  const productListText = cartItems
    .map((item, index) => `${index + 1}. ${item.product.title}`)
    .join("\n");

  const totalText = cart.total > 0 ? `${cart.total.toFixed(2)} EGP` : "FREE";
  const discountText =
    cart.discount > 0 ? `\n- Discount: ${cart.discount.toFixed(2)} EGP` : "";

  try {
    await sendEmail(
      req.user.email,
      "Your Order Has Been Received",
      `<div dir="auto" style='font-family: Arial, sans-serif;'>
            <h2>Thank you for your purchase!</h2>
            <p>Dear ${req.user.name},</p>
            <p>We’re happy to let you know that your order (<b>${purchaseSerial}</b>) has been received.</p>
            <p>You have ordered <b>${cartItems.length}</b> product(s).</p>
            <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr>
                        <th style="text-align:center; padding: 8px; border-bottom: 1px solid #ddd;">##</th>
                        <th style="text-align:start; padding: 8px; border-bottom: 1px solid #ddd;">Product</th>
                    </tr>
                </thead>
                <tbody>
                    ${productListHTML}
                </tbody>
            </table>
            <p>Your order will be processed after the payment is reviewed by our team during working hours from <b>9:00 AM to 9:00 PM</b>.</p>
            <p>If you have any questions, please contact our support team.</p>
            <br>
            <p>Best regards,<br><b>Kalima Team</b></p>
            </div>`,
    );
  } catch (err) {
    console.error("Failed to send purchase confirmation email:", err);
  }

  try {
    if (req.user.phoneNumber) {
      const whatsappMessage = `🎉 *تأكيد الطلب*\n\nعزيزي ${req.user.name}،\n\nشكراً لطلبك!\n\n*رقم الطلب:* ${purchaseSerial}\n\n*المنتجات:*\n${productListText}\n${discountText}\n*الإجمالي: ${totalText}*\n\nسيتم معالجة طلبك خلال ساعات العمل (9 صباحاً - 9 مساءً).\n\nشكراً لاختيارك كلمة! 📚`;
      // Integrate with WhatsApp provider here
    }
  } catch (err) {
    console.error("Failed to send WhatsApp notification:", err);
  }

  try {
    const adminUsers = await User.find({
      role: { $in: ["Admin", "SubAdmin", "Moderator"] },
    }).select("_id name role");

    if (adminUsers && adminUsers.length > 0) {
      const notificationPayloads = adminUsers.map((admin) => ({
        userId: admin._id,
        title: "طلب جديد في المتجر",
        message: `طلب جديد من ${req.user.name}\nرقم الطلب: ${purchaseSerial}\nعدد المنتجات: ${cartItems.length}\nالإجمالي: ${totalText}`,
        type: "store_purchase",
        relatedId: purchase._id,
        metadata: {
          purchaseSerial,
          customerName: req.user.name,
          customerEmail: req.user.email,
          customerPhone: req.user.phoneNumber,
          itemCount: cartItems.length,
          subtotal: cart.subtotal,
          discount: cart.discount,
          total: cart.total,
          productList: productListText,
          products: cartItems.map((item) => ({
            title: item.product.title,
            price: item.priceAtAdd,
          })),
          createdAt: new Date(),
        },
      }));

      await Notification.insertMany(notificationPayloads);
    }
  } catch (err) {
    console.error("Failed to send admin notifications:", err);
  }

  try {
    const io = req.app.get("io");
    if (io) {
      await emitBellNotification(io, {
        purchaseId: purchase._id,
        purchaseSerial,
        customerName: req.user.name,
        customerEmail: req.user.email,
        total: cart.total,
        itemCount: cartItems.length,
      });
    }
  } catch (err) {
    console.error("Failed to emit bell notification:", err);
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $inc: {
        numberOfPurchases: 1,
        TotalSpentAmount: cart.total,
      },
    },
    { new: true },
  );

  await cart.clear();

  res.status(201).json({
    status: "success",
    data: {
      purchase,
    },
  });
});
