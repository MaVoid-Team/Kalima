/**
 * Generic export controller factory.
 *
 * Usage in route files:
 *   router.get("/export", makeExportHandler("products"));
 *
 * Query params accepted:
 *   format  – "csv" | "xlsx" (required)
 *   ids     – comma-separated integers (optional, for selected rows)
 */

import { Request, Response, NextFunction } from "express";
import { exportResource, type ExportFormat } from "./export.service";
import { BadRequestError } from "../../../libs/errors";

const VALID_FORMATS = new Set<ExportFormat>(["csv", "xlsx"]);

function parseIds(raw: unknown): number[] | undefined {
  if (!raw || typeof raw !== "string" || raw.trim() === "") return undefined;

  const ids = raw.split(",").map((s) => {
    const n = Number(s.trim());
    if (!Number.isInteger(n) || n <= 0) {
      throw new BadRequestError(`Invalid ID value: "${s.trim()}"`);
    }
    return n;
  });

  if (ids.length === 0) return undefined;
  return ids;
}

/**
 * Returns an Express handler that exports the given resource.
 */
export function makeExportHandler(resourceName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = (req.query.format as string)?.toLowerCase();
      if (!format || !VALID_FORMATS.has(format as ExportFormat)) {
        throw new BadRequestError(
          'Query parameter "format" is required and must be "csv" or "xlsx".',
        );
      }

      const ids = parseIds(req.query.ids);

      const result = await exportResource(
        resourceName,
        format as ExportFormat,
        ids,
      );

      res.setHeader("Content-Type", result.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.filename}"`,
      );
      res.send(result.buffer);
    } catch (err) {
      next(err);
    }
  };
}
