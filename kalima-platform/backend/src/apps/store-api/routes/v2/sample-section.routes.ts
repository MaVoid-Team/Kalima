import { Router } from "express";
import { sampleSectionController } from "../../controllers/sample-section.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { uploadSampleFiles } from "../../middleware/upload.middleware";
import { role_enum } from "../../generated/prisma/client";

const router = Router();

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin, role_enum.Moderator]),
];

// ============================================
// PUBLIC — no auth required (specific routes first)
// ============================================

router.get("/", sampleSectionController.getAllSections);
router.get("/:sectionId/samples", sampleSectionController.getSamplesBySection);
router.get(
  "/:sectionId/samples/:sampleId/preview",
  sampleSectionController.servePreview,
);
router.get(
  "/:sectionId/samples/:sampleId/download",
  sampleSectionController.serveDownload,
);
router.get(
  "/:sectionId/samples/:sampleId",
  sampleSectionController.getSampleById,
);
router.get("/:id", sampleSectionController.getSectionById);

// ============================================
// ADMIN / SUBADMIN — section CRUD
// ============================================

router.post("/", ...adminAuth, sampleSectionController.createSection);
router.patch("/:id", ...adminAuth, sampleSectionController.updateSection);
router.delete("/:id", ...adminAuth, sampleSectionController.deleteSection);

// ============================================
// ADMIN / SUBADMIN — sample CRUD
// ============================================

router.post(
  "/:sectionId/samples",
  ...adminAuth,
  uploadSampleFiles,
  sampleSectionController.createSample,
);
router.patch(
  "/:sectionId/samples/:sampleId",
  ...adminAuth,
  uploadSampleFiles,
  sampleSectionController.updateSample,
);
router.delete(
  "/:sectionId/samples/:sampleId",
  ...adminAuth,
  sampleSectionController.deleteSample,
);

export default router;
