const express = require("express");
const subjectController = require("../controllers/subjectController");
const authController = require("../controllers/authController");
const verifyJWT = require("../middleware/verifyJWT");
const router = express.Router();

router
  .route("/")
  .post(verifyJWT, authController.verifyRoles("Admin", "SubAdmin", "Moderator"), subjectController.createSubject)
  .get(subjectController.getAllSubjects);

router.route("/:id/level").patch(verifyJWT, authController.verifyRoles("Admin", "SubAdmin", "Moderator"), subjectController.updateLevelOfSubject);
router
  .route("/:id")
  .get(subjectController.getSubjectById)
  .patch(verifyJWT, authController.verifyRoles("Admin", "SubAdmin", "Moderator"), subjectController.updateSubjectById)
  .delete(verifyJWT, authController.verifyRoles("Admin", "SubAdmin"), subjectController.deleteSubjectById);



module.exports = router;
