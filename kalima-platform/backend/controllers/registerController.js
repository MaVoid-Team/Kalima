const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");
const Parent = require("../models/parentModel.js");
const Lecturer = require("../models/lecturerModel.js");
const Student = require("../models/studentModel.js");
const Teacher = require("../models/teacherModel.js");
const Assistant = require("../models/assistantModel.js");
const AppError = require("../utils/appError");
const mongoose = require('mongoose')
const catchAsync = require("../utils/catchAsync");

// @route POST /register/
const registerNewUser = catchAsync(async (req, res, next) => {
  const { role, name, email, phoneNumber, confirmPassword, password, children, ...userData } = req.body;
  const phoneRequiredRoles = ["teacher", "parent", "student"]

  // Checking duplicate.
  const duplicateEmail = await User.findOne({ email });

  if (duplicateEmail) {
    return next(new AppError("This E-Mail is already associated with a user.", 409));
  }

  // For the roles with phone login only.
  const duplicatePhone = await User.findOne({ phoneNumber });
  if (phoneRequiredRoles.includes(role.toLowerCase()) && duplicatePhone) {

    return next(new AppError("This phone number is already associated with a user.", 400));

  }

  // To allow sequenceId to be sent along side valid mongoode StudentId.
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
  }

  const hashedPwd = await bcrypt.hash(password, 12);

  const newUser = phoneNumber ? {
    name,
    email,
    phoneNumber,
    password: hashedPwd,
    children: childrenById,
    ...userData,
  } : {
    name,
    email,
    password: hashedPwd,
    children: childrenById,
    ...userData,
  };


  let user;

  switch (role.toLowerCase()) {
    case "teacher":
      user = await Teacher.create(newUser);
      break;
    case "student":
      user = await Student.create(newUser);
      break;
    case "parent":
      user = await Parent.create(newUser);
      break;
    case "lecturer":
      user = await Lecturer.create(newUser);
      break;
    case "assistant":
      user = await Assistant.create(newUser);
      break;
    default:
      return next(new AppError("Invalid role", 400));
  }

  if (user) {
    return res.status(201).json({ message: `User created successfully with name ${name}.` });
  } else {
    return next(new AppError("Invalid user data received", 400));
  }
});

module.exports = { registerNewUser };
