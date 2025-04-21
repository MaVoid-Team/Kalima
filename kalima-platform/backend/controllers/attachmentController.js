const mongoose = require("mongoose");
const Container = require("../models/containerModel");
const Lecture = require("../models/LectureModel");
const Attachment = require("../models/attachmentModel");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const configureCloudinary = require("../config/cloudinaryOptions");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// You can configure storage options here
// Would be changed once we have established cloud storage

configureCloudinary();
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "attachments",
  },
});

// Still Considering that one
// function fileFilter (req, file, cb) {}

(exports.upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Specify the file size limit
})),
  (exports.getLectureAttachments = catchAsync(async (req, res, next) => {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId)
      .populate("attachments.booklets")
      .populate("attachments.pdfsandimages")
      .populate("attachments.homeworks")
      .populate("attachments.exams")
      .lean();

    if (!lecture) {
      throw new AppError(`Lecture not found`, 404);
    }
    res.status(201).json(lecture.attachments);
  }));

exports.getAttachment = catchAsync(async (req, res, next) => {
  const { attachmentId } = req.params;
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) {
    throw new AppError(`attachment not found`, 404);
  }
  res.status(201).json({ attachment });
});

exports.getAttachmentFile = catchAsync(async (req, res, next) => {
  const { attachmentId } = req.params;

  if (!mongoose.isValidObjectId(attachmentId)) {
    throw new AppError(`Invalid Schema ID`, 404);
  }

  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) {
    throw new AppError(`Attachment not found`, 404);
  }
  const file = await axios.get(attachment.filePath, {
    responseType: "stream",
  });

  res.setHeader("Content-Type", attachment.fileType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${attachment.fileName}"`,
  );

  file.data.pipe(res);

  file.data.on("error", (err) => {
    console.error("Stream error:", err);
    throw new AppError(`Error streaming file`, 500);
  });
});

exports.deleteAttachment = catchAsync(async (req, res, next) => {
  const { attachmentId } = req.params;

  if (!mongoose.isValidObjectId(attachmentId)) {
    throw new AppError(`Invalid Schema ID`, 404);
  }

  const attachment = await Attachment.findByIdAndDelete(attachmentId).lean();
  if (!attachment) {
    throw new AppError(`Couldn't find attachment`, 404);
  }

  await cloudinary.uploader.destroy(attachment.publicId);

  const lecture = await Lecture.findById(attachment.lectureId);

  switch (attachment.type.toLowerCase()) {
    case "booklets":
      lecture.attachments.booklets.pull(attachment._id);
      break;
    case "pdfsandimages":
      lecture.attachments.pdfsandimages.pull(attachment._id);
      break;
    case "homeworks":
      lecture.attachments.homeworks.pull(attachment._id);
      break;
    case "exams":
      lecture.attachments.exams.pull(attachment._id);
      break;
    default:
      await cloudinary.uploader.destroy(req.file.filename);
      throw new AppError(`Invalid file type`, 404);
  }

  await lecture.save();
  res.status(201).json({ message: "Attachment deleted successfully" });
});

exports.createAttachment = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params;
  const { type } = req.body;
  const validTypes = ["booklets", "pdfsandimages", "homeworks", "exams"];

  if (!mongoose.isValidObjectId(lectureId)) {
    await fs.unlink(req.file.path);
    throw new AppError(`Invalid Schema ID`, 404);
  }

  const lecture = await Lecture.findById(lectureId);

  if (!lecture) {
    await cloudinary.uploader.destroy(req.file.filename);
    throw new AppError(`Lecture not found`, 404);
  }

  if (!req.file) {
    await cloudinary.uploader.destroy(req.file.filename);
    throw new AppError(`No file uploaded`, 404);
  }
  if (!type) {
    await cloudinary.uploader.destroy(req.file.filename);
    throw new AppError(`No file type specified`, 404);
  }
  if (!validTypes.includes(type.toLowerCase())) {
    await cloudinary.uploader.destroy(req.file.filename);
    throw new AppError(`Invalid file type`, 404);
  }

  const attachment = new Attachment({
    lectureId: lectureId,
    type: type,
    fileType: req.file.mimetype,
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileSize: req.file.size,
    publicId: req.file.filename,
    uploadedOn: new Date(),
  });

  const savedAttachment = await attachment.save();

  switch (type.toLowerCase()) {
    case "booklets":
      lecture.attachments.booklets.push(savedAttachment._id);
      break;
    case "pdfsandimages":
      lecture.attachments.pdfsandimages.push(savedAttachment._id);
      break;
    case "homeworks":
      lecture.attachments.homeworks.push(savedAttachment._id);
      break;
    case "exams":
      lecture.attachments.exams.push(savedAttachment._id);
      break;
    default:
      await cloudinary.uploader.destroy(req.file.filename);
      throw new AppError(`Invalid file type`, 404);
  }

  try {
    console.log(lecture)
    await lecture.save();
  } catch (error) {
    await cloudinary.uploader.destroy(req.file.filename);
    return res.status(201).json({ message: "Error creating attachment" });
  }
  res.status(201).json({ message: "Attachment uploaded successfully" });
});
