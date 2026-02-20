import { Router } from "express";
import { subjectsController } from "../../controllers/subjects.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma";

const router = Router();
const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin]),
];
const adminOnlyAuth = [authenticateToken, requireRole([role_enum.Admin])];

// PUBLIC
router.get("/", subjectsController.getAllSubjects);
router.get("/:id", subjectsController.getSubjectById);

// ADMIN / SUBADMIN
router.post("/", ...adminAuth, subjectsController.createSubject);
router.patch("/:id", ...adminAuth, subjectsController.updateSubject);

// ADMIN only
router.delete("/:id", ...adminOnlyAuth, subjectsController.deleteSubject);

export default router;
