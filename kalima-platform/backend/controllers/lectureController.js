const Container = require("../models/containerModel");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const QueryFeatures = require("../utils/queryFeatures");
const Level = require("../models/levelModel");
const Subject = require("../models/subjectModel");
const Lecturer = require("../models/lecturerModel");
const Lecture = require("../models/LectureModel");
const NotificationTemplate = require("../models/notificationTemplateModel");
const Notification = require("../models/notification");
const Student = require("../models/studentModel");
const Purchase = require("../models/purchaseModel");
const StudentLectureAccess = require("../models/studentLectureAccessModel");

// Helper function to check if document exists
const checkDoc = async (Model, id, session) => {
  const doc = await Model.findById(id).session(session);
  if (!doc) {
    throw new AppError(`${Model.modelName} not found`, 404);
  }
  return doc;
};

// Create Lecture Endpoint
exports.createLecture = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      name,
      price,
      level,
      subject,
      parent,
      teacherAllowed,
      createdBy,
      videoLink,
      examLink,
      description,
      numberOfViews,
      lecture_type,
    } = req.body;

    // Validate lecture type
    const allowedTypes = ["Free", "Paid", "Revision", "Teachers Only"];
    if (lecture_type && !allowedTypes.includes(lecture_type)) {
      throw new AppError(
        `Invalid lecture type. Allowed types are: ${allowedTypes.join(", ")}`,
        400
      );
    }

    // Check required documents exist
    const levelDoc = await checkDoc(Level, level, session);
    const subjectDoc = await checkDoc(Subject, subject, session);
    await checkDoc(Lecturer, createdBy || req.user._id, session);

    // Create the lecture
    const lecture = await Lecture.create(
      [
        {
          name,
          type: "lecture",
          price: price || 0,
          level,
          subject,
          teacherAllowed,
          parent,
          createdBy: createdBy || req.user._id,
          videoLink,
          examLink,
          description,
          numberOfViews,
          lecture_type,
        },
      ],
      { session }
    );

    // Add lecture to parent's children if parent exists
    if (parent) {
      const parentContainer = await checkDoc(Container, parent, session);
      parentContainer.children.push(lecture[0]._id);
      await parentContainer.save({ session });
    }

    // Notification logic - only for paid lectures
    let studentsNotified = 0;
    if (lecture_type === "Paid" && parent) {
      // Get the container chain (all parent containers up the hierarchy)
      const containerChainResult = await Container.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(parent) },
        },
        {
          $graphLookup: {
            from: "containers",
            startWith: "$parent",
            connectFromField: "parent",
            connectToField: "_id",
            as: "parentChain",
          },
        },
      ]).session(session);

      // Extract all container IDs in the hierarchy (including the direct parent)
      const containerIds = [
        parent,
        ...(containerChainResult[0]?.parentChain.map((c) => c._id) || []),
      ];

      // console.log("containerIds"+ containerIds);
      // Find all purchases where container is in this hierarchy
      const purchases = await Purchase.find({
        container: { $in: containerIds },
        type: "containerPurchase",
      }).session(session);

      // console.log("purchases"+ purchases);

      // Get unique student IDs from these purchases
      const studentIds = [
        ...new Set(purchases.map((p) => p.student.toString())),
      ];

      // console.log("studentIds"+ studentIds);

      // Find these students who want notifications
      const students = await Student.find({
        _id: { $in: studentIds },
        $or: [{ lectureNotify: true }, { lectureNotify: { $exists: false } }],
      }).session(session);

      // console.log("students"+ students);

      // Get notification template
      const template = await NotificationTemplate.findOne({
        type: "new_lecture",
      }).session(session);
      console.log("students" + template);

      if (template && students.length > 0) {
        const io = req.app.get("io");
        const notificationsToCreate = [];

        await Promise.all(
          students.map(async (student) => {
            // Prepare notification data
            const notificationData = {
              title: template.title,
              message: template.message
                .replace("{lecture}", name)
                .replace("{subject}", subjectDoc.name),
              type: "new_lecture",
              relatedId: lecture[0]._id,
            };

            // Check if student is online
            const isOnline = io.sockets.adapter.rooms.has(
              student._id.toString()
            );
            const isSent = isOnline;

            // Create notification
            const notification = await Notification.create(
              [
                {
                  userId: student._id,
                  ...notificationData,
                  isSent,
                },
              ],
              { session }
            );

            notificationsToCreate.push(notification[0]);

            // Send immediately if online
            if (isOnline) {
              studentsNotified++;
              io.to(student._id.toString()).emit("newLecture", {
                ...notificationData,
                notificationId: notification[0]._id,
              });
            }
          })
        );
      }
    }

    await session.commitTransaction();
    res.status(201).json({
      status: "success",
      data: {
        lecture: lecture[0],
        studentsNotified,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

// Get Lecture by ID
exports.getLectureById = catchAsync(async (req, res, next) => {
  const Role = req.user.role?.toLowerCase();
  const container = await Lecture.findById(req.params.lectureId).populate([
    { path: "createdBy", select: "name" },
  ]);

  if (!container) return next(new AppError("Lecture not found", 404));

  if (Role === "teacher") {
    if (!container.teacherAllowed) {
      return res.status(200).json({
        status: "restricted",
        data: {
          id: container._id,
          name: container.name,
          owner: container.createdBy.name || container.createdBy._id,
          subject: container.subject.name || container.subject._id,
          type: container.type,
        },
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      container,
    },
  });
});

exports.getLectureById = catchAsync(async (req, res, next) => {
  const Role = req.user.role?.toLowerCase();
  const container = await Lecture.findById(req.params.lectureId).populate([
    // { path: "children", select: "name" },
    { path: "createdBy", select: "name" },
  ]);
  if (!container) return next(new AppError("Lecture not found", 404));
  if (Role === "teacher") {
    if (!container.teacherAllowed) {
      return res.status(200).json({
        status: "restricted",
        data: {
          id: container._id,
          name: container.name,
          owner: container.createdBy.name || container.createdBy._id,
          subject: container.subject.name || container.subject._id,
          type: container.type,
        },
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      container,
    },
  });
});

// New function specifically for public, non-sensitive data
exports.getAllLecturesPublic = catchAsync(async (req, res, next) => {
  let query = Lecture.find();

  // Populate common fields
  query = query.populate([
    { path: "createdBy", select: "name" },
    { path: "subject", select: "name" },
    { path: "level", select: "name" },
    { path: "name", select: "name" },
    { path: "type", select: "name" },
  ]);

  // Always select only basic, non-sensitive fields for this public route
  query = query.select(
    "name type subject level createdBy price description lecture_type teacherAllowed"
  );

  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  const containers = await features.query.lean();

  if (!containers || containers.length === 0) {
    return next(new AppError("Lectures not found", 404));
  }

  res.status(200).json({
    status: "success",
    results: containers.length,
    data: {
      containers,
    },
  });
});

// Existing function for authenticated users (returns full data if authenticated)
exports.getAllLectures = catchAsync(async (req, res, next) => {
  // This function now assumes req.user exists because it's protected by verifyJWT middleware
  let query = Lecture.find().populate([
    { path: "createdBy", select: "name" },
    { path: "subject", select: "name" },
    { path: "level", select: "name" },
  ]);

  // No need to check req.user here as this route requires authentication
  // It will return all fields by default

  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  const containers = await features.query.lean();

  if (!containers || containers.length === 0) {
    // Check length for lean() results
    return next(new AppError("Lectures not found", 404));
  }

  // Removed the teacher-specific role check and mapping logic.
  // Authenticated users get full data (unless specific role restrictions are added back later).

  res.status(200).json({
    status: "success",
    results: containers.length,
    data: {
      containers,
    },
  });
});

exports.getLecturerLectures = catchAsync(async (req, res, next) => {
  const { lecturerId } = req.params;

  if (!lecturerId) {
    return next(new AppError("Lecturer ID is required", 400));
  }

  const containers = await Lecture.find({
    createdBy: lecturerId,
  }).populate([
    { path: "createdBy", select: "name" },
    { path: "subject", select: "name" },
    { path: "level", select: "name" },
  ]);

  res.status(200).json({
    status: "success",
    results: containers.length,
    data: {
      containers,
    },
  });
});

exports.updatelectures = catchAsync(async (req, res, next) => {
  const {
    name,
    type,
    price,
    level,
    subject,
    videoLink,
    teacherAllowed,
    examLink,
    description,
    numberOfViews,
    lecture_type, // Add lecture_type
  } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let obj = {
      name,
      type,
      price,
      videoLink,
      description,
      numberOfViews,
      lecture_type, // Add lecture_type
    };

    // Basic validation for lecture_type (Mongoose enum validation also applies)
    if (lecture_type) {
      const allowedTypes = ["Free", "Paid", "Revision", "Teachers Only"];
      if (!allowedTypes.includes(lecture_type)) {
        throw new AppError(
          `Invalid lecture type. Allowed types are: ${allowedTypes.join(", ")}`,
          400
        );
      }
    }

    if (subject) {
      const subjectDoc = await checkDoc(Subject, subject, session);
      obj.subject = subjectDoc._id;
    }
    if (level) {
      const levelDoc = await checkDoc(Level, level, session);
      obj.level = levelDoc._id;
    }
    const updatedContainer = await Lecture.findByIdAndUpdate(
      req.params.lectureId,
      obj,
      {
        new: true,
        runValidators: true,
        session,
      }
    ).populate([
      //   { path: "children", select: "name" },
      { path: "createdBy", select: "name" },
    ]);

    if (!updatedContainer) {
      throw new AppError("No container found with that ID", 404);
    }

    await session.commitTransaction();
    res.status(200).json({
      status: "success",
      data: {
        container: updatedContainer,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

exports.UpdateParentOfLecture = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { parentId, lectureId, operation } = req.body;
    const parentContainer = await Container.findById(parentId).session(session);
    if (!parentContainer) {
      throw new AppError("Container not found", 404);
    }

    const lecture = await Lecture.findById(lectureId).session(session);
    if (!lecture) {
      throw new AppError("lecture container not found", 404);
    }
    if (operation === "add") {
      lecture.parent = parentId;
      await lecture.save({ session });
      parentContainer.children.push(lectureId);
      await parentContainer.save({ session });
    } else if (operation === "remove") {
      lecture.parent = null;
      await lecture.save({ session });
      parentContainer.children = parentContainer.children.filter(
        (child) => child.toString() !== lectureId
      );
      await parentContainer.save({ session });
    } else {
      throw new AppError("Invalid operation", 400);
    }
    await session.commitTransaction();

    res.status(200).json({ status: "success", data: { lecture } });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

exports.deletelecture = catchAsync(async (req, res, next) => {
  let session;
  try {
    const { lectureId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
      throw new AppError("Invalid container id", 400);
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const lecture = await Lecture.findById(lectureId).session(session);
    if (!lecture) {
      throw new AppError("Lecture not found", 404);
    }
    if (lecture.parent) {
      const parent = await Container.findById(lecture.parent).session(session);
      if (parent) {
        parent.children = parent.children.filter(
          (child) => child.toString() !== lectureId
        );
        await parent.save({ session });
      }
    }
    await session.commitTransaction();
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    return next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
});
