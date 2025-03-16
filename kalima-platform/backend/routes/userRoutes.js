const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validateUser = require("../middleware/validateUser")

router.route("/").get(userController.getAllUsers).post(validateUser, userController.createUser)

router.route("/:userId").get(userController.getUser).patch(validateUser, userController.updateUser).delete(userController.deleteUser)

module.exports = router
