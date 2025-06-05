const express = require("express");
const router = express.Router();
const ecBookController = require("../controllers/ec.bookController");
const verifyJWT = require("../middleware/verifyJWT");
const { uploadProductFilesMiddleware } = require("../utils/upload files/uploadProductFiles");

// All routes require authentication
router.use(verifyJWT);

router
    .route("/")
    .get(ecBookController.getAllECBooks)
    .post(
        uploadProductFilesMiddleware, // handles both thumbnail and sample
        ecBookController.createECBook
    );

router
    .route("/:id")
    .get(ecBookController.getECBookById)
    .patch(
        uploadProductFilesMiddleware, // handles both thumbnail and sample
        ecBookController.updateECBook
    )
    .delete(ecBookController.deleteECBook);

module.exports = router;