const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validateUser = require("../middleware/validateUser");
const verifyJWT = require("../middleware/verifyJWT");
const uploadFileMiddleware =
  require("../utils/upload files/uploadFiles").uploadFileMiddleware;
const authController = require("../controllers/authController");
// Routes that don't require authentication
router
  .route("/")
  .get(userController.getAllUsers)
  .post(validateUser, userController.createUser);

router
  .route("/:userId")
  .get(userController.getUser)
  .patch(
    validateUser,
    verifyJWT,
    authController.verifyRoles("Admin", "SubAdmin"),
    userController.updateUser
  )
  .delete(
    verifyJWT,
    authController.verifyRoles("Admin", "SubAdmin"),
    userController.deleteUser
  );

router.route("/role/:role").get(userController.getAllUsersByRole);

router
  .route("/update/password")
  .patch(verifyJWT, userController.changePassword);
router
  .route("/accounts/bulk-create")
  .post(uploadFileMiddleware, userController.uploadFileForBulkCreation);
// Routes that require authentication
router.use(verifyJWT);

// Get current user's data (for student/parent only)
router.get("/me/dashboard", userController.getMyData);

// Get parent's children data with detailed information
router.get("/me/children", userController.getParentChildrenData);

// Update current user profile information
router.patch("/me/update", userController.updateMe);

router.route("/update/password").patch(userController.changePassword);

// Confirm a teacher (admin/subadmin/moderator only)
router.patch(
  "/teachers/:id/confirm",
  verifyJWT,
  authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
  userController.confirmTeacher
);

module.exports = router;
