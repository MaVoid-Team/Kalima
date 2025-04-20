const express = require("express");
const levelController = require("../controllers/levelController");
const verifyJWT = require("../middleware/verifyJWT");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(verifyJWT, authController.verifyRoles("admin", "subadmin", "moderator", "lecturer"));

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