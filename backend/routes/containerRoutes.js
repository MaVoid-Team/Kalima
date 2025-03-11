const express = require("express");
const router = express.Router();
const containerController = require("../controllers/containerController");

// Get accessible child containers for a student by container ID.
router.get(
  "/student/:studentId/container/:containerId",
  containerController.getAccessibleChildContainers
);

// Create a new container.
router.post("/", containerController.createContainer);

// Get container details by its ID.
router.get("/:containerId", containerController.getContainerById);

module.exports = router;
