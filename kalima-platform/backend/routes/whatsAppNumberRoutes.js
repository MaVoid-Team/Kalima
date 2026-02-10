// DOMAIN: UNKNOWN
// STATUS: LEGACY
// NOTE: WhatsApp number routes with unclear domain ownership.
const express = require("express");
const whatsAppNumberController = require("../controllers/whatsAppNumberController");
const authController = require("../controllers/authController");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

router
  .route("/")
  .post(
    verifyJWT,
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    whatsAppNumberController.createWhatsAppNumber,
  )
  .get(whatsAppNumberController.getAllWhatsAppNumbers);

router
  .route("/:id")
  .get(whatsAppNumberController.getWhatsAppNumberById)
  .put(
    verifyJWT,
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    whatsAppNumberController.updateWhatsAppNumber,
  )
  .delete(
    verifyJWT,
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    whatsAppNumberController.deleteWhatsAppNumber,
  );

router
  .route("/:id/switch-status")
  .patch(
    verifyJWT,
    authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
    whatsAppNumberController.switchWhatsAppNumberStatus,
  );

module.exports = router;
