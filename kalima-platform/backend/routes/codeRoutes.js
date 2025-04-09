const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const codeController = require("../controllers/codeController");
const authController = require("../controllers/authController");

router.use(verifyJWT);

router
  .route("/")
  .post(
    authController.verifyRoles("Admin", "Lecturer", "Assistant"),
    codeController.createCodes
  );

module.exports = router;
