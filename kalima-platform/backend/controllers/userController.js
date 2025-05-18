const registerController = require("../controllers/registerController");
const User = require("../models/userModel.js");
const Parent = require("../models/parentModel.js");
const Lecturer = require("../models/lecturerModel.js");
const Student = require("../models/studentModel.js");
const Teacher = require("../models/teacherModel.js");
const Assistant = require("../models/assistantModel.js");
const Purchase = require("../models/purchaseModel.js");
const Code = require("../models/codeModel.js");
const StudentLectureAccess = require("../models/studentLectureAccessModel.js");
const Container = require("../models/containerModel.js");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const handleCSV = require("../utils/upload files/handleCSV.js");
const handleExcel = require("../utils/upload files/handleEXCEL.js");
const QueryFeatures = require("../utils/queryFeatures");

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-password").lean();

  if (!users.length) return next(new AppError("Couldn't find users.", 404));
  res.json(users);
});

const getAllUsersByRole = catchAsync(async (req, res, next) => {
  const role =
    req.params.role.charAt(0).toUpperCase() +
    req.params.role.slice(1).toLowerCase();

  const users = await User.find({ role }).select("-password").lean();
  if (!users.length)
    return next(new AppError("Couldn't find users with this role.", 404));

  res.json(users);
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId)
    .select("-password")
    .lean();

  if (!user) return next(new AppError("Couldn't find user.", 404));
  res.json(user);
});

const createUser = registerController.registerNewUser;

/*
show fields to update deending on the current user role,
for ex :- if current user role is student that means if the children is passed in the req.body, the err msg should appear
*/
const updateUser = catchAsync(async (req, res, next) => {
  const { name, email, address, password, children, subjectNotify } = req.body;

  /*
  BUG -->> that means any user can update any user
  To fix it -->> Onlyy authenticated current user has permission to update his self
  userId = req.user._id 
  */
  const userId = req.params.userId;

  /*
  BUG -->> status code here should be 400 (or 403)
  */
  if (password) {
    return next(new AppError("Can't update password on this route.", 404));
  }

  const selectedFields = "-password -passwordChangedAt";

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
    req.body.children = childrenById;
  }

  const updatedUser = {
    name,
    email,
    address,
    children: childrenById,
    ...req.body,
  };

  if (
    foundUser.role.toLowerCase() === "student" &&
    typeof subjectNotify !== "undefined"
  ) {
    updatedUser.subjectNotify = subjectNotify;
  }

  let user;

  switch (foundUser.role.toLowerCase()) {
    case "teacher":
      user = await Teacher.findByIdAndUpdate(userId, updatedUser, {
        new: true,
        runValidators: true,
      })
        .select(selectedFields)
        .lean();
      break;

    case "student":
      user = await Student.findByIdAndUpdate(userId, updatedUser, {
        new: true,
        runValidators: true,
      })
        .select(selectedFields)
        .lean();
      break;

    case "parent":
      user = await Parent.findByIdAndUpdate(userId, updatedUser, {
        new: true,
        runValidators: true,
      })
        .select(selectedFields)
        .lean();
      break;

    case "lecturer":
      user = await Lecturer.findByIdAndUpdate(userId, updatedUser, {
        new: true,
        runValidators: true,
      })
        .select(selectedFields)
        .lean();
      break;

    case "assistant":
      user = await Assistant.findByIdAndUpdate(userId, updatedUser, {
        new: true,
        runValidators: true,
      })
        .select(selectedFields)
        .lean();
      break;

    case "moderator":
      user = await Moderator.findByIdAndUpdate(userId, updatedUser, {
        new: true,
        runValidators: true,
      })
        .select(selectedFields)
        .lean();
      break;

    case "subadmin":
      user = await SubAdmin.findByIdAndUpdate(userId, updatedUser, {
        new: true,
        runValidators: true,
      })
        .select(selectedFields)
        .lean();
      break;

    default:
      return next(new AppError("Invalid role", 400));
  }

  res.json(user);
});

const deleteUser = catchAsync(async (req, res, next) => {
  const foundUser = await User.findById(req.params.userId).select("-password");

  if (!foundUser) return next(new AppError("User not found", 404));
  if (
    req.user.role === "SubAdmin" &&
    (foundUser.role === "Admin" || foundUser.role === "SubAdmin")
  ) {
    return next(new AppError("You are not allowed to delete this user", 403));
  }

  await foundUser.deleteOne();
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// we ahould make a validation for newPassword field here
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError("You should provide both current and new password", 400)
    );
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return next(new AppError("User not found, pleaze login again", 401));
  }

  const isValidCurrentPassword = await user.comparePassword(
    currentPassword,
    user.password
  );
  if (!isValidCurrentPassword) {
    return next(new AppError("Your current password is wrong", 401));
  }

  if (currentPassword === newPassword) {
    return next(
      new AppError("New password can't be the same as old password", 400)
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  await user.save();

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

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  res.status(200).json({
    status: "success",
    message: "Password updated successfully, please login again",
  });
});

const uploadFileForBulkCreation = catchAsync(async (req, res, next) => {
  const { accountType } = req.body;

  const allAccountTypes = ["parent", "teacher", "student"];
  if (!accountType || !allAccountTypes.includes(accountType)) {
    return next(
      new AppError(
        "You should provide one of these account types: parent, teacher, student"
      )
    );
  }

  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }
  const fileType = req.file.mimetype;

  if (fileType === "text/csv" || fileType === "application/csv") {
    await handleCSV(req.file.buffer, accountType, res, next);
  } else if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    fileType === "application/vnd.ms-excel"
  ) {
    await handleExcel(req.file.buffer, accountType, res, next);
  } else {
    return next(
      new AppError(
        "Unsupported file type. Please upload a CSV or Excel file",
        400
      )
    );
  }
});

/**
 * Get all data for the currently logged-in user (any role)
 * Includes user profile, balance information (for student/parent) and purchase history (for student/parent)
 *
 * Query parameters supported:
 * - fields: Comma-separated list of fields to include (e.g., fields=userInfo,purchaseHistory)
 * - limit: Number of items per page for paginated results (default: 10)
 * - page: Page number for paginated results (default: 1)
 * - dateFrom: Filter purchases/activities from this date (YYYY-MM-DD)
 * - dateTo: Filter purchases/activities to this date (YYYY-MM-DD)
 * - sort: Field to sort by (e.g., sort=purchasedAt for purchases, default: -createdAt)
 */
const getMyData = catchAsync(async (req, res, next) => {
  // Get user ID from authenticated user
  const userId = req.user._id;
  const userRole = req.user.role;

  // Parse field selection (if provided)
  const fields = req.query.fields ? req.query.fields.split(",") : null;

  // Common response data
  let responseData = {
    userInfo: {
      id: userId,
      name: req.user.name,
      email: req.user.email,
      role: userRole,
    },
  };

  // Role-specific data retrieval
  switch (userRole) {
    case "Student":
      // Find student with all related data
      const student = await Student.findById(userId)
        .populate("level", "name")
        .populate({
          path: "lecturerPoints.lecturer",
          select: "name subject expertise",
        })
        .lean();

      if (!student) {
        return next(new AppError("Student not found", 404));
      }

      // Add student-specific fields
      responseData.userInfo = {
        ...responseData.userInfo,
        phoneNumber: student.phoneNumber,
        level: student.level,
        generalPoints: student.generalPoints || 0,
        totalPoints: student.totalPoints || 0,
        hobbies: student.hobbies,
        faction: student.faction,
        sequencedId : student.sequencedId
      };

      // Get student purchases, redeemed codes, and lecture access (with query params)
      if (
        !fields ||
        fields.includes("purchaseHistory") ||
        fields.includes("redeemedCodes") ||
        fields.includes("lectureAccess") ||
        fields.includes("pointsBalances") ||
        fields.includes("purchasedFeatures")
      ) {
        responseData = await getStudentParentAdditionalData(
          userId,
          responseData,
          student.lecturerPoints || [],
          req.query
        );
      }
      break;

    case "Parent":
      // Find parent with all related data
      const parent = await Parent.findById(userId)
        .populate({
          path: "children",
          select: "name level sequencedId",
        })
        .populate({
          path: "lecturerPoints.lecturer",
          select: "name subject expertise",
        })
        .lean();

      if (!parent) {
        return next(new AppError("Parent not found", 404));
      }

      // Add parent-specific fields
      responseData.userInfo = {
        ...responseData.userInfo,
        phoneNumber: parent.phoneNumber,
        level: parent.level,
        children: parent.children,
        generalPoints: parent.generalPoints || 0,
      };

      // Get parent purchases, redeemed codes, and lecture access (with query params)
      if (
        !fields ||
        fields.includes("purchaseHistory") ||
        fields.includes("redeemedCodes") ||
        fields.includes("lectureAccess") ||
        fields.includes("pointsBalances") ||
        fields.includes("purchasedFeatures")
      ) {
        responseData = await getStudentParentAdditionalData(
          userId,
          responseData,
          parent.lecturerPoints || [],
          req.query
        );
      }
      break;

    case "Lecturer":
      // Find lecturer with relevant data
      const lecturer = await Lecturer.findById(userId).lean();

      if (!lecturer) {
        return next(new AppError("Lecturer not found", 404));
      }

      // Add lecturer-specific fields
      responseData.userInfo = {
        ...responseData.userInfo,
        bio: lecturer.bio,
        expertise: lecturer.expertise,
        expertise: lecturer.expertise,
      };

      // Only fetch additional lecturer data if no specific fields were requested or if these fields were included
      if (!fields || fields.includes("containers")) {
        // Get lecturer-specific data (containers created by this lecturer)
        let containerQuery = Container.find({ createdBy: userId })
          .select("name type price subject level createdAt")
          .populate("subject", "name")
          .populate("level", "name");

        // Apply query features for containers
        const containerFeatures = new QueryFeatures(containerQuery, req.query)
          .filter()
          .sort()
          .paginate();
        containerQuery = containerFeatures.query;
        const containers = await containerQuery.lean();

        responseData.containers = containers;
      }

      // Only fetch point purchases if no specific fields were requested or if pointPurchases field was included
      if (!fields || fields.includes("pointPurchases")) {
        // Get point purchases made for this lecturer's content
        let purchaseQuery = Purchase.find({ lecturer: userId });

        // Add date filtering if provided
        if (req.query.dateFrom || req.query.dateTo) {
          const dateFilter = {};
          if (req.query.dateFrom) {
            dateFilter.purchasedAt = { $gte: new Date(req.query.dateFrom) };
          }
          if (req.query.dateTo) {
            dateFilter.purchasedAt = {
              ...dateFilter.purchasedAt,
              $lte: new Date(req.query.dateTo),
            };
          }
          purchaseQuery = purchaseQuery.find(dateFilter);
        }

        // Apply query features for purchases
        const purchaseFeatures = new QueryFeatures(purchaseQuery, req.query)
          .filter()
          .sort()
          .paginate();
        purchaseQuery = purchaseFeatures.query;

        const pointPurchases = await purchaseQuery
          .populate("student", "name")
          .lean();

        responseData.pointPurchases = pointPurchases;
      }
      break;

    case "Teacher":
      // Find teacher with relevant data
      const teacher = await Teacher.findById(userId).lean();

      if (!teacher) {
        return next(new AppError("Teacher not found", 404));
      }

      // Add teacher-specific fields
      responseData.userInfo = {
        ...responseData.userInfo,
        phoneNumber: teacher.phoneNumber,
        subject: teacher.subject,
        level: teacher.level,
        faction: teacher.faction,
        school: teacher.school,
        ...teacher,
      };

      // Get student purchases, redeemed codes, and lecture access (with query params)
      if (
        !fields ||
        fields.includes("purchaseHistory") ||
        fields.includes("redeemedCodes") ||
        fields.includes("lectureAccess") ||
        fields.includes("pointsBalances") ||
        fields.includes("purchasedFeatures")
      ) {
        responseData = await getStudentParentAdditionalData(
          userId,
          responseData,
          teacher.lecturerPoints || [],
          req.query
        );
      }

      break;

    case "Admin":
    case "SubAdmin":
    case "Moderator":
      // For admin roles, just return basic profile info
      const admin = await User.findById(userId).select("-password").lean();

      if (!admin) {
        return next(new AppError("User not found", 404));
      }

      // No additional fields needed for admin roles
      break;

    case "Assistant":
      // Find assistant with related lecturer
      const assistant = await Assistant.findById(userId)
        .populate("assignedLecturer", "name expertise")
        .lean();

      if (!assistant) {
        return next(new AppError("Assistant not found", 404));
      }

      // Add assistant-specific fields
      responseData.userInfo = {
        ...responseData.userInfo,
        assignedLecturer: assistant.assignedLecturer,
      };
      break;

    default:
      // For any other role, return basic user info
      const user = await User.findById(userId).select("-password").lean();

      if (!user) {
        return next(new AppError("User not found", 404));
      }
  }

  // Filter out fields that weren't requested (if fields parameter was provided)
  if (fields) {
    const filteredResponse = {};
    fields.forEach((field) => {
      if (responseData[field]) {
        filteredResponse[field] = responseData[field];
      }
    });
    responseData = filteredResponse;
  }

  res.status(200).json({
    status: "success",
    data: responseData,
  });
});

// Helper function to get additional data for students and parents
const getStudentParentAdditionalData = async (
  userId,
  responseData,
  pointsBalances,
  queryParams = {}
) => {
  const fields = queryParams.fields ? queryParams.fields.split(",") : null;

  // Only include purchase history if requested or no specific fields were requested
  if (!fields || fields.includes("purchaseHistory")) {
    // Get all types of purchases for the user
    let purchaseQuery = Purchase.find({
      student: userId,
    });

    // Add date filtering if provided
    if (queryParams.dateFrom || queryParams.dateTo) {
      const dateFilter = {};
      if (queryParams.dateFrom) {
        dateFilter.purchasedAt = { $gte: new Date(queryParams.dateFrom) };
      }
      if (queryParams.dateTo) {
        dateFilter.purchasedAt = {
          ...dateFilter.purchasedAt,
          $lte: new Date(queryParams.dateTo),
        };
      }
      purchaseQuery = purchaseQuery.find(dateFilter);
    }

    // Apply query features for purchases
    const purchaseFeatures = new QueryFeatures(purchaseQuery, queryParams)
      .filter()
      .sort()
      .paginate();
    purchaseQuery = purchaseFeatures.query;

    // Add relevant populated fields
    const purchaseHistory = await purchaseQuery
      .populate([
        { path: "container", select: "name type price" },
        { path: "lecturer", select: "name expertise" },
        { path: "package", select: "name type price description" },
      ])
      .lean();

    responseData.purchaseHistory = purchaseHistory;

    // Get total count of purchases for pagination info
    const totalPurchases = await Purchase.countDocuments({ student: userId });
    responseData.paginationInfo = {
      purchaseHistory: {
        totalCount: totalPurchases,
        page: parseInt(queryParams.page) || 1,
        limit: parseInt(queryParams.limit) || 10,
        totalPages: Math.ceil(
          totalPurchases / (parseInt(queryParams.limit) || 10)
        ),
      },
    };
  }

  // Only include redeemed codes if requested or no specific fields were requested
  if (!fields || fields.includes("redeemedCodes")) {
    let codesQuery = Code.find({
      redeemedBy: userId,
      isRedeemed: true,
    });

    // Apply query features for codes
    const codesFeatures = new QueryFeatures(codesQuery, queryParams)
      .filter()
      .sort()
      .paginate();
    codesQuery = codesFeatures.query;

    const redeemedCodes = await codesQuery.lean();
    responseData.redeemedCodes = redeemedCodes;

    // Get total count of redeemed codes for pagination info
    const totalCodes = await Code.countDocuments({
      redeemedBy: userId,
      isRedeemed: true,
    });

    if (!responseData.paginationInfo) responseData.paginationInfo = {};
    responseData.paginationInfo.redeemedCodes = {
      totalCount: totalCodes,
      page: parseInt(queryParams.page) || 1,
      limit: parseInt(queryParams.limit) || 10,
      totalPages: Math.ceil(totalCodes / (parseInt(queryParams.limit) || 10)),
    };
  }

  // Only include lecture access if requested or no specific fields were requested
  if (!fields || fields.includes("lectureAccess")) {
    let lectureAccessQuery = StudentLectureAccess.find({
      student: userId,
    });

    // Apply query features for lecture access
    const lectureAccessFeatures = new QueryFeatures(
      lectureAccessQuery,
      queryParams
    )
      .filter()
      .sort()
      .paginate();
    lectureAccessQuery = lectureAccessFeatures.query;

    const lectureAccess = await lectureAccessQuery
      .populate({
        path: "lecture",
        select: "name videoLink description numberOfViews",
      })
      .lean();

    responseData.lectureAccess = lectureAccess;

    // Get total count of lecture access entries for pagination info
    const totalLectureAccess = await StudentLectureAccess.countDocuments({
      student: userId,
    });

    if (!responseData.paginationInfo) responseData.paginationInfo = {};
    responseData.paginationInfo.lectureAccess = {
      totalCount: totalLectureAccess,
      page: parseInt(queryParams.page) || 1,
      limit: parseInt(queryParams.limit) || 10,
      totalPages: Math.ceil(
        totalLectureAccess / (parseInt(queryParams.limit) || 10)
      ),
    };
  }

  // Always include points balances as they're small
  if (!fields || fields.includes("pointsBalances")) {
    responseData.pointsBalances = pointsBalances;
  }

  // Calculate feature flags based on data
  if (!fields || fields.includes("purchasedFeatures")) {
    const purchasedLectureTypes = new Set();

    // If we have purchase history, use it to determine purchased features
    if (responseData.purchaseHistory) {
      responseData.purchaseHistory.forEach((purchase) => {
        if (purchase.container && purchase.container.type === "lecture") {
          purchasedLectureTypes.add("lecture");
        }
      });
    }
    // Otherwise we need to query just to determine feature flags
    else {
      const purchaseTypes = await Purchase.find({
        student: userId,
        "container.type": "lecture",
      })
        .limit(1)
        .lean();

      if (purchaseTypes.length > 0) {
        purchasedLectureTypes.add("lecture");
      }
    }

    responseData.purchasedFeatures = {
      hasLectures: purchasedLectureTypes.size > 0,
    };
  }

  return responseData;
};

module.exports = {
  getAllUsers,
  getAllUsersByRole,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  uploadFileForBulkCreation,
  getMyData,
};
