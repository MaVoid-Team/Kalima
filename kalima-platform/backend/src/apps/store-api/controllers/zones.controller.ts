import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { zonesService } from "../services/zones.service";
import { CreateZoneDto, UpdateZoneDto } from "../dtos/zone.dto";
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

export const zonesController = {
  async createZone(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(CreateZoneDto, req.body);
      const zone = await zonesService.createZone(dto);
      res
        .status(201)
        .json({
          success: true,
          message: "Zone created successfully",
          data: zone,
        });
    } catch (err) {
      _next(err);
    }
  },

  async getAllZones(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const government_id = req.query.government_id
        ? parseInt(req.query.government_id as string, 10)
        : undefined;
      const active =
        req.query.active !== undefined
          ? req.query.active === "true"
          : undefined;
      const list = await zonesService.getAllZones({ government_id, active });
      res.status(200).json({ success: true, results: list.length, data: list });
    } catch (err) {
      _next(err);
    }
  },

  async getZonesByGovernment(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const govId = parseInt(
        (req.params.governmentId || req.params.id) as string,
        10,
      );
      if (isNaN(govId)) throw new BadRequestError("Invalid government ID");
      const list = await zonesService.getZonesByGovernment(govId);
      res.status(200).json({ success: true, results: list.length, data: list });
    } catch (err) {
      _next(err);
    }
  },

  async getZoneById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid zone ID");
      const z = await zonesService.getZoneById(id);
      res.status(200).json({ success: true, data: z });
    } catch (err) {
      _next(err);
    }
  },

  async updateZone(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid zone ID");
      const dto = await validateDto(UpdateZoneDto, req.body);
      const updated = await zonesService.updateZone(id, dto);
      res
        .status(200)
        .json({
          success: true,
          message: "Zone updated successfully",
          data: updated,
        });
    } catch (err) {
      _next(err);
    }
  },

  async deleteZone(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid zone ID");
      await zonesService.deleteZone(id);
      res
        .status(200)
        .json({ success: true, message: "Zone deleted successfully" });
    } catch (err) {
      _next(err);
    }
  },
};
