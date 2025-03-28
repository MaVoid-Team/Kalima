const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validateUser = require("../middleware/validateUser")
const verifyJWT = require("../middleware/verifyJWT")

router.route("/").get(userController.getAllUsers).post(validateUser, userController.createUser)

router.route("/:userId").get(userController.getUser).patch(validateUser, userController.updateUser).delete(userController.deleteUser)

router.route("/role/:role").get(userController.getAllUsersByRole)

router.route("/update/password").patch(verifyJWT,userController.changePassword)

module.exports = router
