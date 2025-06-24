const multer = require("multer");
const AppError = require("../appError");
const path = require("path");
const fs = require("fs");

// Ensure upload folders exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Allowed types
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];
const allowedDocTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ...allowedImageTypes,
];
const allowedCSVTypes = [
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// Dynamic destination for different file types
const dynamicDestination = function (req, file, cb) {
  let dest;
  if (file.fieldname === "profilePic") dest = "uploads/profile_pics/";
  else if (file.fieldname === "thumbnail") dest = "uploads/product_thumbnails/";
  else if (file.fieldname === "gallery") dest = "uploads/product_gallery/";
  else if (file.fieldname === "sample") dest = "uploads/docs/";
  else if (file.fieldname === "paymentScreenShot") dest = "uploads/payment_screenshots/";
  else dest = "uploads/other/";
  ensureDir(dest);
  cb(null, dest);
};

// 1. Single image upload (thumbnail only)
const uploadSingleImageToDisk = multer({
  storage: multer.diskStorage({
    destination: dynamicDestination,
    filename: function (req, file, cb) {
      const ext = file.mimetype.split("/")[1];
      cb(null, `${Date.now()}-thumbnail.${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
    else cb(new AppError("Invalid image type", 400), false);
  },
  limits: { fileSize: 3 * 1024 * 1024 },
}).single("thumbnail");

// Dedicated profile picture upload (field: profilePic)
const uploadProfilePicToDisk = multer({
  storage: multer.diskStorage({
    destination: dynamicDestination,
    filename: function (req, file, cb) {
      const ext = file.mimetype.split("/")[1];
      cb(null, `${Date.now()}-profilePic.${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
    else cb(new AppError("Invalid image type for profile picture", 400), false);
  },
  limits: { fileSize: 3 * 1024 * 1024 },
}).single("profilePic");

// 2. Multiple images upload (product gallery)
const uploadMultipleImagesToDisk = multer({
  storage: multer.diskStorage({
    destination: dynamicDestination,
    filename: function (req, file, cb) {
      const ext = file.mimetype.split("/")[1];
      cb(
        null,
        `${Date.now()}-${file.fieldname}-${Math.random().toString(36).substring(2, 8)}.${ext}`
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
    else cb(new AppError("Invalid image type", 400), false);
  },
  limits: { fileSize: 3 * 1024 * 1024 },
}).array("gallery", 3);

// 3. Single document upload (PDF, DOC, DOCX, image)
const uploadSingleDocToDisk = multer({
  storage: multer.diskStorage({
    destination: dynamicDestination,
    filename: function (req, file, cb) {
      const ext = file.mimetype.split("/")[1] || "bin";
      cb(null, `${Date.now()}-${file.fieldname}.${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (allowedDocTypes.includes(file.mimetype)) cb(null, true);
    else cb(new AppError("Invalid document type", 400), false);
  },
  limits: { fileSize: 75 * 1024 * 1024 },
}).single("sample");

// 4. General file upload (CSV/Excel)
const uploadFileToDisk = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dest = "uploads/csv_excel/";
      ensureDir(dest);
      cb(null, dest);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname) || "";
      cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (allowedCSVTypes.includes(file.mimetype)) cb(null, true);
    else cb(new AppError("Invalid file type. Please upload a CSV or Excel document", 400), false);
  },
  limits: { fileSize: 75 * 1024 * 1024 },
}).single("file");

// 5. Payment screenshot upload (image)
const uploadPaymentScreenshotToDisk = multer({
  storage: multer.diskStorage({
    destination: dynamicDestination,
    filename: function (req, file, cb) {
      const ext = file.mimetype.split("/")[1];
      cb(null, `${Date.now()}-paymentScreenShot.${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
    else cb(new AppError("Invalid file type for payment screenshot", 400), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("paymentScreenShot");

// 6. Product files upload (thumbnail image + sample PDF)
const uploadProductFilesToDisk = multer({
  storage: multer.diskStorage({
    destination: dynamicDestination,
    filename: function (req, file, cb) {
      const ext = file.mimetype.split("/")[1] || "bin";
      cb(null, `${Date.now()}-${file.fieldname}.${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      (file.fieldname === "thumbnail" && allowedImageTypes.includes(file.mimetype)) ||
      (file.fieldname === "sample" && file.mimetype === "application/pdf") ||
      (file.fieldname === "gallery" && allowedImageTypes.includes(file.mimetype))
    ) {
      cb(null, true);
    } else {
      cb(new AppError("Invalid file type for field: " + file.fieldname, 400), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "sample", maxCount: 1 },
  { name: "gallery", maxCount: 5 }
]);

module.exports = {
  uploadSingleImageToDisk,
  uploadProfilePicToDisk,
  uploadMultipleImagesToDisk,
  uploadSingleDocToDisk,
  uploadFileToDisk,
  uploadPaymentScreenshotToDisk,
  uploadProductFilesToDisk,
};
