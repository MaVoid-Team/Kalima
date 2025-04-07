const mongoose = require("mongoose");
const Student = require("../models/studentModel");
const Parent = require("../models/parentModel");
const Teacher = require("../models/teacherModel");
const Lecturer = require("../models/lecturerModel");
const catchAsync = require("../utils/catchAsync");
const QuerFeatures = require("../utils/queryFeatures");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const Purchase = require("../models/purchaseModel");

exports.getUserStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: stats,
  });
});

exports.getStudentData = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  const student = await Student.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(studentId) } },
    {
      $lookup: {
        from: "parents",
        localField: "parent",
        foreignField: "_id",
        as: "parent",
      },
    },
    {
      $lookup: {
        from: "purchases",
        let: { stuId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$student", "$$stuId"] },
            },
          },
          // Nested lookup to populate container and its nested fields
          {
            $lookup: {
              from: "containers",
              let: { containerId: "$container" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$containerId"] },
                  },
                },
                // Populate createdBy (Lecturer)
                {
                  $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy",
                  },
                },
                {
                  $unwind: {
                    path: "$createdBy",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                // Populate subject (Subject)
                {
                  $lookup: {
                    from: "subjects",
                    localField: "subject",
                    foreignField: "_id",
                    as: "subject",
                  },
                },
                {
                  $unwind: {
                    path: "$subject",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                // Populate level (Level)
                {
                  $lookup: {
                    from: "levels",
                    localField: "level",
                    foreignField: "_id",
                    as: "level",
                  },
                },
                {
                  $unwind: { path: "$level", preserveNullAndEmptyArrays: true },
                },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    createdBy: { _id: 1, name: 1 },
                    subject: { _id: 1, name: 1 },
                    level: { _id: 1, name: 1 },
                  },
                },
              ],
              as: "container",
            },
          },
          { $unwind: { path: "$container", preserveNullAndEmptyArrays: true } },
          // Optionally, if you also want to populate lecturer on the purchase itself:
          {
            $lookup: {
              from: "users",
              let: { lecturerId: "$lecturer" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$lecturerId"] } } },
                { $project: { _id: 1, name: 1 } },
              ],
              as: "lecturer",
            },
          },
          { $unwind: { path: "$lecturer", preserveNullAndEmptyArrays: true } },
        ],
        as: "purchases",
      },
    },
  ]);
  if (!student) return next(new AppError("Couldn't find student.", 404));
  res.status(200).json({
    status: "success",
    data: student,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let query = User.find().select("-password").lean();
  const features = new QuerFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();
  query = features.query;

  const users = await query;

  if (!users.length) return next(new AppError("Couldn't find users.", 404));

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
