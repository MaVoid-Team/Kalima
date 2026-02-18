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
      expires_at: dto.expires_at,
      // created_by: _user_id, // TODO: uncomment after adding created_by column to coupons table
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
  // VALIDATE COUPON (Teacher)
  // ============================================

  async validateCoupon(code: string): Promise<{ isValid: boolean; coupon: coupons }> {
    const coupon = await this.db.coupons.findUnique({ where: { code } });

    if (!coupon || coupon.deleted_at) {
      throw new NotFoundError("Invalid coupon code");
    }

    if (!coupon.active) {
      throw new BadRequestError("This coupon is no longer active");
    }

    if (coupon.expires_at && coupon.expires_at < new Date()) {
      throw new BadRequestError("This coupon has expired");
    }

    return { isValid: true, coupon };
  }

  // ============================================
  // USE COUPON (Teacher)
  // ============================================

  async useCoupon(code: string, _user_id: number): Promise<coupons> {
    const coupon = await this.db.coupons.findUnique({ where: { code } });

    if (!coupon || coupon.deleted_at) {
      throw new NotFoundError("Invalid coupon code");
    }

    if (!coupon.active) {
      throw new BadRequestError("This coupon has already been used or deactivated");
    }

    if (coupon.expires_at && coupon.expires_at < new Date()) {
      throw new BadRequestError("This coupon has expired");
    }

    const updated = await this.db.coupons.update({
      where: { id: coupon.id },
      data: {
        active: false,
        updated_at: new Date(),
        // used_by: _user_id, // TODO: uncomment after adding used_by column to coupons table
        // used_at: new Date(), // TODO: uncomment after adding used_at column to coupons table
      },
    });

    return updated;
  }
}

export const couponService = new CouponService();
