const express = require("express");
const lectureController = require("../controllers/lectureController");
const attachmentController = require("../controllers/attachmentController");

const router = express.Router();

router
  .route("/type/:lectureType")
  .get(lectureController.getLecturesByType);

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
  .route("/attachments/:lectureId")
  .get(attachmentController.getLectureAttachments)
  .post(
    attachmentController.upload.single("attachment"),
    attachmentController.createAttachment,
  );

router
  .route("/attachment/:attachmentId")
  .get(attachmentController.getAttachment)
  .delete(attachmentController.deleteAttachment);

router
  .route("/attachment/:attachmentId/file")
  .get(attachmentController.getAttachmentFile);

router
  .route("/lecturer/:lecturerId")
  .get(lectureController.getLecturerLectures);

router.route("/update-parent").patch(lectureController.UpdateParentOfLecture);

module.exports = router;
