const mongoose = require('mongoose')
const registerController = require('../controllers/registerController')
const User = require("../models/userModel.js");
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
  const { name, email, phoneNumber, password } = req.body
  let hashedPwd
  if (password) {
    hashedPwd = await bcrypt.hash(password, 12);
  }
  const foundUser = await User.findByIdAndUpdate(
    req.params.userId,
    { name, email, phoneNumber, password: hashedPwd }, {
    new: true,
    runValidators: true,
  }).select("-password")
  if (!foundUser) return next(new AppError("User not found", 404));

  res.json(foundUser);
})
const deleteUser = catchAsync(async (req, res, next) => {
  const foundUser = await User.findByIdAndDelete(req.params.userId).select("-password").lean()
  if (!foundUser) return next(new AppError("User not found", 404));
  res.json(foundUser);
})
module.exports = { getAllUsers, getUser, createUser, updateUser, deleteUser }
