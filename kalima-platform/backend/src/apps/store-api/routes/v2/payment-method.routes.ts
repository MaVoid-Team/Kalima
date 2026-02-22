import { Router } from "express";
import { paymentMethodController } from "../../controllers/payment-method.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";

import { role_enum } from "../../generated/prisma/client";

const router = Router();

// Public routes (or authenticated user routes, depending on requirements, but usually anyone checking out needs to see payment methods)
// Using authenticateToken so only logged in users see it (adjust if it needs to be completely public)
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
  paymentMethodController.createPaymentMethod
);

router.patch(
  "/:id",
  authenticateToken,
  requireRole([role_enum.Admin]),
  paymentMethodController.updatePaymentMethod
);

router.delete(
  "/:id",
  authenticateToken,
  requireRole([role_enum.Admin]),
  paymentMethodController.deletePaymentMethod
);

export default router;
