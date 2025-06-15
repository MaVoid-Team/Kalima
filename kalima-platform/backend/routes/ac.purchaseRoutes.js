const express = require("express");
const extendedECPurchaseController = require("../controllers/ac.purchaseController");
const verifyJWT = require("../middleware/verifyJWT");
const authController = require("../controllers/authController");
const multer  = require("multer");
const upload  = multer({ dest: "uploads/" });

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// Public routes (all authenticated users can access)
router
  .route("/")
  .get(extendedECPurchaseController.getAllExtendedECPurchases)
  .post(
    authController.verifyRoles("Parent", "Student", "Teacher"),
    upload.single("paymentScreenshot"), 
    extendedECPurchaseController.createExtendedECPurchase
  );

// Statistics route
router
  .route("/stats")
  .get(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    extendedECPurchaseController.getExtendedECPurchaseStats
  );

// User's own purchases
router.route("/myPurchases").get(extendedECPurchaseController.getExtendedECPurchasesByUser);


// Get purchases by user ID
router.route("/user/:userId").get(
  authController.verifyRoles("Admin", "SubAdmin"),
  extendedECPurchaseController.getExtendedECPurchasesByUser
);

// Confirmation routes
router
  .route("/:id/confirm")
  .patch(
    authController.verifyRoles("Admin", "SubAdmin"),
    extendedECPurchaseController.confirmExtendedECPurchase
  );

router
  .route("/:id")
  .get(extendedECPurchaseController.getExtendedECPurchaseById)
  .patch(
    authController.verifyRoles("Admin", "SubAdmin"),
    extendedECPurchaseController.updateExtendedECPurchase
  )
  .delete(
    authController.verifyRoles("Admin"),
    extendedECPurchaseController.deleteExtendedECPurchase
  );

module.exports = router;

// Public Routes (All authenticated users):
// Create, view, and search purchases
// Get personal purchases

// Management Routes (Admin/SubAdmin/Moderator):
// Confirm, update purchases
// Get statistics

// Admin-only Routes:
// Delete purchases