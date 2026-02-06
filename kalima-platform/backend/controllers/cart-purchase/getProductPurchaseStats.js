const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");

module.exports = catchAsync(async (req, res) => {
  const stats = await ECCartPurchase.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalPurchases: { $sum: 1 },
        totalValue: { $sum: "$items.priceAtPurchase" },
      },
    },
    {
      $lookup: {
        from: "ecproducts",
        localField: "_id",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: "$productInfo.title",
        productSection: "$productInfo.section",
        totalPurchases: 1,
        totalValue: 1,
      },
    },
    { $sort: { totalPurchases: -1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: stats,
  });
});
