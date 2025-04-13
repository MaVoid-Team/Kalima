const express = require("express");
const packageController = require("../controllers/packageController");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const authController = require("../controllers/authController");

// Apply JWT verification middleware to all routes
router.use(verifyJWT);

router
  .route("/")
  .get(packageController.getAllPackages)
  .post(authController.verifyRoles("Admin", "SubAdmin"), packageController.createPackage);

router.patch("/:id/points", authController.verifyRoles("Admin", "SubAdmin"), packageController.managePackagePoints);
router
  .route("/:id")
  .get(packageController.getPackageById)
  .patch(authController.verifyRoles("Admin", "SubAdmin"), packageController.updatePackage)
  .delete(authController.verifyRoles("Admin", "SubAdmin"), packageController.deletePackage);

module.exports = router;
