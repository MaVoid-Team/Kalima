const Attendance = require("../models/attendanceModel");
const Lesson = require("../models/lessonModel");
// const User = require("../models/userModel"); // Assuming Student is derived from User
const PricingRule = require("../models/pricingRuleModel"); // Import PricingRule
const AppError = require("../utils/appError");
const cStudent = require("../models/center.studentModel"); // Assuming Student is derived from User
const catchAsync = require("../utils/catchAsync");
const QueryFeatures = require("../utils/queryFeatures");

exports.recordAttendance = catchAsync(async (req, res, next) => {
  const {
    studentId,
    lessonId,
    paymentType,
  } = req.body;
  const recordedById = req.user._id;
  if (!studentId || !lessonId || !paymentType) {
    return next(
      new AppError("Student ID, Lesson ID, and Payment Type are required.", 400)
    );
  }

  // --- Validation ---
  const lesson = await Lesson.findById(lessonId).lean(); // Use lean for read-only
  if (!lesson) {
    return next(new AppError("Lesson not found.", 404));
  }

  const student = await cStudent.findById(studentId).lean();
  if (!student) {
    return next(new AppError("Student not found.", 404));
  }

  // --- Check for Existing Attendance for this specific lesson instance ---
  const existingAttendance = await Attendance.findOne({ student: studentId, lesson: lessonId });
  if (existingAttendance) {
      return next(new AppError("Student attendance already recorded for this specific lesson.", 409)); // 409 Conflict
  }
  // --- End Check ---

  // --- Find Applicable Pricing Rule ---
  // Find center-specific rule first, then fall back to global rule (center: null)
  const pricingRule = await PricingRule.findOne({
    lecturer: lesson.lecturer,
    subject: lesson.subject,
    level: lesson.level,
    $or: [{ center: lesson.center }, { center: null }], // Check center-specific then global
  }).sort({ center: -1 }); // Prioritize center-specific rule (-1 puts non-null first)

  if (!pricingRule && paymentType !== 'unpaid') {
      // Allow 'unpaid' even without a rule, but require a rule for 'daily' or 'multi-session'
      return next(new AppError("No pricing rule found for this lesson combination. Cannot record paid attendance.", 404));
  }

  // Use default 0 if no rule found and type is unpaid, otherwise use rule prices
  const lessonDailyPrice = pricingRule ? pricingRule.dailyPrice : 0;
  const lessonMultiSessionPrice = pricingRule ? pricingRule.multiSessionPrice : 0;
  const lessonMultiSessionCount = pricingRule ? pricingRule.multiSessionCount : 1;


  // --- Attendance Logic ---
  let attendanceData = {
    student: studentId,
    lesson: lessonId,
    center: lesson.center,
    lecturer: lesson.lecturer,
    subject: lesson.subject,
    level: lesson.level,
    paymentType,
    recordedBy: recordedById,
    attendanceDate: new Date(),
    amountPaid: 0,
    sessionsPaidFor: 0,
    sessionsRemaining: 0,
  };

  if (paymentType === "daily") {
    attendanceData.amountPaid = lessonDailyPrice;
  } else if (paymentType === "multi-session") {
    // Step 1: Find the absolute latest multi-session record for this student/conceptual lesson
    const latestMultiSessionRecord = await Attendance.findOne({
      student: studentId,
      lecturer: lesson.lecturer,
      subject: lesson.subject,
      level: lesson.level,
      paymentType: "multi-session",
      // Removed sessionsRemaining > 0 from here to find the latest regardless of status
    }).sort({ attendanceDate: -1 }); // Get the very latest record

    // Step 2: Check if that record exists AND has sessions remaining
    if (latestMultiSessionRecord && latestMultiSessionRecord.sessionsRemaining > 0) {
      // Active package found, use an existing session
      console.log(`DEBUG: Found active package, remaining: ${latestMultiSessionRecord.sessionsRemaining}`); // Added console log
      attendanceData.amountPaid = 0;
      attendanceData.sessionsPaidFor = 0;
      attendanceData.sessionsRemaining = latestMultiSessionRecord.sessionsRemaining - 1;
    } else {
      // No active package found (either never existed or latest one is depleted)
      // A NEW payment is required.
      console.log(`DEBUG: No active package found or latest depleted. Creating new payment.`); // Added console log
      const finalAmountPaid = lessonMultiSessionPrice;
      const finalSessionsPaidFor = lessonMultiSessionCount;

      if (!pricingRule) { // Double check pricing rule exists before using its values
           return next(new AppError("Cannot process multi-session payment without a valid pricing rule.", 404));
      }
      if (finalSessionsPaidFor <= 0) {
        return next(
          new AppError("Pricing rule's multi-session count must be positive.", 400)
        );
      }

      // Record the new payment amount and reset the session counter
      attendanceData.amountPaid = finalAmountPaid;
      attendanceData.sessionsPaidFor = finalSessionsPaidFor;
      // Consume the first session of the new package
      attendanceData.sessionsRemaining = finalSessionsPaidFor - 1;
    }
  } else if (paymentType === "unpaid") {
    attendanceData.amountPaid = 0;
  } else {
    return next(new AppError("Invalid payment type.", 400));
  }

  console.log("DEBUG: Final attendanceData before create:", attendanceData); // Added console log
  const newAttendance = await Attendance.create(attendanceData);

  // Determine payment status for the response
  let paymentStatus = 'unknown';
  if (attendanceData.paymentType === 'unpaid') {
      paymentStatus = 'unpaid';
  } else if (attendanceData.amountPaid > 0) {
      // This covers both daily payments and the initial multi-session payment
      paymentStatus = 'paid';
  } else if (attendanceData.paymentType === 'multi-session' && attendanceData.amountPaid === 0) {
      // This covers using a pre-paid session from a multi-session package
      paymentStatus = 'session_used';
  }

  res.status(201).json({
    status: "success",
    data: {
      attendance: newAttendance,
      paymentStatus: paymentStatus // Add payment status to the response
    },
  });
});

// Generic function to get attendance records with filtering/sorting/pagination
exports.getAttendance = catchAsync(async (req, res, next) => {
    const features = new QueryFeatures(Attendance.find(), req.query)
      .filter()
      .sort()
      .paginate();

    // Populate related fields for better readability
    const attendanceRecords = await features.query.populate([
        { path: 'student', select: 'name sequencedId' },
        { path: 'lesson', select: 'startTime' }, // Lesson no longer has price fields
        { path: 'lecturer', select: 'name' },
        { path: 'recordedBy', select: 'name' },
        { path: 'center', select: 'name' },
        { path: 'subject', select: 'name' },
        { path: 'level', select: 'name' }
    ]);

    // Optional: Could fetch applicable pricing rule for each record here if needed for display

    res.status(200).json({
        status: 'success',
        results: attendanceRecords.length,
        data: {
            attendance: attendanceRecords
        }
    });
});


exports.getAttendanceById = catchAsync(async (req, res, next) => {
    const attendanceRecord = await Attendance.findById(req.params.id).populate([
        { path: 'student', select: 'name sequencedId' },
        { path: 'lesson', select: 'startTime' }, // Lesson no longer has price fields
        { path: 'lecturer', select: 'name' },
        { path: 'recordedBy', select: 'name' },
        { path: 'center', select: 'name' },
        { path: 'subject', select: 'name' },
        { path: 'level', select: 'name' }
    ]);

    if (!attendanceRecord) {
        return next(new AppError('No attendance record found with that ID', 404));
    }

     // Optional: Could fetch applicable pricing rule here if needed for display

    res.status(200).json({
        status: 'success',
        data: {
            attendance: attendanceRecord
        }
    });
});

// deleteAttendance remains the same
exports.deleteAttendance = catchAsync(async (req, res, next) => {
    const attendanceRecord = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendanceRecord) {
        return next(new AppError('No attendance record found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
