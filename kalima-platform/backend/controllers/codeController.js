const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Code = require("../models/codeModel");

// i will modify err msg and make validation later
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

module.exports = { createCodes };
