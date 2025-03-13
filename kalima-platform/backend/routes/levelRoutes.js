const express = require("express");
const levelController = require("../controllers/levelController");

const router = express.Router();

router
  .route("/")
  .post(levelController.createLevel)
  .get(levelController.getAllLevels);

router
  .route("/:id")
  .get(levelController.getLevelById)
  .patch(levelController.updateLevelById)
  .delete(levelController.deleteLevelById);

module.exports = router;
