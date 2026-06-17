import { Router } from "express";
import { sitesController } from "../../controllers/sites.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/client";
import { makeExportHandler } from "../../export";

const router = Router();
const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin, role_enum.Moderator]),
];
const adminOnlyAuth = [authenticateToken, requireRole([role_enum.Admin])];

// PUBLIC
router.get("/export", ...adminAuth, makeExportHandler("sites"));
router.get("/", sitesController.getAllSites);
router.get("/:id", sitesController.getSiteById);

// ADMIN / SUBADMIN
router.post("/", ...adminAuth, sitesController.createSite);
router.patch("/:id", ...adminAuth, sitesController.updateSite);

// ADMIN only
router.delete("/:id", ...adminOnlyAuth, sitesController.deleteSite);

export default router;
