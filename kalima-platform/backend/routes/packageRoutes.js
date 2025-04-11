const express = require("express");
const packageController = require("../controllers/packageController");
const router = express.Router();

router
  .route("/")
  .get(packageController.getAllPackages)
  .post(packageController.createPackage);

router.patch("/:id/points", packageController.managePackagePoints);
router
  .route("/:id")
  .get(packageController.getPackageById)
  .patch(packageController.updatePackage)
  .delete(packageController.deletePackage);
module.exports = router;
