import { Request, Response, NextFunction } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { appreciationService } from "../services/appreciation.service";
import { CreateAppreciationCommentDto } from "../dtos/appreciation.dto";
import {
  BadRequestError,
  ValidationError,
} from "../../../libs/errors";

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

function parseUserId(rawUserId: string) {
  const userId = parseInt(rawUserId, 10);

  if (isNaN(userId)) {
    throw new BadRequestError("Invalid user ID");
  }

  return userId;
}

export const appreciationController = {
  async getAdminPage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await appreciationService.getAdminPage(
        parseUserId(req.params.userId as string),
      );

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createAdminPage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await appreciationService.getOrCreateAdminPage(
        parseUserId(req.params.userId as string),
      );

      res.status(200).json({
        success: true,
        message: "Appreciation page ready",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPublicPage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await appreciationService.getPublicPage(
        req.params.token as string,
      );

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(CreateAppreciationCommentDto, req.body);
      const data = await appreciationService.createComment(
        req.params.token as string,
        dto,
      );

      res.status(201).json({
        success: true,
        message: "Comment submitted successfully",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default appreciationController;
