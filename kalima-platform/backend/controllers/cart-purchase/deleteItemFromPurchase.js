// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart purchase item deletion logic.
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const User = require("../../models/userModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

module.exports = catchAsync(async (req, res, next) => {
  const { purchaseId, itemId } = req.params;
  const purchase = await ECCartPurchase.findById(purchaseId);
  if (!purchase) {
    return next(new AppError("No purchase found with that ID", 404));
  }

  const itemToDelete = purchase.items.id(itemId);
  if (!itemToDelete) {
    return next(
      new AppError("No item found with that ID in the purchase", 404),
    );
  }

  if (purchase.items.length === 1) {
    return next(
      new AppError(
        "Cannot remove the last item from the purchase. Delete the entire purchase instead.",
        400,
      ),
    );
  }

  const deletedItemPrice = itemToDelete.priceAtPurchase || 0;

  await User.findByIdAndUpdate(
    purchase.createdBy,
    {
      $inc: {
        TotalSpentAmount: -deletedItemPrice,
      },
    },
    { new: true },
  );

  purchase.items.id(itemId).deleteOne();

  const newSubtotal = purchase.items.reduce(
    (sum, item) => sum + (item.priceAtPurchase || 0),
    0,
  );

  purchase.subtotal = newSubtotal;
  purchase.total = Math.max(0, newSubtotal - (purchase.discount || 0));

  await purchase.save();
  res.status(200).json({
    status: "success",
    message: "Item removed from purchase successfully",
    data: {
      purchase,
    },
  });
});
