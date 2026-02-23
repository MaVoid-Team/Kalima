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

  /** POST /fast-buy — Teacher directly buys a product without cart */
  async fastBuy(req: Request, res: Response, next: NextFunction) {
    try {
      // Normalize incoming form-data fields
      if ((req.body as any).paymentMethod !== undefined) {
        (req.body as any).payment_method_id = Number((req.body as any).paymentMethod);
      }
      if ((req.body as any).productId !== undefined) {
        (req.body as any).product_id = Number((req.body as any).productId);
      }
      if (typeof req.body.quantity === "string") {
        req.body.quantity = Number(req.body.quantity);
      }

      const dto = await validateDto(
        (await import("../dtos/cart.dto")).FastBuyDto,
        req.body
      );

      const userId = (req.user as any).userId;
      
      // Handle Multer files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const paymentScreenshot = files?.["payment_screenshot"]?.[0] || req.file; // Fallback to req.file if single upload
      const productImage = files?.["product_image"]?.[0]; // If product required field needs an image

      const purchase = await purchasesService.fastBuy(
        userId,
        dto.product_id,
        dto.quantity,
        dto, // FastBuyDto extends CheckoutDto
        paymentScreenshot as Express.Multer.File,
        productImage as Express.Multer.File | undefined,
      );

      res.status(201).json({
        success: true,
        message: "Purchase created successfully",
        data: { purchase },
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
        dto.admin_notes,
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
