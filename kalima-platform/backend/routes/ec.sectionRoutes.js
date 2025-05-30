const express = require("express");
const ecSectionController = require("../controllers/ec.sectionController");
const verifyJWT = require("../middleware/verifyJWT");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/").get(ecSectionController.getAllSections).post(
  // verifyJWT,
  // authController.verifyRoles("Admin", "SubAdmin"),
  ecSectionController.createSection
);

router
  .route("/:id")
  .get(ecSectionController.getSectionById)
  .patch(
    // verifyJWT,
    // authController.verifyRoles("Admin", "SubAdmin"),
    ecSectionController.updateSection
  )
  .delete(
    // verifyJWT,
    // authController.verifyRoles("Admin", "SubAdmin"),
    ecSectionController.deleteSection
  );

module.exports = router;
