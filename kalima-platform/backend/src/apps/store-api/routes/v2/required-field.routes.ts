import { Router } from "express";
import { requiredFieldController } from "../../controllers/required-field.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum } from "../../generated/prisma/client";
import { makeExportHandler } from "../../export";

const router = Router();

// All required-field routes require Admin or SubAdmin
const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin]),
];

// ============================================
// FIELD DEFINITIONS — DICTIONARY CRUD
// ============================================

router.get(
  "/definitions/export",
  ...adminAuth,
  makeExportHandler("required-field-definitions"),
);

router.post(
  "/definitions",
  ...adminAuth,
  requiredFieldController.createDefinition,
);
router.get(
  "/definitions",
  ...adminAuth,
  requiredFieldController.getAllDefinitions,
);
router.get(
  "/definitions/:id",
  ...adminAuth,
  requiredFieldController.getDefinitionById,
);
router.patch(
  "/definitions/:id",
  ...adminAuth,
  requiredFieldController.updateDefinition,
);
router.delete(
  "/definitions/:id",
  ...adminAuth,
  requiredFieldController.deleteDefinition,
);

// ============================================
// PRODUCT FIELD ATTACHMENT
// ============================================

router.post(
  "/products/:productId/fields",
  ...adminAuth,
  requiredFieldController.attachFieldsToProduct,
);
router.get(
  "/products/:productId/fields",
  ...adminAuth,
  requiredFieldController.getProductFields,
);
router.delete(
  "/products/:productId/fields/:fieldDefId",
  ...adminAuth,
  requiredFieldController.detachFieldFromProduct,
);

export default router;
