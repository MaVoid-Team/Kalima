import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { BadRequestError } from "../../../libs/errors";

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
]);

const HOTSPOT_MEDIA_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
  ...AUDIO_MIME_TYPES,
]);

const storage = multer.memoryStorage();

function documentFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (DOCUMENT_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new BadRequestError(
      `Invalid document type: ${file.mimetype}. Allowed: PDF, DOC, DOCX`,
    ),
  );
}

function coverFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new BadRequestError(
      `Invalid cover image type: ${file.mimetype}. Allowed: jpeg, png, webp, gif, svg, avif`,
    ),
  );
}

function hotspotMediaFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (HOTSPOT_MEDIA_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new BadRequestError(
      `Invalid hotspot media type: ${file.mimetype}. Allowed: image, video, or audio`,
    ),
  );
}

export const uploadEBookletDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 150 * 1024 * 1024 },
}).single("document");

export const uploadEBookletCover = multer({
  storage,
  fileFilter: coverFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("cover");

export const uploadEBookletHotspotMedia = multer({
  storage,
  fileFilter: hotspotMediaFilter,
  limits: { fileSize: 150 * 1024 * 1024 },
}).single("media");

export const uploadEBookletTemplateWizardFiles = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "cover") {
      coverFilter(req, file, cb);
      return;
    }
    if (file.fieldname === "document") {
      documentFilter(req, file, cb);
      return;
    }
    cb(new BadRequestError(`Unexpected e-booklet upload field: ${file.fieldname}`));
  },
  limits: { fileSize: 150 * 1024 * 1024 },
}).fields([
  { name: "cover", maxCount: 1 },
  { name: "document", maxCount: 1 },
]);
