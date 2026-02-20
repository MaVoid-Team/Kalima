import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { sitesService } from "../services/sites.service";
import { CreateSiteDto, UpdateSiteDto } from "../dtos/site.dto";
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

export const sitesController = {
  async createSite(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(CreateSiteDto, req.body);
      const s = await sitesService.createSite(dto);
      res
        .status(201)
        .json({ success: true, message: "Site created successfully", data: s });
    } catch (err) {
      _next(err);
    }
  },

  async getAllSites(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const active =
        req.query.active !== undefined
          ? req.query.active === "true"
          : undefined;
      const list = await sitesService.getAllSites({ active });
      res.status(200).json({ success: true, results: list.length, data: list });
    } catch (err) {
      _next(err);
    }
  },

  async getSiteById(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid site ID");
      const s = await sitesService.getSiteById(id);
      res.status(200).json({ success: true, data: s });
    } catch (err) {
      _next(err);
    }
  },

  async updateSite(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid site ID");
      const dto = await validateDto(UpdateSiteDto, req.body);
      const updated = await sitesService.updateSite(id, dto);
      res
        .status(200)
        .json({
          success: true,
          message: "Site updated successfully",
          data: updated,
        });
    } catch (err) {
      _next(err);
    }
  },

  async deleteSite(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid site ID");
      await sitesService.deleteSite(id);
      res
        .status(200)
        .json({ success: true, message: "Site deleted successfully" });
    } catch (err) {
      _next(err);
    }
  },
};
