const express = require("express");
const studentLectureAccessController = require("../controllers/studentLectureAccessController");

const router = express.Router();

router
  .route("/")
  .get(studentLectureAccessController.getAllStudentLectureAccess)
  .post(studentLectureAccessController.createStudentLectureAccess);

router
  .route("/:id")
  .get(studentLectureAccessController.getStudentLectureAccess)
  .patch(studentLectureAccessController.updateStudentLectureAccess)
  .delete(studentLectureAccessController.deleteStudentLectureAccess);

module.exports = router;
