const express = require("express");
const containerController = require("../controllers/containerController");
const authController = require("../controllers/authController.js");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");

// Apply JWT verification middleware
router.use(verifyJWT);

// Get accessible child containers for a student by container ID
router.get(
  "/student/:studentId/container/:containerId/purchase/:purchaseId",
  containerController.getAccessibleChildContainers
);

// Get containers for a specific teacher
// router.get(
//   "/teacher/:teacherId",
//   containerController.getTeacherContainers
// );

// Get containers for a specific lecturer
router.get(
  "/lecturer/:lecturerId",
  containerController.getLecturerContainers
);

// Create and get containers
router
  .route("/")
  .get(
    authController.verifyRoles(
      "Admin",
      "SubAdmin",
      "Moderator",
      "Lecturer",
      "Assistant",
      "Student",
      "Parent",
      "teacher"
    ),
    containerController.getAllContainers
  )
  .post(
    authController.verifyRoles("Admin", "SubAdmin", "Moderator", "Lecturer", "Assistant"),
    containerController.createContainer
  );

// Update a child container's parent
router.patch(
  "/update-child",
  authController.verifyRoles("Admin", "SubAdmin", "Moderator", "Lecturer", "Assistant"),
  containerController.UpdateChildOfContainer
);

// Operations on a specific container by ID
router
  .route("/:containerId")
  .get(
    authController.verifyRoles(
      "Admin",
      "SubAdmin",
      "Moderator",
      "Lecturer",
      "Assistant",
      "Student",
      "Parent",
      "teacher"
    ),
    containerController.getContainerById
  )
  .patch(
    authController.verifyRoles(
      "Admin",
      "SubAdmin",
      "Moderator",
      "Lecturer",
      "Assistant"
    ),
    containerController.updateContainer
  )
  .delete(
    authController.verifyRoles(
      "Admin",
      "SubAdmin",
      "Moderator",
      "Lecturer"
    ),
    containerController.deleteContainerAndChildren
  );

// Get revenue for a specific container by Id
router
  .get(
    "/:containerId/revenue",
    authController.verifyRoles(
      "Admin",
      "Sub-Admin",
      "Moderator",
      "Lecturer",
      "Assistant",
      "Student",
      "Parent"
    ),
    containerController.getContainerRevenue
  );


module.exports = router;
