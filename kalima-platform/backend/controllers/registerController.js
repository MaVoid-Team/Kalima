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
  const requiredLength = 8;

  if (password.length < requiredLength) {
    throw new AppError(
      `Password must be ${requiredLength} characters long or more`,
      400
    );
  }
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
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const duplicateEmail = await User.findOne({
    email: { $regex: new RegExp(`^${email}$`, "i") },
  });

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

  const newUser = {
    name,
    email: email.toLowerCase().trim(),
    password: hashedPwd,
    children: childrenById,
    isEmailVerified: true, // Set users to already verified by default
    ...userData,
  };

  if (phoneNumber) {
    newUser.phoneNumber = phoneNumber;
  }

  let user;

  switch (role.toLowerCase()) {
    case "teacher": {
      // Validate level (must be an array of allowed values)
      if (
        !Array.isArray(newUser.level) ||
        newUser.level.length === 0 ||
        !newUser.level.every((l) =>
          ["primary", "preparatory", "secondary"].includes(l)
        )
      ) {
        return next(
          new AppError(
            "Level is required for teacher role and must be a non-empty array of: Primary, Preparatory, Secondary",
            400
          )
        );
      }
      // Validate teachesAtType
      if (
        !newUser.teachesAtType ||
        !["Center", "School", "Both"].includes(newUser.teachesAtType)
      ) {
        return next(
          new AppError(
            "teachesAtType is required and must be 'Center', 'School', or 'Both'",
            400
          )
        );
      }
      // Validate centers
      if (
        (newUser.teachesAtType === "Center" ||
          newUser.teachesAtType === "Both") &&
        (!Array.isArray(newUser.centers) || newUser.centers.length === 0)
      ) {
        return next(
          new AppError(
            "At least one center is required if teachesAtType is 'Center' or 'Both'",
            400
          )
        );
      }
      // Validate school
      if (
        (newUser.teachesAtType === "School" ||
          newUser.teachesAtType === "Both") &&
        (!newUser.school || newUser.school.trim() === "")
      ) {
        return next(
          new AppError(
            "School is required if teachesAtType is 'School' or 'Both'",
            400
          )
        );
      }
      // Validate socialMedia (optional, but if present, must be array of {platform, account})
      if (newUser.socialMedia && !Array.isArray(newUser.socialMedia)) {
        return next(new AppError("socialMedia must be an array", 400));
      }
      if (Array.isArray(newUser.socialMedia)) {
        for (const sm of newUser.socialMedia) {
          if (typeof sm !== "object") continue;
          if (
            sm.platform &&
            ![
              "Facebook",
              "Instagram",
              "Twitter",
              "LinkedIn",
              "TikTok",
              "YouTube",
              "WhatsApp",
              "Telegram",
            ].includes(sm.platform)
          ) {
            return next(
              new AppError(`Invalid social media platform: ${sm.platform}`, 400)
            );
          }
        }
      }
      user = await Teacher.create(newUser);
      break;
    }
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
    return res.status(201).json({
      message: `User created successfully with name ${name}.`,
    });
  } else {
    return next(new AppError("Invalid user data received", 400));
  }
});

module.exports = { registerNewUser };
