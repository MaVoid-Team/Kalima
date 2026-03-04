// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart purchases query logic.
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");

module.exports = catchAsync(async (req, res) => {
  const purchases = await ECCartPurchase.find({
    createdBy: req.user._id,
  })
    .sort("-createdAt")
    .populate("couponCode")
    .populate({
      path: "paymentMethod",
      select: "name",
      strictPopulate: false,
    })
    .select(
      "-confirmedBy -adminNoteBy -receivedBy -returnedBy -returnedAt -confirmedAt -adminNotes -receivedAt -userName -createdBy",
    );

  res.status(200).json({
    status: "success",
    results: purchases.length,
    data: {
      purchases,
    },
  });
});
