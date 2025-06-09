const multer = require("multer");
const AppError = require("../appError");

const multerStorage = multer.memoryStorage();

const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max for any file
    fileFilter: (req, file, cb) => {
        const allowedImageTypes = [
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"
        ];
        if (file.fieldname === "thumbnail" && allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else if (file.fieldname === "sample" && file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new AppError("Invalid file type for field: " + file.fieldname, 400), false);
        }
    }
});

const uploadProductFilesMiddleware = upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "sample", maxCount: 1 }
]);

module.exports = { uploadProductFilesMiddleware };
