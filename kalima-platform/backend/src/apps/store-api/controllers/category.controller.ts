import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { categoryService } from "../services/category.service";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";
import { ValidationError, BadRequestError } from "../../../libs/errors";

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
// CATEGORY CONTROLLER
// ============================================

export const categoryController = {
  // ============================================
  // CREATE (Admin/SubAdmin)
  // ============================================

  /**
   * POST /categories
   * Body: { title, description?, parent_id? }
   */
  async createCategory(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(CreateCategoryDto, req.body);
      const category = await categoryService.createCategory(dto);

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      _next(error);
    }
  },

  // ============================================
  // GET ALL (Public — any authenticated user)
  // ============================================

  /**
   * GET /categories?active=true
   * Returns tree structure (roots with nested children up to 3 levels).
   */
  async getAllCategories(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const active =
        req.query.active !== undefined
          ? req.query.active === "true"
          : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 50;

      const result = await categoryService.getAllCategories({
        active,
        page,
        limit,
      });

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      _next(error);
    }
  },

  // ============================================
  // PUBLIC — UNAUTHENTICATED HELPERS
  // ============================================

  /**
   * GET /categories/roots
   * Return all root (parent) categories (parent_id = null). No auth required.
   */
  async getRootCategories(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const active =
        req.query.active !== undefined
          ? req.query.active === "true"
          : undefined;

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 50;

      const categories = await categoryService.getRootCategories({
        active,
        page,
        limit,
      });

      res.status(200).json({ success: true, ...categories });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * GET /categories/:id/children
   * Return direct child categories for given parent ID. No auth required.
   */
  async getChildrenByParent(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid category ID");

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 50;

      const active =
        req.query.active !== undefined
          ? req.query.active === "true"
          : undefined;

      let data = {};
      if (id === 0) {
        data = await categoryService.getRootCategories({
          active,
          page,
          limit,
        });
      } else {
        data = await categoryService.getChildrenByParent(id, {
          active,
          page,
          limit,
        });
      }

      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (error) {
      _next(error);
    }
  },

  // ============================================
  // GET SINGLE (Public — any authenticated user)
  // ============================================

  /**
   * GET /categories/:id
   */
  async getCategoryById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new BadRequestError("Invalid category ID");
      }

      const category = await categoryService.getCategoryById(id);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      _next(error);
    }
  },

  // ============================================
  // UPDATE (Admin/SubAdmin)
  // ============================================

  /**
   * PATCH /categories/:id
   */
  async updateCategory(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new BadRequestError("Invalid category ID");
      }

      const dto = await validateDto(UpdateCategoryDto, req.body);
      const category = await categoryService.updateCategory(id, dto);

      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      _next(error);
    }
  },

  // ============================================
  // DELETE (Admin/SubAdmin)
  // ============================================

  /**
   * DELETE /categories/:id?deleteProducts=true|false
   * - deleteProducts=true  → deletes the category AND its products
   * - deleteProducts=false → deletes the category, unlinks products (default)
   *
   * Children are always deleted (DB cascade).
   */
  async deleteCategory(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new BadRequestError("Invalid category ID");
      }

      const deleteProducts = req.query.deleteProducts === "true";

      await categoryService.deleteCategory(id, deleteProducts);

      res.status(200).json({
        success: true,
        message: deleteProducts
          ? "Category and its products deleted successfully"
          : "Category deleted successfully (products unlinked)",
      });
    } catch (error) {
      _next(error);
    }
  },
};
