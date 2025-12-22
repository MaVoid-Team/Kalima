const express = require("express");
const lecturerController = require("../controllers/lecturerController");
const authController = require("../controllers/authController");
const convertFormDataToNested = require("../middleware/convertFormDataToNested");

const router = express.Router();

router.use(convertFormDataToNested);

router
    .route("/")
    .get(lecturerController.getAllLecturers)
    .post(lecturerController.uploadLecturerPhoto, lecturerController.createLecturer);

router
    .route("/:id")
    .get(lecturerController.getLecturerById)
    .patch(lecturerController.updateLecturer)
    .delete(lecturerController.deleteLecturer);

module.exports = router;