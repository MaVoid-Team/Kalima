const express = require("express");
const router = express.Router();
const productController = require("../controllers/ec.productController");
const multer = require("multer");
const authController = require("../controllers/authController");
const path = require("path");
const verifyJWT = require("../middleware/verifyJWT");
const { uploadProductFilesMiddleware } = require("../utils/upload files/uploadProductFiles");

// Multer config fortB)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/products/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") cb(null, true);
        else cb(new Error("Only PDF files are allowed!"));
    },
});

// All routes require authentication


router
    .route("/")
    .get(productController.getAllProducts)
    .post(
        verifyJWT,
        authController.verifyRoles("Admin", "SubAdmin"),
        uploadProductFilesMiddleware, // handles both thumbnail and sample
        productController.createProduct
    );

router
    .route("/:id")
    .get(productController.getProductById)
    .patch(
        verifyJWT,
        authController.verifyRoles("Admin", "SubAdmin"),
        uploadProductFilesMiddleware, // handles both thumbnail and sample
        productController.updateProduct
    )
    .delete(
        verifyJWT,
        authController.verifyRoles("Admin", "SubAdmin"),
        productController.deleteProduct);

module.exports = router;
