const express = require("express");
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protect all routes and restrict access to Admin role
//router.use(authController.verifyJWT, authController.verifyRoles("admin"));


router
    .route("/")
    .post(adminController.createAdmin)
    .get(adminController.getAllAdmins);

router
    .route("/:id")
    .get(adminController.getAdminById)
    .patch(adminController.updateAdmin)
    .delete(adminController.deleteAdmin);

module.exports = router;