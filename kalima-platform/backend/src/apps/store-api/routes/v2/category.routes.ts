import { Router } from "express";
import { categoryController } from "../../controllers/category.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/client";

const router = Router();

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin]),
];

// ============================================
// PUBLIC — read (some endpoints unauthenticated)
// ============================================

// Public / unauthenticated helpers
router.get("/roots", categoryController.getRootCategories);
router.get("/:id/children", categoryController.getChildrenByParent);

// Existing endpoints (authenticated)
router.get("/", authenticateToken, categoryController.getAllCategories);
router.get("/:id", authenticateToken, categoryController.getCategoryById);

// ============================================
// ADMIN / SUBADMIN ONLY
// ============================================

router.post("/", ...adminAuth, categoryController.createCategory);
router.patch("/:id", ...adminAuth, categoryController.updateCategory);
router.delete("/:id", ...adminAuth, categoryController.deleteCategory);

export default router;
