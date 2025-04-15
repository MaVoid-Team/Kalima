const multer = require("multer");
const AppError = require("../appError");
const cloudinary = require("cloudinary").v2;

const multerStorage = multer.memoryStorage();

const allowedMimeTypes = [
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const multerFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Please upload a CSV or Exel document",
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadFileMiddleware = upload.single("file");

const uploadFileToCloudinary = async (file, folder, next) => {
  if (!file || !file.buffer) {
    return next(new AppError("No file buffer found for upload", 400));
  }
  const base64File = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;
  const result = await cloudinary.uploader.upload(base64File, {
    folder,
    resource_type: "auto",
  });

  return result.secure_url;
};



module.exports = { uploadFileToCloudinary, uploadFileMiddleware };
