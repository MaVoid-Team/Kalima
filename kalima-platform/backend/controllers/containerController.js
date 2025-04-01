const Container = require("../models/containerModel");
const Purchase = require("../models/purchaseModel");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const QueryFeatures = require("../utils/queryFeatures");
const Level = require("../models/levelModel");
const Subject = require("../models/subjectModel");
const Lecturer = require("../models/lecturerModel");
const StudentLectureAccess = require("../models/studentLectureAccessModel");

const checkDoc = async (Model, id, session) => {
  const doc = await Model.findById(id).session(session);
  if (!doc) {
    throw new AppError(`${Model.modelName} not found`, 404);
  }
  return doc;
};
exports.getAccessibleChildContainers = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { studentId, containerId, purchaseId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(containerId) ||
      (purchaseId && !mongoose.Types.ObjectId.isValid(purchaseId))
    ) {
      throw new AppError("Invalid ID provided.", 400);
    }

    let purchasedContainerId;

    if (purchaseId) {
      const purchase = await Purchase.findById(purchaseId)
        .select("container")
        .session(session);
      if (!purchase) {
        throw new AppError("Purchase not found or unauthorized", 403);
      }
      purchasedContainerId = purchase.container.toString();
    }
    //  else {
    //   // Otherwise, fallback to finding any purchase for this student.
    //   const purchase = await Purchase.findOne({
    //     student: studentId,
    //     type: "containerPurchase",
    //   })
    //     .select("container")
    //     .session(session);
    //   if (!purchase) {
    //     throw new AppError("No purchases found for this student", 403);
    //   }
    //   purchasedContainerId = purchase.container.toString();
    // }

    // Traverse upward from the provided container to get its parent chain.
    const containerChainResult = await Container.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(containerId) },
      },
      {
        $graphLookup: {
          from: "containers", // Ensure this matches your actual collection name.
          startWith: "$parent",
          connectFromField: "parent",
          connectToField: "_id",
          as: "parentChain",
        },
      },
    ]).session(session);

    if (!containerChainResult || containerChainResult.length === 0) {
      throw new AppError("Container not found", 404);
    }
    const containerDoc = containerChainResult[0];

    // Build set of container IDs from the container upward.
    const accessibleChainIds = new Set();
    accessibleChainIds.add(containerDoc._id.toString());
    containerDoc.parentChain.forEach((doc) => {
      accessibleChainIds.add(doc._id.toString());
    });

    // Check if the purchased container is in the chain.
    if (!accessibleChainIds.has(purchasedContainerId)) {
      throw new AppError("You do not have access to this container", 403);
    }

    delete containerDoc.parentChain;
    let access;
    if (containerDoc.kind === "Lecture") {
      access = await StudentLectureAccess.findOne({
        student: studentId,
        lecture: containerDoc._id,
      }).session(session);

      if (!access) {
        const accessRecords = await StudentLectureAccess.create(
          [
            {
              student: studentId,
              lecture: containerDoc._id,
              remainingViews: Number(containerDoc.numberOfViews) - 1,
            },
          ],
          { session }
        );
        access = accessRecords[0];
        if (!access) {
          throw new AppError("Failed to grant access", 500);
        }
      } else {
        if (access.remainingViews > 0) {
          access.remainingViews -= 1;
          access.lastAccessed = Date.now();
          await access.save({ session });
        } else {
          delete containerDoc.videoLink;
        }
      }
    }

    await session.commitTransaction();
    res
      .status(200)
      .json({ status: "success", data: { container: containerDoc, access } });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});
exports.createContainer = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, type, price, level, subject, parent, createdBy } = req.body;
    await checkDoc(Level, level, session);
    await checkDoc(Subject, subject, session);
    await checkDoc(Lecturer, createdBy || req.user._id, session);

    const container = await Container.create(
      [
        {
          name,
          type,
          price: price || 0,
          level,
          subject,
          parent,
          createdBy: createdBy || req.user._id,
        },
      ],
      { session }
    );

    // If this container has a parent, update the parent's children array
    if (parent) {
      const parentContainer = await checkDoc(
        Container,
        req.body.parent,
        session
      );
      parentContainer.children.push(container[0]._id);
      await parentContainer.save({ session });
    }

    await session.commitTransaction();
    res.status(201).json({
      status: "success",
      data: {
        container: container[0],
      },
    });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

exports.getContainerById = catchAsync(async (req, res, next) => {
  const container = await Container.findById(req.params.containerId).populate([
    { path: "children", select: "name" },
    { path: "createdBy", select: "name" },
  ]);
  if (!container) return next(new AppError("Container not found", 404));
  res.status(201).json({
    status: "success",
    data: {
      container,
    },
  });
});

exports.getAllContainers = catchAsync(async (req, res, next) => {
  let query = Container.find().populate([
    { path: "createdBy", select: "name" },
    { path: "subject", select: "name" },
    { path: "level", select: "name" },
  ]);
  const features = new QueryFeatures(query, req.query)
    .filter()
    .sort()
    .paginate();

  const containers = await features.query.lean();
  if (!containers) return next(new AppError("Container not found", 404));
  res.status(200).json({
    status: "success",
    results: containers.length,
    data: {
      containers,
    },
  });
});

exports.getLecturerContainers = catchAsync(async (req, res, next) => {
  const { lecturerId } = req.params;

  if (!lecturerId) {
    return next(new AppError("Lecturer ID is required", 400));
  }

  const containers = await Container.find({
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

exports.updateContainer = catchAsync(async (req, res, next) => {
  const { name, type, price, level, subject } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let obj = { name, type, price };

    if (subject) {
      const subjectDoc = await checkDoc(Subject, subject, session);
      obj.subject = subjectDoc._id;
    }
    if (level) {
      const levelDoc = await checkDoc(Level, level, session);
      obj.level = levelDoc._id;
    }
    const updatedContainer = await Container.findByIdAndUpdate(
      req.params.containerId,
      obj,
      {
        new: true,
        runValidators: true,
        session,
      }
    ).populate([
      { path: "children", select: "name" },
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

exports.UpdateChildOfContainer = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { containerId, childId, operation } = req.body;
    const container = await Container.findById(containerId).session(session);
    if (!container) {
      throw new AppError("Container not found", 404);
    }

    const childContainer = await Container.findById(childId).session(session);
    if (!childContainer) {
      throw new AppError("Child container not found", 404);
    }
    if (operation === "add") {
      childContainer.parent = containerId;
      await childContainer.save({ session });
      container.children.push(childId);
      await container.save({ session });
    } else if (operation === "remove") {
      childContainer.parent = null;
      await childContainer.save({ session });
      container.children = container.children.filter(
        (child) => child.toString() !== childId
      );
      await container.save({ session });
    } else {
      throw new AppError("Invalid operation", 400);
    }
    await session.commitTransaction();

    res.status(200).json({ status: "success", data: { container } });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

exports.deleteContainerAndChildren = catchAsync(async (req, res, next) => {
  let session;
  try {
    const { containerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(containerId)) {
      throw new AppError("Invalid container id", 400);
    }

    session = await mongoose.startSession();
    session.startTransaction();

    // Find the container and recursively search for nested children.
    const containerTree = await Container.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(containerId) },
      },
      {
        $graphLookup: {
          from: "containers", // Ensure this matches your actual collection name
          startWith: "$children",
          connectFromField: "children",
          connectToField: "_id",
          as: "nestedChildren",
        },
      },
    ]).session(session);

    if (!containerTree || containerTree.length === 0) {
      throw new AppError("Container not found", 404);
    }

    const containerDoc = containerTree[0];
    const toDeleteIds = [
      containerDoc._id,
      ...containerDoc.nestedChildren.map((child) => child._id),
    ];

    // Remove the container id from its parent's children array if applicable.
    if (containerDoc.parent) {
      const parent = await Container.findByIdAndUpdate(
        containerDoc.parent,
        { $pull: { children: containerDoc._id } },
        { session }
      );
      if (!parent) {
        throw new AppError(
          "Failed to remove the container from parent's children array",
          404
        );
      }
    }

    // Delete the container and all nested children.
    await Container.deleteMany({ _id: { $in: toDeleteIds } }).session(session);

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


// get the total revenue for a container by Id
exports.getContainerRevenue = catchAsync(async (req , res , next) => {

  const { containerId } = req.params;
  const container = await Container.findById(containerId);
  if (!container) {
    return next(new AppError("Container not found", 404));
  }

  const purchaseCount = await Purchase.countDocuments({ container: containerId });

  const revenue = container.price * purchaseCount;

  res.status(200).json({
    status: "success",
    data: {
      containerId,
      purchaseCount,
      containerPrice: container.price,
      revenue
    }
  });
});
