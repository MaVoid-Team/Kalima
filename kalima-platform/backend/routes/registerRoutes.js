const multer = require("multer");
const { uploadProfilePicToDisk } = require("../utils/upload files/uploadFiles");
const express = require("express");
const router = express.Router();
const registerController = require("../controllers/registerController.js");
const validateUser = require("../middleware/validateUser.js");
const convertFormDataToNested = require("../middleware/convertFormDataToNested");

router.post("/",
    convertFormDataToNested, // Convert form-data bracket notation to nested objects
    uploadProfilePicToDisk, // handle profilePic upload
    validateUser,
    registerController.registerNewUser
);

module.exports = router;
