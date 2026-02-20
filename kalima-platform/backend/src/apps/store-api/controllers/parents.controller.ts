import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { parentChildrenService } from "../services/parent-children.service";
import {
  CreateParentChildDto,
  UpdateParentChildDto,
} from "../dtos/parent-children.dto";
import {
  ValidationError,
  BadRequestError,
  ForbiddenError,
} from "../../../libs/errors";
import { role_enum } from "../generated/prisma";

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

export const parentsController = {
  async createParentChild(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const auth = req.user as any;
      const dto = await validateDto(CreateParentChildDto, req.body);

      if (auth.role === role_enum.Admin || auth.role === role_enum.SubAdmin) {
        if (!dto.parent_user_id)
          throw new BadRequestError(
            "parent_user_id is required when creating on behalf of a parent",
          );
      } else if (auth.role === role_enum.Parent) {
        dto.parent_user_id = auth.id;
      } else {
        throw new ForbiddenError(
          "Not authorized to create parent-child records",
        );
      }

      const created = await parentChildrenService.createParentChild(dto);
      res.status(201).json({
        success: true,
        message: "Parent-child created",
        data: created,
      });
    } catch (err) {
      _next(err);
    }
  },

  async getAllParentChildren(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const parent_user_id = req.query.parent_user_id
        ? parseInt(req.query.parent_user_id as string, 10)
        : undefined;
      const student_user_id = req.query.student_user_id
        ? parseInt(req.query.student_user_id as string, 10)
        : undefined;

      const list = await parentChildrenService.getAllParentChildren({
        parent_user_id,
        student_user_id,
      });
      res.status(200).json({ success: true, results: list.length, data: list });
    } catch (err) {
      _next(err);
    }
  },

  async getParentChildById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid ID");
      const item = await parentChildrenService.getById(id);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      _next(err);
    }
  },

  async updateParentChild(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const auth = req.user as any;
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid ID");

      const existing = await parentChildrenService.getById(id);

      if (
        !(
          auth.role === role_enum.Admin ||
          auth.role === role_enum.SubAdmin ||
          auth.id === existing.parent_user_id
        )
      ) {
        throw new ForbiddenError("Not authorized to update this record");
      }

      const dto = await validateDto(UpdateParentChildDto, req.body);
      if (auth.role === role_enum.Parent) dto.parent_user_id = auth.id;

      const updated = await parentChildrenService.updateParentChild(id, dto);
      res.status(200).json({
        success: true,
        message: "Parent-child updated",
        data: updated,
      });
    } catch (err) {
      _next(err);
    }
  },

  async deleteParentChild(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const auth = req.user as any;
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid ID");

      const existing = await parentChildrenService.getById(id);

      if (
        !(
          auth.role === role_enum.Admin ||
          auth.role === role_enum.SubAdmin ||
          auth.id === existing.parent_user_id
        )
      ) {
        throw new ForbiddenError("Not authorized to delete this record");
      }

      await parentChildrenService.deleteParentChild(id);
      res.status(200).json({ success: true, message: "Parent-child deleted" });
    } catch (err) {
      _next(err);
    }
  },
};
