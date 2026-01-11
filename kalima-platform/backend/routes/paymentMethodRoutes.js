const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const paymentMethodController = require("../controllers/paymentMethodController");
const authController = require("../controllers/authController");
const { uploadPaymentMethodImgToDisk } = require("../utils/upload files/uploadFiles");
router.use(verifyJWT);

router
    .route("/")
    .get(paymentMethodController.getAllPaymentMethods)
    .post(
        authController.verifyRoles("Admin"),
        uploadPaymentMethodImgToDisk,
        paymentMethodController.createPaymentMethod
    );

router
    .route("/:id")
    .get(paymentMethodController.getPaymentMethodById)
    .patch(
        authController.verifyRoles("Admin"),
        uploadPaymentMethodImgToDisk,
        paymentMethodController.updatePaymentMethod
    )
    .delete(
        authController.verifyRoles("Admin"),
        paymentMethodController.deletePaymentMethod
    );

router
    .route("/:id/status")
    .patch(
        authController.verifyRoles("Admin"),
        paymentMethodController.changePaymentMethodStatus
    );

module.exports = router;
