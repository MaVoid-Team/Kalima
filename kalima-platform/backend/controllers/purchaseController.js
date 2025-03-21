const Purchase = require("../models/purchaseModel");
const Container = require("../models/containerModel");
const Student = require("../models/studentModel");
const Parent = require("../models/parentModel");
const User = require("../models/userModel");
const Teacher = require("../models/teacherModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

/**
 * Purchase points for a specific teacher
 */
exports.purchaseTeacherPoints = catchAsync(async (req, res, next) => {
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

  const { teacherId, pointsAmount } = req.body;

  if (!teacherId || !pointsAmount || pointsAmount <= 0) {
    return next(new AppError("Missing required fields or invalid points amount", 400));
  }

  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find teacher
    const teacher = await Teacher.findById(teacherId).session(session);
    if (!teacher) {
      return next(new AppError("Teacher not found", 404));
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
    userModel.addTeacherPoints(teacherId, pointsAmount);
    await userModel.save({ session });

    // Create purchase record
    const purchase = await Purchase.create([{
      student: userId,
      teacher: teacherId,
      points: pointsAmount,
      type: "pointPurchase",
      description: `Purchased ${pointsAmount} points for teacher ${teacher.name}`
    }], { session });

    await session.commitTransaction();
    
    res.status(201).json({
      status: "success",
      data: {
        purchase: purchase[0],
        pointsBalance: userModel.getTeacherPointsBalance(teacherId)
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
 * Purchase a container using teacher-specific points
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

    // Get the teacher ID from the container
    const teacherId = container.teacher || container.createdBy;
    if (!teacherId) {
      return next(new AppError("No teacher associated with this container", 400));
    }

    // Get the required points amount
    const requiredPoints = container.price;
    if (requiredPoints <= 0) {
      return next(new AppError("Container has no price value", 400));
    }

    // Check for existing purchase
    const existingPurchase = await Purchase.findOne({
      student: userId,
      container: containerId,
      type: "containerPurchase"
    }).session(session);

    if (existingPurchase) {
      return next(new AppError("Container already purchased", 400));
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

    // Get teacher name for better error message
    const teacherDoc = await Teacher.findById(teacherId).select('name').session(session);
    const teacherName = teacherDoc ? teacherDoc.name : 'this teacher';

    // Check if user has enough points for this teacher
    const currentPoints = userModel.getTeacherPointsBalance(teacherId);
    if (currentPoints < requiredPoints) {
      return next(new AppError(
        `You don't have enough points for ${teacherName}. Required: ${requiredPoints}, Available: ${currentPoints}`, 
        400
      ));
    }

    // Use the points
    const pointsUsed = userModel.useTeacherPoints(teacherId, requiredPoints);
    if (!pointsUsed) {
      return next(new AppError(`Failed to use points for ${teacherName}`, 500));
    }

    await userModel.save({ session });

    // Create purchase record
    const purchase = await Purchase.create([{
      student: userId,
      teacher: teacherId,
      container: containerId,
      points: -requiredPoints, // Negative to indicate points spent
      type: "containerPurchase",
      description: `Purchased container ${container.name} using ${requiredPoints} points for ${teacherName}`
    }], { session });

    await session.commitTransaction();
    
    res.status(201).json({
      status: "success",
      data: {
        purchase: purchase[0],
        container: container,
        remainingPoints: userModel.getTeacherPointsBalance(teacherId)
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
    .populate(["container", "teacher", "student"]);
  
  res.status(200).json({
    status: "success",
    results: purchases.length,
    data: {
      purchases
    }
  });
});

/**
 * Get points balance for a user with a specific teacher
 */
exports.getTeacherPointsBalance = catchAsync(async (req, res, next) => {
  // Use current user's ID if not specified in params
  let userId = req.params.userId;
  
  if (!userId && req.user) {
    userId = req.user.id || req.user._id;
    // Convert to string if it's an ObjectId
    if (userId && typeof userId === 'object' && userId.toString) {
      userId = userId.toString();
    }
  }
  
  const { teacherId } = req.params;

  if (!teacherId) {
    return next(new AppError("Teacher ID is required", 400));
  }

  if (!userId) {
    return next(new AppError("User ID is required", 400));
  }

  // Find user directly based on role first
  let userModel;
  let pointsBalance = 0;
  
  // Try finding as Student
  userModel = await Student.findById(userId).populate({
    path: 'teacherPoints.teacher',
    select: 'name'
  });
  
  // If not found, try as Parent
  if (!userModel) {
    userModel = await Parent.findById(userId).populate({
      path: 'teacherPoints.teacher',
      select: 'name'
    });
  }
  
  // If still not found, check standard User model
  if (!userModel) {
    const baseUser = await User.findById(userId);
    
    if (baseUser) {
      // If found in base User model, look up the specialized model
      if (baseUser.role === 'Student') {
        userModel = await Student.findById(userId).populate({
          path: 'teacherPoints.teacher',
          select: 'name'
        });
      } else if (baseUser.role === 'Parent') {
        userModel = await Parent.findById(userId).populate({
          path: 'teacherPoints.teacher',
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
  pointsBalance = userModel.getTeacherPointsBalance(teacherId);

  // Get purchase history for this user-teacher combination
  const purchases = await Purchase.find({
    student: userId,
    teacher: teacherId
  }).sort({ purchasedAt: -1 }).populate("container");

  res.status(200).json({
    status: "success",
    data: {
      userId,
      teacherId,
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
    // Convert to string if it's an ObjectId
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
    path: 'teacherPoints.teacher',
    select: 'name subject'
  });
  
  // If not found, try as Parent
  if (!userModel) {
    userModel = await Parent.findById(userId).populate({
      path: 'teacherPoints.teacher',
      select: 'name subject'
    });
  }
  
  // If still not found, check standard User model
  if (!userModel) {
    const baseUser = await User.findById(userId);
    
    if (baseUser) {
      // If found in base User model, look up the specialized model
      if (baseUser.role === 'Student') {
        userModel = await Student.findById(userId).populate({
          path: 'teacherPoints.teacher',
          select: 'name subject'
        });
      } else if (baseUser.role === 'Parent') {
        userModel = await Parent.findById(userId).populate({
          path: 'teacherPoints.teacher',
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
  pointsBalances = userModel.teacherPoints || [];

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
    // Convert to string if it's an ObjectId
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
  .populate(["container", "teacher"])
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
    .populate(["container", "teacher", "student"]);
  
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