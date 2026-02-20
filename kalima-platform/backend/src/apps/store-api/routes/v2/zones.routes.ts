import { Router } from "express";
import { zonesController } from "../../controllers/zones.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma";

const router = Router();
const adminAuth = [authenticateToken, requireRole([role_enum.Admin, role_enum.SubAdmin])];
const adminOnlyAuth = [authenticateToken, requireRole([role_enum.Admin])];

// PUBLIC
router.get("/", zonesController.getAllZones);
router.get("/:id", zonesController.getZoneById);

// ADMIN / SUBADMIN
router.post("/", ...adminAuth, zonesController.createZone);
router.patch("/:id", ...adminAuth, zonesController.updateZone);

// ADMIN only
router.delete("/:id", ...adminOnlyAuth, zonesController.deleteZone);

export default router;
