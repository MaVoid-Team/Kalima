const express = require("express");
const ecPurchaseController = require("../controllers/ec.purchaseController");
const verifyJWT = require("../middleware/verifyJWT");
const authController = require("../controllers/authController");

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// Public routes (all authenticated users can access)
router
  .route("/")
  .get(ecPurchaseController.getAllPurchases)
  .post(
    authController.verifyRoles("Parent", "Student", "Teacher"),
    ecPurchaseController.createPurchase
  );

// Statistics route
router
  .route("/stats")
  .get(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    ecPurchaseController.getPurchaseStats
  );

router.route("/myPurchases").get(ecPurchaseController.getPurchasesByUser);
// Search by serial number
router.route("/search/serial/:serial").get(ecPurchaseController.searchBySerial);

// Get purchases by user name
router.route("/user/:userId").get(ecPurchaseController.getPurchasesByUser);
// Confirmation routes
router
  .route("/:id/confirm")
  .patch(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    ecPurchaseController.confirmPurchase
  );

// router
//   .route("/:id/unconfirm")
//   .patch(
//     authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
//     ecPurchaseController.unconfirmPurchase
//   );

// Individual purchase routes
router
  .route("/:id")
  .get(ecPurchaseController.getPurchaseById)
  .patch(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    ecPurchaseController.updatePurchase
  )
  .delete(
    authController.verifyRoles("Admin", "SubAdmin"),
    ecPurchaseController.deletePurchase
  );

module.exports = router;
