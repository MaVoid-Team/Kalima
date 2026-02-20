import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { subjectsService } from "../services/subjects.service";
import { CreateSubjectDto, UpdateSubjectDto } from "../dtos/subject.dto";
import { ValidationError, BadRequestError } from "../../../libs/errors";

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

export const subjectsController = {
  async createSubject(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(CreateSubjectDto, req.body);
      const s = await subjectsService.createSubject(dto);
      res
        .status(201)
        .json({
          success: true,
          message: "Subject created successfully",
          data: s,
        });
    } catch (err) {
      _next(err);
    }
  },

  async getAllSubjects(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const active =
        req.query.active !== undefined
          ? req.query.active === "true"
          : undefined;
      const list = await subjectsService.getAllSubjects({ active });
      res.status(200).json({ success: true, results: list.length, data: list });
    } catch (err) {
      _next(err);
    }
  },

  async getSubjectById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid subject ID");
      const s = await subjectsService.getSubjectById(id);
      res.status(200).json({ success: true, data: s });
    } catch (err) {
      _next(err);
    }
  },

  async updateSubject(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid subject ID");
      const dto = await validateDto(UpdateSubjectDto, req.body);
      const updated = await subjectsService.updateSubject(id, dto);
      res
        .status(200)
        .json({
          success: true,
          message: "Subject updated successfully",
          data: updated,
        });
    } catch (err) {
      _next(err);
    }
  },

  async deleteSubject(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid subject ID");
      await subjectsService.deleteSubject(id);
      res
        .status(200)
        .json({ success: true, message: "Subject deleted successfully" });
    } catch (err) {
      _next(err);
    }
  },
};
