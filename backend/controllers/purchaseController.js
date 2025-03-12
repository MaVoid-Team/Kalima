const Purchase = require("../models/purchaseModel");

/**
 * Create a new purchase.
 * Student purchases a container (e.g., Year, Term, Month, or Lecture).
 */
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
    // console.log(purchase);
    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all purchases for a student.
 */
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
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate("container");
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
