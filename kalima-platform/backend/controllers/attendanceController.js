const Attendance = require("../models/attendanceModel");
const Lesson = require("../models/lessonModel");
const User = require("../models/userModel"); // Assuming Student is derived from User
const PricingRule = require("../models/pricingRuleModel"); // Import PricingRule
const AppError = require("../utils/appError");
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

  const student = await User.findById(studentId).lean();
  if (!student || student.role !== "Student") {
    return next(new AppError("Student not found.", 404));
  }

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
    // Find the most recent multi-session attendance record for this student
    // attending this specific conceptual lesson (defined by lecturer, subject, level).
    // This works even if the lessonId changes for each scheduled instance,
    // because we query based on the stable identifiers.
    const existingMultiSessionRecord = await Attendance.findOne({
      student: studentId,
      lecturer: lesson.lecturer, // Stable identifier for the conceptual lesson
      subject: lesson.subject,   // Stable identifier
      level: lesson.level,     // Stable identifier
      paymentType: "multi-session",
      sessionsRemaining: { $gt: 0 },
    }).sort({ attendanceDate: -1 }); // Get the latest relevant record

    if (existingMultiSessionRecord) {
      // Use an existing session from a previous payment for this conceptual lesson
      attendanceData.amountPaid = 0;
      attendanceData.sessionsPaidFor = 0;
      attendanceData.sessionsRemaining = existingMultiSessionRecord.sessionsRemaining - 1;
    } else {
      // No active multi-session package found for this student + conceptual lesson.
      // Start a new multi-session package using the applicable pricing rule.
      const finalAmountPaid = lessonMultiSessionPrice;
      const finalSessionsPaidFor = lessonMultiSessionCount;

      if (finalSessionsPaidFor <= 0) {
        return next(
          new AppError("Pricing rule's multi-session count must be positive.", 400)
        );
      }

      attendanceData.amountPaid = finalAmountPaid;
      attendanceData.sessionsPaidFor = finalSessionsPaidFor;
      attendanceData.sessionsRemaining = finalSessionsPaidFor - 1;
    }
  } else if (paymentType === "unpaid") {
    attendanceData.amountPaid = 0;
  } else {
    return next(new AppError("Invalid payment type.", 400));
  }

  const newAttendance = await Attendance.create(attendanceData);

  res.status(201).json({
    status: "success",
    data: {
      attendance: newAttendance,
    },
  });
});

// Generic function to get attendance records with filtering/sorting/pagination
exports.getAttendance = catchAsync(async (req, res, next) => {
    const features = new QueryFeatures(Attendance.find(), req.query)
      .filter()
      .sort()
      .limitFields()
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
