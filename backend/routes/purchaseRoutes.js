const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");

// Create a purchase.
router.post("/", purchaseController.createPurchase);

// Get all purchases for a student.
router.get("/student/:studentId", purchaseController.getPurchasesByStudent);

module.exports = router;
