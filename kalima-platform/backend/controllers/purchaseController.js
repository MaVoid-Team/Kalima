const Purchase = require("../models/purchaseModel");

exports.createPurchase = async (req, res) => {
  try {
    const { studentId, containerId } = req.body;

    // Prevent duplicate purchases.
    const existing = await Purchase.findOne({
      student: studentId,
      container: containerId,
    });
    if (existing) {
      return res.status(400).json({ message: "Container already purchased" });
    }

    const purchase = await Purchase.create({
      student: studentId,
      container: containerId,
    });
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPurchasesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const purchases = await Purchase.find({ student: studentId }).populate(
      "container"
    );
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all purchases.
 */
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate("container");
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a single purchase by ID.
 */
exports.getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findById(id).populate("container");
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a purchase by ID.
 * Allows adding more children to the same parent.
 */
exports.updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, containerId } = req.body;

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Update the purchase with new children while keeping the parent reference.
    purchase.student = studentId || purchase.student;
    purchase.container = containerId || purchase.container;

    await purchase.save();
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a purchase by ID.
 */
exports.deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findByIdAndDelete(id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};