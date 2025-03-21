const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");
const verifyJWT = require("../middleware/verifyJWT");
const authController = require("../controllers/authController");

// Apply JWT verification to all routes
router.use(verifyJWT);

// Purchase points for a specific teacher
router.post("/points", 
  authController.verifyRoles("Student", "Parent"),
  purchaseController.purchaseTeacherPoints
);

// Purchase a container with teacher-specific points
router.post("/container", 
  authController.verifyRoles("Student", "Parent"),
  purchaseController.purchaseContainerWithPoints
);

// Get all purchases - admin only
router.get("/", 
  authController.verifyRoles("Admin", "Sub-Admin", "Moderator"),
  purchaseController.getAllPurchases
);

// Get current user's points balances across all teachers
router.get("/balances", 
  authController.verifyRoles("Student", "Parent"),
  purchaseController.getAllUserPointBalances
);

// Get all user's points balances across all teachers
router.get("/user/:userId/balances", 
  authController.verifyRoles("Admin", "Sub-Admin", "Moderator"),
  purchaseController.getAllUserPointBalances
);

// Get current user's points balance with a specific teacher
router.get("/teacher/:teacherId/balance", 
  authController.verifyRoles("Student", "Parent"),
  purchaseController.getTeacherPointsBalance
);

// Get points balance for a user with a specific teacher
router.get("/user/:userId/teacher/:teacherId/balance", 
  authController.verifyRoles("Admin", "Sub-Admin", "Moderator"),
  purchaseController.getTeacherPointsBalance
);

// Get current user's purchases
router.get("/history", 
  authController.verifyRoles("Student", "Parent"),
  purchaseController.getPurchasesByUser
);

// Get all purchases for a specific user
router.get("/user/:userId", 
  authController.verifyRoles("Admin", "Sub-Admin", "Moderator"),
  purchaseController.getPurchasesByUser
);

// Get, update, or delete a specific purchase by ID
router.route("/:id")
  .get(purchaseController.getPurchaseById)
  .delete(
    authController.verifyRoles("Admin", "Sub-Admin", "Moderator"),
    purchaseController.deletePurchase
  );

module.exports = router;