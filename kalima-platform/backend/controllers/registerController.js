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
const Government = require("../models/governmentModel.js");
const AdministrationZone = require("../models/administrationZonesModel.js");
const validatePassword = (password) => {
  const requiredLength = 8;

  if (password.length < requiredLength) {
    throw new AppError(
      `Password must be at least ${requiredLength} characters long`,
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
    government,
    administrationZone,
    ...userData
  } = req.body;  const phoneRequiredRoles = ["teacher", "parent", "student"];
  const govAdminRequiredRoles = ["teacher", "parent", "student"];    // Only validate government and administration zone for specific roles
  if (govAdminRequiredRoles.includes(role.toLowerCase())) {
    if (!government) {
      return next(new AppError("Government is required.", 400));
    }
    if (!administrationZone) {
      return next(new AppError("Administration zone is required.", 400));
    }
    
    try {
      // Validate government from database (case-insensitive)
      const govDoc = await Government.findOne({ 
        name: { $regex: new RegExp(`^${government}$`, 'i') }
      });
      
      if (!govDoc) {

        return next(new AppError(`Invalid government: ${government}.`, 400));
      }
      
      // Handle case where administrationZone is missing in the Government document
      if (!govDoc.administrationZone || !Array.isArray(govDoc.administrationZone)) {

        return next(new AppError(`No administration zones defined for government: ${government}.`, 400));
      }
      
      // Accept the zone if it exists in either the Government or AdministrationZone collection
      const normalizedZone = administrationZone.trim();
      
      // First check if the zone exists in the Government document
      const zoneExistsInGov = govDoc.administrationZone.some(
        zone => zone && zone.toLowerCase().trim() === normalizedZone.toLowerCase()
      );
      
      if (zoneExistsInGov) {
        // Zone found in government document, proceed with user creation
        console.log(`Found zone in government: ${normalizedZone}`);
      } else {
        // If not found in government, check AdministrationZone collection
        const zoneDoc = await AdministrationZone.findOne({ 
          name: { $regex: new RegExp(`^${normalizedZone}$`, 'i') }
        });
        
        if (!zoneDoc) {
          return next(new AppError(`Administration zone "${administrationZone}" not found for government: ${government}.`, 400));
        }
        
        // Zone is valid, but not in government - could add it to government here if needed
      }
    } catch (error) {
      return next(new AppError(`Error validating location data: ${error.message}`, 500));
    }
  }
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

  // Only include government and administrationZone for specific roles
  if (govAdminRequiredRoles.includes(role.toLowerCase())) {
    newUser.government = government;
    newUser.administrationZone = administrationZone;
  }

  if (phoneNumber) {
    newUser.phoneNumber = phoneNumber;
  }

  let user;

  switch (role.toLowerCase()) {
    case "teacher": {
      // check phoneNumber2 (optional)
      if (userData.phoneNumber2 !== undefined) {
        newUser.phoneNumber2 = userData.phoneNumber2;
      }
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
