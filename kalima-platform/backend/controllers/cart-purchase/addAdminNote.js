const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

module.exports = catchAsync(async (req, res, next) => {
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
