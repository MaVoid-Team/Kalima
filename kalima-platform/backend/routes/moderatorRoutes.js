const express = require("express");
const moderatorController = require("../controllers/moderatorController");
const verifyJWT = require("../middleware/verifyJWT");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(verifyJWT);

router
    .route("/")
    .post(authController.verifyRoles("Admin", "SubAdmin", "Moderator"), moderatorController.createModerator)
    .get(authController.verifyRoles("Admin", "SubAdmin", "Moderator"), moderatorController.getAllModerators);

router
    .route("/:id")
    .get(moderatorController.getModeratorById)
    .patch(authController.verifyRoles("Admin", "SubAdmin", "Moderator"), moderatorController.updateModerator)
    .delete(authController.verifyRoles("Admin", "SubAdmin"), moderatorController.deleteModerator);

module.exports = router;