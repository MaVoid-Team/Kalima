const express = require("express");
const containerController = require("../controllers/containerController");
const authController = require("../controllers/authController.js");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
// Get accessible child containers for a student by container ID.
router.use(verifyJWT);

router.get(
  "/student/:studentId/container/:containerId/purchase/:purchaseId",
  containerController.getAccessibleChildContainers
);
router
  .route("/")
  .get(authController.verifyRoles(
    "Admin",
    "Sub-Admin",
    "Moderator",
    "Lecturer",
    "Assistant",
    "Student",
    "Parent"),
    containerController.getAllContainers
  )
  .post(
    authController.verifyRoles("Admin", "Sub-Admin", "Moderator", "Lecturer"),
    containerController.createContainer
  );

router.patch(
  "/update-child",
  authController.verifyRoles("Admin", "Sub-Admin", "Moderator", "Lecturers"),
  containerController.UpdateChildOfContainer
);
// Get container details by its ID.
router
  .route("/:containerId")
  .get(
    authController.verifyRoles(
      "Admin",
      "Sub-Admin",
      "Moderator",
      "Lecturer",
      "Assistant",
      "Student",
      "Parent"
    ),
    containerController.getContainerById
  )
  .patch(
    authController.verifyRoles(
      "Admin",
      "Sub-Admin",
      "Moderator",
      "Lecturer",
      "Assistant"
    ),
    containerController.updateContainer
  )
  .delete(
    authController.verifyRoles(
      "Admin",
      "Sub-Admin",
      "Moderator",
      "Lecturer",
    ),
    containerController.deleteContainerAndChildren
  );

module.exports = router;
