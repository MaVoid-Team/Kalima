const express = require("express");
const assistantController = require("../controllers/assistantController");
const authController = require("../controllers/authController");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

router.use(verifyJWT, authController.verifyRoles("admin", "subadmin", "moderator"));

router
    .route("/")
    .get(assistantController.getAllAssistants)
    .post(assistantController.createAssistant);

router
    .route("/:id")
    .get(assistantController.getAssistantById)
    .patch(assistantController.updateAssistant)
    .delete(assistantController.deleteAssistant);

module.exports = router;