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

// Get container details by its ID.
router.get("/:containerId", containerController.getContainerById);

module.exports = router;
