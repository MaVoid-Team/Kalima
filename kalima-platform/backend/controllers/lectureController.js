const Container = require("../models/containerModel");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const QueryFeatures = require("../utils/queryFeatures");
const Level = require("../models/levelModel");
const Subject = require("../models/subjectModel");
const Lecturer = require("../models/lecturerModel");
const Lecture = require("../models/LectureModel");

const checkDoc = async (Model, id, session) => {
  const doc = await Model.findById(id).session(session);
  if (!doc) {
    throw new AppError(`${Model.modelName} not found`, 404);
  }
  return doc;
};

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
      createdBy,
      videoLink,
      description,
      numberOfViews,
      lecture_type, // Add lecture_type
    } = req.body;

    // Basic validation for lecture_type (Mongoose enum validation also applies)
    const allowedTypes = ["Free", "Paid", "Revision", "Teachers Only"];
    if (lecture_type && !allowedTypes.includes(lecture_type)) {
      throw new AppError(
        `Invalid lecture type. Allowed types are: ${allowedTypes.join(", ")}`,
        400
      );
    }

    await checkDoc(Level, level, session);
    await checkDoc(Subject, subject, session);
    await checkDoc(Lecturer, createdBy || req.user._id, session);

    const lecture = await Lecture.create(
      [
        {
          name,
          type: "lecture",
          price: price || 0,
          level,
          subject,
          parent,
          createdBy: createdBy || req.user._id,
          videoLink,
          description,
          numberOfViews,
          lecture_type, // Add lecture_type here
        },
      ],
      { session }
    );

    if (parent) {
      const parentContainer = await checkDoc(
        Container,
        req.body.parent,
        session
      );
      parentContainer.children.push(lecture[0]._id);
      await parentContainer.save({ session });
    }

    await session.commitTransaction();
    res.status(201).json({
      status: "success",
      data: {
        lecture: lecture[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

exports.getLectureById = catchAsync(async (req, res, next) => {
  const container = await Lecture.findById(req.params.lectureId).populate([
    // { path: "children", select: "name" },
    { path: "createdBy", select: "name" },
  ]);
  if (!container) return next(new AppError("Lecture not found", 404));
  res.status(200).json({
    status: "success",
    data: {
      container,
    },
  });
});

exports.getAllLectures = catchAsync(async (req, res, next) => {
  let query = Lecture.find().populate([
    { path: "createdBy", select: "name" },
    { path: "subject", select: "name" },
    { path: "level", select: "name" },
  ]);
  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  const containers = await features.query.lean();
  if (!containers) return next(new AppError("Lectures not found", 404));
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

exports.getLecturesByType = catchAsync(async (req, res, next) => {
  const { lectureType } = req.params;
  const allowedTypes = ["Free", "Paid", "Revision", "Teachers Only"];

  if (!allowedTypes.includes(lectureType)) {
    return next(
      new AppError(
        `Invalid lecture type specified: ${lectureType}. Allowed types are: ${allowedTypes.join(
          ", "
        )}`,
        400
      )
    );
  }

  let query = Lecture.find({ lecture_type: lectureType }).populate([
    { path: "createdBy", select: "name" },
    { path: "subject", select: "name" },
    { path: "level", select: "name" },
  ]);

  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  const lectures = await features.query.lean();

  res.status(200).json({
    status: "success",
    results: lectures.length,
    data: {
      lectures,
    },
  });
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
