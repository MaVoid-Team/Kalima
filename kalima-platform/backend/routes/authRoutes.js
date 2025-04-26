const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const loginLimiter = require("../middleware/loginLimiter.js");
const verifyJWT = require("../middleware/verifyJWT");

router.route("/").post(loginLimiter, authController.login);
router.route("/refresh").get(authController.refresh);
router.route("/logout").post(verifyJWT, authController.logout);

module.exports = router;
