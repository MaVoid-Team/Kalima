import { BadRequestError, NotFoundError } from "../../../libs/errors";
import { TeacherWalletService } from "./teacher-wallet.service";
import { EBookletMilestoneNotificationService } from "./e-booklet-milestone-notification.service";

type EBookletMilestoneServiceOptions = {
  milestoneNotifier?: Pick<EBookletMilestoneNotificationService, "notifyMilestoneAchievements"> | null;
};

type EBookletMilestoneEvaluationContext = {
  io?: any;
};

const MILESTONE_NOTIFICATION_RECIPIENTS = new Set(["admins", "teacher_and_admins"]);
const DEFAULT_REWARD_EXPIRY_DAYS = 120;

export class EBookletMilestoneService {
  constructor(private readonly db: any, private readonly options: EBookletMilestoneServiceOptions = {}) {}

  private notificationRecipients(value: any): string {
    return MILESTONE_NOTIFICATION_RECIPIENTS.has(value) ? value : "admins";
  }

  private transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    if (typeof this.db.$transaction === "function") return this.db.$transaction(callback, { isolationLevel: "Serializable" });
    return callback(this.db);
  }

  private number(value: any): number {
    const n = value && typeof value.toNumber === "function" ? value.toNumber() : Number(value ?? 0);
    if (!Number.isFinite(n)) throw new BadRequestError("Invalid number.");
    return n;
  }

  private nonEmptyString(value: any, label: string): string {
    const text = String(value ?? "").trim();
    if (!text) throw new BadRequestError(`Invalid ${label}.`);
    return text;
  }

  private finiteInt(value: any, label: string): number {
    const n = Number(value);
    if (!Number.isInteger(n)) throw new BadRequestError(`Invalid ${label}.`);
    return n;
  }

  private strictBoolean(value: any, label: string): boolean {
    if (value === true || value === false) return value;
    throw new BadRequestError(`Invalid ${label}.`);
  }

  private positiveInt(value: any, label: string): number {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) throw new BadRequestError(`Invalid ${label}.`);
    return n;
  }

  private rewardExpiryDays(value: any): number {
    return this.positiveInt(value ?? DEFAULT_REWARD_EXPIRY_DAYS, "reward expiry days");
  }

  private hasRewardExpiryDays(input: any): boolean {
    return input.rewardExpiryDays !== undefined || input.reward_expiry_days !== undefined;
  }

  private async defaultRewardExpiryDays(): Promise<number> {
    if (!this.db.e_booklet_global_settings?.findUnique) return DEFAULT_REWARD_EXPIRY_DAYS;
    const settings = await this.db.e_booklet_global_settings.findUnique({ where: { id: 1 } });
    return this.rewardExpiryDays(settings?.default_reward_expiry_days);
  }

  private addDays(value: Date, days: number): Date {
    const next = new Date(value);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }

  private nonNegativeNumber(value: any, label: string, required = false): number | null {
    if (value === undefined || value === null || value === "") {
      if (required) throw new BadRequestError(`Invalid ${label}.`);
      return null;
    }
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) throw new BadRequestError(`Invalid ${label}.`);
    return n;
  }

  private positiveNumber(value: any, label: string): number {
    const n = this.nonNegativeNumber(value, label, true);
    if (n === null || n <= 0) throw new BadRequestError(`Invalid ${label}.`);
    return n;
  }

  private isUniqueConflict(error: any) {
    return error?.code === "P2002";
  }

  private async getActiveTerm(tx: any, termId?: number) {
    const now = new Date();
    const term = await tx.e_booklet_terms.findFirst({
      where: {
        ...(termId ? { id: termId } : {}),
        status: "active",
        starts_at: { lte: now },
        OR: [{ ends_at: null }, { ends_at: { gt: now } }],
      },
      orderBy: { starts_at: "desc" },
    });
    if (!term) throw new NotFoundError("Active e-booklet terms not found.");
    return term;
  }

  private async assertTermExists(termId: number) {
    const term = await this.db.e_booklet_terms.findFirst({ where: { id: termId } });
    if (!term) throw new NotFoundError("E-booklet terms not found.");
    return term;
  }

  async listMilestones(termId?: number, teacherId?: number, includeInactive = false) {
    const milestones = await this.db.e_booklet_milestones.findMany({
      where: { ...(termId ? { term_id: termId } : {}), ...(includeInactive ? {} : { active: true }) },
      orderBy: [{ term_id: "asc" }, { sort_order: "asc" }, { target_paid_redemptions: "asc" }],
    });
    if (!teacherId || milestones.length === 0) return milestones;

    const termIds = Array.from(new Set(milestones.map((milestone: any) => milestone.term_id).filter(Boolean)));
    const [achievements, paidRedemptionsByTerm] = await Promise.all([
      this.db.e_booklet_milestone_achievements.findMany({
        where: { teacher_id: teacherId, ...(termId ? { term_id: termId } : { term_id: { in: termIds } }) },
      }),
      Promise.all(
        termIds.map(async (id) => ({
          termId: id,
          paidRedemptions: await this.db.e_booklet_access_code_redemptions.count({
            where: {
              counted_for_progress: true,
              access_code: { teacher_id: teacherId, term_id: id, kind: "paid" },
            },
          }),
        })),
      ),
    ]);

    const achievementByMilestoneId = new Map<number, any>(achievements.map((achievement: any) => [achievement.milestone_id, achievement]));
    const progressByTermId = new Map<number, number>(paidRedemptionsByTerm.map((item: any) => [item.termId, item.paidRedemptions]));

    return milestones.map((milestone: any) => {
      const achievement = achievementByMilestoneId.get(milestone.id) ?? null;
      const progressCount = progressByTermId.get(milestone.term_id) ?? 0;
      return {
        ...milestone,
        progress_count: progressCount,
        paid_redemptions_snapshot: achievement?.paid_redemptions_snapshot ?? progressCount,
        achievement,
        achievement_id: achievement?.id ?? null,
        milestone_achievement_id: achievement?.id ?? null,
        claimed_at: achievement?.claimed_at ?? null,
        reward_terms_accepted_at: achievement?.reward_terms_accepted_at ?? null,
        reward_amount: achievement?.reward_amount ?? milestone.reward_amount_snapshot ?? null,
        reward_expiry_days_snapshot: achievement?.reward_expiry_days_snapshot ?? milestone.reward_expiry_days ?? DEFAULT_REWARD_EXPIRY_DAYS,
        reward_expires_at: achievement?.reward_expires_at ?? null,
      };
    });
  }

  async createMilestone(input: any, _adminUserId?: number) {
    const termId = this.positiveInt(input.termId ?? input.term_id, "term ID");
    const targetPaidRedemptions = this.positiveInt(input.targetPaidRedemptions ?? input.target_paid_redemptions, "target paid redemptions");
    const milestonePrice = this.nonNegativeNumber(input.milestonePrice ?? input.milestone_price, "milestone price", true);
    const previousPriceSnapshot = this.nonNegativeNumber(input.previousPriceSnapshot ?? input.previous_price_snapshot, "previous price");
    const rewardAmountSnapshot = this.nonNegativeNumber(input.rewardAmountSnapshot ?? input.reward_amount_snapshot, "reward amount", true);
    const rewardExpiryDays = this.hasRewardExpiryDays(input)
      ? this.rewardExpiryDays(input.rewardExpiryDays ?? input.reward_expiry_days)
      : await this.defaultRewardExpiryDays();
    const title = this.nonEmptyString(input.title, "milestone title");
    const sortOrder = this.finiteInt(input.sortOrder ?? input.sort_order ?? 0, "sort order");
    const active = input.active === undefined ? true : this.strictBoolean(input.active, "active flag");
    await this.assertTermExists(termId);
    return this.db.e_booklet_milestones.create({
      data: {
        term_id: termId,
        title,
        description: input.description ?? null,
        target_paid_redemptions: targetPaidRedemptions,
        milestone_price: milestonePrice,
        previous_price_snapshot: previousPriceSnapshot,
        reward_amount_snapshot: rewardAmountSnapshot,
        reward_expiry_days: rewardExpiryDays,
        notification_recipients: this.notificationRecipients(input.notificationRecipients ?? input.notification_recipients),
        sort_order: sortOrder,
        active,
      },
    });
  }

  async updateMilestone(id: number, input: any) {
    const data: any = {};
    if (input.termId !== undefined || input.term_id !== undefined) data.term_id = this.positiveInt(input.termId ?? input.term_id, "term ID");
    if (input.title !== undefined) data.title = this.nonEmptyString(input.title, "milestone title");
    if (input.description !== undefined) data.description = input.description;
    if (input.targetPaidRedemptions !== undefined || input.target_paid_redemptions !== undefined) {
      data.target_paid_redemptions = this.positiveInt(input.targetPaidRedemptions ?? input.target_paid_redemptions, "target paid redemptions");
    }
    if (input.milestonePrice !== undefined || input.milestone_price !== undefined) data.milestone_price = this.nonNegativeNumber(input.milestonePrice ?? input.milestone_price, "milestone price", true);
    if (input.previousPriceSnapshot !== undefined || input.previous_price_snapshot !== undefined) data.previous_price_snapshot = this.nonNegativeNumber(input.previousPriceSnapshot ?? input.previous_price_snapshot, "previous price");
    if (input.rewardAmountSnapshot !== undefined || input.reward_amount_snapshot !== undefined) data.reward_amount_snapshot = this.nonNegativeNumber(input.rewardAmountSnapshot ?? input.reward_amount_snapshot, "reward amount", true);
    if (input.rewardExpiryDays !== undefined || input.reward_expiry_days !== undefined) data.reward_expiry_days = this.rewardExpiryDays(input.rewardExpiryDays ?? input.reward_expiry_days);
    if (input.notificationRecipients !== undefined || input.notification_recipients !== undefined) data.notification_recipients = this.notificationRecipients(input.notificationRecipients ?? input.notification_recipients);
    if (input.sortOrder !== undefined || input.sort_order !== undefined) data.sort_order = this.finiteInt(input.sortOrder ?? input.sort_order, "sort order");
    if (input.active !== undefined) data.active = this.strictBoolean(input.active, "active flag");
    if (data.term_id !== undefined) await this.assertTermExists(data.term_id);
    data.updated_at = new Date();
    return this.db.e_booklet_milestones.update({
      where: { id },
      data,
    });
  }

  async deleteMilestone(id: number) {
    return this.db.e_booklet_milestones.update({
      where: { id },
      data: { active: false, updated_at: new Date() },
    });
  }

  async reorderMilestones(termId: number, items: Array<{ id: number; sortOrder?: number; sort_order?: number }>) {
    return this.transaction(async (tx) => {
      const updated: any[] = [];
      for (const item of items) {
        const milestone = await tx.e_booklet_milestones.findFirst({
          where: { id: this.positiveInt(item.id, "milestone ID"), term_id: this.positiveInt(termId, "term ID") },
        });
        if (!milestone) throw new NotFoundError("Milestone not found for this term.");
        updated.push(await tx.e_booklet_milestones.update({
          where: { id: this.positiveInt(item.id, "milestone ID") },
          data: {
            sort_order: this.finiteInt(item.sortOrder ?? item.sort_order ?? 0, "sort order"),
            updated_at: new Date(),
          },
        }));
      }
      return updated;
    });
  }

  async listProgress(termId?: number) {
    const where = termId ? { term_id: termId } : {};
    const [achievements, redemptions] = await Promise.all([
      this.db.e_booklet_milestone_achievements.findMany({
        where,
        orderBy: { achieved_at: "desc" },
      }),
      this.db.e_booklet_access_code_redemptions.findMany({
        where: {
          counted_for_progress: true,
          access_code: {
            kind: "paid",
            ...(termId ? { term_id: termId } : {}),
          },
        },
        include: { access_code: { select: { teacher_id: true, term_id: true, teacher: { select: { id: true, name: true, email: true } } } } },
      }),
    ]);
    const teacherRows = new Map<number, any>();
    for (const redemption of redemptions) {
      const teacherId = Number(redemption?.access_code?.teacher_id);
      if (!Number.isInteger(teacherId)) continue;
      const row = teacherRows.get(teacherId) ?? {
        teacherId,
        teacherName: redemption?.access_code?.teacher?.name ?? null,
        teacher: redemption?.access_code?.teacher ?? null,
        paidRedemptions: 0,
        achievements: [],
      };
      if (!row.teacher && redemption?.access_code?.teacher) row.teacher = redemption.access_code.teacher;
      if (!row.teacherName && redemption?.access_code?.teacher?.name) row.teacherName = redemption.access_code.teacher.name;
      row.paidRedemptions += 1;
      teacherRows.set(teacherId, row);
    }
    for (const achievement of achievements) {
      const teacherId = Number(achievement.teacher_id);
      if (!Number.isInteger(teacherId)) continue;
      const row = teacherRows.get(teacherId) ?? {
        teacherId,
        teacherName: achievement?.teacher?.name ?? null,
        teacher: achievement?.teacher ?? null,
        paidRedemptions: 0,
        achievements: [],
      };
      if (!row.teacher && achievement?.teacher) row.teacher = achievement.teacher;
      if (!row.teacherName && achievement?.teacher?.name) row.teacherName = achievement.teacher.name;
      row.achievements.push(achievement);
      teacherRows.set(teacherId, row);
    }
    const teacherProgress = Array.from(teacherRows.values()).sort((a, b) => b.paidRedemptions - a.paidRedemptions || a.teacherId - b.teacherId);
    const paidRedemptions = teacherProgress.reduce((sum, row) => sum + row.paidRedemptions, 0);
    return { termId: termId ?? null, paidRedemptions, achievements, teacherProgress };
  }

  async claimReward(teacherId: number, milestoneAchievementId: number, meta: { ipAddress?: string; userAgent?: string; termsAccepted?: boolean } = {}) {
    if (meta.termsAccepted !== true) {
      throw new BadRequestError("Reward claim terms must be accepted.");
    }
    return this.transaction(async (tx) => {
      const achievement = await tx.e_booklet_milestone_achievements.findFirst({
        where: { id: milestoneAchievementId, teacher_id: teacherId },
      });
      if (!achievement) throw new NotFoundError("E-booklet milestone achievement not found.");
      if (achievement.claimed_at) {
        return { claimed: true, alreadyClaimed: true, achievement };
      }

      const claimedAt = new Date();
      const rewardExpiresAt = this.addDays(claimedAt, this.rewardExpiryDays(achievement.reward_expiry_days_snapshot));
      const claimUpdate = await tx.e_booklet_milestone_achievements.updateMany({
        where: { id: achievement.id, teacher_id: teacherId, claimed_at: null },
        data: {
          reward_terms_accepted_at: claimedAt,
          claimed_at: claimedAt,
          reward_expires_at: rewardExpiresAt,
        },
      });
      if (claimUpdate.count !== 1) {
        const latest = await tx.e_booklet_milestone_achievements.findFirst({
          where: { id: milestoneAchievementId, teacher_id: teacherId },
        });
        return { claimed: true, alreadyClaimed: true, achievement: latest ?? achievement };
      }

      const terms = await tx.e_booklet_terms.findFirst({ where: { id: achievement.term_id } });
      const existingAcceptance = await tx.e_booklet_teacher_terms_acceptances.findFirst({
        where: {
          teacher_id: teacherId,
          term_id: achievement.term_id,
          acceptance_type: "reward_claim",
          milestone_achievement_id: achievement.id,
        },
      });
      if (!existingAcceptance) {
        try {
          await tx.e_booklet_teacher_terms_acceptances.create({
            data: {
              teacher_id: teacherId,
              term_id: achievement.term_id,
              acceptance_type: "reward_claim",
              milestone_achievement_id: achievement.id,
              terms_version: `term:${achievement.term_id}`,
              terms_snapshot: terms?.reward_claim_terms ?? null,
              ip_address: meta.ipAddress,
              user_agent: meta.userAgent,
            },
          });
        } catch (error) {
          if (!this.isUniqueConflict(error)) throw error;
        }
      }
      const updatedAchievement = await tx.e_booklet_milestone_achievements.findFirst({
        where: { id: milestoneAchievementId, teacher_id: teacherId },
      }) ?? {
        ...achievement,
        reward_terms_accepted_at: claimedAt,
        claimed_at: claimedAt,
        reward_expires_at: rewardExpiresAt,
      };
      const walletCredit = await new TeacherWalletService(tx).creditMilestone({
        teacherId,
        amount: this.number(achievement.reward_amount),
        milestoneAchievementId: achievement.id,
        rewardExpiryDays: this.rewardExpiryDays(achievement.reward_expiry_days_snapshot),
        claimedAt: updatedAchievement.claimed_at ?? new Date(),
        notes: `E-booklet milestone reward claim ${achievement.id}`,
      });
      return { claimed: true, alreadyClaimed: false, achievement: updatedAchievement, walletCredit };
    });
  }

  async evaluateTeacherMilestones(teacherId: number, termId?: number, context: EBookletMilestoneEvaluationContext = {}) {
    const result = await this.transaction(async (tx) => {
      const term = await this.getActiveTerm(tx, termId);
      const paidFirstAccessCount = await tx.e_booklet_access_code_redemptions.count({
        where: {
          counted_for_progress: true,
          access_code: {
            teacher_id: teacherId,
            term_id: term.id,
            kind: "paid",
          },
        },
      });

      const milestones = await tx.e_booklet_milestones.findMany({
        where: {
          term_id: term.id,
          active: true,
          target_paid_redemptions: { lte: paidFirstAccessCount },
        },
        orderBy: { target_paid_redemptions: "asc" },
      });

      const awarded: any[] = [];
      const notifyable: any[] = [];
      for (const milestone of milestones) {
        const existing = await tx.e_booklet_milestone_achievements.findUnique({
          where: {
            teacher_id_term_id_milestone_id: {
              teacher_id: teacherId,
              term_id: term.id,
              milestone_id: milestone.id,
            },
          },
        });
        if (existing) {
          continue;
        }

        const rewardAmount = this.nonNegativeNumber(milestone.reward_amount_snapshot, "reward amount", true);
        const achievement = await tx.e_booklet_milestone_achievements.create({
          data: {
            teacher_id: teacherId,
            term_id: term.id,
            milestone_id: milestone.id,
            paid_redemptions_snapshot: paidFirstAccessCount,
            previous_price_snapshot: milestone.previous_price_snapshot ?? 0,
            milestone_price_snapshot: milestone.milestone_price,
            reward_amount: rewardAmount,
            reward_expiry_days_snapshot: this.rewardExpiryDays(milestone.reward_expiry_days),
          },
        });
        awarded.push(achievement);
        notifyable.push({ ...achievement, notification_recipients: milestone.notification_recipients });
      }

      return { termId: term.id, term, paidFirstAccessCount, milestones, awarded, notifyable };
    });

    if (result.notifyable.length > 0) {
      const notifier = this.options.milestoneNotifier ?? new EBookletMilestoneNotificationService(this.db);
      try {
        await notifier.notifyMilestoneAchievements(result.notifyable, {
          term: result.term,
          milestones: result.milestones,
          io: context.io ?? null,
        });
      } catch (error) {
        console.error("Failed to notify e-booklet milestone achievements", error);
      }
    }

    return { termId: result.termId, paidFirstAccessCount: result.paidFirstAccessCount, awarded: result.awarded };
  }
}
