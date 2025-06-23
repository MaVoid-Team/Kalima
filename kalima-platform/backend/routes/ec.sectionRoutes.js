const express = require("express");
const ecSectionController = require("../controllers/ec.sectionController");
const verifyJWT = require("../middleware/verifyJWT");
const authController = require("../controllers/authController");

const router = express.Router();

// Get all sections visible to the current user's role
router.get('/allowed', verifyJWT, ecSectionController.getAllowedSections);
// Get section by ID only if allowed for current user's role
router.get('/allowed/:id', verifyJWT, ecSectionController.getSectionByIdAllowed);

router.route("/").get(ecSectionController.getAllSections).post(
  verifyJWT,
  authController.verifyRoles("Admin", "SubAdmin"),
  ecSectionController.createSection
);

router
  .route("/:id")
  .get(ecSectionController.getSectionById)
  .patch(
    verifyJWT,
    authController.verifyRoles("Admin", "SubAdmin"),
    ecSectionController.updateSection
  )
  .delete(
    verifyJWT,
    authController.verifyRoles("Admin", "SubAdmin"),
    ecSectionController.deleteSection
  );

router.get('/:id/products', ecSectionController.getSectionWithProducts);

module.exports = router;
