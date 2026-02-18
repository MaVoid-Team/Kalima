import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";
import { categories } from "../generated/prisma";
import { BadRequestError, NotFoundError } from "../../../libs/errors";

// ============================================
// CONSTANTS
// ============================================

const MAX_NESTING_DEPTH = 3;

// ============================================
// CATEGORY SERVICE
// ============================================

class CategoryService {
  constructor(private db: PrismaClient = prisma) {}

  // ============================================
  // CREATE
  // ============================================

  async createCategory(dto: CreateCategoryDto): Promise<categories> {
    // If parent_id is provided, validate it exists and check depth
    if (dto.parent_id) {
      const parent = await this.db.categories.findUnique({
        where: { id: dto.parent_id },
      });
      if (!parent) {
        throw new NotFoundError("Parent category not found");
      }

      const depth = await this.getCategoryDepth(dto.parent_id);
      if (depth >= MAX_NESTING_DEPTH) {
        throw new BadRequestError(
          `Maximum nesting depth of ${MAX_NESTING_DEPTH} reached. Cannot create a child under this category.`,
        );
      }
    }

    const category = await this.db.categories.create({
      data: {
        title: dto.title,
        description: dto.description,
        parent_id: dto.parent_id ?? null,
      },
    });

    return category;
  }

  // ============================================
  // READ — ALL (with tree structure)
  // ============================================

  /**
   * Returns all root categories with nested children (up to 3 levels).
   * If active filter is provided, only returns matching categories.
   */
  async getAllCategories(filters?: {
    active?: boolean;
  }): Promise<categories[]> {
    const where: any = {};

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    // Get root categories (no parent) with 3 levels of nesting
    where.parent_id = null;

    const roots = await this.db.categories.findMany({
      where,
      include: {
        other_categories: {
          where:
            filters?.active !== undefined ? { active: filters.active } : {},
          include: {
            other_categories: {
              where:
                filters?.active !== undefined ? { active: filters.active } : {},
              include: {
                product_categories: {
                  select: { product_id: true },
                },
              },
            },
            product_categories: {
              select: { product_id: true },
            },
          },
        },
        product_categories: {
          select: { product_id: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return roots;
  }

  // ============================================
  // READ — SINGLE
  // ============================================

  async getCategoryById(id: number): Promise<categories> {
    const category = await this.db.categories.findUnique({
      where: { id },
      include: {
        other_categories: {
          include: {
            other_categories: {
              include: {
                product_categories: {
                  select: { product_id: true },
                },
              },
            },
            product_categories: {
              select: { product_id: true },
            },
          },
        },
        product_categories: {
          select: { product_id: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    return category;
  }

  // ============================================
  // UPDATE
  // ============================================

  async updateCategory(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<categories> {
    const category = await this.db.categories.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // If changing parent, validate depth
    if (dto.parent_id !== undefined) {
      if (dto.parent_id === id) {
        throw new BadRequestError("A category cannot be its own parent");
      }

      if (dto.parent_id !== null) {
        const parent = await this.db.categories.findUnique({
          where: { id: dto.parent_id },
        });
        if (!parent) {
          throw new NotFoundError("Parent category not found");
        }

        // Check that new parent is not a descendant of this category
        const isDescendant = await this.isDescendantOf(dto.parent_id, id);
        if (isDescendant) {
          throw new BadRequestError(
            "Cannot move a category under one of its own descendants",
          );
        }

        // Check depth: depth of new parent + depth of this subtree
        const parentDepth = await this.getCategoryDepth(dto.parent_id);
        const subtreeDepth = await this.getSubtreeDepth(id);
        if (parentDepth + subtreeDepth > MAX_NESTING_DEPTH) {
          throw new BadRequestError(
            `Moving this category would exceed the maximum nesting depth of ${MAX_NESTING_DEPTH}`,
          );
        }
      }
    }

    // If archiving, cascade to children
    if (dto.active === false && category.active !== false) {
      await this.archiveCascade(id);
    }

    const data: any = { updated_at: new Date() };
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.parent_id !== undefined) data.parent_id = dto.parent_id;
    if (dto.active !== undefined) data.active = dto.active;

    const updated = await this.db.categories.update({
      where: { id },
      data,
    });

    return updated;
  }

  // ============================================
  // DELETE
  // ============================================

  /**
   * Deletes a category.
   * @param deleteProducts - if true, also deletes all products linked
   *   to this category (and its children). If false, only unlinks them.
   *
   * Children are always deleted (cascade via DB relation).
   */
  async deleteCategory(id: number, deleteProducts: boolean): Promise<void> {
    const category = await this.db.categories.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Collect all descendant category IDs (including self)
    const allCategoryIds = await this.collectDescendantIds(id);

    if (deleteProducts) {
      // Find all product IDs linked to these categories
      const productLinks = await this.db.product_categories.findMany({
        where: { category_id: { in: allCategoryIds } },
        select: { product_id: true },
      });
      const productIds = [...new Set(productLinks.map((p) => p.product_id))];

      if (productIds.length > 0) {
        // Delete products (cascade will clean up product_required_fields, product_categories)
        await this.db.products.deleteMany({
          where: { id: { in: productIds } },
        });
      }
    } else {
      // Just unlink products from these categories
      await this.db.product_categories.deleteMany({
        where: { category_id: { in: allCategoryIds } },
      });
    }

    // Delete the category (children cascade via DB)
    await this.db.categories.delete({
      where: { id },
    });
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Returns the depth level of a category (1 = root, 2 = child, 3 = grandchild).
   */
  private async getCategoryDepth(categoryId: number): Promise<number> {
    let depth = 1;
    let currentId: number | null = categoryId;

    while (currentId) {
      const cat = await this.db.categories.findUnique({
        where: { id: currentId },
        select: { parent_id: true },
      });
      if (!cat || !cat.parent_id) break;
      depth++;
      currentId = cat.parent_id;
    }

    return depth;
  }

  /**
   * Returns the max depth of the subtree rooted at categoryId (1 = leaf).
   */
  private async getSubtreeDepth(categoryId: number): Promise<number> {
    const children = await this.db.categories.findMany({
      where: { parent_id: categoryId },
      select: { id: true },
    });

    if (children.length === 0) return 1;

    const childDepths = await Promise.all(
      children.map((c) => this.getSubtreeDepth(c.id)),
    );

    return 1 + Math.max(...childDepths);
  }

  /**
   * Checks if `possibleDescendantId` is a descendant of `ancestorId`.
   */
  private async isDescendantOf(
    possibleDescendantId: number,
    ancestorId: number,
  ): Promise<boolean> {
    let currentId: number | null = possibleDescendantId;

    while (currentId) {
      const cat = await this.db.categories.findUnique({
        where: { id: currentId },
        select: { parent_id: true },
      });
      if (!cat || !cat.parent_id) return false;
      if (cat.parent_id === ancestorId) return true;
      currentId = cat.parent_id;
    }

    return false;
  }

  /**
   * Collects all descendant IDs (including the given category itself).
   */
  private async collectDescendantIds(categoryId: number): Promise<number[]> {
    const ids: number[] = [categoryId];
    const children = await this.db.categories.findMany({
      where: { parent_id: categoryId },
      select: { id: true },
    });

    for (const child of children) {
      const childIds = await this.collectDescendantIds(child.id);
      ids.push(...childIds);
    }

    return ids;
  }

  /**
   * Recursively archives all children of a category.
   */
  private async archiveCascade(categoryId: number): Promise<void> {
    const children = await this.db.categories.findMany({
      where: { parent_id: categoryId },
      select: { id: true },
    });

    for (const child of children) {
      await this.archiveCascade(child.id);
    }

    await this.db.categories.update({
      where: { id: categoryId },
      data: { active: false, updated_at: new Date() },
    });
  }
}

export const categoryService = new CategoryService();
