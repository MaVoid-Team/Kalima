const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Code = require("../models/codeModel");
const QueryFeatures = require("../utils/queryFeatures");
const User = require("../models/userModel");
const mongoose = require("mongoose");

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
  const { code } = req.body;
  if (!code) {
    return next(new AppError("Code is required", 400));
  }

  const codeToDelete = await Code.findOneAndDelete({ code });

  if (!codeToDelete) {
    return next(new AppError("Code not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: `Code <${code}> deleted successfully`,
  });
});

//restricted only to users(stud)
const redeemCode = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return next(new AppError("Code is a required field", 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isExistCode = await Code.findOne({ code, isRedeemed: false }).session(
      session
    );
    if (!isExistCode) {
      await session.abortTransaction();
      return next(new AppError("Code not found", 404));
    }

    const pointsAmount = isExistCode.pointsAmount;

    const currentUser = await User.findById(req.user._id).session(session);
    currentUser.totalPoints += pointsAmount;
    await currentUser.save({ session });

    await Code.deleteOne({ code }).session(session);

    await session.commitTransaction();
    res.status(200).json({
      status: "success",
      message: `Your code has been redeemed successfully, +${pointsAmount} points`,
    });
  } catch (error) {
    await session.abortTransaction();
    return next(new AppError("Failed to reddem code, try again later", 500));
  } finally {
    await session.endSession();
  }
});

module.exports = { createCodes, getCodes, deleteCodes, redeemCode };
