const express = require("express");
const moderatorController = require("../controllers/moderatorController");
const authController = require("../controllers/authController");

const router = express.Router();

//router.use(authController.verifyJWT);
//authController.verifyRoles("Admin", "SubAdmin")
router
    .route("/")
    .post(moderatorController.createModerator)
    .get(moderatorController.getAllModerators);

router
    .route("/:id")
    .get(moderatorController.getModeratorById)
    .patch(moderatorController.updateModerator)
    .delete(moderatorController.deleteModerator);

module.exports = router;