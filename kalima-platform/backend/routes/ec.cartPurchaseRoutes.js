const express = require('express');
const cartPurchaseController = require('../controllers/ec.cartPurchaseController');
const verifyJWT = require('../middleware/verifyJWT');
const { uploadCartPurchaseFiles } = require("../utils/upload files/uploadFiles");
const authController = require('./../controllers/authController');

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// User routes
router.route('/')
    .post(uploadCartPurchaseFiles, cartPurchaseController.createCartPurchase)
    .get(cartPurchaseController.getCartPurchases);

// Admin/Staff routes
router.route('/admin/all')
    .get(
        authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
        cartPurchaseController.getAllPurchases
    );

router.route('/admin/statistics')
    .get(
        authController.verifyRoles("Admin"),
        cartPurchaseController.getPurchaseStatistics
    );

router.route('/admin/product-statistics').get(
    authController.verifyRoles("Admin"),
    cartPurchaseController.getProductPurchaseStats
);

router.route('/admin/response-time')
    .get(
        authController.verifyRoles("Admin"),
        cartPurchaseController.getResponseTimeStatistics
    );

router.route('/admin/fullreport')
    .get(
        authController.verifyRoles("Admin"),
        cartPurchaseController.getFullOrdersReport
    );

router.route('/:id')
    .get(authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
        cartPurchaseController.getCartPurchaseById);

router.route('/:id/receive')
    .patch(
        authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
        cartPurchaseController.receivePurchase
    );

router.route('/:id/confirm')
    .patch(
        authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
        cartPurchaseController.confirmCartPurchase
    );

router.route('/:id/return')
    .patch(
        authController.verifyRoles("Admin", "SubAdmin", "Moderator"),
        cartPurchaseController.returnCartPurchase
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