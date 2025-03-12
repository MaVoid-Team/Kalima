const Container = require("../models/containerModel");
const Purchase = require("../models/purchaseModel");
const mongoose = require("mongoose");

exports.getAccessibleChildContainers = async (req, res) => {
  try {
    const { studentId, containerId, purchaseId } = req.params;

    // Validate required ObjectIds.
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(containerId) ||
      (purchaseId && !mongoose.Types.ObjectId.isValid(purchaseId))
    ) {
      return res.status(400).json({ message: "Invalid ID provided." });
    }

    let purchasedContainerId;

    // If purchaseId is provided, look it up directly.
    if (purchaseId) {
      const purchase = await Purchase.findById(purchaseId).select("container");
      if (!purchase) {
        return res
          .status(403)
          .json({ message: "Purchase not found or unauthorized" });
      }
      purchasedContainerId = purchase.container.toString();
    } else {
      // Otherwise, fallback to finding any purchase for this student.
      const purchase = await Purchase.findOne({ student: studentId }).select(
        "container"
      );
      if (!purchase) {
        return res
          .status(403)
          .json({ message: "No purchases found for this student" });
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
      return res.status(404).json({ message: "Container not found" });
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
      return res
        .status(403)
        .json({ message: "You do not have access to this container" });
    }

    // Access allowed; return the container data.
    delete containerDoc.parentChain;
    res.json(containerDoc);
  } catch (error) {
    console.error("Error in getAccessibleChildContainers:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createContainer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Create the new container inside the transaction.
    const newContainers = await Container.create([req.body], { session });
    const newContainer = newContainers[0];

    if (req.body.parent) {
      const parentContainer = await Container.findById(req.body.parent).session(
        session
      );
      if (!parentContainer) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Parent container not found" });
      }
      parentContainer.children.push(newContainer._id);
      await parentContainer.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json(newContainer);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

exports.getContainerById = async (req, res) => {
  try {
    const container = await Container.findById(req.params.containerId).populate(
      [
        { path: "children", select: "name" },
        { path: "createdBy", select: "name" },
      ]
    );
    if (!container)
      return res.status(404).json({ message: "Container not found" });
    res.json(container);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllContainers = async (req, res) => {
  try {
    const container = await Container.find().populate([
      { path: "createdBy", select: "name" },
    ]);
    if (!container)
      return res.status(404).json({ message: "Container not found" });
    res.json(container);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateContainer = async (req, res) => {
  try {
    const { name, type, level, price } = req.body;
    const container = await Container.findByIdAndUpdate(
      req.params.containerId,
      { name, type, level, price },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!container)
      return res.status(404).json({ message: "Container not found" });
    res.json(container);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.UpdateChildOfContainer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { containerId, childId, operation } = req.body;
    const container = await Container.findById(containerId).session(session);
    if (!container) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Container not found" });
    }

    const childContainer = await Container.findById(childId).session(session);
    if (!childContainer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Child container not found" });
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
      return res.status(400).json({ message: "Invalid operation" });
    }
    await session.commitTransaction();
    session.endSession();
    res.json(container);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

exports.deleteContainerAndChildren = async (req, res) => {
  let session;
  try {
    const { containerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(containerId)) {
      return res.status(400).json({ message: "Invalid container id" });
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
      return res.status(404).json({ message: "Container not found" });
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
    res.json({
      message: "Container and its nested children deleted successfully",
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    res.status(500).json({ error: error.message });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
