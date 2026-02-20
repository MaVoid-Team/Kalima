import { Request, Response, NextFunction } from "express";
import { sampleService } from "../services/sample.service";
import { BadRequestError } from "../../../libs/errors";

// ============================================
// SAMPLE CONTROLLER
// ============================================

export const sampleController = {
  /**
   * GET /samples
   * Returns all samples
   */
  async getAllSamples(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const samples = await sampleService.getAllSamples();

      res.status(200).json({
        success: true,
        results: samples.length,
        data: samples,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /samples/:id
   * Returns sample by id
   */
  async getSampleById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new BadRequestError("Invalid sample ID");

      const sample = await sampleService.getSampleById(id);

      res.status(200).json({
        success: true,
        data: sample,
      });
    } catch (error) {
      next(error);
    }
  },
};
