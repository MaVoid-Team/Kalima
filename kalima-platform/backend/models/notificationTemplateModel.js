// DOMAIN: SHARED
// STATUS: LEGACY
// NOTE: Shared notification template model.
const mongoose = require("mongoose");

const notificationTemplateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "new_subject",
        "new_lecture",
        "new_container",
        "new_homework",
        "new_attachment",
        "new_exam",
        "new_homework_assignment",
        "lecture_updated",
        "store_purchase",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "NotificationTemplate",
  notificationTemplateSchema,
);
