const express = require("express");
const lectureController = require("../controllers/lectureController");

const router = express.Router();

router
  .route("/")
  .get(lectureController.getAllLectures)
  .post(lectureController.createLecture);

router
  .route("/:lectureId")
  .get(lectureController.getLectureById)
  .patch(lectureController.updatelectures)
  .delete(lectureController.deletelecture);

router
  .route("/lecturer/:lecturerId")
  .get(lectureController.getLecturerLectures);

router.route("/update-parent").patch(lectureController.UpdateParentOfLecture);

module.exports = router;
