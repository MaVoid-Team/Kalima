// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store cart purchase listing logic.
const mongoose = require("mongoose");
const ECCartPurchase = require("../../models/ec.cartPurchaseModel");
const catchAsync = require("../../utils/catchAsync");

const populatePurchaseQuery = (query) =>
  query
    .populate({ path: "createdBy", select: "name email role phoneNumber" })
    .populate({ path: "confirmedBy", select: "name" })
    .populate({ path: "receivedBy", select: "name" })
    .populate({ path: "returnedBy", select: "name" })
    .populate({ path: "adminNoteBy", select: "name" })
    .populate({
      path: "paymentMethod",
      select: "name phoneNumber",
      strictPopulate: false,
    })
    .populate({ path: "couponCode" }); // I will need to update this

const buildBaseMatch = (query) => {
  const baseMatch = {};

  if (query.status) {
    baseMatch.status = query.status;
  }

  if (query.startDate && query.endDate) {
    baseMatch.createdAt = {
      $gte: new Date(query.startDate),
      $lte: new Date(query.endDate),
    };
  }

  if (query.minTotal || query.maxTotal) {
    baseMatch.total = {};
    if (query.minTotal) baseMatch.total.$gte = parseFloat(query.minTotal);
    if (query.maxTotal) baseMatch.total.$lte = parseFloat(query.maxTotal);
  }

  return baseMatch;
};

module.exports = catchAsync(async (req, res) => {
  const baseMatch = buildBaseMatch(req.query);
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  if (req.query.search) {
    const searchTermString = String(req.query.search || "").trim();
    const searchRegex = new RegExp(
      searchTermString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );

    if (/^[0-9a-fA-F]{24}$/.test(searchTermString)) {
      try {
        const found = await populatePurchaseQuery(
          ECCartPurchase.findById(searchTermString),
        );

        const doc = await found;
        let matchesBase = true;
        if (doc && Object.keys(baseMatch).length > 0) {
          if (baseMatch.status && doc.status !== baseMatch.status)
            matchesBase = false;
          if (baseMatch.createdAt) {
            const gte = baseMatch.createdAt.$gte;
            const lte = baseMatch.createdAt.$lte;
            const created = new Date(doc.createdAt);
            if (gte && created < gte) matchesBase = false;
            if (lte && created > lte) matchesBase = false;
          }
          if (baseMatch.total) {
            if (
              baseMatch.total.$gte != null &&
              (doc.total == null || doc.total < baseMatch.total.$gte)
            )
              matchesBase = false;
            if (
              baseMatch.total.$lte != null &&
              (doc.total == null || doc.total > baseMatch.total.$lte)
            )
              matchesBase = false;
          }
        }

        const total = doc && matchesBase ? 1 : 0;
        return res.status(200).json({
          status: "success",
          results: total,
          pagination: {
            total,
            page: 1,
            pages: total > 0 ? 1 : 0,
            limit: 1,
          },
          data: {
            purchases: doc && matchesBase ? [doc] : [],
          },
        });
      } catch (err) {
        console.error("Error in ObjectId fast-path search:", err);
      }
    }

    const orMatch = [
      { userName: searchRegex },
      { purchaseSerial: searchRegex },
      { numberTransferredFrom: searchRegex },
      { "items.productSnapshot.serial": searchRegex },
      { "items.productSnapshot.title": searchRegex },
      { "createdByUser.phoneNumber": searchRegex },
      { "createdByUser.email": searchRegex },
      { "createdByUser.name": searchRegex },
    ];

    if (/^[0-9a-fA-F]{24}$/.test(searchTermString)) {
      try {
        orMatch.push({ _id: mongoose.Types.ObjectId(searchTermString) });
      } catch (_) {
        // Ignore invalid ObjectId
      }
    }

    const pipeline = [];
    if (Object.keys(baseMatch).length > 0) pipeline.push({ $match: baseMatch });

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdByUser",
      },
    });
    pipeline.push({
      $unwind: { path: "$createdByUser", preserveNullAndEmptyArrays: true },
    });

    pipeline.push({ $match: { $or: orMatch } });
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const purchases = await ECCartPurchase.aggregate(pipeline);

    const countPipeline = [];
    if (Object.keys(baseMatch).length > 0)
      countPipeline.push({ $match: baseMatch });
    countPipeline.push({
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdByUser",
      },
    });
    countPipeline.push({
      $unwind: { path: "$createdByUser", preserveNullAndEmptyArrays: true },
    });
    countPipeline.push({ $match: { $or: orMatch } });
    countPipeline.push({ $count: "total" });

    const countResult = await ECCartPurchase.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    const resultIds = purchases.map((p) => p._id);
    const populated = resultIds.length
      ? await populatePurchaseQuery(
          ECCartPurchase.find({ _id: { $in: resultIds } }).sort("-createdAt"),
        )
      : [];

    return res.status(200).json({
      status: "success",
      results: populated.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      data: {
        purchases: populated,
      },
    });
  }

  const purchases = await populatePurchaseQuery(
    ECCartPurchase.find(baseMatch).sort("-createdAt").skip(skip).limit(limit),
  );

  const [populatedDocs, total] = await Promise.all([
    purchases,
    ECCartPurchase.countDocuments(baseMatch),
  ]);

  res.status(200).json({
    status: "success",
    results: populatedDocs.length,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    data: {
      purchases: populatedDocs,
    },
  });
});
