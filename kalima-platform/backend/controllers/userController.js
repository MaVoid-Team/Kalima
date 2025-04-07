const registerController = require('../controllers/registerController')
const User = require("../models/userModel.js");
const Parent = require("../models/parentModel.js");
const Lecturer = require("../models/lecturerModel.js");
const Student = require("../models/studentModel.js");
const Teacher = require("../models/teacherModel.js");
const Assistant = require("../models/assistantModel.js");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require('mongoose')
const bcrypt = require("bcrypt");

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-password").lean();

  if (!users.length) return next(new AppError("Couldn't find users.", 404));
  res.json(users);
})

const getAllUsersByRole = catchAsync(async (req, res, next) => {
  const role = req.params.role.charAt(0).toUpperCase() + req.params.role.slice(1).toLowerCase()

  const users = await User.find({ role }).select("-password").lean();
  if (!users.length) return next(new AppError("Couldn't find users with this role.", 404));

  res.json(users);
})

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select("-password").lean();

  if (!user) return next(new AppError("Couldn't find user.", 404));
  res.json(user);
})

const createUser = registerController.registerNewUser;

/*
show fields to update deending on the current user role,
for ex :- if current user role is student that means if the children is passed in the req.body, the err msg should appear
*/
const updateUser = catchAsync(async (req, res, next) => {
  const { name, email, address, password, children, subjectNotify } = req.body
  const userId = req.params.userId

  /*
  BUG -->> status code here should be 400 (or 403)
  */
  if (password) {
    return next(new AppError("Can't update password on this route.", 404));
  }

  const selectedFields = "-password -passwordChangedAt"

  const foundUser = await User.findById(userId).select(selectedFields);
  

  if (!foundUser) return next(new AppError("User not found", 404));


  /*
  BUG -->> if the array here is empty, no err occured!!!!!!,
  the for loop runs but does nothing, we sould reject it because empty array is invalid input,

  ex:- "children": ["4"] , "children": []  -->> should not passed, but passed

  BUG-->> if the current parent enter a valid objectId, that passes with no problem , but the problem here that:
  if children not belong to cuurent parent (or it may not in our db broooo) , we should fix it

  BUG -->> assume you passed a valid ids in children and when you updating you replace the filed children(in db) 
  with the children(that given in the req.body), means if the current parent has an id === 4 in the children array, when 
  parent make an update to add new one (for ex: id =5) then when updating , the old one is replaced by the newes , it
  becoms has a childer  whose id =5 not whos ids =4 &5

  TAKE CARE OFF -->> when fixing the above , don't allow the repeatition of ids in children array
  */
  const childrenById = []
  if (!!children) {
    for (let id of children) {      
      // Check if the id is a valid MongoDB ObjectId
      const isMongoId = mongoose.Types.ObjectId.isValid(id);
      if (isMongoId) {
        childrenById.push(id);
      } else {
        try {
          const student = await Student.findOne({ sequencedId: id }).lean();          
          if (student) {
            childrenById.push(student._id);
          }
        }
        catch (error) {
          if (error.name === 'CastError') {
            return next(new AppError("Not all children values are valid UserId or SequenceId.", 400));
          }
        }
      }
    }
    req.body.children = childrenById
  }

  const updatedUser = { name, email, address, children: childrenById, ...req.body }

  if (foundUser.role.toLowerCase() === "student" && typeof subjectNotify !== 'undefined') {
    updatedUser.subjectNotify = subjectNotify;
  }
  
  let user

  switch (foundUser.role.toLowerCase()) {
    case "teacher":
    // fix a bug here : replace runvalidators with runValidators 
      user = await Teacher.findByIdAndUpdate(userId, updatedUser, { new: true, runValidators: true }).select(selectedFields).lean()
      break;
    case "student":
      user = await Student.findByIdAndUpdate(userId, updatedUser, { new: true, runValidators: true }).select(selectedFields).lean()
      break;
    case "parent":
      user = await Parent.findByIdAndUpdate(userId, updatedUser, { new: true, runValidators: true }).select(selectedFields).lean()
      break;
    case "lecturer":
      user = await Lecturer.findByIdAndUpdate(userId, updatedUser, { new: true, runValidators: true }).select(selectedFields).lean()
      break;
    case "assistant":
      user = await Assistant.findByIdAndUpdate(userId, updatedUser, { new: true, runValidators: true }).select("-password").lean() 
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

// we ahould make a validation for newPassword field here
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if(!currentPassword || !newPassword){
    return next(new AppError("You should provide both current and new password",400));
  }

  const user = await User.findById(req.user._id).select("+password");
  if(!user) {
    return next(new AppError("User not found, pleaze login again",401));
  }

  const isValidCurrentPassword = await user.comparePassword(currentPassword,user.password);
  if(!isValidCurrentPassword){
    return next(new AppError("Your current password is wrong",401));
  }

  if (currentPassword === newPassword) {
    return next(
      new AppError("New password can't be the same as old password", 400)
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword,12);
  user.password = hashedPassword;
  await user.save()

  // otional: regenerate jwt if we  wanna to keep the user logged in
  /*
    const accessToken = jwt.sign(
    {
      UserInfo: { id: user._id, role: user.role }, // we should select role also from the query
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "90d" }, // Time should be changed in production
  );

  const refreshToken = jwt.sign(
    { id: user._id, },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1000s" }, // Time should be changed in production
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "none", // Allow cross-site.
    secure: process.env.NODE_ENV === "production",
    maxAge: 300000 * 1000, // Should be set to match the Refresh Token age.
  });

    res.status(200).json({
    status:"success",
    message:"Password updated successfully",
    accessToken
  })
  */


  res.clearCookie("jwt",{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"none",
  })
  
  res.status(200).json({
    status:"success",
    message:"Password updated successfully, please login again"
  })
  
});

module.exports = { getAllUsers, getAllUsersByRole, getUser, createUser, updateUser, deleteUser,changePassword }
