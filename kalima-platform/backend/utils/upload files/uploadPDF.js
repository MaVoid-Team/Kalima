const multer = require("multer");
const AppError = require("../appError");
const cloudinary = require("cloudinary").v2;

const multerStorage = multer.memoryStorage();

const allowedMimeTypes = ["application/pdf"];

const multerFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError("Invalid file type. Please upload a PDF document", 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

const uploadPDFMiddleware = upload.single("sample");

const uploadPDFToCloudinary = async (file, folder, next) => {
    if (!file || !file.buffer) {
        return next(new AppError("No file buffer found for upload", 400));
    }
    const base64File = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64File, {
        folder,
        resource_type: "raw",
    });
    return result.secure_url;
};

module.exports = { uploadPDFToCloudinary, uploadPDFMiddleware };
