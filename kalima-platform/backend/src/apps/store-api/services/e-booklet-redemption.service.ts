import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../../libs/errors";
import { notification_key_enum } from "../generated/prisma/client";
import { hashEBookletAccessCode } from "./e-booklet-access-code.service";

const DEFAULT_REDEMPTION_SETTINGS = {
  notify_admins_on_access_code_redemption: false,
};

export interface RedeemCodeInput {
  termsAccepted?: boolean;
  ipAddress?: string;
  userAgent?: string;
  purchaseId?: number | null;
}

export class EBookletRedemptionService {
  constructor(private readonly db: any) {}

  private transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    if (typeof this.db.$transaction === "function") {
      return this.db.$transaction(callback, { isolationLevel: "Serializable" });
    }
    return callback(this.db);
  }

  private assertTermsAccepted(input: RedeemCodeInput) {
    if (input.termsAccepted !== true) {
      throw new BadRequestError("Student terms acceptance is required.");
    }
  }

  private assertCodeExistsAndRedeemable(code: any, studentId: number) {
    if (!code) throw new NotFoundError("Invalid e-booklet access code.");
    if (code.status === "active") return;
    const isSameStudentPaidRedemption =
      code.status === "redeemed" &&
      code.kind === "paid" &&
      Number(code.bound_student_id) === Number(studentId);
    if (!isSameStudentPaidRedemption) {
      throw new ForbiddenError("This e-booklet access code is no longer active.");
    }
  }

  private async reserveCapacity(tx: any, code: any, studentId: number, isPaid: boolean) {
    const maxRedemptions = Number(code.max_redemptions ?? 1);
    const result = await tx.e_booklet_access_codes.updateMany({
      where: {
        id: code.id,
        status: "active",
        redeemed_count: { lt: maxRedemptions },
        ...(isPaid ? { bound_student_id: null } : {}),
      },
      data: {
        bound_student_id: isPaid ? studentId : code.bound_student_id ?? null,
        redeemed_count: { increment: 1 },
        ...(isPaid ? { status: "redeemed" } : {}),
      },
    });
    if (result.count !== 1) {
      throw new ForbiddenError(
        isPaid
          ? "This e-booklet access code has already been redeemed."
          : "This e-booklet access code has reached its redemption limit.",
      );
    }
  }

  private async releaseReservedCapacity(tx: any, code: any, studentId: number, isPaid: boolean) {
    await tx.e_booklet_access_codes.updateMany({
      where: {
        id: code.id,
        redeemed_count: { gt: 0 },
        ...(isPaid ? { bound_student_id: studentId } : {}),
      },
      data: {
        redeemed_count: { decrement: 1 },
        ...(isPaid ? { status: "active", bound_student_id: null } : {}),
      },
    });
  }

  private async findStudentRedemption(tx: any, codeId: number, studentId: number) {
    return tx.e_booklet_access_code_redemptions.findFirst({
      where: { access_code_id: codeId, student_id: studentId },
    });
  }

  private async assertPaidSeatAvailable(tx: any, code: any, isPaid: boolean) {
    if (!isPaid) return;
    const instance = await tx.e_booklet_instances.findFirst({
      where: { id: code.booklet_instance_id },
      select: { id: true, invite_quota: true },
    });
    if (!instance || instance.invite_quota === null || instance.invite_quota === undefined) return;
    const usedSeats = await tx.e_booklet_access_code_redemptions.count({
      where: {
        booklet_instance_id: code.booklet_instance_id,
        counted_for_progress: true,
      },
    });
    if (usedSeats >= Number(instance.invite_quota)) {
      throw new ConflictError("E-booklet student seat limit reached.");
    }
  }

  private isUniqueConflict(error: any) {
    return error?.code === "P2002";
  }

  private async getSettings(tx: any) {
    if (!tx.e_booklet_global_settings?.upsert) return DEFAULT_REDEMPTION_SETTINGS;
    const settings = await tx.e_booklet_global_settings.upsert({
      where: { id: 1 },
      create: { id: 1, ...DEFAULT_REDEMPTION_SETTINGS },
      update: {},
    });
    return { ...DEFAULT_REDEMPTION_SETTINGS, ...settings };
  }

  private async notifyAdminsOnRedemption(tx: any, redemption: any, code: any) {
    const settings = await this.getSettings(tx);
    if (settings.notify_admins_on_access_code_redemption !== true || !tx.notifications?.create || !tx.users?.findMany) return;
    const admins = await tx.users.findMany({
      where: {
        user_roles: {
          some: { portal: "store", role: { in: ["Admin", "SubAdmin"] } },
        },
        OR: [{ is_deleted: false }, { is_deleted: null }],
      },
      select: { id: true },
    });
    for (const admin of admins || []) {
      try {
        await tx.notifications.create({
          data: {
            user_id: admin.id,
            category: 8,
            message_key: notification_key_enum.CUSTOM,
            entity_type: "e_booklet_access_code_redemption",
            entity_id: redemption.id,
            target_link: `/admin/e-booklets/access?teacherId=${code.teacher_id}&bookletInstanceId=${code.booklet_instance_id}`,
          },
        });
      } catch (error: any) {
        if (error?.code !== "P2002") throw error;
      }
    }
  }

  private async grantViewerAccess(tx: any, code: any, studentId: number) {
    return tx.e_booklet_access.upsert({
      where: {
        booklet_instance_id_user_id_role: {
          booklet_instance_id: code.booklet_instance_id,
          user_id: studentId,
          role: "student",
        },
      },
      create: {
        booklet_instance_id: code.booklet_instance_id,
        user_id: studentId,
        role: "student",
        access_source: "teacher_code",
        terms_accepted_at: new Date(),
        terms_version: code.term_id ? `term:${code.term_id}` : null,
        status: "active",
      },
      update: {
        status: "active",
        revoked_at: null,
        terms_accepted_at: new Date(),
        terms_version: code.term_id ? `term:${code.term_id}` : null,
      },
    });
  }

  private redemptionDto(redemption: any, access: any, code: any) {
    return {
      ...redemption,
      access_id: access?.id ?? redemption?.access_id ?? null,
      accessId: access?.id ?? redemption?.access_id ?? null,
      booklet_instance_id: code.booklet_instance_id,
      bookletInstanceId: code.booklet_instance_id,
      accessCodeId: code.id,
      countedForProgress: Boolean(redemption?.counted_for_progress),
    };
  }

  async previewCode(rawCode: string, studentId: number) {
    const normalizedCode = String(rawCode ?? "").trim();
    if (!normalizedCode) throw new BadRequestError("E-booklet access code is required.");
    const codeHash = hashEBookletAccessCode(normalizedCode);
    const code = await this.db.e_booklet_access_codes.findUnique({
      where: { code_hash: codeHash },
      include: {
        teacher: { select: { id: true, name: true, email: true, phone: true, profile_pic_url: true } },
        term: { select: { id: true, name: true } },
        booklet_instance: {
          select: {
            id: true,
            display_title: true,
            student_marketing_price: true,
            access_expires_at: true,
            invite_quota: true,
            status: true,
            template: { select: { id: true, title: true, description: true } },
          },
        },
      },
    });
    this.assertCodeExistsAndRedeemable(code, studentId);
    const existingForStudent = await this.findStudentRedemption(this.db, code.id, studentId);
    const maxRedemptions = Number(code.max_redemptions ?? 1);
    const redeemedCount = Number(code.redeemed_count ?? 0);
    const isExpired = Boolean(code.expires_at && new Date(code.expires_at) <= new Date());
    const isPaid = code.kind === "paid";
    const remainingRedemptions = Math.max(0, maxRedemptions - redeemedCount);
    const alreadyBoundToOtherStudent = isPaid && code.bound_student_id && Number(code.bound_student_id) !== Number(studentId);
    const canRedeem = Boolean(existingForStudent) || (
      code.status === "active" &&
      !isExpired &&
      !alreadyBoundToOtherStudent &&
      remainingRedemptions > 0
    );
    return {
      codeHint: code.code_hint,
      kind: code.kind,
      status: code.status,
      expiresAt: code.expires_at,
      maxRedemptions,
      redeemedCount,
      remainingRedemptions,
      alreadyRedeemedByCurrentStudent: Boolean(existingForStudent),
      canRedeem,
      teacher: code.teacher ? {
        id: code.teacher.id,
        name: code.teacher.name,
        email: code.teacher.email,
        phone: code.teacher.phone,
        profilePicUrl: code.teacher.profile_pic_url,
      } : null,
      eBooklet: code.booklet_instance ? {
        id: code.booklet_instance.id,
        title: code.booklet_instance.display_title || code.booklet_instance.template?.title,
        templateName: code.booklet_instance.template?.title || null,
        description: code.booklet_instance.template?.description || null,
        studentMarketingPrice: code.booklet_instance.student_marketing_price?.toString?.() ?? code.booklet_instance.student_marketing_price ?? null,
        accessExpiresAt: code.booklet_instance.access_expires_at,
        status: code.booklet_instance.status,
      } : null,
      term: code.term ? { id: code.term.id, name: code.term.name } : null,
    };
  }

  async redeemCode(rawCode: string, studentId: number, input: RedeemCodeInput) {
    this.assertTermsAccepted(input);
    const normalizedCode = String(rawCode ?? "").trim();
    if (!normalizedCode) throw new BadRequestError("E-booklet access code is required.");
    const codeHash = hashEBookletAccessCode(normalizedCode);

    return this.transaction(async (tx) => {
      const code = await tx.e_booklet_access_codes.findUnique({ where: { code_hash: codeHash } });
      this.assertCodeExistsAndRedeemable(code, studentId);

      const existingForStudent = await this.findStudentRedemption(tx, code.id, studentId);
      if (existingForStudent) {
        const access = await this.grantViewerAccess(tx, code, studentId);
        if (!existingForStudent.access_id && access?.id) {
          await tx.e_booklet_access_code_redemptions.update({
            where: { id: existingForStudent.id },
            data: { access_id: access.id },
          });
        }
        return this.redemptionDto(existingForStudent, access, code);
      }
      if (code.expires_at && new Date(code.expires_at) <= new Date()) {
        throw new ForbiddenError("This e-booklet access code has expired.");
      }

      const isPaid = code.kind === "paid";
      if (isPaid && code.bound_student_id && Number(code.bound_student_id) !== Number(studentId)) {
        throw new ForbiddenError("This e-booklet access code has already been redeemed.");
      }

      await this.assertPaidSeatAvailable(tx, code, isPaid);

      try {
        await this.reserveCapacity(tx, code, studentId, isPaid);
      } catch (error) {
        const redemptionAfterWait = await this.findStudentRedemption(tx, code.id, studentId);
        if (redemptionAfterWait) {
          const access = await this.grantViewerAccess(tx, code, studentId);
          return this.redemptionDto(redemptionAfterWait, access, code);
        }
        throw error;
      }
      const access = await this.grantViewerAccess(tx, code, studentId);

      try {
        const redemption = await tx.e_booklet_access_code_redemptions.create({
          data: {
            access_code_id: code.id,
            booklet_instance_id: code.booklet_instance_id,
            student_id: studentId,
            access_id: access?.id ?? null,
            purchase_id: input.purchaseId ?? null,
            paid_redemption_guard: isPaid ? `paid-code-${code.id}` : null,
            counted_for_progress: isPaid,
            ip_address: input.ipAddress,
            user_agent: input.userAgent,
          },
        });
        await this.notifyAdminsOnRedemption(tx, redemption, code);
        return this.redemptionDto(redemption, access, code);
      } catch (error) {
        if (this.isUniqueConflict(error)) {
          await this.releaseReservedCapacity(tx, code, studentId, isPaid);
          const concurrentRedemption = await this.findStudentRedemption(tx, code.id, studentId);
          if (concurrentRedemption) return this.redemptionDto(concurrentRedemption, access, code);
        }
        throw error;
      }
    });
  }
}
