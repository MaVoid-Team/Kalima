const express = require("express");
const containerController = require("../controllers/containerController");
const authController = require("../controllers/authController.js");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");


// Get containers for a specific lecturer
router.get(
  "/lecturer/:lecturerId",
  containerController.getLecturerContainers
);
// Get container by ID - works with or without authentication
router.get(
  "/:containerId",
  authController.optionalJWT,  // Apply optional JWT middleware
  containerController.getContainerById
);

// Apply JWT verification middleware to all routes below this line
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

//purchaseCounter for all containers
router.get(
  "/purchase-counts",
  authController.verifyRoles("admin", "subadmin", "moderator"), // Restrict access to specific roles
  containerController.getAllContainerPurchaseCounts
);
//purchaseCounter for a container
router.get(
  "/purchase-counts/:containerId",
  authController.verifyRoles("admin", "subadmin", "moderator"), // Restrict access to specific roles
  containerController.getContainerPurchaseCountById
);

// Add a route to get containers of the currently logged-in lecturer
router.get(
  "/my-containers",
  authController.verifyRoles("Lecturer"),
  containerController.getMyContainers
);

// Create and get containers
router
  .route("/")
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
