import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { governmentService } from "../services/government.service";
import { zonesService } from "../services/zones.service";
import {
  CreateGovernmentDto,
  UpdateGovernmentDto,
} from "../dtos/government.dto";
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

export const governmentController = {
  async createGovernment(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(CreateGovernmentDto, req.body);
      const g = await governmentService.createGovernment(dto);
      res
        .status(201)
        .json({
          success: true,
          message: "Government created successfully",
          data: g,
        });
    } catch (err) {
      _next(err);
    }
  },

  async getAllGovernments(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const active =
        req.query.active !== undefined
          ? req.query.active === "true"
          : undefined;
      const list = await governmentService.getAllGovernments({ active });
      res.status(200).json({ success: true, results: list.length, data: list });
    } catch (err) {
      _next(err);
    }
  },

  async getGovernmentById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid government ID");

      const g = await governmentService.getGovernmentById(id);
      res.status(200).json({ success: true, data: g });
    } catch (err) {
      _next(err);
    }
  },

  async updateGovernment(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid government ID");

      const dto = await validateDto(UpdateGovernmentDto, req.body);
      const updated = await governmentService.updateGovernment(id, dto);
      res
        .status(200)
        .json({
          success: true,
          message: "Government updated successfully",
          data: updated,
        });
    } catch (err) {
      _next(err);
    }
  },

  async deleteGovernment(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid government ID");

      await governmentService.deleteGovernment(id);
      res
        .status(200)
        .json({ success: true, message: "Government deleted successfully" });
    } catch (err) {
      _next(err);
    }
  },

  // Convenience: expose zones-by-government via this controller (delegates to zonesController)
  async getZonesForGovernment(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    const govId = parseInt(
      (req.params.governmentId || req.params.id) as string,
      10,
    );
    if (isNaN(govId)) throw new BadRequestError("Invalid government ID");

    const list = await zonesService.getZonesByGovernment(govId);
    res.status(200).json({ success: true, results: list.length, data: list });
  },
};
