const express = require("express");
const router = express.Router();
const registerController = require("../controllers/registerController.js");
const validateUser = require("../middleware/validateUser.js");

router.route("/").post(validateUser, registerController.registerNewUser);

module.exports = router;
