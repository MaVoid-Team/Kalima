import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { requiredFieldService } from "../services/required-field.service";
import {
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
  AttachFieldsToProductDto,
} from "../dtos/required-field.dto";
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
// REQUIRED FIELD CONTROLLER
// ============================================

export const requiredFieldController = {
  // ============================================
  // FIELD DEFINITIONS — DICTIONARY CRUD
  // ============================================

  /**
   * POST /required-fields/definitions
   */
  async createDefinition(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(CreateFieldDefinitionDto, req.body);
      const definition = await requiredFieldService.createDefinition(dto);

      res.status(201).json({
        success: true,
        message: "Field definition created successfully",
        data: definition,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * GET /required-fields/definitions?page=1&limit=20&active=true
   */
  async getAllDefinitions(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const page = req.query.page
        ? parseInt(req.query.page as string, 10)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined;
      const active =
        req.query.active !== undefined
          ? req.query.active === "true"
          : undefined;

      const result = await requiredFieldService.getAllDefinitions({
        page,
        limit,
        active,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * GET /required-fields/definitions/:id
   */
  async getDefinitionById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new BadRequestError("Invalid field definition ID");
      }

      const definition = await requiredFieldService.getDefinitionById(id);

      res.status(200).json({
        success: true,
        data: definition,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * PATCH /required-fields/definitions/:id
   */
  async updateDefinition(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new BadRequestError("Invalid field definition ID");
      }

      const dto = await validateDto(UpdateFieldDefinitionDto, req.body);
      const definition = await requiredFieldService.updateDefinition(id, dto);

      res.status(200).json({
        success: true,
        message: "Field definition updated successfully",
        data: definition,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * DELETE /required-fields/definitions/:id
   */
  async deleteDefinition(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new BadRequestError("Invalid field definition ID");
      }

      await requiredFieldService.deleteDefinition(id);

      res.status(200).json({
        success: true,
        message: "Field definition deleted successfully",
      });
    } catch (error) {
      _next(error);
    }
  },

  // ============================================
  // PRODUCT FIELD ATTACHMENT
  // ============================================

  /**
   * POST /required-fields/products/:productId/fields
   */
  async attachFieldsToProduct(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const productId = parseInt(req.params.productId as string, 10);
      if (isNaN(productId)) {
        throw new BadRequestError("Invalid product ID");
      }

      const dto = await validateDto(AttachFieldsToProductDto, req.body);
      const result = await requiredFieldService.attachFieldsToProduct(
        productId,
        dto.fields,
      );

      res.status(201).json({
        success: true,
        message: `Attached ${result.attached} field(s), skipped ${result.skipped} duplicate(s)`,
        data: result,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * GET /required-fields/products/:productId/fields
   */
  async getProductFields(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const productId = parseInt(req.params.productId as string, 10);
      if (isNaN(productId)) {
        throw new BadRequestError("Invalid product ID");
      }

      const fields = await requiredFieldService.getProductFields(productId);

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
   * DELETE /required-fields/products/:productId/fields/:fieldDefId
   */
  async detachFieldFromProduct(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const productId = parseInt(req.params.productId as string, 10);
      const fieldDefId = parseInt(req.params.fieldDefId as string, 10);

      if (isNaN(productId)) {
        throw new BadRequestError("Invalid product ID");
      }
      if (isNaN(fieldDefId)) {
        throw new BadRequestError("Invalid field definition ID");
      }

      await requiredFieldService.detachFieldFromProduct(productId, fieldDefId);

      res.status(200).json({
        success: true,
        message: "Field detached from product successfully",
      });
    } catch (error) {
      _next(error);
    }
  },
};
