const express = require("express");
const containerController = require("../controllers/containerController");
const authController = require("../controllers/authController.js");
const router = express.Router();
// Get accessible child containers for a student by container ID.
router.get(
  "/student/:studentId/container/:containerId/purchase/:purchaseId",
  containerController.getAccessibleChildContainers
);

router
  .route("/")
  .get(
    authController.verifyRoles(
      "Admin",
      "Sub-Admin",
      "Mods",
      "Lecturers",
      "assistant",
      "Student",
      "Parent"
    ),
    containerController.getAllContainers
  )
  .post(
    authController.verifyRoles("Admin", "Sub-Admin", "Mods", "Lecturers"),
    containerController.createContainer
  );

router.patch(
  "/update-child",
  authController.verifyRoles("Admin", "Sub-Admin", "Mods", "Lecturers"),
  containerController.UpdateChildOfContainer
);
// Get container details by its ID.
router
  .route("/:containerId")
  .get(
    authController.verifyRoles(
      "Admin",
      "Sub-Admin",
      "Mods",
      "Lecturers",
      "assistant",
      "Student",
      "Parent"
    ),
    containerController.getContainerById
  )
  .patch(
    authController.verifyRoles(
      "Admin",
      "Sub-Admin",
      "Mods",
      "Lecturers",
      "assistant"
    ),
    containerController.updateContainer
  )
  .delete(
    authController.verifyRoles(
      "Admin",
      "Sub-Admin",
      "Mods",
      "Lecturers",
      "assistant"
    ),
    containerController.deleteContainerAndChildren
  );

module.exports = router;
