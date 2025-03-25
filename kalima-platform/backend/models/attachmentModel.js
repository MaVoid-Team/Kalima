const mongoose = require('mongoose')

const attachmentSchema = new mongoose.Schema({
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
  type: {
    type: String,
    enum: ["booklets", "pdfsandimages", "homeworks", "exams"],
    required: true,
  },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: String, required: true },
  uploadedOn: { type: Date, default: Date.now },
});

Attachment = mongoose.model('Attachment', attachmentSchema)
module.exports = Attachment
