import { Router } from "express";
import { purchaseController } from "../../controllers/purchase.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/client";
import { uploadFastBuy } from "../../middleware/upload.middleware";

const router = Router();

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin]),
];

// ============================================
// AUTHENTICATED — teacher reads own purchases & fast buy
// ============================================

router.get("/my", authenticateToken, purchaseController.getMyPurchases);
router.post("/fast-buy", authenticateToken, uploadFastBuy, purchaseController.fastBuy);

// ============================================
// ADMIN / SUBADMIN — purchase management
// ============================================

router.get("/", ...adminAuth, purchaseController.getAll);
router.get("/:id", ...adminAuth, purchaseController.getById);

router.patch("/:id/receive", ...adminAuth, purchaseController.receive);
router.patch("/:id/confirm", ...adminAuth, purchaseController.confirm);
router.patch("/:id/return", ...adminAuth, purchaseController.returnPurchase);
router.patch("/:id/admin-note", ...adminAuth, purchaseController.addAdminNote);

router.delete("/:id", ...adminAuth, purchaseController.deletePurchase);
router.delete("/:id/items/:itemId", ...adminAuth, purchaseController.deleteItem);

export default router;
