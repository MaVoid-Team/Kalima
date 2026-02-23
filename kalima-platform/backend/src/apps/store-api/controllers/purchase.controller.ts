import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { purchasesService } from "../services/purchases.service";
import { AdminNoteDto, PurchaseFilterDto } from "../dtos/purchase.dto";
import { ValidationError, BadRequestError } from "../../../libs/errors";

// ---------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------
async function validateDto<T extends object>(
  DtoClass: new () => T,
  body: unknown,
): Promise<T> {
  const dto = plainToInstance(DtoClass, body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
    throw new ValidationError(msgs);
  }
  return dto;
}

function parseIntParam(
  value: string | string[] | undefined,
  name: string,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (!raw || Number.isNaN(parsed) || parsed <= 0) {
    throw new BadRequestError(`Invalid ${name}`);
  }
  return parsed;
}

// ---------------------------------------------------------------
// Controller
// ---------------------------------------------------------------
export const purchaseController = {
  // ---- Admin / SubAdmin ----

  /** GET / — admin paginated list with search & filters */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(PurchaseFilterDto, req.query);
      const result = await purchasesService.getAll({
        status: dto.status,
        search: dto.search,
        startDate: dto.startDate,
        endDate: dto.endDate,
        minTotal: dto.minTotal,
        maxTotal: dto.maxTotal,
        page: dto.page || 1,
        limit: dto.limit || 10,
      });
      res.status(200).json({
        success: true,
        results: result.purchases.length,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
          limit: result.limit,
        },
        data: { purchases: result.purchases },
      });
    } catch (err) {
      next(err);
    }
  },

  /** GET /:id — single purchase by ID */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params.id, "purchase ID");
      const purchase = await purchasesService.getById(id);
      res.status(200).json({ success: true, data: { purchase } });
    } catch (err) {
      next(err);
    }
  },

  // ---- Teacher ----

  /** GET /my — teacher's own purchases */
  async getMyPurchases(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).userId;
      const purchases = await purchasesService.getByUser(userId);
      res.status(200).json({
        success: true,
        results: purchases.length,
        data: { purchases },
      });
    } catch (err) {
      next(err);
    }
  },

  // ---- Status transitions (Admin / SubAdmin) ----

  /** PATCH /:id/receive — pending → received */
  async receive(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params.id, "purchase ID");
      const adminId = (req.user as any).userId;
      const purchase = await purchasesService.receive(id, adminId);
      res.status(200).json({
        success: true,
        message: "Purchase marked as received",
        data: { purchase },
      });
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /:id/confirm — received|returned → confirmed */
  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params.id, "purchase ID");
      const adminId = (req.user as any).userId;
      const purchase = await purchasesService.confirm(id, adminId);
      res.status(200).json({
        success: true,
        message: "Purchase confirmed successfully",
        data: { purchase },
      });
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /:id/return — received|confirmed → returned */
  async returnPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params.id, "purchase ID");
      const adminId = (req.user as any).userId;
      const purchase = await purchasesService.returnPurchase(id, adminId);
      res.status(200).json({
        success: true,
        message: "Purchase returned successfully",
        data: { purchase },
      });
    } catch (err) {
      next(err);
    }
  },

  // ---- Admin operations ----

  /** PATCH /:id/admin-note — set admin notes */
  async addAdminNote(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params.id, "purchase ID");
      const dto = await validateDto(AdminNoteDto, req.body);
      const adminId = (req.user as any).userId;
      const purchase = await purchasesService.addAdminNote(
        id,
        dto.admin_notes || dto.adminNote || "",
        adminId,
      );
      res.status(200).json({
        success: true,
        data: { purchase },
      });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /:id — hard delete */
  async deletePurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseIntParam(req.params.id, "purchase ID");
      await purchasesService.deletePurchase(id);
      res.status(200).json({
        success: true,
        message: "Purchase deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /:id/items/:itemId — remove single item */
  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const purchaseId = parseIntParam(req.params.id, "purchase ID");
      const itemId = parseIntParam(req.params.itemId, "item ID");
      const purchase = await purchasesService.deleteItem(purchaseId, itemId);
      res.status(200).json({
        success: true,
        message: "Item removed from purchase",
        data: { purchase },
      });
    } catch (err) {
      next(err);
    }
  },
};
