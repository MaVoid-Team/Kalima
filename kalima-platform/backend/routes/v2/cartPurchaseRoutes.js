// DOMAIN: STORE
// STATUS: LEGACY
// NOTE: Store v2 cart purchase routes.
const express = require("express");
const cartPurchaseController = require("../../controllers/cart-purchase");
const verifyJWT = require("../../middleware/verifyJWT");
const {
  uploadCartPurchaseFiles,
} = require("../../utils/upload files/uploadFiles");
const authController = require("../../controllers/authController");

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// ─── User routes ─────────────────────────────────────────────
router
  .route("/")
  .post(uploadCartPurchaseFiles, cartPurchaseController.createCartPurchase)
  .get(cartPurchaseController.getCartPurchases);

// ─── Admin / Staff routes ────────────────────────────────────
router
  .route("/admin/all")
  .get(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    cartPurchaseController.getAllPurchases,
  );

router
  .route("/admin/statistics")
  .get(
    authController.verifyRoles("Admin"),
    cartPurchaseController.getPurchaseStatistics,
  );

router
  .route("/admin/product-statistics")
  .get(
    authController.verifyRoles("Admin"),
    cartPurchaseController.getProductPurchaseStats,
  );

router
  .route("/admin/response-time")
  .get(
    authController.verifyRoles("Admin"),
    cartPurchaseController.getResponseTimeStatistics,
  );

router
  .route("/admin/fullreport")
  .get(
    authController.verifyRoles("Admin"),
    cartPurchaseController.getFullOrdersReport,
  );

router.get(
  "/confirmed-count",
  authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
  cartPurchaseController.getMonthlyConfirmedPurchasesCount,
);

// ─── Single purchase operations ──────────────────────────────
router
  .route("/:id")
  .get(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    cartPurchaseController.getCartPurchaseById,
  )
  .delete(
    authController.verifyRoles("Admin", "SubAdmin"),
    cartPurchaseController.deletePurchase,
  );

// ─── Status transitions ─────────────────────────────────────
router
  .route("/:id/receive")
  .patch(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    cartPurchaseController.receivePurchase,
  );

router
  .route("/:id/confirm")
  .patch(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    cartPurchaseController.confirmCartPurchase,
  );

router
  .route("/:id/return")
  .patch(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    cartPurchaseController.returnCartPurchase,
  );

// ─── Admin notes ─────────────────────────────────────────────
router
  .route("/:id/admin-note")
  .patch(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    cartPurchaseController.addAdminNote,
  );

// ─── Item-level deletion ─────────────────────────────────────
router
  .route("/:purchaseId/items/:itemId")
  .delete(
    authController.verifyRoles("Admin", "SubAdmin"),
    cartPurchaseController.deleteItemFromPurchase,
  );

module.exports = router;
