// The controller is made with Local storage in mind.
// Both 'Storage' constant and FileSystem operations should be changed in production.

const mongoose = require("mongoose");
const Attachment = require("../models/attachmentModel");
const Container = require("../models/containerModel");
const Lecture = require("../models/LectureModel");
const multer = require("multer");
const fs = require("fs").promises;
const path = require('path')
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");


// You can configure store option here
// Would be change once we have established cloud storate

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

// Still Considering that one
// function fileFilter (req, file, cb) {}

exports.upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // Specify the file size limit
})

exports.getLectureAttachment = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params;
  const lecture = await Lecture.findById(lectureId);
  if (!lecture) {
    throw new AppError(`Lecture not found`, 404);
  }
  res.status(201).json({ attachments: lecture.attachments })

})

exports.getAttachmentFile = catchAsync(async (req, res, next) => {
  const { attachmentId } = req.params;

  if (!mongoose.isValidObjectId(attachmentId)) {
    throw new AppError(`Invalid Schema ID`, 404);
  }

  const attachment = await Attachment.findById(attachmentId)
  if (!attachment) {
    throw new AppError(`Attachment not found`, 404);
  }

  // Get absloute path.
  const filePath = path.resolve(attachment.filePath);

  try {
    console.log(filePath)
    await fs.access(filePath);
  } catch (error) {
    throw new AppError(`Couldn't find the file on the server`, 404);
  }


  res.setHeader("Content-Type", attachment.fileType);
  res.setHeader("Content-Disposition", `attachment; filename="${attachment.fileName}"`);

  res.sendFile(filePath, (err) => {
    if (err) {
      throw new AppError(`Error sending file.`, 500);
    }
  });

})
exports.createAttachment = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params;
  const { type } = req.body;
  const validTypes = ["booklets", 'pdfsandimages', 'homeworks', 'exams']

  if (!mongoose.isValidObjectId(lectureId)) {
    await fs.unlink(req.file.path);
    throw new AppError(`Invalid Schema ID`, 404);
  }

  const lecture = await Lecture.findById(lectureId);

  if (!lecture) {
    await fs.unlink(req.file.path);
    throw new AppError(`Lecture not found`, 404);
  }

  if (!req.file) {
    await fs.unlink(req.file.path);
    throw new AppError(`No file uploaded`, 404);
  }
  if (!type) {
    await fs.unlink(req.file.path);
    throw new AppError(`No file type specified`, 404);
  }
  if (!validTypes.includes(type.toLowerCase())) {
    await fs.unlink(req.file.path);
    throw new AppError(`Invalid file type`, 404);
  }

  const attachment = new Attachment({
    lectureId: lectureId,
    type: type,
    fileType: req.file.mimetype,
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileSize: req.file.size,
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
      await fs.unlink(req.file.path);
      throw new AppError(`Invalid file type`, 404);
  }

  await lecture.save();
  res.status(201).json({ message: 'Attachment uploaded successfully' })

})
