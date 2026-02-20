import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { BadRequestError, NotFoundError } from "../../../libs/errors";
import {
  CreateCartDto,
  AddCartItemDto,
  UpdateCartItemDto,
  CheckoutDto,
  UpdateCartItemRequiredFieldsDto,
} from "../dtos/cart.dto";
import { imageService } from "./image.service";
import { purchasesService } from "./purchases.service";
import { userManagementService } from "./user-management.service";
import { addPurchaseEvent } from "./notificationStream.service";
import {
  getCachedCart,
  setCachedCart,
  invalidateCartCache,
} from "./cartCache.service";
import { validatePaymentForCheckout } from "./checkout-validation.service";
import type { Prisma } from "../generated/prisma";
import type { CreatePurchaseDto } from "../dtos/purchase.dto";

// Typed payloads from Prisma for cart items/purchases
type CartItemWithRelations = Prisma.cart_itemsGetPayload<{
  include: { products: true; cart_item_required_fields: true };
}>;
type CartWithItems = Prisma.cartsGetPayload<{
  include: {
    cart_items: { include: { products: true; cart_item_required_fields: true } };
  };
}>;

// FieldType enum (kept as literal union so we don't rely on generated enum export)
type FieldType = "text" | "number" | "date" | "image";

// minimal shape used by calculators (accepts Decimal or number)
type CalcCartItem = {
  price_at_add: number | Prisma.Decimal;
  quantity: number;
  discount?: number | Prisma.Decimal | null;
  coupon_id?: number | null;
  required_fields?: { field_definition_id: number; value: string }[];
};

class CartService {
  // ============================================
  // APPLY COUPON TO CART ITEM
  // ============================================
  async applyCouponToCartItem(
    user_id: number,
    cart_item_id: number,
    coupon_code: string,
  ) {
    // 1. Validate cart and cart item
    const cart = await this.getActiveCartByUser(user_id);
    const cartItem = await this.db.cart_items.findUnique({
      where: { id: cart_item_id },
      select: {
        id: true,
        discount: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        cart_id: true,
        product_id: true,
        quantity: true,
        price_at_add: true,
        final_price: true,
        required_fields_filled: true,
        coupon_id: true,
      },
    });
    if (!cartItem || cartItem.cart_id !== cart.id) {
      throw new NotFoundError("Cart item not found in user's cart");
    }

    // 2. Validate coupon (active, date range, not already used by this user)
    const { couponService } = await import("./coupon.service");
    const { isValid, coupon } = await couponService.validateCoupon(
      coupon_code,
      user_id,
    );
    if (!isValid) throw new BadRequestError("Invalid coupon code");

    // 3. Ensure coupon is not already used on another item in this cart
    const usedOnOther = await this.db.cart_items.findFirst({
      where: {
        cart_id: cart.id,
        id: { not: cart_item_id },
        coupon_id: coupon.id,
      },
    });
    if (usedOnOther) {
      throw new BadRequestError(
        "This coupon is already applied to another item in your cart",
      );
    }

    // 4. Ensure this item does not already have a coupon
    if (cartItem.coupon_id) {
      throw new BadRequestError(
        "This item already has a coupon applied. Remove it first before applying a new one.",
      );
    }

    // 5. Apply coupon to the item (set coupon_id, discount)
    let discount = 0;
    if (coupon.discount_amount && coupon.discount_amount.toNumber() > 0) {
      discount = coupon.discount_amount.toNumber();
    } else if (coupon.discount_percentage && coupon.discount_percentage > 0) {
      discount = Math.floor(
        Number(cartItem.price_at_add) *
          cartItem.quantity *
          (coupon.discount_percentage / 100),
      );
    }

    await this.db.cart_items.update({
      where: { id: cart_item_id },
      data: {
        coupon_id: coupon.id,
        discount,
      },
    });

    // Update cart totals after applying coupon
    // Re-fetch all cart items for this cart (excluding deleted)
    const updatedCartItems = await this.db.cart_items.findMany({
      where: { cart_id: cart.id, deleted_at: null },
    });
    const subtotal = this.#calculateSubtotal(updatedCartItems);
    const discountTotal = this.#calculateDiscount(updatedCartItems);
    const total = this.#calculateTotal(subtotal, discountTotal);
    await this.db.carts.update({
      where: { id: cart.id },
      data: { subtotal, discount: discountTotal, total },
    });

    await invalidateCartCache(user_id);
    return { success: true };
  }
  constructor(private db: PrismaClient = prisma) {}

  // ============================================
  // CREATE CART
  // ============================================
  async createCart(dto: CreateCartDto) {
    const existing = await this.db.carts.findFirst({
      where: { user_id: dto.user_id, status: "active" },
    });
    if (existing) {
      throw new BadRequestError("User already has an active cart");
    }
    return this.db.carts.create({
      data: { user_id: dto.user_id, status: "active" },
    });
  }

  // ============================================
  // GET CART BY USER (with Redis read-through cache)
  // ============================================
  async getActiveCartByUser(user_id: number): Promise<CartWithItems> {
    const cached = await getCachedCart<CartWithItems>(user_id);
    if (cached) return cached;

    const cart = await this.db.carts.findFirst({
      where: { user_id, status: "active" },
      include: {
        cart_items: {
          include: {
            products: true,
            cart_item_required_fields: true,
          },
        },
      },
    });
    if (!cart) throw new NotFoundError("Active cart not found");
    const result = cart as CartWithItems;
    await setCachedCart(user_id, result);
    return result;
  }

  // ============================================
  // ADD ITEM TO CART
  // ============================================
  async addItemToCart(
    user_id: number,
    dto: AddCartItemDto,
    file?: Express.Multer.File,
  ) {
    let cart = null;
    try {
      cart = await this.getActiveCartByUser(user_id);
    } catch (err) {
      if (err instanceof NotFoundError) {
        cart = await this.createCart({ user_id });
      } else {
        throw err;
      }
    }
    // Validate product exists
    const product = await this.db.products.findUnique({
      where: { id: dto.product_id },
    });
    if (!product) throw new NotFoundError("Product not found");

    // Check if item already exists in cart
    let cartItem = await this.db.cart_items.findFirst({
      where: { cart_id: cart.id, product_id: dto.product_id, deleted_at: null },
    });
    if (cartItem) {
      // Update quantity
      cartItem = await this.db.cart_items.update({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity + dto.quantity },
      });
    } else {
      // Create new cart item
      cartItem = await this.db.cart_items.create({
        data: {
          cart_id: cart.id,
          product_id: dto.product_id,
          quantity: dto.quantity,
          price_at_add: product.price,
          final_price: product.price, // TODO: handle discounts if needed
        },
      });
    }

    // Handle required fields (including image upload)
    if (dto.required_fields && dto.required_fields.length > 0) {
      // preload definitions for proper type-based handling (no `any`)
      const defIds = dto.required_fields.map(
        (x) => x.required_field_definition_id,
      );
      const defs = await this.db.required_field_definitions.findMany({
        where: { id: { in: defIds } },
        select: { id: true, field_type: true },
      });
      const defMap = new Map<number, FieldType>();
      for (const d of defs) defMap.set(d.id, d.field_type as FieldType);

      await this.db.cart_item_required_fields.deleteMany({
        where: { cart_item_id: cartItem.id },
      });
      for (const f of dto.required_fields) {
        let value = f.value;
        const fieldType = defMap.get(f.required_field_definition_id);
        if (fieldType === "image" && file) {
          const image = await imageService.uploadImage(file, {
            compress: true,
            quality: 80,
          });
          value = image.id.toString();
        }
        await this.db.cart_item_required_fields.create({
          data: {
            cart_item_id: cartItem.id,
            field_definition_id: f.required_field_definition_id,
            value,
          },
        });
      }
    }
    await invalidateCartCache(user_id);
    return cartItem;
  }

  // ============================================
  // REMOVE ITEM FROM CART
  // ============================================
  async removeItemFromCart(user_id: number, cart_item_id: number) {
    const cart = await this.getActiveCartByUser(user_id);
    const cartItem = await this.db.cart_items.findUnique({
      where: { id: cart_item_id },
    });
    if (!cartItem || cartItem.cart_id !== cart.id) {
      throw new NotFoundError("Cart item not found in user's cart");
    }

    await this.db.cart_items.delete({ where: { id: cart_item_id } });

    // Recalculate cart totals and persist
    const updatedCartItems = await this.db.cart_items.findMany({
      where: { cart_id: cart.id, deleted_at: null },
    });
    const subtotal = this.#calculateSubtotal(updatedCartItems);
    const discountTotal = this.#calculateDiscount(updatedCartItems);
    const total = this.#calculateTotal(subtotal, discountTotal);
    await this.db.carts.update({
      where: { id: cart.id },
      data: { subtotal, discount: discountTotal, total },
    });

    await invalidateCartCache(user_id);
    return { success: true };
  }

  // ============================================
  // REMOVE COUPON FROM CART ITEM
  // ============================================
  async removeCouponFromCartItem(user_id: number, cart_item_id: number) {
    const cart = await this.getActiveCartByUser(user_id);
    const cartItem = await this.db.cart_items.findUnique({
      where: { id: cart_item_id },
    });
    if (!cartItem || cartItem.cart_id !== cart.id)
      throw new NotFoundError("Cart item not found in user's cart");

    await this.db.cart_items.update({
      where: { id: cart_item_id },
      data: { coupon_id: null, discount: 0 },
    });

    const updatedCartItems = await this.db.cart_items.findMany({
      where: { cart_id: cart.id, deleted_at: null },
    });
    const subtotal = this.#calculateSubtotal(updatedCartItems);
    const discountTotal = this.#calculateDiscount(updatedCartItems);
    const total = this.#calculateTotal(subtotal, discountTotal);
    await this.db.carts.update({
      where: { id: cart.id },
      data: { subtotal, discount: discountTotal, total },
    });

    await invalidateCartCache(user_id);
    return { success: true };
  }

  // ============================================
  // UPDATE ITEM QUANTITY
  // ============================================
  async updateCartItem(user_id: number, dto: UpdateCartItemDto) {
    const cart = await this.getActiveCartByUser(user_id);
    const cartItem = await this.db.cart_items.findUnique({
      where: { id: dto.cart_item_id },
    });
    if (!cartItem || cartItem.cart_id !== cart.id) {
      throw new NotFoundError("Cart item not found in user's cart");
    }
    const updated = await this.db.cart_items.update({
      where: { id: dto.cart_item_id },
      data: { quantity: dto.quantity },
    });
    await invalidateCartCache(user_id);
    return updated;
  }

  // ============================================
  // CLEAR CART
  // ============================================
  async clearCart(user_id: number) {
    const cart = await this.getActiveCartByUser(user_id);
    await this.db.cart_items.deleteMany({ where: { cart_id: cart.id } });
    await invalidateCartCache(user_id);
    return this.getActiveCartByUser(user_id);
  }

  // ============================================
  // CHECKOUT
  // ============================================
  async checkout(
    user_id: number,
    dto: CheckoutDto,
    payment_screenshot_file: Express.Multer.File,
  ) {
    // 1. Validate cart
    const cart = await this.getActiveCartByUser(user_id);
    if (!cart.cart_items.length) {
      throw new BadRequestError("Cart is empty");
    }

    // 2. Validate required fields (payment, etc.)
    // For each cart item, ensure all required fields for the product are filled
    for (const item of cart.cart_items) {
      const requiredFields = await this.db.product_required_fields.findMany({
        where: { product_id: item.product_id, is_required: true, active: true },
        select: { field_definition_id: true },
      });
      if (requiredFields.length > 0) {
        const filledFields = await this.db.cart_item_required_fields.findMany({
          where: { cart_item_id: item.id },
          select: { field_definition_id: true },
        });
        const filledSet = new Set(
          filledFields.map((f) => f.field_definition_id),
        );
        const missing = requiredFields.filter(
          (rf) => !filledSet.has(rf.field_definition_id),
        );
        if (missing.length > 0) {
          throw new BadRequestError(
            `Cart item for product ${item.product_id} is missing required fields: ` +
              missing.map((m) => m.field_definition_id).join(", "),
          );
        }
      }
    }

    // 3. Calculate totals (subtotal, discount, total, item count)
    const subtotal = this.#calculateSubtotal(cart.cart_items);
    const discount = this.#calculateDiscount(cart.cart_items);
    const total = this.#calculateTotal(subtotal, discount);
    const itemCount = this.#calculateItemCount(cart.cart_items);

    // 4. Validate payment method, process payment, handle payment screenshot
    if (!dto.payment_method_id) {
      throw new BadRequestError("Payment method is required");
    }

    if (!payment_screenshot_file) {
      throw new BadRequestError("Payment screenshot is required");
    }
    const paymentScreenshot = await imageService.uploadImage(
      payment_screenshot_file,
      { compress: true, quality: 80 },
    );
    const payment_screenshot_id = paymentScreenshot.id;

    const paymentMethod = await validatePaymentForCheckout(this.db, {
      total,
      numberTransferredFrom: dto.numberTransferredFrom,
      payment_method_id: dto.payment_method_id,
    });

    // 5. Assemble purchase payload (typed)
    const purchaseInput: CreatePurchaseDto = {
      user_id,
      payment_method_id: dto.payment_method_id,
      payment_screenshot_id,
      items: cart.cart_items.map((item) => ({
        product_id: item.product_id,
        price_at_purchase: Number(item.price_at_add) * item.quantity,
        discount: Number(item.discount || 0),
        required_fields: (item.cart_item_required_fields || []).map((rf) => ({
          field_definition_id: rf.field_definition_id,
          value: rf.value,
        })),
      })),
      subtotal,
      discount,
      total,
      notes: dto.notes,
      number_transferred_from: dto.numberTransferredFrom || null,
      payment_number: paymentMethod?.phone_number || null,
    };

    type PurchaseWithItems = Prisma.purchasesGetPayload<{
      include: {
        purchase_items: { include: { purchase_item_required_fields: true } };
      };
    }>;

    let createdPurchase: PurchaseWithItems | null = null;

    // 6. Transaction: create purchase, mark coupons, update analytics, clear cart
    await this.db.$transaction(async (tx) => {
      createdPurchase = await purchasesService.createPurchase(
        purchaseInput,
        tx as unknown as PrismaClient,
      );

      for (const item of cart.cart_items) {
        const couponId = (item as { coupon_id?: number | null }).coupon_id;
        if (couponId) {
          const coupon = await tx.coupons.findUnique({ where: { id: couponId } });
          if (coupon && coupon.active) {
            await tx.coupons.update({ where: { id: coupon.id }, data: { active: false, updated_at: new Date() } });
          }
        }
      }

      // update analytics via user-management service (keeps user-related logic consolidated)
      await userManagementService.incrementUserAnalytics(
        user_id,
        Number(total),
        itemCount,
        tx as unknown as PrismaClient,
      );

      await tx.carts.update({
        where: { id: cart.id },
        data: {
          status: "checked_out",
          subtotal,
          discount,
          total,
        },
      });
      await tx.cart_items.deleteMany({ where: { cart_id: cart.id } });
    });

    await invalidateCartCache(user_id);

    if (createdPurchase) {
      const user = await this.db.users.findUnique({
        where: { id: user_id },
        select: { name: true },
      });
      addPurchaseEvent({
        purchase_id: createdPurchase.id,
        purchase_serial: createdPurchase.purchase_serial ?? "",
        user_id,
        total: Number(total),
        item_count: itemCount,
        customer_name: user?.name ?? "Customer",
      }).catch((err) =>
        console.error("[Cart] Failed to publish purchase notification:", err)
      );
    }

    return {
      success: true,
      purchase: createdPurchase,
      subtotal,
      discount,
      total,
      itemCount,
    };
  }

  // ============================================
  // PRIVATE CALCULATION METHODS
  // ============================================
  #calculateSubtotal(cartItems: CalcCartItem[]): number {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price_at_add) * item.quantity,
      0,
    );
  }

  #calculateDiscount(cartItems: CalcCartItem[]): number {
    // Assumes each item has a discount field (0 if none)
    return cartItems.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  }

  #calculateTotal(subtotal: number, discount: number): number {
    return Math.max(0, subtotal - discount);
  }

  #calculateItemCount(cartItems: CalcCartItem[]): number {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ============================================
  // UPDATE REQUIRED FIELDS FOR CART ITEM
  // ============================================
  async updateCartItemRequiredFields(
    user_id: number,
    dto: UpdateCartItemRequiredFieldsDto,
    file?: Express.Multer.File,
  ) {
    const cartItem = await this.db.cart_items.findUnique({
      where: { id: dto.cart_item_id },
    });
    if (!cartItem) throw new NotFoundError("Cart item not found");
    const cart = await this.getActiveCartByUser(user_id);
    if (cartItem.cart_id !== cart.id)
      throw new BadRequestError("Cart item does not belong to user's cart");
    // preload definitions to determine if any required field expects an image
    const defIds = dto.required_fields.map((x) => x.required_field_definition_id);
    const defs = await this.db.required_field_definitions.findMany({ where: { id: { in: defIds } }, select: { id: true, field_type: true } });
      const defMap = new Map<number, FieldType>();
      for (const d of defs) defMap.set(d.id, d.field_type as FieldType);
    await this.db.cart_item_required_fields.deleteMany({ where: { cart_item_id: dto.cart_item_id } });
    for (const f of dto.required_fields) {
      let value = f.value;
      const fieldType = defMap.get(f.required_field_definition_id);
      if (fieldType === "image" && file) {
        const image = await imageService.uploadImage(file, { compress: true, quality: 80 });
        value = image.id.toString();
      }
      await this.db.cart_item_required_fields.create({
        data: {
          cart_item_id: dto.cart_item_id,
          field_definition_id: f.required_field_definition_id,
          value,
        },
      });
    }
    await invalidateCartCache(user_id);
    return { success: true };
  }
}

export const cartService = new CartService();
export default CartService;
