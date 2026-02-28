import { Router } from "express";
import { sampleController } from "../../controllers/sample.controller";
import { makeExportHandler } from "../../export";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/client";

const router = Router();

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin]),
];

// ============================================
// PUBLIC — no auth required
// ============================================

router.get("/export", ...adminAuth, makeExportHandler("samples"));
router.get("/", sampleController.getAllSamples);
router.get("/:id", sampleController.getSampleById);

export default router;
