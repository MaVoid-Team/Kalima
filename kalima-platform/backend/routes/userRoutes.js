const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validateUser = require("../middleware/validateUser")
const verifyJWT = require("../middleware/verifyJWT")

// Routes that don't require authentication
router.route("/").get(userController.getAllUsers).post(validateUser, userController.createUser)

router.route("/:userId").get(userController.getUser).patch(validateUser, userController.updateUser).delete(userController.deleteUser)

router.route("/role/:role").get(userController.getAllUsersByRole)

// Routes that require authentication
router.use(verifyJWT);

// Get current user's data (for student/parent only)
router.get("/me/dashboard", userController.getMyData);

router.route("/update/password").patch(userController.changePassword)

module.exports = router
