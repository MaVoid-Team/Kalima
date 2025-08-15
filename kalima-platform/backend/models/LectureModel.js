const mongoose = require("mongoose");
const Container = require("./containerModel");

const lectureSchema = new mongoose.Schema({
  videoLink: { type: String, required: true },
  thumbnail: { type: String, required: true }, // Store local file path for thumbnail
  description: { type: String },
  numberOfViews: { type: Number, default: 3 },
  teacherAllowed: { type: Boolean, required: true },
  lecture_type: {
    type: String,
    enum: ['Free', 'Paid', 'Revision', 'Teachers Only'],
    required: [true, 'A lecture must have a type'],
  }, requiresExam: {
    type: Boolean,
    default: false
  },
  examConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LecturerExamConfig"
  },
  passingThreshold: {
    type: Number,
    min: 0,
    max: 100,
  },
  requiresHomework: {
    type: Boolean,
    default: false
  },
  homeworkConfig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LecturerExamConfig"
  },
  homeworkPassingThreshold: {
    type: Number,
    min: 0,
    max: 100,
  },
  attachments: {
    booklets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
    pdfsandimages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
    homeworks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
  },
});

const Lecture = Container.discriminator("Lecture", lectureSchema);
module.exports = Lecture
