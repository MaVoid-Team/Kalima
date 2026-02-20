import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { BadRequestError, NotFoundError } from "../../../libs/errors";
import { CreatePurchaseDto, CreatePurchaseItemDto } from "../dtos/purchase.dto";
import { userManagementService } from "./user-management.service";
import { imageService } from "./image.service";
import type { Prisma } from "../generated/prisma/client";
import type { CheckoutDto } from "../dtos/cart.dto";
import { couponService } from "./coupon.service";
import { validatePaymentForCheckout } from "./checkout-validation.service";

class PurchasesService {
  constructor(private db: PrismaClient = prisma) {}

  // -----------------------------
  // Helpers
  // -----------------------------
  private buildUserSerialFrom(userRecord: {
    mongo_id?: string;
    id: number;
  }): string {
    if (userRecord.mongo_id && userRecord.mongo_id.length >= 8) {
      return userRecord.mongo_id.slice(-8).toUpperCase();
    }
    return userRecord.id.toString().slice(-8).toUpperCase();
  }

  private async generatePurchaseSerial(
    client: PrismaClient,
    userSerial: string,
  ): Promise<string> {
    const now = new Date();
    const yyyy = now.getFullYear().toString();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const formattedDate = `${yyyy}${mm}${dd}`;

    const last = await client.purchases.findFirst({
      where: {
        purchase_serial: { startsWith: `${userSerial}-CP-${formattedDate}-` },
      },
      orderBy: { purchase_serial: "desc" },
    });

    let seq = 1;
    if (last && last.purchase_serial) {
      const parts = last.purchase_serial.split("-");
      const lastSeq = parseInt(parts.pop() || "0", 10);
      if (!Number.isNaN(lastSeq)) seq = lastSeq + 1;
    }

    const formattedSeq = String(seq).padStart(3, "0");
    return `${userSerial}-CP-${formattedDate}-${formattedSeq}`;
  }

  // -----------------------------
  // Core persistence (typed)
  // -----------------------------
  async createPurchase(input: CreatePurchaseDto, txClient?: PrismaClient) {
    // run inside provided transaction or start a new one
    if (!txClient) {
      return this.db.$transaction(async (tx) =>
        this.createPurchase(input, tx as unknown as PrismaClient),
      );
    }

    const client = txClient;

    // Validate user via user-management.service (use service as canonical source)
    const user = await userManagementService.findUserById(input.user_id);
    if (!user) throw new NotFoundError("User not found");

    // Validate payment method
    const paymentMethod = await client.payment_methods.findUnique({
      where: { id: input.payment_method_id },
    });
    if (!paymentMethod || paymentMethod.status !== true)
      throw new BadRequestError("Invalid or inactive payment method");

    // Validate payment screenshot exists
    const screenshot = await client.images.findUnique({
      where: { id: input.payment_screenshot_id },
    });
    if (!screenshot) throw new BadRequestError("Payment screenshot not found");

    // Generate purchase serial
    const userSerial = this.buildUserSerialFrom({
      mongo_id: user.mongo_id ?? undefined,
      id: user.id,
    });
    const purchaseSerial = await this.generatePurchaseSerial(
      client,
      userSerial,
    );

    // Persist purchase
    const created = await client.purchases.create({
      data: {
        user_id: input.user_id,
        payment_method_id: input.payment_method_id,
        payment_screenshot_id: input.payment_screenshot_id,
        subtotal: input.subtotal,
        discount: input.discount,
        total: input.total,
        notes: input.notes,
        number_transferred_from: input.number_transferred_from,
        payment_number: input.payment_number,
        purchase_serial: purchaseSerial,
      },
    });

    // Persist items + required fields
    for (const item of input.items) {
      const purchaseItem = await client.purchase_items.create({
        data: {
          purchase_id: created.id,
          product_id: item.product_id,
          price_at_purchase: item.price_at_purchase,
          discount: item.discount,
        },
      });

      if (item.required_fields && item.required_fields.length > 0) {
        await client.purchase_item_required_fields.createMany({
          data: item.required_fields.map((rf) => ({
            purchase_item_id: purchaseItem.id,
            field_definition_id: rf.field_definition_id,
            value: rf.value,
          })),
        });
      }
    }

    // Return fully populated purchase
    const result = await client.purchases.findUnique({
      where: { id: created.id },
      include: {
        purchase_items: { include: { purchase_item_required_fields: true } },
      },
    });

    return result;
  }

  // -----------------------------
  // Create purchase directly from an active cart (does NOT clear cart or mark coupons)
  // Useful for services/controllers that need to persist a purchase based on the cart payload
  // -----------------------------
  async createPurchaseFromCart(
    user_id: number,
    input: {
      payment_method_id: number;
      payment_screenshot_id: number;
      number_transferred_from?: string;
      notes?: string;
    },
    txClient?: PrismaClient,
  ) {
    const client = txClient ?? this.db;

    // load active cart with relations
    type CartWithItems = Prisma.cartsGetPayload<{
      include: { cart_items: { include: { cart_item_required_fields: true } } };
    }>;
    const cart = (await client.carts.findFirst({
      where: { user_id, status: "active" },
      include: { cart_items: { include: { cart_item_required_fields: true } } },
    })) as CartWithItems | null;
    if (!cart || !cart.cart_items || cart.cart_items.length === 0)
      throw new BadRequestError("Active cart is empty");

    // build purchase DTO from cart
    const items: CreatePurchaseItemDto[] = cart.cart_items.map((ci) => ({
      product_id: ci.product_id,
      price_at_purchase: Number(ci.price_at_add),
      discount: Number(ci.discount || 0),
      required_fields: (ci.cart_item_required_fields || []).map((rf) => ({
        field_definition_id: rf.field_definition_id,
        value: rf.value,
      })),
    }));

    const purchaseDto: CreatePurchaseDto = {
      user_id,
      payment_method_id: input.payment_method_id,
      payment_screenshot_id: input.payment_screenshot_id,
      items,
      subtotal: Number(cart.subtotal),
      discount: Number(cart.discount),
      total: Number(cart.total),
      number_transferred_from: input.number_transferred_from || undefined,
      payment_number: undefined,
      notes: input.notes || undefined,
    };

    // delegate to createPurchase (transaction-safe)
    const purchase = await this.createPurchase(purchaseDto, txClient);

    // Record coupon usage for each unique coupon used in this purchase (one-time per user)
    const couponIds = [
      ...new Set(
        cart.cart_items
          .filter((ci) => ci.coupon_id != null)
          .map((ci) => ci.coupon_id as number),
      ),
    ];
    for (const couponId of couponIds) {
      await couponService.recordCouponUsage(
        user_id,
        couponId,
        purchase?.id ?? undefined,
      );
    }

    return purchase;
  }

  // -----------------------------
  // Fast-buy: purchase a single product without mutating user's cart
  // - Validates required fields for product
  // - Uploads payment screenshot via imageService
  // - Persists purchase using createPurchase
  // -----------------------------
  async fastBuy(
    user_id: number,
    product_id: number,
    quantity: number,
    checkout: CheckoutDto,
    payment_screenshot_file: Express.Multer.File,
    txClient?: PrismaClient,
  ) {
    const client = txClient ?? this.db;

    // product exists
    const product = await client.products.findUnique({
      where: { id: product_id },
    });
    if (!product) throw new NotFoundError("Product not found");

    // validate required fields for this product
    const requiredDefs = await client.product_required_fields.findMany({
      where: { product_id: product_id, is_required: true, active: true },
      select: { field_definition_id: true },
    });
    if (requiredDefs.length > 0) {
      const provided = checkout.required_fields || [];
      const providedSet = new Set(
        provided.map((p) => p.required_field_definition_id),
      );
      const missing = requiredDefs.filter(
        (r) => !providedSet.has(r.field_definition_id),
      );
      if (missing.length > 0)
        throw new BadRequestError(
          `Missing required product fields: ${missing.map((m) => m.field_definition_id).join(", ")}`,
        );
    }

    // upload payment screenshot
    if (!payment_screenshot_file) {
      throw new BadRequestError("Payment screenshot is required");
    }
    const screenshot = await imageService.uploadImage(payment_screenshot_file, {
      compress: true,
      quality: 80,
    });

    const unitPrice = Number(product.price);
    const subtotal = unitPrice * quantity;
    const discount = 0;
    const total = Math.max(0, subtotal - discount);

    const paymentMethod = await validatePaymentForCheckout(client, {
      total,
      numberTransferredFrom: checkout.numberTransferredFrom,
      payment_method_id: checkout.payment_method_id,
    });

    // Create one purchase_item per unit (schema has no quantity field)
    const requiredFieldsMapped = (checkout.required_fields || []).map((f) => ({
      field_definition_id: f.required_field_definition_id,
      value: f.value,
    }));
    const items: CreatePurchaseItemDto[] = Array.from(
      { length: quantity },
      () => ({
        product_id: product_id,
        price_at_purchase: unitPrice,
        discount: 0,
        required_fields:
          requiredFieldsMapped.length > 0 ? requiredFieldsMapped : undefined,
      }),
    );

    const purchaseDto: CreatePurchaseDto = {
      user_id,
      payment_method_id: checkout.payment_method_id,
      payment_screenshot_id: screenshot.id,
      items,
      subtotal,
      discount,
      total,
      number_transferred_from: checkout.numberTransferredFrom || undefined,
      payment_number: paymentMethod?.phone_number || undefined,
      notes: checkout.notes || undefined,
    };

    return this.createPurchase(purchaseDto, txClient);
  }
}

export const purchasesService = new PurchasesService();
