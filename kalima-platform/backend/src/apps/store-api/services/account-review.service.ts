import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { role_enum } from "../generated/prisma/client";
import { NotFoundError } from "../../../libs/errors";

// ============================================
// ACCOUNT REVIEW SERVICE
// ============================================

class AccountReviewService {
  constructor(private db: PrismaClient = prisma) {}

  /** Check if the given role requires admin review for new accounts */
  async roleRequiresReview(role: role_enum): Promise<boolean> {
    const setting = await this.db.account_review_settings.findUnique({
      where: { role },
    });
    return setting?.requires_review ?? false;
  }

  /** Get all account review settings */
  async getAllSettings() {
    const allRoles = Object.values(role_enum);
    const settings = await this.db.account_review_settings.findMany();
    const byRole = new Map(settings.map((s) => [s.role, s.requires_review]));

    return allRoles.map((role) => ({
      role,
      requires_review: byRole.get(role) ?? false,
    }));
  }

  /** Upsert a single role's setting */
  async upsertSetting(
    role: role_enum,
    requiresReview: boolean,
    updatedBy?: number,
  ) {
    return this.db.account_review_settings.upsert({
      where: { role },
      create: { role, requires_review: requiresReview, updated_by: updatedBy },
      update: {
        requires_review: requiresReview,
        updated_at: new Date(),
        updated_by: updatedBy,
      },
    });
  }

  /** Approve a user (set confirmed = true) */
  async approveUser(userId: number) {
    const updated = await this.db.users.updateMany({
      where: { id: userId },
      data: { confirmed: true },
    });
    if (updated.count === 0) {
      throw new NotFoundError("User not found");
    }
    return { id: userId, confirmed: true };
  }

  /** Reject a user (set confirmed = false) */
  async rejectUser(userId: number) {
    const updated = await this.db.users.updateMany({
      where: { id: userId },
      data: { confirmed: false },
    });
    if (updated.count === 0) {
      throw new NotFoundError("User not found");
    }
    return { id: userId, confirmed: false };
  }
}

export const accountReviewService = new AccountReviewService();
