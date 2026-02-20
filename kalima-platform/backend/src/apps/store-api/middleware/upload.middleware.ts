import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { BadRequestError } from "../../../libs/errors";

// ============================================
// ALLOWED MIME TYPES
// ============================================

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

// ============================================
// FILE FILTER — images only
// ============================================

function imageFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file type: ${file.mimetype}. Allowed: jpeg, png, webp, gif, svg, avif`,
      ),
    );
  }
}

// ============================================
// MEMORY STORAGE (buffer only — no disk write)
// ============================================

const memoryStorage = multer.memoryStorage();

// ============================================
// FACTORY — creates a multer instance with a given size limit
// ============================================

function createImageUpload(maxSizeMB: number) {
  return multer({
    storage: memoryStorage,
    fileFilter: imageFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });
}

// ============================================
// PRE-CONFIGURED UPLOAD MIDDLEWARES
// ============================================

/** Single image — 5 MB (product thumbnail, payment method, etc.) */
export const uploadSingleImage = (fieldName: string) =>
  createImageUpload(5).single(fieldName);

/** Multiple images — 5 MB each (product gallery) */
export const uploadMultipleImages = (fieldName: string, maxCount: number) =>
  createImageUpload(5).array(fieldName, maxCount);

/** Single image — 3 MB (profile picture) */
export const uploadProfilePic = (fieldName: string) =>
  createImageUpload(3).single(fieldName);

/** Custom size — for special use cases */
export const uploadImageWithLimit = (fieldName: string, maxSizeMB: number) =>
  createImageUpload(maxSizeMB).single(fieldName);
