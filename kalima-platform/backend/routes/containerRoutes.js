const express = require("express");
const router = express.Router();
const containerController = require("../controllers/containerController");

// Get accessible child containers for a student by container ID.
router.get(
  "/student/:studentId/container/:containerId/purchase/:purchaseId",
  containerController.getAccessibleChildContainers
);

// Create a new container.
router
  .route("/")
  .get(containerController.getAllContainers)
  .post(containerController.createContainer);
router.patch("/update-child", containerController.UpdateChildOfContainer);
// Get container details by its ID.
router
  .route("/:containerId")
  .get(containerController.getContainerById)
  .patch(containerController.updateContainer)
  .delete(containerController.deleteContainerAndChildren);

module.exports = router;
