const express = require("express");
const levelController = require("../controllers/levelController");
const verifyJWT = require("../middleware/verifyJWT");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(levelController.getAllLevels)
  .post(
    verifyJWT,
    authController.verifyRoles("Admin", "SubAdmin"),
    levelController.createLevel
  );

router
  .route("/:id")
  .get(levelController.getLevelById)
  .patch(levelController.updateLevelById)
  .delete(levelController.deleteLevelById);

module.exports = router;
