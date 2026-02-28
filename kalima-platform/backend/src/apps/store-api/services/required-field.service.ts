import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import {
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
  AttachFieldEntry,
} from "../dtos/required-field.dto";
import {
  required_field_definitions,
  product_required_fields,
  field_type_enum,
} from "../generated/prisma/client";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../../../libs/errors";

// ============================================
// REQUIRED FIELD SERVICE
// ============================================

class RequiredFieldService {
  constructor(private db: PrismaClient = prisma) {}

  // ============================================
  // FIELD DEFINITIONS — CRUD
  // ============================================

  /**
   * Create a new field definition in the dictionary.
   */
  async createDefinition(
    dto: CreateFieldDefinitionDto,
  ): Promise<required_field_definitions> {
    // Check label uniqueness (both active and soft-deleted)
    const existing = await this.db.required_field_definitions.findFirst({
      where: { label: dto.label },
    });

    if (existing) {
      if (existing.deleted_at !== null) {
        // Restore the soft-deleted definition and update its details
        return this.db.required_field_definitions.update({
          where: { id: existing.id },
          data: {
            deleted_at: null,
            active: true,
            field_type: dto.field_type as field_type_enum,
            updated_at: new Date(),
          },
        });
      }

      throw new ConflictError(
        `Field definition with label "${dto.label}" already exists`,
      );
    }

    const definition = await this.db.required_field_definitions.create({
      data: {
        label: dto.label,
        field_type: dto.field_type as field_type_enum,
      },
    });

    return definition;
  }

  /**
   * List all field definitions with optional pagination and active filter.
   */
  async getAllDefinitions(filters?: {
    active?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: required_field_definitions[];
    page: number;
    limit: number;
    count: number;
  }> {
    const where: any = { deleted_at: null };
    if (filters?.active !== undefined) where.active = filters.active;
    if (filters?.search) {
      where.label = { contains: filters.search, mode: "insensitive" };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, count] = await Promise.all([
      prisma.required_field_definitions.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.required_field_definitions.count({ where }),
    ]);

    return { data, page, limit, count };
  }

  /**
   * Get a single field definition by ID.
   */
  async getDefinitionById(id: number): Promise<required_field_definitions> {
    const definition = await this.db.required_field_definitions.findFirst({
      where: { id, deleted_at: null },
    });
    if (!definition) {
      throw new NotFoundError("Field definition not found");
    }
    return definition;
  }

  /**
   * Update a field definition (label, field_type, active).
   */
  async updateDefinition(
    id: number,
    dto: UpdateFieldDefinitionDto,
  ): Promise<required_field_definitions> {
    const definition = await this.db.required_field_definitions.findFirst({
      where: { id, deleted_at: null },
    });
    if (!definition) {
      throw new NotFoundError("Field definition not found");
    }

    // If label is being changed, check uniqueness
    if (dto.label && dto.label !== definition.label) {
      const existing = await this.db.required_field_definitions.findFirst({
        where: { label: dto.label },
      });
      if (existing) {
        throw new ConflictError(
          `Field definition with label "${dto.label}" already exists${
            existing.deleted_at
              ? " (it is currently deleted, please reuse or restore it)"
              : ""
          }`,
        );
      }
    }

    const data: any = {
      updated_at: new Date(),
    };

    if (dto.label !== undefined) data.label = dto.label;
    if (dto.field_type !== undefined)
      data.field_type = dto.field_type as field_type_enum;
    if (dto.active !== undefined) data.active = dto.active;

    const updated = await this.db.required_field_definitions.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Soft-delete a field definition.
   * Also deactivates all product_required_fields linked to it.
   */
  async deleteDefinition(id: number): Promise<required_field_definitions> {
    const definition = await this.db.required_field_definitions.findFirst({
      where: { id, deleted_at: null },
    });
    if (!definition) {
      throw new NotFoundError("Field definition not found");
    }

    // Deactivate all product attachments that use this definition
    await this.db.product_required_fields.updateMany({
      where: { field_definition_id: id },
      data: { active: false },
    });

    const deleted = await this.db.required_field_definitions.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        active: false,
      },
    });

    return deleted;
  }

  // ============================================
  // PRODUCT FIELD ATTACHMENT
  // ============================================

  /**
   * Attach one or more field definitions to a product.
   * Skips any that are already attached.
   */
  async attachFieldsToProduct(
    productId: number,
    fields: AttachFieldEntry[],
  ): Promise<{ attached: number; skipped: number }> {
    // Verify product exists
    const product = await this.db.products.findFirst({
      where: { id: productId, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Verify all field definitions exist and are not soft-deleted
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

    // Check which are already attached
    const existingAttachments = await this.db.product_required_fields.findMany({
      where: {
        product_id: productId,
        field_definition_id: { in: definitionIds },
      },
    });
    const existingSet = new Set(
      existingAttachments.map((a) => a.field_definition_id),
    );

    // Only insert new ones
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

  /**
   * Get all fields attached to a product (with definition details).
   */
  async getProductFields(
    productId: number,
  ): Promise<product_required_fields[]> {
    // Verify product exists
    const product = await this.db.products.findFirst({
      where: { id: productId, deleted_at: null },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const fields = await this.db.product_required_fields.findMany({
      where: { product_id: productId, active: true },
      include: {
        required_field_definitions: true,
      },
    });

    return fields;
  }

  /**
   * Detach a single field definition from a product (hard delete the junction row).
   */
  async detachFieldFromProduct(
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

export const requiredFieldService = new RequiredFieldService();
