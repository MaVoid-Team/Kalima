import type { Server as SocketIOServer } from "socket.io";
import { notification_key_enum } from "../generated/prisma/client";
import { getEmailService, type EmailService } from "../emails/email.service";
import { emitNotificationToUser, emitNotificationToUsers } from "../../../libs/redis/socketNotificationEmitter";

const E_BOOKLET_MILESTONE_NOTIFICATION_CATEGORY = 8;
const MILESTONE_ENTITY_TYPE = "e_booklet_milestone_achievement";

export interface EBookletMilestoneNotificationAchievement {
  id: number;
  teacher_id: number;
  term_id: number;
  milestone_id: number;
  paid_redemptions_snapshot?: number | null;
  reward_amount?: number | { toNumber(): number } | null;
  notification_recipients?: "admins" | "teacher_and_admins" | string | null;
}

export interface EBookletMilestoneNotificationContext {
  io?: SocketIOServer | null;
  term?: { id: number; name?: string | null } | null;
  milestones?: Array<{ id: number; title?: string | null }>;
  dashboardUrl?: string;
}

function number(value: unknown): number {
  if (value && typeof (value as any).toNumber === "function") return (value as any).toNumber();
  return Number(value ?? 0);
}

export class EBookletMilestoneNotificationService {
  constructor(
    private readonly db: any,
    private readonly emailService: Pick<EmailService, "sendEBookletMilestoneTeacherEmail" | "sendEBookletMilestoneAdminEmail"> = getEmailService(),
  ) {}

  private async ensureTeacherNotification(achievement: EBookletMilestoneNotificationAchievement, targetLink: string) {
    const where = {
      user_id: achievement.teacher_id,
      message_key: notification_key_enum.E_BOOKLET_MILESTONE_ACHIEVED,
      entity_type: MILESTONE_ENTITY_TYPE,
      entity_id: achievement.id,
    };
    const existing = await this.db.notifications.findFirst?.({ where });
    if (existing) return { notification: existing, created: false };
    const notification = await this.db.notifications.create({
      data: {
        user_id: achievement.teacher_id,
        category: E_BOOKLET_MILESTONE_NOTIFICATION_CATEGORY,
        message_key: notification_key_enum.E_BOOKLET_MILESTONE_ACHIEVED,
        entity_type: MILESTONE_ENTITY_TYPE,
        entity_id: achievement.id,
        target_link: targetLink,
      },
    });
    return { notification, created: true };
  }

  async notifyMilestoneAchievements(
    achievements: EBookletMilestoneNotificationAchievement[],
    context: EBookletMilestoneNotificationContext = {},
  ): Promise<void> {
    if (achievements.length === 0) return;
    const milestoneById = new Map((context.milestones ?? []).map((milestone) => [milestone.id, milestone]));

    for (const achievement of achievements) {
      const teacher = await this.db.users.findUnique({
        where: { id: achievement.teacher_id },
        select: { id: true, name: true, email: true },
      });
      if (!teacher) continue;

      const milestone = milestoneById.get(achievement.milestone_id);
      const notificationRecipients = achievement.notification_recipients ?? (milestone as any)?.notification_recipients ?? "admins";
      const notifyTeacher = notificationRecipients === "teacher_and_admins";
      const notifyAdmins = notificationRecipients === "admins" || notificationRecipients === "teacher_and_admins";
      const milestoneTitle = milestone?.title ?? `Milestone #${achievement.milestone_id}`;
      const teacherTargetLink = `/teacher/e-booklets/milestones/${achievement.id}`;
      const adminTargetLink = `/admin/e-booklets/milestones/${achievement.id}`;
      let teacherNotificationResult: any = { notification: null, created: false };
      if (notifyTeacher) {
        teacherNotificationResult = await this.ensureTeacherNotification(achievement, teacherTargetLink);
      }
      const teacherNotification = teacherNotificationResult.notification;
      if (context.io && teacherNotificationResult.created && teacherNotification) {
        emitNotificationToUser(context.io, achievement.teacher_id, {
          id: teacherNotification.id,
          category: teacherNotification.category,
          message_key: teacherNotification.message_key,
          entity_type: teacherNotification.entity_type,
          entity_id: teacherNotification.entity_id,
          target_link: teacherNotification.target_link,
          created_at: teacherNotification.created_at,
        });
      }

      const admins = notifyAdmins ? await this.db.users.findMany({
        where: {
          user_roles: {
            some: { portal: "store", role: { in: ["Admin", "SubAdmin"] } },
          },
          OR: [{ is_deleted: false }, { is_deleted: null }],
        },
        select: { id: true, name: true, email: true },
      }) : [];
      const adminIds = admins.map((admin: any) => admin.id);
      let missingAdminIds: number[] = [];
      let createdAdminIds: number[] = [];
      if (adminIds.length > 0) {
        const existingAdminNotifications = await this.db.notifications.findMany?.({
          where: {
            user_id: { in: adminIds },
            message_key: notification_key_enum.E_BOOKLET_MILESTONE_ADMIN_ALERT,
            entity_type: MILESTONE_ENTITY_TYPE,
            entity_id: achievement.id,
          },
          select: { user_id: true },
        });
        const alreadyNotifiedAdminIds = new Set((existingAdminNotifications ?? []).map((row: any) => row.user_id));
        missingAdminIds = adminIds.filter((adminId: number) => !alreadyNotifiedAdminIds.has(adminId));
        if (missingAdminIds.length > 0) {
          const createResult = await this.db.notifications.createMany({
            data: missingAdminIds.map((adminId: number) => ({
              user_id: adminId,
              category: E_BOOKLET_MILESTONE_NOTIFICATION_CATEGORY,
              message_key: notification_key_enum.E_BOOKLET_MILESTONE_ADMIN_ALERT,
              entity_type: MILESTONE_ENTITY_TYPE,
              entity_id: achievement.id,
              target_link: adminTargetLink,
            })),
            skipDuplicates: true,
          });
          createdAdminIds = Number(createResult?.count ?? missingAdminIds.length) === missingAdminIds.length ? missingAdminIds : [];
        }
        if (context.io && createdAdminIds.length > 0) {
          emitNotificationToUsers(context.io, createdAdminIds, {
            id: 0,
            category: E_BOOKLET_MILESTONE_NOTIFICATION_CATEGORY,
            message_key: notification_key_enum.E_BOOKLET_MILESTONE_ADMIN_ALERT,
            entity_type: MILESTONE_ENTITY_TYPE,
            entity_id: achievement.id,
            target_link: adminTargetLink,
            created_at: null,
          });
        }
      }

      const commonEmailData = {
        teacherName: teacher.name,
        milestoneTitle,
        paidRedemptions: Number(achievement.paid_redemptions_snapshot ?? 0),
        rewardAmount: number(achievement.reward_amount),
        termName: context.term?.name ?? null,
      };
      if (teacherNotificationResult.created && teacher.email) {
        await this.emailService.sendEBookletMilestoneTeacherEmail(teacher.email, {
          ...commonEmailData,
          dashboardUrl: context.dashboardUrl ?? teacherTargetLink,
        });
      }
      const missingAdminIdSet = new Set(createdAdminIds ?? []);
      for (const admin of admins) {
        if (admin.email && missingAdminIdSet.has(admin.id)) {
          await this.emailService.sendEBookletMilestoneAdminEmail(admin.email, {
            ...commonEmailData,
            dashboardUrl: adminTargetLink,
          });
        }
      }
    }
  }
}
