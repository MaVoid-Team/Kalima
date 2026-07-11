jest.mock("../../src/libs/redis/socketNotificationEmitter", () => ({
  emitNotificationToUser: jest.fn(),
  emitNotificationToUsers: jest.fn(),
}));

import { EBookletMilestoneService } from "../../src/apps/store-api/services/e-booklet-milestone.service";
import { EBookletMilestoneNotificationService } from "../../src/apps/store-api/services/e-booklet-milestone-notification.service";
import {
  getEBookletMilestoneAdminEmailHtml,
  getEBookletMilestoneAdminEmailSubject,
  getEBookletMilestoneTeacherEmailHtml,
  getEBookletMilestoneTeacherEmailSubject,
} from "../../src/apps/store-api/emails/templates/e-booklet-milestone-achievement.template";
import { notification_key_enum } from "../../src/apps/store-api/generated/prisma/client";
import { emitNotificationToUser, emitNotificationToUsers } from "../../src/libs/redis/socketNotificationEmitter";

function createDb(overrides: Record<string, unknown> = {}) {
  const db: any = {
    e_booklet_terms: { findFirst: jest.fn() },
    e_booklet_access_code_redemptions: { count: jest.fn() },
    e_booklet_milestones: { findMany: jest.fn() },
    e_booklet_milestone_achievements: { findUnique: jest.fn(), create: jest.fn() },
    notifications: { create: jest.fn(), createMany: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    users: { findUnique: jest.fn(), findMany: jest.fn() },
    user_roles: { findMany: jest.fn() },
    ...overrides,
  };
  db.$transaction = jest.fn(async (callback: (tx: any) => Promise<unknown>) => callback(db));
  return db;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Phase 4 e-booklet milestone notifications and emails", () => {
  test("milestone evaluation creates teacher/admin notification rows, emits sockets, and sends milestone emails after achievement", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, name: "June Term", status: "active" });
    db.e_booklet_access_code_redemptions.count.mockResolvedValue(10);
    db.e_booklet_milestones.findMany.mockResolvedValue([
      { id: 2, term_id: 1, title: "10 paid readers", target_paid_redemptions: 10, milestone_price: 180, previous_price_snapshot: 220, reward_amount_snapshot: 40, active: true, notification_recipients: "teacher_and_admins" },
    ]);
    db.e_booklet_milestone_achievements.findUnique.mockResolvedValue(null);
    db.e_booklet_milestone_achievements.create.mockResolvedValue({ id: 7, teacher_id: 9, term_id: 1, milestone_id: 2, reward_amount: 40, paid_redemptions_snapshot: 10 });
    db.notifications.findFirst.mockResolvedValue(null);
    db.notifications.create.mockResolvedValue({ id: 70, category: 8, message_key: notification_key_enum.E_BOOKLET_MILESTONE_ACHIEVED, entity_type: "e_booklet_milestone_achievement", entity_id: 7, target_link: "/teacher/e-booklets", created_at: new Date("2026-06-14T00:00:00.000Z") });
    db.users.findUnique.mockResolvedValue({ id: 9, name: "Teacher One", email: "teacher@example.com" });
    db.users.findMany.mockResolvedValue([
      { id: 1, name: "Admin", email: "admin@example.com" },
      { id: 2, name: "Sub", email: "sub@example.com" },
    ]);
    const emailService = { sendEBookletMilestoneTeacherEmail: jest.fn().mockResolvedValue(true), sendEBookletMilestoneAdminEmail: jest.fn().mockResolvedValue(true) };
    const notifier = new EBookletMilestoneNotificationService(db, emailService as any);
    const service = new EBookletMilestoneService(db, { milestoneNotifier: notifier });
    const io = {} as any;

    const result: any = await service.evaluateTeacherMilestones(9, 1, { io });

    expect(result.awarded).toHaveLength(1);
    expect(db.notifications.create).toHaveBeenCalledWith({ data: expect.objectContaining({ user_id: 9, category: expect.any(Number), message_key: notification_key_enum.E_BOOKLET_MILESTONE_ACHIEVED, entity_type: "e_booklet_milestone_achievement", entity_id: 7, target_link: "/teacher/e-booklets" }) });
    expect(db.notifications.createMany).toHaveBeenCalledWith({ data: expect.arrayContaining([
      expect.objectContaining({ user_id: 1, message_key: notification_key_enum.E_BOOKLET_MILESTONE_ADMIN_ALERT, entity_type: "e_booklet_milestone_achievement", entity_id: 7, target_link: "/admin/e-booklets/settings/terms-milestones" }),
      expect.objectContaining({ user_id: 2, message_key: notification_key_enum.E_BOOKLET_MILESTONE_ADMIN_ALERT, entity_type: "e_booklet_milestone_achievement", entity_id: 7, target_link: "/admin/e-booklets/settings/terms-milestones" }),
    ]), skipDuplicates: true });
    expect(emitNotificationToUser).toHaveBeenCalledWith(io, 9, expect.objectContaining({ id: 70, entity_id: 7 }));
    expect(emitNotificationToUsers).toHaveBeenCalledWith(io, [1, 2], expect.objectContaining({ entity_id: 7, target_link: "/admin/e-booklets/settings/terms-milestones" }));
    expect(emailService.sendEBookletMilestoneTeacherEmail).toHaveBeenCalledWith("teacher@example.com", expect.objectContaining({ teacherName: "Teacher One", milestoneTitle: "10 paid readers", rewardAmount: 40, dashboardUrl: "/teacher/e-booklets" }));
    expect(emailService.sendEBookletMilestoneAdminEmail).toHaveBeenCalledWith("admin@example.com", expect.objectContaining({ dashboardUrl: "/admin/e-booklets/settings/terms-milestones" }));
    expect(emailService.sendEBookletMilestoneAdminEmail).toHaveBeenCalledTimes(2);
  });

  test("admin in-app notifications include admins without email and legacy null is_deleted rows", async () => {
    const db = createDb();
    db.notifications.findFirst.mockResolvedValue(null);
    db.notifications.create.mockResolvedValue({ id: 70, category: 8, message_key: notification_key_enum.E_BOOKLET_MILESTONE_ACHIEVED, entity_type: "e_booklet_milestone_achievement", entity_id: 7, target_link: "/teacher/e-booklets/milestones/7", created_at: null });
    db.users.findUnique.mockResolvedValue({ id: 9, name: "Teacher One", email: "teacher@example.com" });
    db.users.findMany.mockResolvedValue([
      { id: 1, name: "Admin With Email", email: "admin@example.com" },
      { id: 2, name: "Admin No Email", email: null },
    ]);
    const emailService = { sendEBookletMilestoneTeacherEmail: jest.fn().mockResolvedValue(true), sendEBookletMilestoneAdminEmail: jest.fn().mockResolvedValue(true) };
    const notifier = new EBookletMilestoneNotificationService(db, emailService as any);

    await notifier.notifyMilestoneAchievements([{ id: 7, teacher_id: 9, term_id: 1, milestone_id: 2, reward_amount: 40, paid_redemptions_snapshot: 10 }], { term: { id: 1, name: "June Term" }, milestones: [{ id: 2, title: "10 paid readers" }] });

    expect(db.users.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        user_roles: { some: { portal: "store", role: { in: ["Admin", "SubAdmin"] } } },
        OR: [{ is_deleted: false }, { is_deleted: null }],
      }),
    }));
    expect(JSON.stringify(db.users.findMany.mock.calls[0][0].where)).not.toContain("email");
    expect(db.notifications.createMany).toHaveBeenCalledWith({ data: expect.arrayContaining([
      expect.objectContaining({ user_id: 1 }),
      expect.objectContaining({ user_id: 2 }),
    ]), skipDuplicates: true });
    expect(emailService.sendEBookletMilestoneAdminEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendEBookletMilestoneAdminEmail).toHaveBeenCalledWith("admin@example.com", expect.any(Object));
  });

  test("existing achievements are not re-notified during regular milestone evaluation", async () => {
    const db = createDb();
    const existing = { id: 7, teacher_id: 9, term_id: 1, milestone_id: 2, reward_amount: 40, paid_redemptions_snapshot: 10 };
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, name: "June Term", status: "active" });
    db.e_booklet_access_code_redemptions.count.mockResolvedValue(10);
    db.e_booklet_milestones.findMany.mockResolvedValue([{ id: 2, term_id: 1, title: "10 paid readers", target_paid_redemptions: 10, reward_amount_snapshot: 40, active: true, notification_recipients: "teacher_and_admins" }]);
    db.e_booklet_milestone_achievements.findUnique.mockResolvedValue(existing);
    const milestoneNotifier = { notifyMilestoneAchievements: jest.fn().mockResolvedValue(undefined) };
    const service = new EBookletMilestoneService(db, { milestoneNotifier });

    const result: any = await service.evaluateTeacherMilestones(9, 1);

    expect(result.awarded).toHaveLength(0);
    expect(db.e_booklet_milestone_achievements.create).not.toHaveBeenCalled();
    expect(milestoneNotifier.notifyMilestoneAchievements).not.toHaveBeenCalled();
  });

  test("admin notification retry does not create duplicate admin notification rows", async () => {
    const db = createDb();
    db.notifications.findFirst.mockResolvedValue({ id: 70, category: 8, message_key: notification_key_enum.E_BOOKLET_MILESTONE_ACHIEVED, entity_type: "e_booklet_milestone_achievement", entity_id: 7, target_link: "/teacher/e-booklets/milestones/7", created_at: null });
    db.notifications.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ user_id: 1 }, { user_id: 2 }]);
    db.users.findUnique.mockResolvedValue({ id: 9, name: "Teacher One", email: null });
    db.users.findMany.mockResolvedValue([
      { id: 1, name: "Admin", email: null },
      { id: 2, name: "Sub", email: null },
    ]);
    const emailService = { sendEBookletMilestoneTeacherEmail: jest.fn().mockResolvedValue(true), sendEBookletMilestoneAdminEmail: jest.fn().mockResolvedValue(true) };
    const notifier = new EBookletMilestoneNotificationService(db, emailService as any);
    const achievement = { id: 7, teacher_id: 9, term_id: 1, milestone_id: 2, reward_amount: 40, paid_redemptions_snapshot: 10 };

    await notifier.notifyMilestoneAchievements([achievement], { milestones: [{ id: 2, title: "10 paid readers" }] });
    await notifier.notifyMilestoneAchievements([achievement], { milestones: [{ id: 2, title: "10 paid readers" }] });

    expect(db.notifications.createMany).toHaveBeenCalledTimes(1);
    expect(db.notifications.createMany).toHaveBeenCalledWith({ data: expect.arrayContaining([
      expect.objectContaining({ user_id: 1, entity_id: 7 }),
      expect.objectContaining({ user_id: 2, entity_id: 7 }),
    ]), skipDuplicates: true });
  });

  test("notification retry does not resend milestone emails or socket events when all notification rows already exist", async () => {
    const db = createDb();
    const teacherNotification = { id: 70, category: 8, message_key: notification_key_enum.E_BOOKLET_MILESTONE_ACHIEVED, entity_type: "e_booklet_milestone_achievement", entity_id: 7, target_link: "/teacher/e-booklets/milestones/7", created_at: null };
    db.notifications.findFirst.mockResolvedValue(teacherNotification);
    db.notifications.findMany.mockResolvedValue([{ user_id: 1 }, { user_id: 2 }]);
    db.users.findUnique.mockResolvedValue({ id: 9, name: "Teacher One", email: "teacher@example.com" });
    db.users.findMany.mockResolvedValue([
      { id: 1, name: "Admin", email: "admin@example.com" },
      { id: 2, name: "Sub", email: "sub@example.com" },
    ]);
    const emailService = { sendEBookletMilestoneTeacherEmail: jest.fn().mockResolvedValue(true), sendEBookletMilestoneAdminEmail: jest.fn().mockResolvedValue(true) };
    const notifier = new EBookletMilestoneNotificationService(db, emailService as any);
    const achievement = { id: 7, teacher_id: 9, term_id: 1, milestone_id: 2, reward_amount: 40, paid_redemptions_snapshot: 10 };

    await notifier.notifyMilestoneAchievements([achievement], { milestones: [{ id: 2, title: "10 paid readers" }], io: {} as any });

    expect(db.notifications.create).not.toHaveBeenCalled();
    expect(db.notifications.createMany).not.toHaveBeenCalled();
    expect(emitNotificationToUser).not.toHaveBeenCalled();
    expect(emitNotificationToUsers).not.toHaveBeenCalled();
    expect(emailService.sendEBookletMilestoneTeacherEmail).not.toHaveBeenCalled();
    expect(emailService.sendEBookletMilestoneAdminEmail).not.toHaveBeenCalled();
  });

  test("admins-only milestone policy suppresses teacher notification email and socket while notifying admins", async () => {
    const db = createDb();
    db.notifications.findMany.mockResolvedValue([]);
    db.users.findUnique.mockResolvedValue({ id: 9, name: "Teacher One", email: "teacher@example.com" });
    db.users.findMany.mockResolvedValue([{ id: 1, name: "Admin", email: "admin@example.com" }]);
    const emailService = { sendEBookletMilestoneTeacherEmail: jest.fn().mockResolvedValue(true), sendEBookletMilestoneAdminEmail: jest.fn().mockResolvedValue(true) };
    const notifier = new EBookletMilestoneNotificationService(db, emailService as any);
    const io = {} as any;

    await notifier.notifyMilestoneAchievements([{ id: 7, teacher_id: 9, term_id: 1, milestone_id: 2, reward_amount: 40, paid_redemptions_snapshot: 10, notification_recipients: "admins" }], { milestones: [{ id: 2, title: "10 paid readers" }], io });

    expect(db.notifications.create).not.toHaveBeenCalled();
    expect(emitNotificationToUser).not.toHaveBeenCalled();
    expect(emailService.sendEBookletMilestoneTeacherEmail).not.toHaveBeenCalled();
    expect(db.notifications.createMany).toHaveBeenCalledWith({ data: [expect.objectContaining({ user_id: 1, message_key: notification_key_enum.E_BOOKLET_MILESTONE_ADMIN_ALERT })], skipDuplicates: true });
    expect(emitNotificationToUsers).toHaveBeenCalledWith(io, [1], expect.objectContaining({ entity_id: 7 }));
    expect(emailService.sendEBookletMilestoneAdminEmail).toHaveBeenCalledWith("admin@example.com", expect.any(Object));
  });

  test("global milestone notification settings suppress teacher and admin milestone notifications", async () => {
    const db = createDb({
      e_booklet_global_settings: {
        upsert: jest.fn().mockResolvedValue({
          notify_teacher_on_milestone: false,
          notify_admins_on_milestone: false,
        }),
      },
    });
    db.users.findUnique.mockResolvedValue({ id: 9, name: "Teacher One", email: "teacher@example.com" });
    const emailService = { sendEBookletMilestoneTeacherEmail: jest.fn().mockResolvedValue(true), sendEBookletMilestoneAdminEmail: jest.fn().mockResolvedValue(true) };
    const notifier = new EBookletMilestoneNotificationService(db, emailService as any);

    await notifier.notifyMilestoneAchievements([{ id: 7, teacher_id: 9, term_id: 1, milestone_id: 2, reward_amount: 40, paid_redemptions_snapshot: 10, notification_recipients: "teacher_and_admins" }], { milestones: [{ id: 2, title: "10 paid readers" }], io: {} as any });

    expect(db.notifications.create).not.toHaveBeenCalled();
    expect(db.notifications.createMany).not.toHaveBeenCalled();
    expect(db.users.findMany).not.toHaveBeenCalled();
    expect(emitNotificationToUser).not.toHaveBeenCalled();
    expect(emitNotificationToUsers).not.toHaveBeenCalled();
    expect(emailService.sendEBookletMilestoneTeacherEmail).not.toHaveBeenCalled();
    expect(emailService.sendEBookletMilestoneAdminEmail).not.toHaveBeenCalled();
  });

  test("concurrent admin notification loser does not emit or email duplicate admin alerts", async () => {
    const db = createDb();
    db.notifications.findFirst.mockResolvedValue(null);
    db.notifications.create.mockResolvedValue({ id: 70, category: 8, message_key: notification_key_enum.E_BOOKLET_MILESTONE_ACHIEVED, entity_type: "e_booklet_milestone_achievement", entity_id: 7, target_link: "/teacher/e-booklets/milestones/7", created_at: null });
    db.notifications.findMany.mockResolvedValue([]);
    db.notifications.createMany.mockResolvedValue({ count: 0 });
    db.users.findUnique.mockResolvedValue({ id: 9, name: "Teacher One", email: null });
    db.users.findMany.mockResolvedValue([{ id: 1, name: "Admin", email: "admin@example.com" }]);
    const emailService = { sendEBookletMilestoneTeacherEmail: jest.fn().mockResolvedValue(true), sendEBookletMilestoneAdminEmail: jest.fn().mockResolvedValue(true) };
    const notifier = new EBookletMilestoneNotificationService(db, emailService as any);
    const io = {} as any;

    await notifier.notifyMilestoneAchievements([{ id: 7, teacher_id: 9, term_id: 1, milestone_id: 2, reward_amount: 40, paid_redemptions_snapshot: 10 }], { milestones: [{ id: 2, title: "10 paid readers" }], io });

    expect(db.notifications.createMany).toHaveBeenCalledWith({ data: [expect.objectContaining({ user_id: 1 })], skipDuplicates: true });
    expect(emitNotificationToUsers).not.toHaveBeenCalled();
    expect(emailService.sendEBookletMilestoneAdminEmail).not.toHaveBeenCalled();
  });

  test("milestone email templates escape html content and reject unsafe href values", () => {
    const data = { teacherName: "<img src=x onerror=alert(1)>", milestoneTitle: "<b>10 paid readers</b>", paidRedemptions: 10, rewardAmount: 40, termName: "June & <Term>", dashboardUrl: "javascript:alert(1)" };

    const teacherHtml = getEBookletMilestoneTeacherEmailHtml(data);
    const adminHtml = getEBookletMilestoneAdminEmailHtml(data);

    expect(teacherHtml).not.toContain("<img");
    expect(teacherHtml).not.toContain("<b>10 paid readers</b>");
    expect(teacherHtml).not.toContain("javascript:alert");
    expect(teacherHtml).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(teacherHtml).toContain("June &amp; &lt;Term&gt;");
    expect(adminHtml).not.toContain("javascript:alert");
  });

  test("milestone email templates include teacher, milestone, reward, and admin context", () => {
    const data = { teacherName: "Teacher One", milestoneTitle: "10 paid readers", paidRedemptions: 10, rewardAmount: 40, termName: "June Term", dashboardUrl: "https://kalima.example/teacher/e-booklets" };

    expect(getEBookletMilestoneTeacherEmailSubject(data)).toContain("10 paid readers");
    expect(getEBookletMilestoneTeacherEmailHtml(data)).toContain("Teacher One");
    expect(getEBookletMilestoneTeacherEmailHtml(data)).toContain("40");
    expect(getEBookletMilestoneAdminEmailSubject(data)).toContain("Teacher One");
    expect(getEBookletMilestoneAdminEmailHtml(data)).toContain("10 paid readers");
  });
});
