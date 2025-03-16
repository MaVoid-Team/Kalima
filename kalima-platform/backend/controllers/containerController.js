const Container = require("../models/containerModel");
const Purchase = require("../models/purchaseModel");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const QueryFeatures = require("../utils/queryFeatures");
const Level = require("../models/levelModel");
const Subject = require("../models/subjectModel");
const Lecturer = require("../models/lecturerModel");

const checkDoc = async (Model, id, session) => {
  const doc = await Model.findById(id).session(session);
  if (!doc) {
    throw new AppError(`${Model.modelName} not found`, 404);
  }
  return doc;
};

exports.getAccessibleChildContainers = catchAsync(async (req, res, next) => {
  const { studentId, containerId, purchaseId } = req.params;

  // Validate required ObjectIds.
  if (
    !mongoose.Types.ObjectId.isValid(studentId) ||
    !mongoose.Types.ObjectId.isValid(containerId) ||
    (purchaseId && !mongoose.Types.ObjectId.isValid(purchaseId))
  ) {
    return next(new AppError("Invalid ID provided.", 400));
  }

  let purchasedContainerId;

  // If purchaseId is provided, look it up directly.
  if (purchaseId) {
    const purchase = await Purchase.findById(purchaseId).select("container");
    if (!purchase) {
      return next(new AppError("Purchase not found or unauthorized", 403));
    }
    purchasedContainerId = purchase.container.toString();
  } else {
    // Otherwise, fallback to finding any purchase for this student.
    const purchase = await Purchase.findOne({ student: studentId }).select(
      "container"
    );
    if (!purchase) {
      return next(new AppError("No purchases found for this student", 403));
    }
    purchasedContainerId = purchase.container.toString();
  }

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
  ]);
  if (!containerChainResult || containerChainResult.length === 0) {
    return next(new AppError("Container not found", 404));
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
    return next(new AppError("You do not have access to this container", 403));
  }

  // Access allowed; return the container data.
  delete containerDoc.parentChain;
  res.json(containerDoc);
});

exports.createContainer = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Create the new container inside the transaction.
    await checkDoc(Level, req.body.level, session);
    await checkDoc(Subject, req.body.subject, session);
    await checkDoc(Lecturer, req.body.createdBy, session);
    const newContainers = await Container.create([req.body], { session });
    const newContainer = newContainers[0];

    if (req.body.parent) {
      const parentContainer = await checkDoc(
        Container,
        req.body.parent,
        session
      );
      parentContainer.children.push(newContainer._id);
      await parentContainer.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(newContainer);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(error.message, 500));
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
  res.json(container);
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

    const container = await Container.findByIdAndUpdate(
      req.params.containerId,
      obj,
      {
        new: true,
        runValidators: true,
        session,
      }
    );
    if (!container) {
      throw new AppError("Container not found", 404);
    }
    await session.commitTransaction();
    res.status(200).json({ status: "success", data: { container } });
  } catch (error) {
    await session.abortTransaction();
    return next(new AppError(error.message, 500));
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
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Container not found", 404));
    }

    const childContainer = await Container.findById(childId).session(session);
    if (!childContainer) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Child container not found", 404));
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
      await session.abortTransaction();
      session.endSession();
      return next(new AppError("Invalid operation", 400));
    }
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ status: "success", data: { container } });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(new AppError(error.message, 500));
  } finally {
    session.endSession();
  }
});

exports.deleteContainerAndChildren = catchAsync(async (req, res, next) => {
  let session;
  try {
    const { containerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(containerId)) {
      return next(new AppError("Invalid container id", 400));
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
      await session.abortTransaction();
      return next(new AppError("Container not found", 404));
    }

    const containerDoc = containerTree[0];
    const toDeleteIds = [
      containerDoc._id,
      ...containerDoc.nestedChildren.map((child) => child._id),
    ];

    // Remove the container id from its parent's children array if applicable.
    if (containerDoc.parent) {
      await Container.findByIdAndUpdate(
        containerDoc.parent,
        { $pull: { children: containerDoc._id } },
        { session }
      );
    }

    // Delete the container and all nested children.
    await Container.deleteMany({ _id: { $in: toDeleteIds } }).session(session);

    await session.commitTransaction();
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    return next(new AppError(error.message, 500));
  } finally {
    if (session) {
      session.endSession();
    }
  }
});
