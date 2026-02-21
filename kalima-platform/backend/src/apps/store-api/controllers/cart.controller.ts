import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { cartService } from "../services/cart.service";
import { CheckoutDto, AddCartItemDto, UpdateCartItemDto, UpdateCartItemRequiredFieldsDto } from "../dtos/cart.dto";
import { ValidationError, BadRequestError } from "../../../libs/errors";

async function validateDto<T extends object>(DtoClass: new () => T, body: unknown): Promise<T> {
  const dto = plainToInstance(DtoClass, body);
  const validationErrors = await validate(dto);
  if (validationErrors.length > 0) {
    const errors = validationErrors.flatMap((err) => Object.values(err.constraints || {}));
    throw new ValidationError(errors);
  }
  return dto;
}

export const cartController = {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).userId;
      const cart = await cartService.getActiveCartByUser(userId);
      res.status(200).json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  },

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      // normalize incoming names (frontend may send productId)
      if ((req.body as any).productId !== undefined) (req.body as any).product_id = Number((req.body as any).productId);

      const dto = await validateDto(AddCartItemDto, req.body);
      const file = req.file as Express.Multer.File | undefined;
      const userId = (req.user as any).userId;
      const item = await cartService.addItemToCart(userId, dto, file);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  },

  async updateItemQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      (req.body as any).cart_item_id = Number(req.params.itemId);
      const dto = await validateDto(UpdateCartItemDto, req.body);
      const userId = (req.user as any).userId;
      const updated = await cartService.updateCartItem(userId, dto);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async removeFromCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).userId;
      const itemId = Number(req.params.itemId);
      await cartService.removeItemFromCart(userId, itemId);
      res.status(200).json({ success: true, message: "Item removed from cart" });
    } catch (err) {
      next(err);
    }
  },

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).userId;
      const cart = await cartService.clearCart(userId);
      res.status(200).json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  },

  async applyCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { couponCode, itemId } = req.body;
      if (!couponCode || !itemId) throw new BadRequestError("couponCode and itemId are required");
      const userId = (req.user as any).userId;
      await cartService.applyCouponToCartItem(userId, Number(itemId), couponCode);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async removeCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).userId;
      const itemId = Number(req.params.itemId);
      await cartService.removeCouponFromCartItem(userId, itemId);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async updateCartItemRequiredFields(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file as Express.Multer.File | undefined;
      const dto = await validateDto(UpdateCartItemRequiredFieldsDto, req.body);
      const userId = (req.user as any).userId;
      await cartService.updateCartItemRequiredFields(userId, dto, file);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  },

  async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      // normalize incoming names
      if ((req.body as any).paymentMethod !== undefined) (req.body as any).payment_method_id = Number((req.body as any).paymentMethod);

      const dto = await validateDto(CheckoutDto, req.body);
      const file = req.file as Express.Multer.File | undefined; // payment screenshot
      const userId = (req.user as any).userId;
      const result = await cartService.checkout(userId, dto, file as any);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async getCheckoutPreview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).userId;
      const cart = await cartService.getActiveCartByUser(userId);
      const hasBooks = cart.cart_items.some((i: any) => i.products?.type === "Book");
      const requiredFields = {
        common: ["numberTransferredFrom", "paymentScreenShot"],
        books: hasBooks ? ["nameOnBook", "numberOnBook", "seriesName"] : [],
      };
      res.status(200).json({ success: true, data: { hasBooks, requiredFields } });
    } catch (err) {
      next(err);
    }
  },
};