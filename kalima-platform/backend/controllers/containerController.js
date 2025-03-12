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
  try {
    // const { name, type, parent, price, createdBy, level } = req.body;
    const newContainer = await Container.create(req.body);
    res.status(201).json(newContainer);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
