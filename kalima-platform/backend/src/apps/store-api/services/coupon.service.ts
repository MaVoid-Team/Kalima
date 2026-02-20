import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import {
  CreateCouponDto,
  UpdateCouponDto,
  DiscountType,
} from "../dtos/coupon.dto";
import { coupons, role_enum } from "../generated/prisma";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../../../libs/errors";
import crypto from "crypto";

// ============================================
// COUPON SERVICE
// ============================================

class CouponService {
  constructor(private db: PrismaClient = prisma) {}

  // ============================================
  // GENERATE UNIQUE CODE (public helper)
  // ============================================

  /**
   * Generates a unique coupon code in the format KLM-XXXXXX.
   * Can be called independently so admins can pre-generate a code.
   */
  async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists: coupons | null;

    do {
      const random = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 hex chars
      code = `KLM-${random}`;
      exists = await this.db.coupons.findUnique({ where: { code } });
    } while (exists);

    return code;
  }

  // ============================================
  // CREATE
  // ============================================

  async createCoupon(
    dto: CreateCouponDto,
    _user_id: number,
  ): Promise<coupons> {
    // Check uniqueness of the provided code
    const existing = await this.db.coupons.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictError(`Coupon code "${dto.code}" already exists`);
    }

    // Build data based on discount type
    const data: any = {
      code: dto.code,
      starts_at: dto.starts_at ?? null,
      expires_at: dto.expires_at,
    };

    if (dto.discount_type === DiscountType.AMOUNT) {
      data.discount_amount = dto.discount_amount;
      data.discount_percentage = 0;
    } else {
      data.discount_percentage = dto.discount_percentage;
      data.discount_amount = 0;
    }

    const coupon = await this.db.coupons.create({ data });
    return coupon;
  }

  // ============================================
  // READ — ALL (Admin/SubAdmin)
  // ============================================

  async getAllCoupons(filters?: {
    page?: number;
    limit?: number;
    active?: boolean;
  }): Promise<{ coupons: coupons[]; total: number; page: number; limit: number }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null, // exclude soft-deleted
    };

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    const [coupons, total] = await Promise.all([
      this.db.coupons.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.coupons.count({ where }),
    ]);

    return { coupons, total, page, limit };
  }

  // ============================================
  // READ — SINGLE
  // ============================================

  async getCouponById(id: number): Promise<coupons> {
    const coupon = await this.db.coupons.findFirst({
      where: { id, deleted_at: null },
    });
    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }
    return coupon;
  }

  // ============================================
  // UPDATE
  // ============================================

  async updateCoupon(id: number, dto: UpdateCouponDto): Promise<coupons> {
    const coupon = await this.db.coupons.findFirst({
      where: { id, deleted_at: null },
    });
    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }

    // If code is being changed, check uniqueness
    if (dto.code && dto.code !== coupon.code) {
      const existing = await this.db.coupons.findUnique({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictError(`Coupon code "${dto.code}" already exists`);
      }
    }

    const data: any = {
      updated_at: new Date(),
    };

    if (dto.code !== undefined) data.code = dto.code;
    if (dto.starts_at !== undefined) data.starts_at = dto.starts_at;
    if (dto.expires_at !== undefined) data.expires_at = dto.expires_at;
    if (dto.is_active !== undefined) data.active = dto.is_active;

    // Handle discount type change
    if (dto.discount_type !== undefined) {
      if (dto.discount_type === DiscountType.AMOUNT) {
        data.discount_amount = dto.discount_amount;
        data.discount_percentage = 0;
      } else {
        data.discount_percentage = dto.discount_percentage;
        data.discount_amount = 0;
      }
    } else {
      // No type change — just update the value if provided
      if (dto.discount_amount !== undefined)
        data.discount_amount = dto.discount_amount;
      if (dto.discount_percentage !== undefined)
        data.discount_percentage = dto.discount_percentage;
    }

    const updated = await this.db.coupons.update({
      where: { id },
      data,
    });
    return updated;
  }

  // ============================================
  // SOFT DELETE
  // ============================================

  async deleteCoupon(id: number): Promise<coupons> {
    const coupon = await this.db.coupons.findFirst({
      where: { id, deleted_at: null },
    });
    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }

    const deleted = await this.db.coupons.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        active: false,
      },
    });
    return deleted;
  }

  // ============================================
  // VALIDATE COUPON
  // ============================================

  /**
   * Validates a coupon for use.
   * @param code - Coupon code
   * @param user_id - Optional. When provided, checks if user has already used this coupon (one-time per user).
   */
  async validateCoupon(
    code: string,
    user_id?: number,
  ): Promise<{ isValid: boolean; coupon: coupons }> {
    const coupon = await this.db.coupons.findUnique({ where: { code } });

    if (!coupon || coupon.deleted_at) {
      throw new NotFoundError("Invalid coupon code");
    }

    if (!coupon.active) {
      throw new BadRequestError("This coupon is no longer active");
    }

    const now = new Date();

    if (coupon.starts_at && coupon.starts_at > now) {
      throw new BadRequestError("This coupon is not yet valid");
    }

    if (coupon.expires_at && coupon.expires_at < now) {
      throw new BadRequestError("This coupon has expired");
    }

    if (user_id !== undefined) {
      const alreadyUsed = await this.db.coupon_usages.findUnique({
        where: {
          user_id_coupon_id: { user_id, coupon_id: coupon.id },
        },
      });
      if (alreadyUsed) {
        throw new BadRequestError("You have already used this coupon");
      }
    }

    return { isValid: true, coupon };
  }

  /**
   * Records that a user has used a coupon (called when purchase completes).
   */
  async recordCouponUsage(
    user_id: number,
    coupon_id: number,
    purchase_id?: number,
  ): Promise<void> {
    await this.db.coupon_usages.create({
      data: {
        user_id,
        coupon_id,
        purchase_id: purchase_id ?? null,
      },
    });
  }

  // ============================================
  // USE COUPON (Teacher / Account-level promo)
  // ============================================

  /**
   * Records that a user has used a coupon (e.g. for account-level promo).
   * Each user can use each coupon only once (enforced via validateCoupon).
   */
  async useCoupon(code: string, user_id: number): Promise<coupons> {
    const { coupon } = await this.validateCoupon(code, user_id);
    await this.recordCouponUsage(user_id, coupon.id);
    return coupon;
  }
}

export const couponService = new CouponService();
