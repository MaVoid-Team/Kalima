// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart purchase lookup logic.
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

module.exports = catchAsync(async (req, res, next) => {
  const purchase = await ECCartPurchase.findById(req.params.id)
    .populate("couponCode")
    .populate("createdBy", "name email")
    .populate("confirmedBy", "name email")
    .populate("adminNoteBy", "name")
    .populate({
      path: "paymentMethod",
      select: "name phoneNumber",
      strictPopulate: false,
    });

  if (!purchase) {
    return next(new AppError("Purchase not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});
