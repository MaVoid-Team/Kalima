const multer = require("multer");
const AppError = require("../appError");
const cloudinary = require("cloudinary").v2;

const multerStorage = multer.memoryStorage();

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/jpg"
];

const multerFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new AppError(
                "Invalid file type. Please upload an image (jpeg, png, webp, gif, jpg)",
                400
            ),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

const uploadProductImageMiddleware = upload.single("image");

const uploadProductImageToCloudinary = async (file, folder, next) => {
    if (!file || !file.buffer) {
        return next(new AppError("No file buffer found for upload", 400));
    }
    const base64File = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
    )}`;
    const result = await cloudinary.uploader.upload(base64File, {
        folder,
        resource_type: "image",
    });
    return result.secure_url;
};

module.exports = { uploadProductImageToCloudinary, uploadProductImageMiddleware };
