const multer = require("multer");
const AppError = require("../appError");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// ===== Ensure upload folders exist =====
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ===== Allowed types =====
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];

// ===== Compress image helper =====
const compressImage = async (buffer, quality = 80) => {
  try {
    return await sharp(buffer)
      .withMetadata()
      .toFormat("webp", { quality })
      .toBuffer();
  } catch (error) {
    console.error("Image compression error:", error);
    throw new AppError("Failed to compress image", 500);
  }
};

// ===== Resize and compress image helper =====
const resizeAndCompressImage = async (buffer, width, height, quality = 80) => {
  try {
    return await sharp(buffer)
      .resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .withMetadata()
      .toFormat("webp", { quality })
      .toBuffer();
  } catch (error) {
    console.error("Image resize/compress error:", error);
    throw new AppError("Failed to process image", 500);
  }
};
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

// ===== Dynamic destination =====
const dynamicDestination = function (req, file, cb) {
  let dest;
  if (file.fieldname === "profilePic") dest = "uploads/profile_pics/";
  else if (file.fieldname === "thumbnail") dest = "uploads/product_thumbnails/";
  else if (file.fieldname === "gallery") dest = "uploads/product_gallery/";
  else if (file.fieldname === "sample") dest = "uploads/docs/";
  else if (file.fieldname === "paymentScreenShot") dest = "uploads/payment_screenshots/";
  else if (file.fieldname === "watermark") dest = "uploads/watermarks/";
  else if (file.fieldname === "paymentMethodImg") dest = "uploads/payment_methods/";
  else dest = "uploads/other/";
  ensureDir(dest);
  cb(null, dest);
};

// ===== Cleanup wrapper =====
const withCleanup = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) return next(err);

      const oldSend = res.send;
      res.send = function (body) {
        if (res.statusCode >= 400) {
          const deleteFile = (filePath) => {
            if (filePath && fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
                console.log("Deleted file after failed request:", filePath);
              } catch (unlinkErr) {
                console.error("Failed to delete uploaded file:", unlinkErr);
              }
            }
          };

          if (req.file) deleteFile(req.file.path);
          if (req.files) {
            if (Array.isArray(req.files)) {
              req.files.forEach((f) => deleteFile(f.path));
            } else {
              Object.values(req.files).flat().forEach((f) => deleteFile(f.path));
            }
          }
        }
        return oldSend.call(this, body);
      };

      next();
    });
  };
};

// ===== Combined compression and cleanup wrapper =====
const withCompressionAndCleanup = (multerMiddleware, compressOptions = {}) => {
  const { quality = 80, resize = null, fieldsToCompress = [] } = compressOptions;

  return (req, res, next) => {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);

      try {
        // Compress single file and save to disk
        if (req.file && req.file.buffer) {
          const shouldCompress = fieldsToCompress.length === 0 || fieldsToCompress.includes(req.file.fieldname);

          if (shouldCompress) {
            console.log("📸 Starting compression for:", req.file.fieldname, "Original size:", req.file.buffer.length, "bytes");

            const compressed = resize
              ? await resizeAndCompressImage(req.file.buffer, resize.width, resize.height, quality)
              : await compressImage(req.file.buffer, quality);

            // Determine destination folder
            let dest = "uploads/other/";
            if (req.file.fieldname === "profilePic") dest = "uploads/profile_pics/";
            else if (req.file.fieldname === "thumbnail") dest = "uploads/product_thumbnails/";
            else if (req.file.fieldname === "gallery") dest = "uploads/product_gallery/";
            else if (req.file.fieldname === "sample") dest = "uploads/docs/";
            else if (req.file.fieldname === "paymentScreenShot") dest = "uploads/payment_screenshots/";
            else if (req.file.fieldname === "watermark") dest = "uploads/watermarks/";
            else if (req.file.fieldname === "paymentMethodImg") dest = "uploads/payment_methods/";

            ensureDir(dest);
            const filename = `${Date.now()}-${req.file.fieldname}.webp`;
            const filepath = path.join(dest, filename);

            fs.writeFileSync(filepath, compressed);
            req.file.path = filepath;
            req.file.filename = filename;

            const compressionRatio = ((1 - compressed.length / req.file.buffer.length) * 100).toFixed(2);
            console.log("✓ Compressed image saved:", filepath);
            console.log("   Original size:", req.file.buffer.length, "bytes");
            console.log("   Compressed size:", compressed.length, "bytes");
            console.log("   Compression ratio:", compressionRatio + "%");
          }
        }

        // Compress multiple files and save to disk (for .fields())
        if (req.files) {
          for (const fieldName in req.files) {
            const shouldCompress = fieldsToCompress.length === 0 || fieldsToCompress.includes(fieldName);

            for (let i = 0; i < req.files[fieldName].length; i++) {
              const file = req.files[fieldName][i];

              if (shouldCompress && file.buffer) {
                console.log("📸 Starting compression for:", fieldName, "Original size:", file.buffer.length, "bytes");

                const compressed = resize
                  ? await resizeAndCompressImage(file.buffer, resize.width, resize.height, quality)
                  : await compressImage(file.buffer, quality);

                // Determine destination folder
                let dest = "uploads/other/";
                if (fieldName === "profilePic") dest = "uploads/profile_pics/";
                else if (fieldName === "thumbnail") dest = "uploads/product_thumbnails/";
                else if (fieldName === "gallery") dest = "uploads/product_gallery/";
                else if (fieldName === "sample") dest = "uploads/docs/";
                else if (fieldName === "paymentScreenShot") dest = "uploads/payment_screenshots/";
                else if (fieldName === "watermark") dest = "uploads/watermarks/";
                else if (fieldName === "paymentMethodImg") dest = "uploads/payment_methods/";

                ensureDir(dest);
                const filename = `${Date.now()}-${fieldName}.webp`;
                const filepath = path.join(dest, filename);

                fs.writeFileSync(filepath, compressed);
                file.path = filepath;
                file.filename = filename;

                const compressionRatio = ((1 - compressed.length / file.buffer.length) * 100).toFixed(2);
                console.log("✓ Compressed image saved:", filepath);
                console.log("   Original size:", file.buffer.length, "bytes");
                console.log("   Compressed size:", compressed.length, "bytes");
                console.log("   Compression ratio:", compressionRatio + "%");
              }
            }
          }
        }

        const oldSend = res.send;
        res.send = function (body) {
          if (res.statusCode >= 400) {
            const deleteFile = (filePath) => {
              if (filePath && fs.existsSync(filePath)) {
                try {
                  fs.unlinkSync(filePath);
                  console.log("Deleted file after failed request:", filePath);
                } catch (unlinkErr) {
                  console.error("Failed to delete uploaded file:", unlinkErr);
                }
              }
            };

            if (req.file) deleteFile(req.file.path);
            if (req.files) {
              if (Array.isArray(req.files)) {
                req.files.forEach((f) => deleteFile(f.path));
              } else {
                Object.values(req.files).flat().forEach((f) => deleteFile(f.path));
              }
            }
          }
          return oldSend.call(this, body);
        };

        next();
      } catch (compressionError) {
        console.error("✗ Compression error:", compressionError);
        next(compressionError);
      }
    });
  };
};

// ===== Uploaders with compression and cleanup =====
const uploadSingleImageToDisk = withCleanup(
  multer({
    storage: multer.diskStorage({
      destination: dynamicDestination,
      filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${Date.now()}-thumbnail.${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
      else cb(new AppError("Invalid image type", 400), false);
    },
    limits: { fileSize: 3 * 1024 * 1024 },
  }).single("thumbnail")
);

const uploadProfilePicToDisk = withCleanup(
  multer({
    storage: multer.diskStorage({
      destination: dynamicDestination,
      filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${Date.now()}-profilePic.${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
      else cb(new AppError("Invalid image type for profile picture", 400), false);
    },
    limits: { fileSize: 3 * 1024 * 1024 },
  }).single("profilePic")
);

const uploadMultipleImagesToDisk = withCleanup(
  multer({
    storage: multer.diskStorage({
      destination: dynamicDestination,
      filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${Date.now()}-${file.fieldname}-${Math.random().toString(36).substring(2, 8)}.${ext}`);
      },

    }),
    fileFilter: (req, file, cb) => {
      if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
      else cb(new AppError("Invalid image type", 400), false);
    },
    limits: { fileSize: 3 * 1024 * 1024 },
  }).array("gallery", 5)
);

const uploadSingleDocToDisk = withCleanup(
  multer({
    storage: multer.diskStorage({
      destination: dynamicDestination,
      filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1] || "bin";
        cb(null, `${Date.now()}-${file.fieldname}.${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (allowedDocTypes.includes(file.mimetype)) cb(null, true);
      else cb(new AppError("Invalid document type", 400), false);
    },
    limits: { fileSize: 75 * 1024 * 1024 },
  }).single("sample")
);

const uploadFileToDisk = withCleanup(
  multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const dest = "uploads/csv_excel/";
        ensureDir(dest);
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || "";
        cb(null, `${Date.now()}-${file.fieldname}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (allowedCSVTypes.includes(file.mimetype)) cb(null, true);
      else cb(new AppError("Invalid file type. Please upload a CSV or Excel document", 400), false);
    },
    limits: { fileSize: 75 * 1024 * 1024 },
  }).single("file")
);

const uploadPaymentScreenshotToDisk = withCompressionAndCleanup(
  multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
      else cb(new AppError("Invalid file type for payment screenshot", 400), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }).single("paymentScreenShot"),
  { quality: 75 }
);

const uplaodwatermarkToDisk = withCleanup(
  multer({
    storage: multer.diskStorage({
      destination: dynamicDestination,
      filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${Date.now()}-watermark.${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
      else cb(new AppError("Invalid file type for watermark", 400), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }).single("watermark")
);

const uploadCartPurchaseFiles = withCompressionAndCleanup(
  multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError(`Invalid file type for ${file.fieldname}`, 400), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }).fields([
    { name: "paymentScreenShot", maxCount: 1 },
    { name: "watermark", maxCount: 1 },
  ]),
  { quality: 1, fieldsToCompress: ["paymentScreenShot"] }
);

const uploadProductFilesToDisk = withCleanup(
  multer({
    storage: multer.diskStorage({
      destination: dynamicDestination,
      filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${file.originalname}`);
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
    limits: { fileSize: 150 * 1024 * 1024 },
  }).fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "sample", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ])
);

const uploadPaymentMethodImgToDisk = withCleanup(
  multer({
    storage: multer.diskStorage({
      destination: dynamicDestination,
      filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `${Date.now()}-paymentMethod.${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (allowedImageTypes.includes(file.mimetype)) cb(null, true);
      else cb(new AppError("Invalid file type for payment method", 400), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }).single("paymentMethodImg")
);

module.exports = {
  uploadSingleImageToDisk,
  uploadProfilePicToDisk,
  uploadMultipleImagesToDisk,
  uploadSingleDocToDisk,
  uploadFileToDisk,
  uploadPaymentScreenshotToDisk,
  uploadProductFilesToDisk,
  uplaodwatermarkToDisk,
  uploadCartPurchaseFiles,
  uploadPaymentMethodImgToDisk
};
