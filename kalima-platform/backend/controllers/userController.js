const registerController = require('../controllers/registerController')
const User = require("../models/userModel.js");
const Parent = require("../models/parentModel.js");
const Lecturer = require("../models/lecturerModel.js");
const Student = require("../models/studentModel.js");
const Teacher = require("../models/teacherModel.js");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-password").lean();

  if (!users) return next(new AppError("Couldn't find users.", 404));
  res.json(users);
})
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select("-password").lean();

  if (!user) return next(new AppError("Couldn't find user.", 404));
  res.json(user);
})

const createUser = registerController.registerNewUser;

const updateUser = catchAsync(async (req, res, next) => {
  const { name, email, address, password } = req.body
  const userId = req.params.userId

  let hashedPwd

  if (password) {
    hashedPwd = await bcrypt.hash(password, 12);
  }
  const foundUser = await User.findById(userId).select("-password")

  if (!foundUser) return next(new AppError("User not found", 404));

  const updatedUser = { name, email, address, password, ...req.body }
  let user

  switch (foundUser.role.toLowerCase()) {
    case "teacher":
      user = await Teacher.findByIdAndUpdate(userId, updatedUser, { new: true, runvalidators: true }).select("-password").lean()
      break;
    case "student":
      user = await Student.findByIdAndUpdate(userId, updatedUser, { new: true, runValidators: true }).select("-password").lean()
      break;
    case "parent":
      user = await Parent.findByIdAndUpdate(userId, updatedUser, { new: true, runValidators: true }).select("-password").lean()
      break;
    case "lecturer":
      user = await Lecturer.findByIdAndUpdate(userId, updatedUser, { new: true, runValidators: true }).select("-password").lean()
      break;
    default:
      return next(new AppError("Invalid role", 400));
  }

  res.json(user)
})

const deleteUser = catchAsync(async (req, res, next) => {
  const foundUser = await User.findByIdAndDelete(req.params.userId).select("-password").lean()
  if (!foundUser) return next(new AppError("User not found", 404));
  res.json(foundUser);
})
module.exports = { getAllUsers, getUser, createUser, updateUser, deleteUser }
