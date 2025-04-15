const express = require("express");
const lecturerController = require("../controllers/lecturerController"); // Adjust path if necessary

const router = express.Router();

router
  .route("/")
  .get(lecturerController.getAllLecturers)
  .post(lecturerController.createLecturer);

router
  .route("/:id")
  .get(lecturerController.getLecturerById)
  .patch(lecturerController.updateLecturer)
  .delete(lecturerController.deleteLecturer);

module.exports = router;
