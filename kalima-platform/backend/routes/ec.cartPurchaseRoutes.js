const express = require('express');
const cartPurchaseController = require('../controllers/ec.cartPurchaseController');
const verifyJWT = require('../middleware/verifyJWT');
const { uploadPaymentScreenshotToDisk } = require("../utils/upload files/uploadFiles");
const authController = require('./../controllers/authController');

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// User routes
router.route('/')
    .post(uploadPaymentScreenshotToDisk, cartPurchaseController.createCartPurchase)
    .get(cartPurchaseController.getCartPurchases);

// Admin/Staff routes
router.route('/admin/all')
    .get(
        authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
        cartPurchaseController.getAllPurchases
    );

router.route('/admin/statistics')
    .get(
        authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
        cartPurchaseController.getPurchaseStatistics
    );

router.route('/:id')
    .get(cartPurchaseController.getCartPurchaseById);

router.route('/:id/confirm')
    .patch(
        authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
        cartPurchaseController.confirmCartPurchase
    );

router.route('/:id/admin-note')
    .patch(
        authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
        cartPurchaseController.addAdminNote
    );


router.route('/:id')
    .delete(
        authController.verifyRoles("Admin", "SubAdmin"),
        cartPurchaseController.deletePurchase
    );

module.exports = router;