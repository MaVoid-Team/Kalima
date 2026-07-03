import { Router } from "express";
import { sampleSectionController } from "../../controllers/sample-section.controller";
import { makeExportHandler } from "../../export";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/client";

const router = Router();

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin, role_enum.Moderator]),
];

router.get("/export", ...adminAuth, makeExportHandler("samples"));

// ============================================
// PUBLIC — no auth required
// ============================================

router.get("/", sampleSectionController.getAllSamples);
router.get("/:sampleId", sampleSectionController.getSampleById);

export default router;
