const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Code = require("../models/codeModel");
const QueryFeatures = require("../utils/queryFeatures");

// i will modify err msg and make validation later
// restricted to admin-center-lectural
const createCodes = catchAsync(async (req, res, next) => {
  const { pointsAmount, numOfCodes } = req.body;
  if (!pointsAmount || !numOfCodes) {
    return next(new AppError("All fields are required"));
  }

  const newCodes = [];

  for (let i = 0; i < numOfCodes; i++) {
    const code = new Code({ pointsAmount });
    code.generateCode();
    newCodes.push(code);
  }

  await Code.insertMany(newCodes);

  res.status(201).json({
    status: "success",
    message: `${newCodes.length} Code(s) has been created successfully`,
  });
});

const getCodes = catchAsync(async (req, res, next) => {
  const codesQuery = Code.find({ isRedeemed: false }).select(
    "code pointsAmount"
  );

  const features = new QueryFeatures(codesQuery, req.query)
    .filter()
    .sort()
    .paginate();

  const codes = await features.query;
  if (codes.length === 0) {
    return next(new AppError("No codes yet", 404));
  }
  res.status(201).json({
    status: "success",
    results: codes.length,
    data: {
      codes,
    },
  });
});

const deleteCodes = catchAsync(async (req, res, next) => {
  const { pointsAmount, numOfCodes } = req.body;
  if (!pointsAmount || !numOfCodes) {
    return next(new AppError("All fields are required"));
  }

  const codesToDelete = await Code.find({
    isRedeemed: false,
    pointsAmount,
  })
    .limit(numOfCodes)
    .select("_id");

  if (codesToDelete.length === 0) {
    return next(
      new AppError(`You don't have codes yet with points ${pointsAmount}`, 404)
    );
  }

  if (codesToDelete.length < numOfCodes) {
    return next(
      new AppError(
        `You cannot delete ${numOfCodes} code(s), you only have ${codesToDelete.length} code(s)`,
        400
      )
    );
  }

  const codesToDeleteIds = codesToDelete.map((code) => code._id);
  await Code.deleteMany({ _id: { $in: codesToDeleteIds } });

  res.status(200).json({
    status: "success",
    message: `${codesToDeleteIds.length} code(s) with ${pointsAmount} points have been deleted successfully`,
  });
});

module.exports = { createCodes, getCodes, deleteCodes };
