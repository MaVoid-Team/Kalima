import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import {
  products,
  product_gallery,
  product_categories,
  product_required_fields,
} from "../generated/prisma/client";
import { imageService, UploadImageOptions } from "./image.service";
import { sampleService } from "./sample.service";
import {
  CreateProductDto,
  UpdateProductDto,
  AttachRequiredFieldEntry,
} from "../dtos/product.dto";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../../../libs/errors";

// ============================================
// SHARED INCLUDES
// ============================================

const PRODUCT_INCLUDE = {
  thumbnail_image: true,
  product_gallery: {
    include: { images: true },
    orderBy: { sort_order: "asc" as const },
  },
  product_categories: {
    include: { categories: true },
  },
  product_required_fields: {
    include: { required_field_definitions: true },
  },
  coupons: true,
  samples: true,
};

// ============================================
// PRODUCT SERVICE
// ============================================

class ProductService {
  constructor(private db: PrismaClient = prisma) {}

  // ============================================
  // CREATE
  // ============================================

  async createProduct(
    dto: CreateProductDto,
    thumbnailFile?: Express.Multer.File,
    sampleFile?: Express.Multer.File,
  ): Promise<products> {
    // If coupon_id provided, verify it exists
    if (dto.coupon_id) {
      const coupon = await this.db.coupons.findUnique({
        where: { id: dto.coupon_id },
      });
      if (!coupon) {
        throw new NotFoundError("Coupon not found");
      }
    }

    // If category_ids provided, verify they all exist
    if (dto.category_ids && dto.category_ids.length > 0) {
      const categories = await this.db.categories.findMany({
        where: { id: { in: dto.category_ids } },
        select: { id: true },
      });
      if (categories.length !== dto.category_ids.length) {
        const foundIds = new Set(categories.map((c) => c.id));
        const missing = dto.category_ids.filter((id) => !foundIds.has(id));
        throw new NotFoundError(
          `Category ID(s) not found: ${missing.join(", ")}`,
        );
      }
    }

    // Upload thumbnail if provided
    let thumbnailId: number | null = null;
    if (thumbnailFile) {
      const image = await imageService.uploadImage(thumbnailFile, {
        compress: true,
        quality: 75,
      });
      thumbnailId = image.id;
    }

    // Create product
    const product = await this.db.products.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        price: dto.price,
        price_after_discount: dto.price_after_discount,
        serial: dto.serial,
        sample_url: dto.sample_url,
        coupon_id: dto.coupon_id ?? null,
        thumbnail_id: thumbnailId,
      },
      include: PRODUCT_INCLUDE,
    });

    // Attach categories if provided
    if (dto.category_ids && dto.category_ids.length > 0) {
      await this.db.product_categories.createMany({
        data: dto.category_ids.map((categoryId) => ({
          product_id: product.id,
          category_id: categoryId,
        })),
      });
    }

    // Upload sample if provided
    if (sampleFile) {
      await sampleService.uploadSample(sampleFile, product.id);
    }

    // Re-fetch to include categories and sample
    return this.getProductById(product.id);
  }

  // ============================================
  // READ — ALL
  // ============================================

  async getAllProducts(filters?: {
    is_archived?: boolean;
    category_id?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: products[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { deleted_at: null };

    if (filters?.is_archived !== undefined) {
      where.is_archived = filters.is_archived;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.category_id) {
      where.product_categories = {
        some: { category_id: filters.category_id },
      };
    }

    const [data, total] = await Promise.all([
      this.db.products.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.products.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // ============================================
  // READ — SINGLE
  // ============================================

  async getProductById(id: number): Promise<products> {
    const product = await this.db.products.findFirst({
      where: { id, deleted_at: null },
      include: PRODUCT_INCLUDE,
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return product;
  }

  // ============================================
  // UPDATE
  // ============================================

  async updateProduct(id: number, dto: UpdateProductDto): Promise<products> {
    const product = await this.db.products.findFirst({
      where: { id, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // If changing coupon, verify it exists
    if (dto.coupon_id !== undefined && dto.coupon_id !== null) {
      const coupon = await this.db.coupons.findUnique({
        where: { id: dto.coupon_id },
      });
      if (!coupon) {
        throw new NotFoundError("Coupon not found");
      }
    }

    const data: any = { updated_at: new Date() };
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.price_after_discount !== undefined)
      data.price_after_discount = dto.price_after_discount;
    if (dto.serial !== undefined) data.serial = dto.serial;
    if (dto.sample_url !== undefined) data.sample_url = dto.sample_url;
    if (dto.coupon_id !== undefined) data.coupon_id = dto.coupon_id;
    if (dto.is_archived !== undefined) data.is_archived = dto.is_archived;

    const updated = await this.db.products.update({
      where: { id },
      data,
      include: PRODUCT_INCLUDE,
    });

    return updated;
  }

  // ============================================
  // SOFT DELETE
  // ============================================

  async deleteProduct(id: number): Promise<void> {
    const product = await this.db.products.findFirst({
      where: { id, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    await this.db.products.update({
      where: { id },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });
  }

  // ============================================
  // THUMBNAIL — UPLOAD / REPLACE
  // ============================================

  async uploadThumbnail(
    productId: number,
    file: Express.Multer.File,
  ): Promise<products> {
    const product = await this.db.products.findFirst({
      where: { id: productId, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const newImage = await imageService.replaceImage(
      product.thumbnail_id,
      file,
      { compress: true, quality: 75 },
    );

    const updated = await this.db.products.update({
      where: { id: productId },
      data: { thumbnail_id: newImage.id, updated_at: new Date() },
      include: PRODUCT_INCLUDE,
    });

    return updated;
  }

  // ============================================
  // THUMBNAIL — REMOVE
  // ============================================

  async removeThumbnail(productId: number): Promise<products> {
    const product = await this.db.products.findFirst({
      where: { id: productId, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (!product.thumbnail_id) {
      throw new BadRequestError("Product has no thumbnail");
    }

    // Nullify FK first, then delete image
    await this.db.products.update({
      where: { id: productId },
      data: { thumbnail_id: null, updated_at: new Date() },
    });

    await imageService.deleteImage(product.thumbnail_id);

    return this.getProductById(productId);
  }

  // ============================================
  // GALLERY — ADD IMAGES
  // ============================================

  async addToGallery(
    productId: number,
    files: Express.Multer.File[],
    compress: boolean = true,
  ): Promise<product_gallery[]> {
    const product = await this.db.products.findFirst({
      where: { id: productId, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Get current max sort_order
    const maxEntry = await this.db.product_gallery.findFirst({
      where: { product_id: productId },
      orderBy: { sort_order: "desc" },
      select: { sort_order: true },
    });
    let nextSort = (maxEntry?.sort_order ?? -1) + 1;

    const entries: product_gallery[] = [];

    for (const file of files) {
      const image = await imageService.uploadImage(file, {
        compress,
        quality: 75,
      });

      const entry = await this.db.product_gallery.create({
        data: {
          product_id: productId,
          image_id: image.id,
          sort_order: nextSort++,
        },
        include: { images: true },
      });

      entries.push(entry);
    }

    return entries;
  }

  // ============================================
  // GALLERY — GET
  // ============================================

  async getGallery(
    productId: number,
    includeInactive: boolean = false,
  ): Promise<product_gallery[]> {
    const where: any = { product_id: productId };
    if (!includeInactive) {
      where.active = true;
    }

    return this.db.product_gallery.findMany({
      where,
      include: { images: true },
      orderBy: { sort_order: "asc" },
    });
  }

  // ============================================
  // GALLERY — UPDATE ENTRY
  // ============================================

  async updateGalleryEntry(
    productId: number,
    galleryId: number,
    data: { sort_order?: number; active?: boolean },
  ): Promise<product_gallery> {
    const entry = await this.db.product_gallery.findFirst({
      where: { id: galleryId, product_id: productId },
    });
    if (!entry) {
      throw new NotFoundError("Gallery entry not found");
    }

    return this.db.product_gallery.update({
      where: { id: galleryId },
      data,
      include: { images: true },
    });
  }

  // ============================================
  // GALLERY — REMOVE
  // ============================================

  async removeFromGallery(productId: number, galleryId: number): Promise<void> {
    const entry = await this.db.product_gallery.findFirst({
      where: { id: galleryId, product_id: productId },
    });
    if (!entry) {
      throw new NotFoundError("Gallery entry not found");
    }

    await imageService.deleteImage(entry.image_id);
  }

  // ============================================
  // CATEGORIES — ATTACH
  // ============================================

  async attachCategories(
    productId: number,
    categoryIds: number[],
  ): Promise<{ attached: number; skipped: number }> {
    const product = await this.db.products.findFirst({
      where: { id: productId, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Verify all categories exist
    const categories = await this.db.categories.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    if (categories.length !== categoryIds.length) {
      const foundIds = new Set(categories.map((c) => c.id));
      const missing = categoryIds.filter((id) => !foundIds.has(id));
      throw new NotFoundError(
        `Category ID(s) not found: ${missing.join(", ")}`,
      );
    }

    // Check existing attachments
    const existing = await this.db.product_categories.findMany({
      where: {
        product_id: productId,
        category_id: { in: categoryIds },
      },
    });
    const existingSet = new Set(existing.map((e) => e.category_id));
    const toInsert = categoryIds.filter((id) => !existingSet.has(id));

    if (toInsert.length > 0) {
      await this.db.product_categories.createMany({
        data: toInsert.map((categoryId) => ({
          product_id: productId,
          category_id: categoryId,
        })),
      });
    }

    return {
      attached: toInsert.length,
      skipped: categoryIds.length - toInsert.length,
    };
  }

  // ============================================
  // CATEGORIES — DETACH
  // ============================================

  async detachCategory(productId: number, categoryId: number): Promise<void> {
    const link = await this.db.product_categories.findFirst({
      where: { product_id: productId, category_id: categoryId },
    });
    if (!link) {
      throw new NotFoundError("Category is not attached to this product");
    }

    await this.db.product_categories.delete({ where: { id: link.id } });
  }

  // ============================================
  // REQUIRED FIELDS — ATTACH
  // ============================================

  async attachRequiredFields(
    productId: number,
    fields: AttachRequiredFieldEntry[],
  ): Promise<{ attached: number; skipped: number }> {
    const product = await this.db.products.findFirst({
      where: { id: productId, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const definitionIds = fields.map((f) => f.field_definition_id);
    const definitions = await this.db.required_field_definitions.findMany({
      where: { id: { in: definitionIds }, deleted_at: null },
    });

    const validIds = new Set(definitions.map((d) => d.id));
    const invalidIds = definitionIds.filter((id) => !validIds.has(id));
    if (invalidIds.length > 0) {
      throw new NotFoundError(
        `Field definition(s) not found: ${invalidIds.join(", ")}`,
      );
    }

    const existing = await this.db.product_required_fields.findMany({
      where: {
        product_id: productId,
        field_definition_id: { in: definitionIds },
      },
    });
    const existingSet = new Set(existing.map((e) => e.field_definition_id));
    const toInsert = fields.filter(
      (f) => !existingSet.has(f.field_definition_id),
    );

    if (toInsert.length > 0) {
      await this.db.product_required_fields.createMany({
        data: toInsert.map((f) => ({
          product_id: productId,
          field_definition_id: f.field_definition_id,
          is_required: f.is_required ?? true,
        })),
      });
    }

    return {
      attached: toInsert.length,
      skipped: fields.length - toInsert.length,
    };
  }

  // ============================================
  // REQUIRED FIELDS — GET
  // ============================================

  async getProductRequiredFields(
    productId: number,
  ): Promise<product_required_fields[]> {
    const product = await this.db.products.findFirst({
      where: { id: productId, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return this.db.product_required_fields.findMany({
      where: { product_id: productId, active: true },
      include: { required_field_definitions: true },
    });
  }

  // ============================================
  // REQUIRED FIELDS — DETACH
  // ============================================

  async detachRequiredField(
    productId: number,
    fieldDefinitionId: number,
  ): Promise<void> {
    const attachment = await this.db.product_required_fields.findFirst({
      where: {
        product_id: productId,
        field_definition_id: fieldDefinitionId,
      },
    });
    if (!attachment) {
      throw new NotFoundError(
        "This field is not attached to the specified product",
      );
    }

    await this.db.product_required_fields.delete({
      where: { id: attachment.id },
    });
  }
}

export const productService = new ProductService();
