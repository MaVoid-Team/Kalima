import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { BadRequestError, NotFoundError } from "../../../libs/errors";
import { CreatePurchaseDto, CreatePurchaseItemDto } from "../dtos/purchase.dto";
import { userManagementService } from "./user-management.service";
import { imageService } from "./image.service";
import type { Prisma } from "../generated/prisma/client";
import { role_enum } from "../generated/prisma/client";
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

    const isFreeOrder = Number(input.total) <= 0;

    let paymentMethod: { phone_number: string | null } | null = null;
    if (!isFreeOrder) {
      if (!input.payment_method_id) {
        throw new BadRequestError("Payment method is required for paid orders");
      }

      if (!input.payment_screenshot_id) {
        throw new BadRequestError(
          "Payment screenshot is required for paid orders",
        );
      }

      const screenshot = await client.images.findUnique({
        where: { id: input.payment_screenshot_id },
      });
      if (!screenshot)
        throw new BadRequestError("Payment screenshot not found");

      paymentMethod = await validatePaymentForCheckout(client, {
        total: Number(input.total),
        numberTransferredFrom: input.number_transferred_from,
        payment_method_id: input.payment_method_id,
      });
    }

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
        payment_method_id: isFreeOrder ? null : (input.payment_method_id ?? null),
        payment_screenshot_id: isFreeOrder
          ? null
          : (input.payment_screenshot_id ?? null),
        subtotal: input.subtotal,
        discount: input.discount,
        total: input.total,
        notes: input.notes,
        number_transferred_from: isFreeOrder
          ? null
          : (input.number_transferred_from ?? null),
        payment_number: isFreeOrder
          ? null
          : (input.payment_number ?? paymentMethod?.phone_number ?? null),
        purchase_serial: purchaseSerial,
      },
    });

    const purchaseItemsData = input.items.map((item) => ({
      purchase_id: created.id,
      product_id: item.product_id,
      price_at_purchase: item.price_at_purchase,
      discount: item.discount,
      quantity: item.quantity,
      final_price: item.final_price,
      coupon_id: item.coupon_id || null,
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
          if (rf.value !== null && rf.value !== undefined && rf.value !== "") {
            requiredFieldsData.push({
              purchase_item_id: purchaseItem.id,
              field_definition_id: rf.field_definition_id,
              value: String(rf.value),
            });
          }
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

    const where: Prisma.purchasesWhereInput = { deleted_at: null };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.created_at = {};
      if (filters.startDate) where.created_at.gte = new Date(filters.startDate);
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
  async getByUser(
    userId: number,
    filters?: { status?: string; page?: number; limit?: number },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.purchasesWhereInput = { user_id: userId };
    if (filters?.status) {
      where.status = filters.status;
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

    return {
      purchases,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    };
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

  /** Aggregated count of confirmed purchases per admin and per month with pagination */
  async getConfirmedStats(
    page: number,
    limit: number,
    month?: number,
    year?: number,
  ) {
    const skip = (page - 1) * limit;

    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    // 1. Get all eligible users (Admin, SubAdmin, Moderator)
    const eligibleRoles: role_enum[] = ["Admin", "SubAdmin", "Moderator"];

    // We filter users who have any of these roles
    const totalAdmins = await this.db.users.count({
      where: {
        user_roles: {
          some: {
            role: { in: eligibleRoles },
          },
        },
        deleted_at: null,
      },
    });

    const admins = await this.db.users.findMany({
      where: {
        user_roles: {
          some: {
            role: { in: eligibleRoles },
          },
        },
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        user_roles: {
          select: { role: true },
          where: { role: { in: eligibleRoles } },
          take: 1, // Generally one primary role for this grouping
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    });

    const adminIds = admins.map((a) => a.id);

    // 2. Get confirmed counts for these specific admins in the target month
    const grouped = await this.db.purchases.groupBy({
      by: ["confirmed_by"],
      _count: { _all: true },
      where: {
        confirmed_by: { in: adminIds },
        status: "confirmed",
        deleted_at: null,
        confirmed_at: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const countsMap = new Map(
      grouped.map((g) => [g.confirmed_by, g._count._all]),
    );

    // 3. Merge data
    const stats = admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      role: admin.user_roles[0]?.role || null,
      count: countsMap.get(admin.id) || 0,
    }));

    return {
      stats,
      total: totalAdmins,
      page,
      pages: Math.ceil(totalAdmins / limit),
      limit,
    };
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
      await tx.purchases.update({
        where: { id: purchaseId },
        data: { deleted_at: new Date(), is_deleted: true },
      });
      await tx.user_analytics.update({
        where: { user_id: purchase.user_id },
        data: {
          number_of_purchases: {
            decrement: 1,
          },
        },
      });
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

    await this.db.purchase_items.update({
      where: { id: itemId },
      data: { deleted_at: new Date(), is_deleted: true },
    });

    const remaining = purchase.purchase_items.filter((i) => i.id !== itemId);
    const newSubtotal = remaining.reduce(
      (sum, i) => sum + Number(i.price_at_purchase) * i.quantity,
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
