// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart purchase admin note logic.
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

module.exports = catchAsync(async (req, res, next) => {
  const exists = await ECCartPurchase.exists({ _id: req.params.id });
  if (!exists) {
    return next(new AppError("Purchase not found", 404));
  }

  const purchase = await ECCartPurchase.findByIdAndUpdate(
    req.params.id,
    {
      adminNotes: req.body.adminNotes,
      adminNoteBy: req.user._id,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate("createdBy", "name email")
    .populate("confirmedBy", "name email")
    .populate("adminNoteBy", "name");

  res.status(200).json({
    status: "success",
    data: {
      purchase,
    },
  });
});
