const express = require("express");
const subAdminController = require("../controllers/subAdminController");
const authController = require("../controllers/authController");

const router = express.Router();
//authController.verifyRoles("Admin"),
router
    .route("/")
    .post(subAdminController.createSubAdmin)
    .get(subAdminController.getAllSubAdmins);

router
    .route("/:id")
    .get(subAdminController.getSubAdminById)
    .patch(subAdminController.updateSubAdmin)
    .delete(subAdminController.deleteSubAdmin);

module.exports = router;