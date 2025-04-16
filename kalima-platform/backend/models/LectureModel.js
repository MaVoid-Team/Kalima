const mongoose = require("mongoose");
const Container = require("./containerModel");

const lectureSchema = new mongoose.Schema({
  videoLink: { type: String, required: true },
  examLink: { type: String },
  description: { type: String },
  numberOfViews: { type: Number, default: 3 },
  teacherAllowed: { type: Boolean, required: true },
  lecture_type: { // New field
    type: String,
    enum: ['Free', 'Paid', 'Revision', 'Teachers Only'],
    required: [true, 'A lecture must have a type'],
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
