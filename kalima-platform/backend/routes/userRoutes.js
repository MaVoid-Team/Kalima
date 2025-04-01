const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validateUser = require("../middleware/validateUser");
const verifyJWT = require("../middleware/verifyJWT");
const uploadFileMiddleware =
  require("../utils/upload files/uploadFiles").uploadFileMiddleware;

router
  .route("/")
  .get(userController.getAllUsers)
  .post(validateUser, userController.createUser);

router
  .route("/:userId")
  .get(userController.getUser)
  .patch(validateUser, userController.updateUser)
  .delete(userController.deleteUser);

router.route("/role/:role").get(userController.getAllUsersByRole);

router
  .route("/update/password")
  .patch(verifyJWT, userController.changePassword);
router
  .route("/accounts/bulk-create")
  .post(uploadFileMiddleware, userController.uploadFileForBulkCreation);

module.exports = router;
