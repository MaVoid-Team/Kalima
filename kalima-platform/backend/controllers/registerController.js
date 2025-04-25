const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");
const Parent = require("../models/parentModel.js");
const Lecturer = require("../models/lecturerModel.js");
const Student = require("../models/studentModel.js");
const Teacher = require("../models/teacherModel.js");
const Assistant = require("../models/assistantModel.js");
const Moderator = require("../models/moderatorModel.js");
const SubAdmin = require("../models/subAdminModel.js");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const Level = require("../models/levelModel.js");

const validatePassword = (password) => {
  const minLength = 8;
  const maxLength = 30;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    throw new AppError(`Password must be at least ${minLength} characters long`, 400);
  }
  if (password.length > maxLength) {
    throw new AppError(`Password must be less than ${maxLength} characters`, 400);
  }
  if (!hasUpperCase) {
    throw new AppError("Password must contain at least one uppercase letter", 400);
  }
  if (!hasLowerCase) {
    throw new AppError("Password must contain at least one lowercase letter", 400);
  }
  if (!hasNumbers) {
    throw new AppError("Password must contain at least one number", 400);
  }
  if (!hasSpecialChar) {
    throw new AppError("Password must contain at least one special character", 400);
  }
};

const generateDefaultEmail = (name, phoneNumber) => {
  if (!phoneNumber || phoneNumber.length < 4) {
    throw new AppError("Phone number must be at least 4 digits for email generation", 400);
  }
  
  const cleanName = name.replace(/\s+/g, '.').toLowerCase();
  const lastFourDigits = phoneNumber.slice(-4);
  
  return `${cleanName}${lastFourDigits}@example.com`;
};

const registerNewUser = catchAsync(async (req, res, next) => {
  const {
    role,
    name,
    email,
    phoneNumber,
    confirmPassword,
    password,
    children,
    ...userData
  } = req.body;
  const phoneRequiredRoles = ["teacher", "parent", "student"];

  // Validate password
  try {
    validatePassword(password);
  } catch (error) {
    return next(error);
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  let finalEmail = email;
  if (!email && phoneNumber) {
    try {
      finalEmail = generateDefaultEmail(name, phoneNumber);
    } catch (error) {
      return next(error);
    }
  } else if (!email) {
    return next(new AppError("Email is required when phone number is not provided", 400));
  }

  finalEmail = finalEmail.toLowerCase().trim();

  const duplicateEmail = await User.findOne({ email: { $regex: new RegExp(`^${finalEmail}$`, 'i') } });

  if (duplicateEmail) {
    return next(
      new AppError("This E-Mail is already associated with a user.", 409)
    );
  }

  const duplicatePhone = await User.findOne({ phoneNumber });
  if (phoneRequiredRoles.includes(role.toLowerCase()) && duplicatePhone) {
    return next(
      new AppError("This phone number is already associated with a user.", 400)
    );
  }

  const childrenById = [];
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
        } catch (error) {
          if (error.name === "CastError") {
            return next(
              new AppError(
                "Not all children values are valid UserId or SequenceId.",
                400
              )
            );
          }
        }
      }
    }
  }

  const hashedPwd = await bcrypt.hash(password, 12);

  const newUser = phoneNumber
    ? {
        name,
        email: finalEmail,
        phoneNumber,
        password: hashedPwd,
        children: childrenById,
        ...userData,
      }
    : {
        name,
        email: finalEmail,
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
      if (!newUser.level)
        return next(new AppError("Level is required for student role", 400));
      const level = await Level.findById(newUser.level);
      if (!level)
        return next(new AppError("There is no level with this id", 404));
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
    case "moderator":
      user = await Moderator.create(newUser);
      break;
    case "subadmin":
      user = await SubAdmin.create(newUser);
      break;
    default:
      return next(new AppError("Invalid role", 400));
  }

  if (user) {
    return res
      .status(201)
      .json({ message: `User created successfully with name ${name}.` });
  } else {
    return next(new AppError("Invalid user data received", 400));
  }
});

module.exports = { registerNewUser };