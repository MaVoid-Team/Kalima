const Container = require("../models/containerModel");
const Purchase = require("../models/purchaseModel");

/**
 * Get direct child containers of a requested container,
 * but only if the student has access to it (via purchases).
 */
exports.getAccessibleChildContainers = async (req, res) => {
  try {
    const { studentId, containerId } = req.params;

    // Find all containers that the student purchased.
    const purchases = await Purchase.find({ student: studentId }).select(
      "container"
    );

    const purchasedContainerIds = purchases.map((p) => p.container);
    if (purchasedContainerIds.length === 0) {
      return res
        .status(403)
        .json({ message: "No purchases found for this student" });
    }
    // Use $graphLookup to traverse from the purchased containers down the hierarchy.
    const result = await Container.aggregate([
      {
        $match: { _id: { $in: purchasedContainerIds } },
      },
      {
        $graphLookup: {
          from: "containers", // Make sure this matches your actual MongoDB collection name.
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parent",
          as: "accessibleContainers",
        },
      },
    ]);

    // Build a set of all accessible container IDs (as strings).
    const accessibleContainerIds = new Set();
    result.forEach((doc) => {
      accessibleContainerIds.add(doc._id.toString());
      doc.accessibleContainers.forEach((child) =>
        accessibleContainerIds.add(child._id.toString())
      );
    });

    // Check if the requested container is within the accessible set.
    if (!accessibleContainerIds.has(containerId)) {
      return res
        .status(403)
        .json({ message: "You do not have access to this container" });
    }

    // Retrieve only the direct children (next level) of the requested container.
    const container = await Container.findById(containerId);
    if (!container) {
      return res.status(404).json({ message: "Container not found" });
    }
    res.json({ container });
  } catch (error) {
    console.error("Error in getAccessibleChildContainers:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new container (e.g., a Year, Term, Month, or Lecture).
 */
exports.createContainer = async (req, res) => {
  try {
    // const { name, type, parent, price, createdBy, level } = req.body;
    const newContainer = await Container.create(req.body);
    res.status(201).json(newContainer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get container details by its ID.
 */
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
