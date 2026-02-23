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

/** Standard include shape for purchase queries */
const PURCHASE_INCLUDE = {
  purchase_items: {
    include: {
      purchase_item_required_fields: {
        include: { required_field_definitions: true },
      },
      products: {
        select: {
          id: true,
          title: true,
          serial: true,
          type: true,
          price: true,
          thumbnail_image: { select: { id: true, url: true } },
        },
      },
    },
  },
  users: { select: { id: true, name: true, email: true, phone: true } },
  received_by_user: { select: { id: true, name: true } },
  confirmed_by_user: { select: { id: true, name: true } },
  returned_by_user: { select: { id: true, name: true } },
  payment_methods: { select: { id: true, name: true, phone_number: true } },
  payment_screenshot: { select: { id: true, url: true } },
  watermark: { select: { id: true, url: true } },
  coupon_usages: {
    include: {
      coupons: {
        select: {
          id: true,
          code: true,
          discount_amount: true,
          discount_percentage: true,
        },
      },
    },
  },
} as const;

class PurchasesService {
  constructor(private db: PrismaClient = prisma) {}

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
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

  // ---------------------------------------------------------------
  // Core persistence
  // ---------------------------------------------------------------
  async createPurchase(input: CreatePurchaseDto, txClient?: PrismaClient) {
    if (!txClient) {
      return this.db.$transaction(async (tx) =>
        this.createPurchase(input, tx as unknown as PrismaClient),
      );
    }

    const client = txClient;

    const user = await userManagementService.findUserById(input.user_id);
    if (!user) throw new NotFoundError("User not found");

    const paymentMethod = await client.payment_methods.findUnique({
      where: { id: input.payment_method_id },
    });
    if (!paymentMethod || paymentMethod.status !== true)
      throw new BadRequestError("Invalid or inactive payment method");

    const screenshot = await client.images.findUnique({
      where: { id: input.payment_screenshot_id },
    });
    if (!screenshot) throw new BadRequestError("Payment screenshot not found");

    const userSerial = this.buildUserSerialFrom({
      mongo_id: user.mongo_id ?? undefined,
      id: user.id,
    });
    const purchaseSerial = await this.generatePurchaseSerial(
      client,
      userSerial,
    );

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

    const purchaseItemsData = input.items.map((item) => ({
      purchase_id: created.id,
      product_id: item.product_id,
      price_at_purchase: item.price_at_purchase,
      discount: item.discount,
    }));

    const createdItems = await client.purchase_items.createManyAndReturn({
      data: purchaseItemsData,
    });

    const requiredFieldsData: Array<{
      purchase_item_id: number;
      field_definition_id: number;
      value: string;
    }> = [];
    for (let i = 0; i < input.items.length; i++) {
      const item = input.items[i];
      const purchaseItem = createdItems[i];
      if (item.required_fields?.length && purchaseItem) {
        for (const rf of item.required_fields) {
          requiredFieldsData.push({
            purchase_item_id: purchaseItem.id,
            field_definition_id: rf.field_definition_id,
            value: rf.value,
          });
        }
      }
    }
    if (requiredFieldsData.length > 0) {
      await client.purchase_item_required_fields.createMany({
        data: requiredFieldsData,
      });
    }

    return client.purchases.findUnique({
      where: { id: created.id },
      include: PURCHASE_INCLUDE,
    });
  }

  // ---------------------------------------------------------------
  // Fast-buy (single product, no cart mutation)
  // ---------------------------------------------------------------
  async fastBuy(
    user_id: number,
    product_id: number,
    quantity: number,
    checkout: CheckoutDto,
    payment_screenshot_file: Express.Multer.File,
    txClient?: PrismaClient,
  ) {
    const client = txClient ?? this.db;

    const product = await client.products.findUnique({
      where: { id: product_id },
    });
    if (!product) throw new NotFoundError("Product not found");

    const requiredDefs = await client.product_required_fields.findMany({
      where: { product_id, is_required: true, active: true },
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

    if (!payment_screenshot_file) {
      throw new BadRequestError("Payment screenshot is required");
    }
    const screenshot = await imageService.uploadImage(
      payment_screenshot_file,
      { compress: true, quality: 80 },
    );

    const unitPrice = Number(product.price);
    const subtotal = unitPrice * quantity;
    const discount = 0;
    const total = Math.max(0, subtotal - discount);

    const paymentMethod = await validatePaymentForCheckout(client, {
      total,
      numberTransferredFrom: checkout.numberTransferredFrom,
      payment_method_id: checkout.payment_method_id,
    });

    const requiredFieldsMapped = (checkout.required_fields || []).map((f) => ({
      field_definition_id: f.required_field_definition_id,
      value: f.value,
    }));
    const items: CreatePurchaseItemDto[] = Array.from(
      { length: quantity },
      () => ({
        product_id,
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

  // =============================================================
  // Read operations
  // =============================================================

  /** Admin paginated list with search and filters */
  async getAll(filters: {
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    minTotal?: number;
    maxTotal?: number;
    page: number;
    limit: number;
  }) {
    const { page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.purchasesWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate)
        where.created_at.gte = new Date(filters.startDate);
      if (filters.endDate) where.created_at.lte = new Date(filters.endDate);
    }

    if (filters.minTotal !== undefined || filters.maxTotal !== undefined) {
      where.total = {};
      if (filters.minTotal !== undefined) where.total.gte = filters.minTotal;
      if (filters.maxTotal !== undefined) where.total.lte = filters.maxTotal;
    }

    if (filters.search) {
      const s = filters.search.trim();
      where.OR = [
        { purchase_serial: { contains: s, mode: "insensitive" } },
        {
          number_transferred_from: { contains: s, mode: "insensitive" },
        },
        { users: { name: { contains: s, mode: "insensitive" } } },
        { users: { email: { contains: s, mode: "insensitive" } } },
        { users: { phone: { contains: s, mode: "insensitive" } } },
        {
          purchase_items: {
            some: {
              products: { title: { contains: s, mode: "insensitive" } },
            },
          },
        },
        {
          purchase_items: {
            some: {
              products: { serial: { contains: s, mode: "insensitive" } },
            },
          },
        },
      ];
    }

    const [purchases, total] = await Promise.all([
      this.db.purchases.findMany({
        where,
        include: PURCHASE_INCLUDE,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.purchases.count({ where }),
    ]);

    return { purchases, total, page, pages: Math.ceil(total / limit), limit };
  }

  /** Teacher's own purchases */
  async getByUser(userId: number) {
    return this.db.purchases.findMany({
      where: { user_id: userId },
      include: PURCHASE_INCLUDE,
      orderBy: { created_at: "desc" },
    });
  }

  /** Single purchase by ID */
  async getById(id: number) {
    const purchase = await this.db.purchases.findUnique({
      where: { id },
      include: PURCHASE_INCLUDE,
    });
    if (!purchase) throw new NotFoundError("Purchase not found");
    return purchase;
  }

  // =============================================================
  // Status transitions
  // =============================================================

  /** pending → received */
  async receive(purchaseId: number, adminId: number) {
    const purchase = await this.db.purchases.findUnique({
      where: { id: purchaseId },
    });
    if (!purchase) throw new NotFoundError("Purchase not found");
    if (purchase.status !== "pending") {
      throw new BadRequestError(`Purchase is already ${purchase.status}`);
    }

    return this.db.purchases.update({
      where: { id: purchaseId },
      data: {
        status: "received",
        received_by: adminId,
        received_at: new Date(),
        updated_at: new Date(),
      },
      include: PURCHASE_INCLUDE,
    });
  }

  /** received | returned → confirmed */
  async confirm(purchaseId: number, adminId: number) {
    const purchase = await this.db.purchases.findUnique({
      where: { id: purchaseId },
    });
    if (!purchase) throw new NotFoundError("Purchase not found");
    if (purchase.status === "confirmed") {
      throw new BadRequestError("Purchase is already confirmed");
    }
    if (!["received", "returned"].includes(purchase.status)) {
      throw new BadRequestError(
        "Purchase must be received or in returned status before it can be confirmed",
      );
    }

    return this.db.purchases.update({
      where: { id: purchaseId },
      data: {
        status: "confirmed",
        confirmed_by: adminId,
        confirmed_at: new Date(),
        updated_at: new Date(),
      },
      include: PURCHASE_INCLUDE,
    });
  }

  /** received | confirmed → returned */
  async returnPurchase(purchaseId: number, adminId: number) {
    const purchase = await this.db.purchases.findUnique({
      where: { id: purchaseId },
    });
    if (!purchase) throw new NotFoundError("Purchase not found");

    if (!["confirmed", "received"].includes(purchase.status)) {
      throw new BadRequestError(
        purchase.status === "returned"
          ? "Purchase is already returned"
          : "Only confirmed or received purchases can be returned",
      );
    }

    return this.db.purchases.update({
      where: { id: purchaseId },
      data: {
        status: "returned",
        returned_by: adminId,
        returned_at: new Date(),
        updated_at: new Date(),
      },
      include: PURCHASE_INCLUDE,
    });
  }

  // =============================================================
  // Admin operations
  // =============================================================

  /** Update admin notes */
  async addAdminNote(purchaseId: number, adminNotes: string, adminId: number) {
    const exists = await this.db.purchases.findUnique({
      where: { id: purchaseId },
    });
    if (!exists) throw new NotFoundError("Purchase not found");

    return this.db.purchases.update({
      where: { id: purchaseId },
      data: {
        admin_notes: adminNotes,
        admin_note_by: adminId,
        updated_at: new Date(),
      },
      include: PURCHASE_INCLUDE,
    });
  }

  /** Hard-delete a purchase. Restores used coupons if confirmed. */
  async deletePurchase(purchaseId: number) {
    const purchase = await this.db.purchases.findUnique({
      where: { id: purchaseId },
    });
    if (!purchase) throw new NotFoundError("Purchase not found");

    await this.db.$transaction(async (tx) => {
      if (purchase.status === "confirmed") {
        await tx.coupon_usages.deleteMany({
          where: { purchase_id: purchaseId },
        });
      }
      await tx.purchases.delete({ where: { id: purchaseId } });
    });
  }

  /** Remove a single item; recalculate totals. Cannot remove last item. */
  async deleteItem(purchaseId: number, itemId: number) {
    const purchase = await this.db.purchases.findUnique({
      where: { id: purchaseId },
      include: { purchase_items: true },
    });
    if (!purchase) throw new NotFoundError("Purchase not found");

    const item = purchase.purchase_items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundError("Item not found in this purchase");

    if (purchase.purchase_items.length === 1) {
      throw new BadRequestError(
        "Cannot remove the last item. Delete the entire purchase instead.",
      );
    }

    await this.db.purchase_items.delete({ where: { id: itemId } });

    const remaining = purchase.purchase_items.filter((i) => i.id !== itemId);
    const newSubtotal = remaining.reduce(
      (sum, i) => sum + Number(i.price_at_purchase),
      0,
    );
    const newTotal = Math.max(0, newSubtotal - Number(purchase.discount));

    return this.db.purchases.update({
      where: { id: purchaseId },
      data: {
        subtotal: newSubtotal,
        total: newTotal,
        updated_at: new Date(),
      },
      include: PURCHASE_INCLUDE,
    });
  }
}

export const purchasesService = new PurchasesService();
