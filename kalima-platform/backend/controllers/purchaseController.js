const Purchase = require("../models/purchaseModel");
const Container = require("../models/containerModel");
const Student = require("../models/studentModel");
const Parent = require("../models/parentModel");
const User = require("../models/userModel");
const Teacher = require("../models/teacherModel");
const Lecturer = require("../models/lecturerModel"); // Add this import
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

/**
 * Purchase points for a specific lecturer
 */
exports.purchaseLecturerPoints = catchAsync(async (req, res, next) => {
  // Get userId from the authenticated user's JWT token - try multiple possible properties
  let userId;
  
  if (req.user) {
    userId = req.user.id || req.user._id;
    // Convert to string if it's an ObjectId
    if (userId && typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }
  }
  
  if (!userId) {
    return next(new AppError("User ID not found in authentication token", 401));
  }

  const { lecturerId, pointsAmount } = req.body;

  if (!lecturerId || !pointsAmount || pointsAmount <= 0) {
    return next(new AppError("Missing required fields or invalid points amount", 400));
  }

  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find lecturer
    const lecturer = await Lecturer.findById(lecturerId).session(session);
    if (!lecturer) {
      return next(new AppError("Lecturer not found", 404));
    }

    // Find user directly based on role first
    let userModel;
    
    // Try finding as Student
    userModel = await Student.findById(userId).session(session);
    
    // If not found, try as Parent
    if (!userModel) {
      userModel = await Parent.findById(userId).session(session);
    }
    
    // If still not found, check standard User model
    if (!userModel) {
      const baseUser = await User.findById(userId).session(session);
      
      if (baseUser) {
        // If found in base User model, look up the specialized model
        if (baseUser.role === 'Student') {
          userModel = await Student.findById(userId).session(session);
        } else if (baseUser.role === 'Parent') {
          userModel = await Parent.findById(userId).session(session);
        }
      }
    }
    
    // Final check if we found a valid user model
    if (!userModel) {
      console.log(`No user model found for ID: ${userId}`);
      await session.abortTransaction();
      session.endSession();
      return next(new AppError(`User not found with ID: ${userId}`, 404));
    }
    
    console.log(`Found user model: ${userModel.name} with role: ${userModel.role || userModel.constructor.modelName}`);

    // Add points to user's balance
    userModel.addLecturerPoints(lecturerId, pointsAmount);
    await userModel.save({ session });

    // Create purchase record
    const purchase = await Purchase.create([{
      student: userId,
      lecturer: lecturerId,
      points: pointsAmount,
      type: "pointPurchase",
      description: `Purchased ${pointsAmount} points for lecturer ${lecturer.name}`
    }], { session });

    await session.commitTransaction();
    
    res.status(201).json({
      status: "success",
      data: {
        purchase: purchase[0],
        pointsBalance: userModel.getLecturerPointsBalance(lecturerId)
      }
    });
  } catch (error) {
    console.error('Transaction error:', error);
    await session.abortTransaction();
    return next(new AppError(error.message, 500));
  } finally {
    session.endSession();
  }
});

/**
 * Purchase a container using lecturer-specific points
 */
exports.purchaseContainerWithPoints = catchAsync(async (req, res, next) => {
  // Get userId from the authenticated user's JWT token - try multiple possible properties
  let userId;
  
  if (req.user) {
    userId = req.user.id || req.user._id;
    // Convert to string if it's an ObjectId
    if (userId && typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }
  }
  
  if (!userId) {
    return next(new AppError("User ID not found in authentication token", 401));
  }

  const { containerId } = req.body;

  if (!containerId) {
    return next(new AppError("Container ID is required", 400));
  }

  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the container
    const container = await Container.findById(containerId).session(session);
    if (!container) {
      return next(new AppError("Container not found", 404));
    }

    // Ensure the container has a lecturer and a price
    if (!container.createdBy) {
      return next(new AppError("Container is not associated with any lecturer", 400));
    }
    
    const lecturerId = container.createdBy.toString();
    const pointsRequired = container.price || 0;

    // Find user model
    let userModel;
    
    // Try finding as Student
    userModel = await Student.findById(userId).session(session);
    
    // If not found, try as Parent
    if (!userModel) {
      userModel = await Parent.findById(userId).session(session);
    }
    
    // If still not found, check standard User model to determine role
    if (!userModel) {
      const baseUser = await User.findById(userId).session(session);
      
      if (baseUser) {
        if (baseUser.role === 'Student') {
          userModel = await Student.findById(userId).session(session);
        } else if (baseUser.role === 'Parent') {
          userModel = await Parent.findById(userId).session(session);
        }
      }
    }
    
    if (!userModel) {
      return next(new AppError(`User not found with ID: ${userId}`, 404));
    }

    // Check if user has enough points for this lecturer
    const currentPoints = userModel.getLecturerPointsBalance(lecturerId);
    
    if (currentPoints < pointsRequired) {
      return next(new AppError(`Not enough points. Required: ${pointsRequired}, Available: ${currentPoints}`, 400));
    }

    // Deduct points
    const success = userModel.useLecturerPoints(lecturerId, pointsRequired);
    
    if (!success) {
      return next(new AppError("Failed to deduct points", 500));
    }
    
    await userModel.save({ session });

    // Create purchase record
    const purchase = await Purchase.create([{
      student: userId,
      lecturer: lecturerId,
      points: pointsRequired,
      container: containerId,
      type: "containerPurchase",
      description: `Purchased container ${container.name} for ${pointsRequired} points`
    }], { session });

    await session.commitTransaction();
    
    res.status(201).json({
      status: "success",
      data: {
        purchase: purchase[0],
        remainingPoints: userModel.getLecturerPointsBalance(lecturerId)
      }
    });
  } catch (error) {
    console.error('Transaction error:', error);
    await session.abortTransaction();
    return next(new AppError(error.message, 500));
  } finally {
    session.endSession();
  }
});

/**
 * Get all purchases
 */
exports.getAllPurchases = catchAsync(async (req, res, next) => {
  const purchases = await Purchase.find()
    .populate(["container", "lecturer", "student"]);
  
  res.status(200).json({
    status: "success",
    results: purchases.length,
    data: {
      purchases
    }
  });
});

/**
 * Get points balance for a user with a specific lecturer
 */
exports.getLecturerPointsBalance = catchAsync(async (req, res, next) => {
  // Use current user's ID if not specified in params
  let userId = req.params.userId;
  
  if (!userId && req.user) {
    userId = req.user.id || req.user._id;
    if (userId && typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }
  }
  
  const { lecturerId } = req.params;

  if (!lecturerId) {
    return next(new AppError("Lecturer ID is required", 400));
  }

  if (!userId) {
    return next(new AppError("User ID is required", 400));
  }

  // Find user directly based on role first
  let userModel;
  let pointsBalance = 0;
  
  // Try finding as Student
  userModel = await Student.findById(userId).populate({
    path: 'lecturerPoints.lecturer',
    select: 'name'
  });
  
  // If not found, try as Parent
  if (!userModel) {
    userModel = await Parent.findById(userId).populate({
      path: 'lecturerPoints.lecturer',
      select: 'name'
    });
  }
  
  // If still not found, check standard User model
  if (!userModel) {
    const baseUser = await User.findById(userId);
    
    if (baseUser) {
      if (baseUser.role === 'Student') {
        userModel = await Student.findById(userId).populate({
          path: 'lecturerPoints.lecturer',
          select: 'name'
        });
      } else if (baseUser.role === 'Parent') {
        userModel = await Parent.findById(userId).populate({
          path: 'lecturerPoints.lecturer',
          select: 'name'
        });
      }
    }
  }
  
  // Final check if we found a valid user model
  if (!userModel) {
    return next(new AppError(`User not found with ID: ${userId}`, 404));
  }
  
  // Get points balance
  pointsBalance = userModel.getLecturerPointsBalance(lecturerId);

  // Get purchase history for this user-lecturer combination
  const purchases = await Purchase.find({
    student: userId,
    lecturer: lecturerId
  }).sort({ purchasedAt: -1 }).populate("container");

  res.status(200).json({
    status: "success",
    data: {
      userId,
      lecturerId,
      pointsBalance,
      purchases
    }
  });
});

/**
 * Get all user's points balances
 */
exports.getAllUserPointBalances = catchAsync(async (req, res, next) => {
  // Use current user's ID if not specified in params
  let userId = req.params.userId;
  
  if (!userId && req.user) {
    userId = req.user.id || req.user._id;
    if (userId && typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }
  }
  
  if (!userId) {
    return next(new AppError("User ID is required", 400));
  }

  // Find user directly based on role first
  let userModel;
  let pointsBalances = [];
  
  // Try finding as Student
  userModel = await Student.findById(userId).populate({
    path: 'lecturerPoints.lecturer',
    select: 'name subject'
  });
  
  // If not found, try as Parent
  if (!userModel) {
    userModel = await Parent.findById(userId).populate({
      path: 'lecturerPoints.lecturer',
      select: 'name subject'
    });
  }
  
  // If still not found, check standard User model
  if (!userModel) {
    const baseUser = await User.findById(userId);
    
    if (baseUser) {
      if (baseUser.role === 'Student') {
        userModel = await Student.findById(userId).populate({
          path: 'lecturerPoints.lecturer',
          select: 'name subject'
        });
      } else if (baseUser.role === 'Parent') {
        userModel = await Parent.findById(userId).populate({
          path: 'lecturerPoints.lecturer',
          select: 'name subject'
        });
      }
    }
  }
  
  // Final check if we found a valid user model
  if (!userModel) {
    return next(new AppError(`User not found with ID: ${userId}`, 404));
  }
  
  // Get points balances
  pointsBalances = userModel.lecturerPoints || [];

  res.status(200).json({
    status: "success",
    data: {
      userId,
      user: userModel.name,
      userRole: userModel.role || userModel.constructor.modelName,
      pointsBalances
    }
  });
});

/**
 * Get purchases by user
 */
exports.getPurchasesByUser = catchAsync(async (req, res, next) => {
  // Use current user's ID if not specified in params
  let userId = req.params.userId;
  
  if (!userId && req.user) {
    userId = req.user.id || req.user._id;
    if (userId && typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }
  }
  
  if (!userId) {
    return next(new AppError("User ID is required", 400));
  }
  
  const purchases = await Purchase.find({ 
    student: userId 
  })
  .populate(["container", "lecturer"])
  .sort({ purchasedAt: -1 });
  
  res.status(200).json({
    status: "success",
    results: purchases.length,
    data: {
      purchases
    }
  });
});

/**
 * Get a purchase by ID
 */
exports.getPurchaseById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const purchase = await Purchase.findById(id)
    .populate(["container", "lecturer", "student"]);
  
  if (!purchase) {
    return next(new AppError("Purchase not found", 404));
  }
  
  res.status(200).json({
    status: "success",
    data: {
      purchase
    }
  });
});

/**
 * Delete a purchase by ID
 */
exports.deletePurchase = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const purchase = await Purchase.findByIdAndDelete(id);
  
  if (!purchase) {
    return next(new AppError("Purchase not found", 404));
  }
  
  res.status(204).json({
    status: "success",
    data: null
  });
});