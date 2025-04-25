const express = require("express");
const AttachmentController = require("../controllers/attachmentController");

const router = express.Router();

router.route("/").get(AttachmentController.getAllAttachments);

router
  .route("/:attachmentId")
  .get(AttachmentController.getAttachment)
  .delete(AttachmentController.deleteAttachment);

module.exports = router;
