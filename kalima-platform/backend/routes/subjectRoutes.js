const express = require("express");
const subjectController = require("../controllers/subjectController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(authController.verifyRoles("Admin", "SubAdmin", "Moderator"), subjectController.createSubject)
  .get(subjectController.getAllSubjects);

router.route("/:id/level").patch(authController.verifyRoles("Admin", "SubAdmin", "Moderator"), subjectController.updateLevelOfSubject);
router
  .route("/:id")
  .get(subjectController.getSubjectById)
  .patch(authController.verifyRoles("Admin", "SubAdmin", "Moderator"), subjectController.updateSubjectById)
  .delete(authController.verifyRoles("Admin", "SubAdmin"), subjectController.deleteSubjectById);



module.exports = router;
