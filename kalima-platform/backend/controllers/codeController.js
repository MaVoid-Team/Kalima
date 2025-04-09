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

module.exports = { createCodes, getCodes };
