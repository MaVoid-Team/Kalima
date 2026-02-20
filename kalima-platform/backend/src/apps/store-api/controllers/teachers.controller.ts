import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { socialMediaService } from "../services/social-media.service";
import { teachesAtService } from "../services/teaches-at.service";
import {
  CreateSocialMediaDto,
  UpdateSocialMediaDto,
} from "../dtos/social-media.dto";
import { CreateTeachesAtDto, UpdateTeachesAtDto } from "../dtos/teaches-at.dto";
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

export const teachersController = {
  // Social media handlers
  async createSocialMedia(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const auth = req.user as any;
      const dto = await validateDto(CreateSocialMediaDto, req.body);

      if (auth.role === role_enum.Admin || auth.role === role_enum.SubAdmin) {
        if (!dto.teacher_user_id)
          throw new BadRequestError(
            "teacher_user_id is required when creating on behalf of a teacher",
          );
      } else if (auth.role === role_enum.Teacher) {
        dto.teacher_user_id = auth.id;
      } else {
        throw new ForbiddenError(
          "Not authorized to create social media entries",
        );
      }

      const created = await socialMediaService.createSocialMedia(dto);
      res
        .status(201)
        .json({
          success: true,
          message: "Social media entry created",
          data: created,
        });
    } catch (err) {
      _next(err);
    }
  },

  async getAllSocialMedia(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const teacher_user_id = req.query.teacher_user_id
        ? parseInt(req.query.teacher_user_id as string, 10)
        : undefined;
      const site_id = req.query.site_id
        ? parseInt(req.query.site_id as string, 10)
        : undefined;
      const active =
        req.query.active !== undefined
          ? req.query.active === "true"
          : undefined;

      const list = await socialMediaService.getAllSocialMedia({
        teacher_user_id,
        site_id,
        active,
      });
      res.status(200).json({ success: true, results: list.length, data: list });
    } catch (err) {
      _next(err);
    }
  },

  async getSocialMediaById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid social media ID");
      const item = await socialMediaService.getById(id);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      _next(err);
    }
  },

  async updateSocialMedia(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const auth = req.user as any;
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid social media ID");

      const existing = await socialMediaService.getById(id);

      if (
        !(
          auth.role === role_enum.Admin ||
          auth.role === role_enum.SubAdmin ||
          auth.id === existing.teacher_user_id
        )
      ) {
        throw new ForbiddenError(
          "Not authorized to update this social media entry",
        );
      }

      const dto = await validateDto(UpdateSocialMediaDto, req.body);
      if (auth.role === role_enum.Teacher) dto.teacher_user_id = auth.id;

      const updated = await socialMediaService.updateSocialMedia(id, dto);
      res
        .status(200)
        .json({
          success: true,
          message: "Social media updated",
          data: updated,
        });
    } catch (err) {
      _next(err);
    }
  },

  async deleteSocialMedia(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const auth = req.user as any;
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid social media ID");

      const existing = await socialMediaService.getById(id);

      if (
        !(
          auth.role === role_enum.Admin ||
          auth.role === role_enum.SubAdmin ||
          auth.id === existing.teacher_user_id
        )
      ) {
        throw new ForbiddenError(
          "Not authorized to delete this social media entry",
        );
      }

      await socialMediaService.deleteSocialMedia(id);
      res
        .status(200)
        .json({ success: true, message: "Social media entry deleted" });
    } catch (err) {
      _next(err);
    }
  },

  // TeachesAt handlers
  async createTeachesAt(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const auth = req.user as any;
      const dto = await validateDto(CreateTeachesAtDto, req.body);

      if (auth.role === role_enum.Admin || auth.role === role_enum.SubAdmin) {
        if (!dto.user_id)
          throw new BadRequestError(
            "user_id is required when creating on behalf of a user",
          );
      } else if (auth.role === role_enum.Teacher) {
        dto.user_id = auth.id;
      } else {
        throw new ForbiddenError("Not authorized to create teaches_at records");
      }

      const created = await teachesAtService.createTeachesAt(dto);
      res
        .status(201)
        .json({ success: true, message: "TeachesAt created", data: created });
    } catch (err) {
      _next(err);
    }
  },

  async getAllTeachesAt(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const user_id = req.query.user_id
        ? parseInt(req.query.user_id as string, 10)
        : undefined;
      const location_type = req.query.location_type
        ? (req.query.location_type as string)
        : undefined;
      const active =
        req.query.active !== undefined
          ? req.query.active === "true"
          : undefined;

      const list = await teachesAtService.getAllTeachesAt({
        user_id,
        location_type,
        active,
      });
      res.status(200).json({ success: true, results: list.length, data: list });
    } catch (err) {
      _next(err);
    }
  },

  async getTeachesAtById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid ID");
      const item = await teachesAtService.getById(id);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      _next(err);
    }
  },

  async updateTeachesAt(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const auth = req.user as any;
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid ID");

      const existing = await teachesAtService.getById(id);

      if (
        !(
          auth.role === role_enum.Admin ||
          auth.role === role_enum.SubAdmin ||
          auth.id === existing.user_id
        )
      ) {
        throw new ForbiddenError("Not authorized to update this record");
      }

      const dto = await validateDto(UpdateTeachesAtDto, req.body);
      if (auth.role === role_enum.Teacher) dto.user_id = auth.id;

      const updated = await teachesAtService.updateTeachesAt(id, dto);
      res
        .status(200)
        .json({ success: true, message: "TeachesAt updated", data: updated });
    } catch (err) {
      _next(err);
    }
  },

  async deleteTeachesAt(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const auth = req.user as any;
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid ID");

      const existing = await teachesAtService.getById(id);

      if (
        !(
          auth.role === role_enum.Admin ||
          auth.role === role_enum.SubAdmin ||
          auth.id === existing.user_id
        )
      ) {
        throw new ForbiddenError("Not authorized to delete this record");
      }

      await teachesAtService.deleteTeachesAt(id);
      res.status(200).json({ success: true, message: "TeachesAt deleted" });
    } catch (err) {
      _next(err);
    }
  },
};
