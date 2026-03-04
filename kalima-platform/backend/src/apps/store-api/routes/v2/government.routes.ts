import { Router } from "express";
import { governmentController } from "../../controllers/government.controller";
import { zonesController } from "../../controllers/zones.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/client";
import { makeExportHandler } from "../../export";

const router = Router();

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin]),
];
const adminOnlyAuth = [authenticateToken, requireRole([role_enum.Admin])];

// PUBLIC — read-only
router.get("/export", ...adminAuth, makeExportHandler("governments"));
router.get("/", governmentController.getAllGovernments);
router.get("/:id", governmentController.getGovernmentById);
router.get("/:governmentId/zones", zonesController.getZonesByGovernment);

// ADMIN / SUBADMIN — create / update
router.post("/", ...adminAuth, governmentController.createGovernment);
router.patch("/:id", ...adminAuth, governmentController.updateGovernment);

// ADMIN only — delete
router.delete("/:id", ...adminOnlyAuth, governmentController.deleteGovernment);

export default router;
