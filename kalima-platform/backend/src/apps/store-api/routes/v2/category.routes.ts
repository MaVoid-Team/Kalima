import { Router } from "express";
import { categoryController } from "../../controllers/category.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma";

const router = Router();

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin]),
];

// ============================================
// PUBLIC — any authenticated user can read
// ============================================

router.get("/", authenticateToken, categoryController.getAllCategories);
router.get("/:id", authenticateToken, categoryController.getCategoryById);

// ============================================
// ADMIN / SUBADMIN ONLY
// ============================================

router.post("/", ...adminAuth, categoryController.createCategory);
router.patch("/:id", ...adminAuth, categoryController.updateCategory);
router.delete("/:id", ...adminAuth, categoryController.deleteCategory);

export default router;
