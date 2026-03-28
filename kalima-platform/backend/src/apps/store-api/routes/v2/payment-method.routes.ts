import { Router } from "express";
import { paymentMethodController } from "../../controllers/payment-method.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { uploadSingleImage } from "../../middleware/upload.middleware";
import { role_enum } from "../../generated/prisma/client";
import { makeExportHandler } from "../../export";

const router = Router();

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin, role_enum.Moderator]),
];

router.get("/export", ...adminAuth, makeExportHandler("payment-methods"));

router.get(
  "/",
  authenticateToken,
  paymentMethodController.listPaymentMethods
);

router.get(
  "/:id",
  authenticateToken,
  paymentMethodController.getPaymentMethod
);

// Admin-only routes
router.post(
  "/",
  authenticateToken,
  requireRole([role_enum.Admin]),
  uploadSingleImage("image"),
  paymentMethodController.createPaymentMethod
);

router.patch(
  "/:id",
  authenticateToken,
  requireRole([role_enum.Admin]),
  uploadSingleImage("image"),
  paymentMethodController.updatePaymentMethod
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole([role_enum.Admin]),
  paymentMethodController.deletePaymentMethod
);

export default router;
