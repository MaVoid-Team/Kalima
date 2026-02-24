import { Router } from "express";
import { productController } from "../../controllers/product.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadProductWithSample,
} from "../../middleware/upload.middleware";
import { role_enum } from "../../generated/prisma/client";
import { makeExportHandler } from "../../export";

const router = Router();

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin]),
];

// ============================================
// PUBLIC — no auth required
// ============================================

router.get("/export", makeExportHandler("products"));
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get("/:id/coupons", productController.getProductCoupons);
router.get("/:id/thumbnail", productController.getThumbnail);
router.get("/:id/gallery", productController.getGallery);
router.get("/:id/required-fields", productController.getProductRequiredFields);

// ============================================
// ADMIN / SUBADMIN — product CRUD
// ============================================

router.post(
  "/",
  ...adminAuth,
  uploadProductWithSample,
  productController.createProduct,
);

router.patch("/:id", ...adminAuth, productController.updateProduct);
router.delete("/:id", ...adminAuth, productController.deleteProduct);

// ============================================
// ADMIN / SUBADMIN — thumbnail
// ============================================

router.post(
  "/:id/thumbnail",
  ...adminAuth,
  uploadSingleImage("thumbnail"),
  productController.uploadThumbnail,
);

router.delete(
  "/:id/thumbnail",
  ...adminAuth,
  productController.removeThumbnail,
);

// ============================================
// ADMIN / SUBADMIN — gallery
// ============================================

router.post(
  "/:id/gallery",
  ...adminAuth,
  uploadMultipleImages("gallery", 10),
  productController.addToGallery,
);

router.patch(
  "/:id/gallery/:galleryId",
  ...adminAuth,
  productController.updateGalleryEntry,
);

router.delete(
  "/:id/gallery/:galleryId",
  ...adminAuth,
  productController.removeFromGallery,
);

// ============================================
// ADMIN / SUBADMIN — categories
// ============================================

router.post(
  "/:id/categories",
  ...adminAuth,
  productController.attachCategories,
);

router.delete(
  "/:id/categories/:categoryId",
  ...adminAuth,
  productController.detachCategory,
);

// ============================================
// ADMIN / SUBADMIN — required fields
// ============================================

router.post(
  "/:id/required-fields",
  ...adminAuth,
  productController.attachRequiredFields,
);

router.delete(
  "/:id/required-fields/:fieldDefinitionId",
  ...adminAuth,
  productController.detachRequiredField,
);

export default router;
