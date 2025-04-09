const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const codeController = require("../controllers/codeController");
const authController = require("../controllers/authController");

router.use(verifyJWT);

router
  .route("/")
  .get(authController.verifyRoles("Admin"), codeController.getCodes)
  .post(authController.verifyRoles("Admin"), codeController.createCodes)
  .delete(authController.verifyRoles("Admin"), codeController.deleteCodes);

router
  .route("/redeem")
  .post(authController.verifyRoles("Student"), codeController.redeemCode);

module.exports = router;
