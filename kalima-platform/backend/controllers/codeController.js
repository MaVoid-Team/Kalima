const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Code = require("../models/codeModel");
const QueryFeatures = require("../utils/queryFeatures");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const Lecturer = require("../models/lecturerModel");

// i will modify err msg and make validation later
// restricted to admin-center-lectural
const createCodes = catchAsync(async (req, res, next) => {
  const { pointsAmount, numOfCodes, type, lecturerId } = req.body;
  if (!pointsAmount || !numOfCodes || !type) {
    return next(new AppError("All fields are required"));
  }

  let lecturer = null;
  if (type === "specific") {
    if (!lecturerId) {
      return next(new AppError("Lecturer ID is required for specific codes"));
    }
    lecturer = await Lecturer.findById(lecturerId);
    if (!lecturer) {
      return next(new AppError("Lecturer not found", 404));
    }
  }

  const newCodes = [];
  for (let i = 0; i < numOfCodes; i++) {
    const codeDoc = new Code({
      pointsAmount,
      type,
      lecturerId: lecturer ? lecturer._id : null,
    });
    codeDoc.generateCode();
    newCodes.push(codeDoc);
  }

  const codes = await Code.insertMany(newCodes);

  res.status(201).json({
    status: "success",
    message: `${newCodes.length} Code(s) have been created successfully`,
    data: {
      codes,
    },
  });
});

const getAllCodes = catchAsync(async (req, res, next) => {
  const codesQuery = Code.find().select("-__v");

  const features = new QueryFeatures(codesQuery, req.query)
    .filter()
    .sort()
    .paginate();

  const codes = await features.query
    .populate({ path: "lecturerId", select: "name" })
    .lean();
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
const getCodeById = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(new AppError("Code ID is required", 400));
  }
  const code = await Code.findById(req.params.id)
    .select("-__v")
    .populate({ path: "lecturerId", select: "name" })
    .lean();
  if (!code) {
    return next(new AppError("Code not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      code,
    },
  });
});
const deleteCodes = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return next(new AppError("Code is required", 400));
  }

  const codeToDelete = await Code.findOneAndDelete({ code, isRedeemed: false });

  if (!codeToDelete) {
    return next(new AppError("Code not found or has been redeemed", 404));
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
    return next(new AppError("Code and Lecturer Id are required fields", 400));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isExistCode = await Code.findOne({ code, isRedeemed: false }).session(
      session
    );
    if (!isExistCode) {
      await session.abortTransaction();
      return next(
        new AppError("Code not found or has been redeemed before", 404)
      );
    }

    const currentUser = await User.findById(req.user._id).session(session);
    if (!currentUser) {
      await session.abortTransaction();
      return next(new AppError("User not found", 404));
    }
    //specific type for lecturer
    // add points to the specific lecturer's balance
    if (isExistCode.type === "specific") {
      currentUser.addLecturerPoints(
        isExistCode.lecturerId,
        isExistCode.pointsAmount
      );
    } else {
      //type is general
      // add points to the general points balance
      currentUser.generalPoints += isExistCode.pointsAmount;
    }
    await currentUser.save({ session });

    await Code.findOneAndUpdate(
      { code },
      {
        isRedeemed: true,
        redeemedBy: req.user._id,
        redeemedAt: new Date(),
      }
    ).session(session);

    await session.commitTransaction();
    res.status(200).json({
      status: "success",
      message: `Your code has been redeemed successfully, +${isExistCode.pointsAmount} points`,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return next(new AppError("Failed to redeem code, try again later", 500));
  } finally {
    await session.endSession();
  }
});

module.exports = {
  createCodes,
  getAllCodes,
  deleteCodes,
  redeemCode,
  getCodeById,
};
