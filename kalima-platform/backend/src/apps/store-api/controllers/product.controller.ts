import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { productService } from "../services/product.service";
import { couponService } from "../services/coupon.service";
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateGalleryEntryDto,
  AttachCategoriesDto,
  AttachRequiredFieldsDto,
} from "../dtos/product.dto";
import {
  ValidationError,
  BadRequestError,
  NotFoundError,
} from "../../../libs/errors";

// ============================================
// HELPER
// ============================================

async function validateDto<T extends object>(
  DtoClass: new () => T,
  body: unknown,
): Promise<T> {
  const dto = plainToInstance(DtoClass, body);
  const validationErrors = await validate(dto);

  if (validationErrors.length > 0) {
    const errors = validationErrors.flatMap((err) =>
      Object.values(err.constraints || {}),
    );
    throw new ValidationError(errors);
  }

  return dto;
}

// ============================================
// PRODUCT CONTROLLER
// ============================================

export const productController = {
  // ──────────────────────────────────────────
  // CRUD
  // ──────────────────────────────────────────

  /**
   * POST /products
   * multipart/form-data — fields + optional "thumbnail" file
   */
  async createProduct(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      // Parse category_id from string if sent via form-data
      if (typeof req.body.category_id === "string") {
        const parsed = parseInt(req.body.category_id, 10);
        if (isNaN(parsed)) {
          throw new BadRequestError("category_id must be a valid integer");
        }
        req.body.category_id = parsed;
      }

      const dto = await validateDto(CreateProductDto, req.body);
      const files = req.files as
        | { thumbnail?: Express.Multer.File[]; sample?: Express.Multer.File[] }
        | undefined;
      const thumbnailFile = files?.thumbnail?.[0];
      const sampleFile = files?.sample?.[0];

      const product = await productService.createProduct(
        dto,
        thumbnailFile,
        sampleFile,
      );

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * GET /products
   * Query: ?is_archived, ?category_id, ?search, ?page, ?limit
   */
  async getAllProducts(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const filters = {
        is_archived:
          req.query.is_archived !== undefined
            ? req.query.is_archived === "true"
            : undefined,
        category_id: req.query.category_id
          ? parseInt(req.query.category_id as string, 10)
          : undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      };

      const result = await productService.getAllProducts(filters);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * GET /products/:id
   */
  async getProductById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const product = await productService.getProductById(id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * GET /products/:id/coupons
   * Returns active coupons for a product.
   */
  async getProductCoupons(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const active =
        req.query.active !== undefined ? req.query.active === "true" : true;

      const coupons = await couponService.getCouponsByProduct(id, active);

      res.status(200).json({
        success: true,
        data: coupons,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * GET /products/:id/thumbnail
   */
  async getThumbnail(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const product = (await productService.getProductById(id)) as any;

      if (!product.thumbnail_image) {
        throw new NotFoundError("Thumbnail not found for this product");
      }

      res.status(200).json({
        success: true,
        data: product.thumbnail_image,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * PATCH /products/:id
   */
  async updateProduct(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const dto = await validateDto(UpdateProductDto, req.body);
      const product = await productService.updateProduct(id, dto);

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * DELETE /products/:id  (soft delete)
   */
  async deleteProduct(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      await productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      _next(error);
    }
  },

  // ──────────────────────────────────────────
  // THUMBNAIL
  // ──────────────────────────────────────────

  /**
   * POST /products/:id/thumbnail
   * multipart/form-data — field "thumbnail"
   */
  async uploadThumbnail(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const file = req.file as Express.Multer.File | undefined;
      if (!file) throw new BadRequestError("No thumbnail file provided");

      const product = await productService.uploadThumbnail(id, file);

      res.status(200).json({
        success: true,
        message: "Thumbnail uploaded successfully",
        data: product,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * DELETE /products/:id/thumbnail
   */
  async removeThumbnail(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const product = await productService.removeThumbnail(id);

      res.status(200).json({
        success: true,
        message: "Thumbnail removed successfully",
        data: product,
      });
    } catch (error) {
      _next(error);
    }
  },

  // ──────────────────────────────────────────
  // GALLERY
  // ──────────────────────────────────────────

  /**
   * POST /products/:id/gallery
   * multipart/form-data — field "gallery" (1–10 images)
   * Query: ?compress=false to skip compression
   */
  async addToGallery(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new BadRequestError("No images provided");
      }

      const compress = req.query.compress !== "false";

      const entries = await productService.addToGallery(id, files, compress);

      res.status(201).json({
        success: true,
        message: `${entries.length} image(s) added to gallery`,
        data: entries,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * GET /products/:id/gallery
   * Query: ?includeInactive=true
   */
  async getGallery(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const includeInactive = req.query.includeInactive === "true";
      const entries = await productService.getGallery(id, includeInactive);

      res.status(200).json({
        success: true,
        results: entries.length,
        data: entries,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * PATCH /products/:id/gallery/:galleryId
   */
  async updateGalleryEntry(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const galleryId = parseInt(req.params.galleryId as string, 10);
      if (isNaN(id) || isNaN(galleryId)) {
        throw new BadRequestError("Invalid product ID or gallery ID");
      }

      const dto = await validateDto(UpdateGalleryEntryDto, req.body);
      const entry = await productService.updateGalleryEntry(id, galleryId, dto);

      res.status(200).json({
        success: true,
        message: "Gallery entry updated",
        data: entry,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * DELETE /products/:id/gallery/:galleryId
   */
  async removeFromGallery(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const galleryId = parseInt(req.params.galleryId as string, 10);
      if (isNaN(id) || isNaN(galleryId)) {
        throw new BadRequestError("Invalid product ID or gallery ID");
      }

      await productService.removeFromGallery(id, galleryId);

      res.status(200).json({
        success: true,
        message: "Image removed from gallery",
      });
    } catch (error) {
      _next(error);
    }
  },

  // ──────────────────────────────────────────
  // CATEGORIES
  // ──────────────────────────────────────────

  /**
   * POST /products/:id/categories
   * Body: { category_ids: [1, 2, 3] }
   */
  async attachCategories(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const dto = await validateDto(AttachCategoriesDto, req.body);
      const result = await productService.attachCategories(
        id,
        dto.category_ids,
      );

      res.status(200).json({
        success: true,
        message: `${result.attached} category(ies) attached, ${result.skipped} skipped (already attached)`,
        data: result,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * DELETE /products/:id/categories/:categoryId
   */
  async detachCategory(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const categoryId = parseInt(req.params.categoryId as string, 10);
      if (isNaN(id) || isNaN(categoryId)) {
        throw new BadRequestError("Invalid product ID or category ID");
      }

      await productService.detachCategory(id, categoryId);

      res.status(200).json({
        success: true,
        message: "Category detached from product",
      });
    } catch (error) {
      _next(error);
    }
  },

  // ──────────────────────────────────────────
  // REQUIRED FIELDS
  // ──────────────────────────────────────────

  /**
   * POST /products/:id/required-fields
   * Body: { fields: [{ field_definition_id, is_required? }] }
   */
  async attachRequiredFields(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const dto = await validateDto(AttachRequiredFieldsDto, req.body);
      const result = await productService.attachRequiredFields(id, dto.fields);

      res.status(200).json({
        success: true,
        message: `${result.attached} field(s) attached, ${result.skipped} skipped`,
        data: result,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * GET /products/:id/required-fields
   */
  async getProductRequiredFields(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid product ID");

      const fields = await productService.getProductRequiredFields(id);

      res.status(200).json({
        success: true,
        results: fields.length,
        data: fields,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * DELETE /products/:id/required-fields/:fieldDefinitionId
   */
  async detachRequiredField(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      const fieldDefinitionId = parseInt(
        req.params.fieldDefinitionId as string,
        10,
      );
      if (isNaN(id) || isNaN(fieldDefinitionId)) {
        throw new BadRequestError("Invalid product ID or field definition ID");
      }

      await productService.detachRequiredField(id, fieldDefinitionId);

      res.status(200).json({
        success: true,
        message: "Required field detached from product",
      });
    } catch (error) {
      _next(error);
    }
  },
};
