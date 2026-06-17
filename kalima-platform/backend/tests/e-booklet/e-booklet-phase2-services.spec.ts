import { EBookletTermsService } from "../../src/apps/store-api/services/e-booklet-terms.service";
import { EBookletAccessCodeService, hashEBookletAccessCode } from "../../src/apps/store-api/services/e-booklet-access-code.service";
import { EBookletRedemptionService } from "../../src/apps/store-api/services/e-booklet-redemption.service";
import { EBookletMilestoneService } from "../../src/apps/store-api/services/e-booklet-milestone.service";
import { TeacherWalletService } from "../../src/apps/store-api/services/teacher-wallet.service";

function createDb(overrides: Record<string, unknown> = {}) {
  const db: any = {
    e_booklet_terms: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    e_booklet_teacher_terms_acceptances: { findFirst: jest.fn(), create: jest.fn() },
    e_booklet_instances: { findFirst: jest.fn() },
    e_booklet_access_codes: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), aggregate: jest.fn() },
    e_booklet_access_code_redemptions: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    e_booklet_access: { findFirst: jest.fn(), create: jest.fn(), upsert: jest.fn() },
    e_booklet_milestones: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), findFirst: jest.fn() },
    e_booklet_milestone_achievements: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    teacher_wallets: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    teacher_wallet_ledger: { create: jest.fn(), aggregate: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    purchases: { findFirst: jest.fn(), update: jest.fn() },
    e_booklet_purchases: { findFirst: jest.fn(), update: jest.fn() },
    purchase_items: { findMany: jest.fn() },
    coupon_usages: { findFirst: jest.fn() },
    users: { findUnique: jest.fn(), findMany: jest.fn() },
    notifications: { create: jest.fn(), createMany: jest.fn() },
    e_booklet_audit_logs: { create: jest.fn() },
    ...overrides,
  };
  db.$transaction = jest.fn(async (callback: (tx: any) => Promise<unknown>) => callback(db));
  return db;
}

describe("Phase 2 e-booklet terms/codes/redemptions/milestones/wallet services", () => {
  beforeAll(() => {
    process.env.E_BOOKLET_ACCESS_CODE_SECRET = "test-e-booklet-access-code-secret";
  });

  test("terms service uses real term fields and records code-generation acceptance", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst
      .mockResolvedValueOnce({ id: 1, name: "Term 1", status: "active", active_guard: "global-active", code_generation_terms: "Generate terms", reward_claim_terms: "Reward terms" })
      .mockResolvedValueOnce({ id: 1, name: "Term 1", status: "active", active_guard: "global-active", code_generation_terms: "Generate terms", reward_claim_terms: "Reward terms" })
      .mockResolvedValueOnce({ id: 1, name: "Term 1", status: "active", active_guard: "global-active", code_generation_terms: "Generate terms", reward_claim_terms: "Reward terms" });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 8, term_id: 1, acceptance_type: "code_generation" });
    db.e_booklet_teacher_terms_acceptances.create.mockResolvedValue({ id: 7, teacher_id: 9, term_id: 1, acceptance_type: "code_generation" });
    const service = new EBookletTermsService(db);

    await expect(service.createTerms({ name: "Term 2", codeGenerationTerms: "Terms", rewardClaimTerms: "Reward", startsAt: new Date("2026-01-01T00:00:00.000Z"), status: "active" }, 1)).rejects.toThrow("already has an active terms version");
    await expect(service.acceptLatestTerms(9, "code_generation", { ipAddress: "127.0.0.1" })).resolves.toEqual({ id: 7, teacher_id: 9, term_id: 1, acceptance_type: "code_generation" });
    await expect(service.acceptLatestTerms(9, "code_generation")).resolves.toEqual({ id: 8, term_id: 1, acceptance_type: "code_generation" });
    expect(db.e_booklet_teacher_terms_acceptances.create).toHaveBeenCalledWith({ data: expect.objectContaining({ teacher_id: 9, term_id: 1, acceptance_type: "code_generation", terms_snapshot: "Generate terms", ip_address: "127.0.0.1" }) });
  });

  test("terms acceptance is idempotent when concurrent requests hit the unique index", async () => {
    const db = createDb();
    const existingAcceptance = { id: 11, teacher_id: 9, term_id: 1, acceptance_type: "code_generation" };
    db.e_booklet_terms.findFirst.mockResolvedValue({
      id: 1,
      name: "Term 1",
      status: "active",
      active_guard: "global-active",
      code_generation_terms: "Generate terms",
    });
    db.e_booklet_teacher_terms_acceptances.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingAcceptance);
    db.e_booklet_teacher_terms_acceptances.create.mockRejectedValue({ code: "P2002" });
    const service = new EBookletTermsService(db);

    await expect(service.acceptLatestTerms(9, "code_generation")).resolves.toEqual(existingAcceptance);
    expect(db.e_booklet_teacher_terms_acceptances.create).toHaveBeenCalledTimes(1);
    expect(db.e_booklet_teacher_terms_acceptances.findFirst).toHaveBeenNthCalledWith(2, {
      where: {
        teacher_id: 9,
        term_id: 1,
        acceptance_type: "code_generation",
        milestone_achievement_id: null,
      },
    });
  });

  test("terms service falls back from template-specific lookup to active global terms", async () => {
    const db = createDb();
    const globalTerm = { id: 5, name: "Global", status: "active", template_id: null, code_generation_terms: "Global code" };
    db.e_booklet_terms.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(globalTerm)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(globalTerm);
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValue(null);
    db.e_booklet_teacher_terms_acceptances.create.mockResolvedValue({ id: 9, teacher_id: 4, term_id: 5, acceptance_type: "code_generation" });
    const service = new EBookletTermsService(db);

    await expect(service.getLatestActiveTerms(99)).resolves.toBe(globalTerm);
    await expect(service.acceptLatestTerms(4, "code_generation", {}, 99)).resolves.toEqual(expect.objectContaining({ term_id: 5 }));
    expect(db.e_booklet_terms.findFirst).toHaveBeenNthCalledWith(1, expect.objectContaining({ where: expect.objectContaining({ template_id: 99 }) }));
    expect(db.e_booklet_terms.findFirst).toHaveBeenNthCalledWith(2, expect.objectContaining({ where: expect.objectContaining({ template_id: null }) }));
    expect(db.e_booklet_teacher_terms_acceptances.create).toHaveBeenCalledWith({ data: expect.objectContaining({ teacher_id: 4, term_id: 5, acceptance_type: "code_generation", terms_snapshot: "Global code" }) });
  });

  test("terms service prefers template-specific active terms over global fallback", async () => {
    const db = createDb();
    const templateTerm = { id: 6, name: "Template", status: "active", template_id: 99 };
    db.e_booklet_terms.findFirst.mockResolvedValue(templateTerm);
    const service = new EBookletTermsService(db);

    await expect(service.getLatestActiveTerms(99)).resolves.toBe(templateTerm);
    expect(db.e_booklet_terms.findFirst).toHaveBeenCalledTimes(1);
    expect(db.e_booklet_terms.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ template_id: 99 }) }));
  });

  test("access code service uses real schema fields, template-scoped terms, and URL+code WhatsApp messages", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst
      .mockResolvedValueOnce({ id: 1, status: "active", template_id: 99, active_guard: "template:99" })
      .mockResolvedValueOnce({ id: 1, status: "active", template_id: 99, active_guard: "template:99" });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 2, term_id: 1, acceptance_type: "code_generation" });
    db.e_booklet_access_codes.findUnique.mockResolvedValue(null);
    db.e_booklet_instances.findFirst.mockResolvedValue({ id: 10, teacher_id: 9, template_id: 99, status: "active" });
    db.e_booklet_access_codes.create.mockImplementation(async ({ data }: any) => ({ id: 2, ...data }));
    const service = new EBookletAccessCodeService(db);

    await expect(service.generateCode({ bookletInstanceId: 10, teacherId: 9, kind: "paid", termId: 1 })).rejects.toThrow("Code-generation terms must be accepted");
    const result: any = await service.generateCode({ bookletInstanceId: 10, teacherId: 9, kind: "paid", termId: 1 });

    expect(result.code).toMatch(/^KLM-[A-Z0-9]{12}$/);
    expect(result.redeemUrl).toMatch(/\/e-booklet-code$/);
    expect(result.whatsappMessage).toContain(result.code);
    expect(result.whatsappMessage).toContain(result.redeemUrl);
    expect(result.record.code_hash).toBeUndefined();
    expect(result.record.code_plaintext).toBeUndefined();
    expect(db.e_booklet_audit_logs.create).not.toHaveBeenCalled();
    expect(db.e_booklet_instances.findFirst).toHaveBeenCalledWith({ where: { id: 10, teacher_id: 9, status: "active" }, include: { template: true } });
    expect(db.e_booklet_access_codes.create).toHaveBeenCalledWith({ data: expect.objectContaining({ booklet_instance_id: 10, teacher_id: 9, kind: "paid", max_redemptions: 1, term_id: 1, code_hint: expect.any(String) }) });
  });

  test("access code service enforces paid seat quota and bulk-generates codes after approval", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, status: "active", template_id: 99 });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValue({ id: 2, term_id: 1, acceptance_type: "code_generation" });
    db.e_booklet_instances.findFirst.mockResolvedValue({ id: 10, teacher_id: 9, template_id: 99, status: "active", invite_quota: 3 });
    db.e_booklet_access_codes.aggregate.mockResolvedValue({ _sum: { max_redemptions: 2 } });
    db.e_booklet_access_codes.findUnique.mockResolvedValue(null);
    db.e_booklet_access_codes.create.mockImplementation(async ({ data }: any) => ({ id: Math.floor(Math.random() * 10000), ...data }));
    const service = new EBookletAccessCodeService(db);

    await expect(service.generateCodes({ bookletInstanceId: 10, teacherId: 9, kind: "paid", termId: 1, count: 2 })).rejects.toThrow("Not enough available student seats");
    await expect(service.generateCodes({ bookletInstanceId: 10, teacherId: 9, kind: "paid", termId: 1, count: 1 })).resolves.toMatchObject({ count: 1 });

    expect(db.e_booklet_access_codes.aggregate).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ booklet_instance_id: 10, teacher_id: 9, kind: "paid", status: { in: ["active", "redeemed"] } }),
      _sum: { max_redemptions: true },
    }));
    expect(db.e_booklet_access_codes.create).toHaveBeenCalledTimes(1);
  });

  test("access code service lists sanitized teacher code statuses without hashes", async () => {
    const db = createDb();
    db.e_booklet_access_codes.findMany.mockResolvedValue([{ id: 7, code_hash: "secret", code_hint: "ABCD", status: "active", kind: "paid" }]);
    const service = new EBookletAccessCodeService(db);

    await expect(service.listCodes({ teacherId: 9, bookletInstanceId: 10, status: "active" as any })).resolves.toEqual([{ id: 7, code_hint: "ABCD", status: "active", kind: "paid" }]);
    expect(db.e_booklet_access_codes.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ teacher_id: 9, booklet_instance_id: 10, status: "active" }) }));
  });

  test("free shared access codes do not reserve paid student seats", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, status: "active", template_id: 99 });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValue({ id: 3, term_id: 1, term: { id: 1, template_id: 99 }, acceptance_type: "code_generation" });
    db.e_booklet_instances.findFirst.mockResolvedValue({ id: 10, teacher_id: 9, template_id: 99, status: "active", invite_quota: 0 });
    db.e_booklet_access_codes.create.mockResolvedValue({ id: 8, code_hint: "FREE", kind: "free", status: "active" });
    const service = new EBookletAccessCodeService(db);

    await service.generateCode({ bookletInstanceId: 10, teacherId: 9, kind: "free", termId: 1, maxRedemptions: 999999 });

    expect(db.e_booklet_access_codes.aggregate).not.toHaveBeenCalled();
    expect(db.e_booklet_access_codes.create).toHaveBeenCalledWith({ data: expect.objectContaining({ kind: "free", max_redemptions: 999999 }) });
  });

  test("access code service audits admin-generated free codes", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, status: "active", template_id: 99 });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValue(null);
    db.e_booklet_instances.findFirst.mockResolvedValue({ id: 10, teacher_id: 9, template_id: 99, status: "active" });
    db.e_booklet_access_codes.findUnique.mockResolvedValue(null);
    db.e_booklet_access_codes.create.mockResolvedValue({ id: 44, kind: "free" });
    const service = new EBookletAccessCodeService(db);

    await service.generateCode({ bookletInstanceId: 10, teacherId: 9, kind: "free", termId: 1, adminActorId: 5, ipAddress: "127.0.0.1", userAgent: "jest" });

    expect(db.e_booklet_teacher_terms_acceptances.findFirst).not.toHaveBeenCalled();
    expect(db.e_booklet_audit_logs.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      actor_user_id: 5,
      action: "admin_generate_free_access_code",
      entity_type: "e_booklet_access_code",
      entity_id: 44,
      ip_address: "127.0.0.1",
      user_agent: "jest",
      metadata_json: expect.objectContaining({ teacher_id: 9, booklet_instance_id: 10, term_id: 1, kind: "free" }),
    }) });
  });

  test("access code service rejects wrong-template terms for instance code generation", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 2, status: "active", template_id: 88, active_guard: "template:88" });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValue({ id: 3, term_id: 2, acceptance_type: "code_generation" });
    db.e_booklet_instances.findFirst.mockResolvedValue({ id: 10, teacher_id: 9, template_id: 99, status: "active" });
    const service = new EBookletAccessCodeService(db);

    await expect(service.generateCode({ bookletInstanceId: 10, teacherId: 9, kind: "paid", termId: 2 })).rejects.toThrow("Terms do not match this e-booklet template");
    expect(db.e_booklet_access_codes.create).not.toHaveBeenCalled();
  });

  test("access code service includes current-window constraints when loading active terms", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, status: "active", template_id: 99, starts_at: new Date("2027-01-01T00:00:00.000Z"), ends_at: null });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValue({ id: 2, term_id: 1, acceptance_type: "code_generation" });
    db.e_booklet_instances.findFirst.mockResolvedValue({ id: 10, teacher_id: 9, template_id: 99, status: "active" });
    db.e_booklet_access_codes.findUnique.mockResolvedValue(null);
    db.e_booklet_access_codes.create.mockResolvedValue({ id: 2, kind: "paid" });
    const service = new EBookletAccessCodeService(db);

    await service.generateCode({ bookletInstanceId: 10, teacherId: 9, kind: "paid", termId: 1 });

    expect(db.e_booklet_terms.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: 1,
        status: "active",
        starts_at: expect.objectContaining({ lte: expect.any(Date) }),
        OR: [{ ends_at: null }, { ends_at: expect.objectContaining({ gt: expect.any(Date) }) }],
      }),
    }));
  });

  test("access code service rejects code generation for another teacher instance", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, status: "active", active_guard: "global-active" });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValue({ id: 2, term_id: 1, acceptance_type: "code_generation" });
    db.e_booklet_instances.findFirst.mockResolvedValue(null);
    const service = new EBookletAccessCodeService(db);

    await expect(service.generateCode({ bookletInstanceId: 10, teacherId: 9, kind: "paid", termId: 1 })).rejects.toThrow("E-booklet instance not found");
    expect(db.e_booklet_access_codes.create).not.toHaveBeenCalled();
  });

  test("paid redemption binds first student atomically, reopens same-student access, and rejects a different student after use", async () => {
    const db = createDb();
    const activeCode = { id: 3, booklet_instance_id: 10, teacher_id: 9, kind: "paid", max_redemptions: 1, redeemed_count: 0, status: "active", expires_at: null, bound_student_id: null, term_id: 1 };
    const redeemedCode = { ...activeCode, redeemed_count: 1, status: "redeemed", bound_student_id: 55 };
    db.e_booklet_access_codes.findUnique
      .mockResolvedValueOnce(activeCode)
      .mockResolvedValueOnce(redeemedCode)
      .mockResolvedValueOnce(redeemedCode);
    db.e_booklet_access_code_redemptions.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 30, student_id: 55, access_id: null, counted_for_progress: true })
      .mockResolvedValueOnce(null);
    db.e_booklet_access.upsert.mockResolvedValue({ id: 88, user_id: 55, booklet_instance_id: 10, access_source: "teacher_code" });
    db.e_booklet_access_code_redemptions.create.mockResolvedValue({ id: 30, student_id: 55, access_id: 88, counted_for_progress: true });
    db.e_booklet_access_codes.updateMany.mockResolvedValue({ count: 1 });
    const service = new EBookletRedemptionService(db);

    const first: any = await service.redeemCode("KLM-ABCDEFGH123", 55, { termsAccepted: true });
    await expect(service.redeemCode("KLM-ABCDEFGH123", 55, { termsAccepted: true })).resolves.toEqual(expect.objectContaining({ id: 30, access_id: 88, accessId: 88, bookletInstanceId: 10, countedForProgress: true }));
    await expect(service.redeemCode("KLM-ABCDEFGH123", 56, { termsAccepted: true })).rejects.toThrow("no longer active");
    expect(first.access_id).toBe(88);
    expect(db.e_booklet_access.upsert).toHaveBeenCalledTimes(2);
    expect(db.e_booklet_access_code_redemptions.update).toHaveBeenCalledWith({ where: { id: 30 }, data: { access_id: 88 } });
    expect(db.e_booklet_access_code_redemptions.create).toHaveBeenCalledWith({ data: expect.objectContaining({ paid_redemption_guard: "paid-code-3", counted_for_progress: true }) });
    expect(db.e_booklet_access_codes.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: 3, status: "active", bound_student_id: null }), data: expect.objectContaining({ bound_student_id: 55, redeemed_count: { increment: 1 }, status: "redeemed" }) }));
    expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
  });

  test("free shared codes track logged-in entry, grant viewer access, but do not count toward milestones", async () => {
    const db = createDb();
    db.e_booklet_access_codes.findUnique.mockResolvedValue({ id: 4, booklet_instance_id: 10, teacher_id: 9, kind: "free", max_redemptions: 999999, redeemed_count: 0, status: "active", expires_at: null, bound_student_id: null, term_id: 1 });
    db.e_booklet_access_code_redemptions.findFirst.mockResolvedValue(null);
    db.e_booklet_access.upsert.mockResolvedValue({ id: 88, user_id: 55, booklet_instance_id: 10, access_source: "teacher_code" });
    db.e_booklet_access_code_redemptions.create.mockResolvedValue({ id: 40, access_id: 88, student_id: 55, counted_for_progress: false });
    db.e_booklet_access_codes.updateMany.mockResolvedValue({ count: 1 });
    const service = new EBookletRedemptionService(db);

    await expect(service.redeemCode("KLM-FREECODE123", 55, { termsAccepted: true })).resolves.toEqual(expect.objectContaining({ id: 40, access_id: 88, student_id: 55, counted_for_progress: false, bookletInstanceId: 10, accessId: 88 }));
    expect(db.e_booklet_access.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { booklet_instance_id_user_id_role: { booklet_instance_id: 10, user_id: 55, role: "student" } },
      create: expect.objectContaining({ booklet_instance_id: 10, user_id: 55, access_source: "teacher_code", status: "active" }),
    }));
    expect(db.e_booklet_access_code_redemptions.create).toHaveBeenCalledWith({ data: expect.objectContaining({ counted_for_progress: false, access_id: 88, paid_redemption_guard: null }) });
  });

  test("shared redemption checks the same student first and atomically reserves capacity", async () => {
    const db = createDb();
    const activeCode = { id: 4, booklet_instance_id: 10, teacher_id: 9, kind: "free", max_redemptions: 2, redeemed_count: 1, status: "active", expires_at: null, bound_student_id: null, term_id: 1 };
    db.e_booklet_access_codes.findUnique.mockResolvedValue(activeCode);
    db.e_booklet_access_code_redemptions.findFirst.mockResolvedValue({ id: 41, access_code_id: 4, student_id: 55, access_id: 88 });
    const service = new EBookletRedemptionService(db);

    await expect(service.redeemCode("KLM-FREECODE123", 55, { termsAccepted: true })).resolves.toEqual(expect.objectContaining({ id: 41, access_code_id: 4, student_id: 55, access_id: 88, bookletInstanceId: 10, accessId: 88 }));
    expect(db.e_booklet_access_code_redemptions.findFirst).toHaveBeenCalledWith({ where: { access_code_id: 4, student_id: 55 } });
    expect(db.e_booklet_access_codes.updateMany).not.toHaveBeenCalled();
  });

  test("shared redemption rejects when atomic capacity reservation fails", async () => {
    const db = createDb();
    db.e_booklet_access_codes.findUnique.mockResolvedValue({ id: 4, booklet_instance_id: 10, teacher_id: 9, kind: "free", max_redemptions: 2, redeemed_count: 2, status: "active", expires_at: null, bound_student_id: null, term_id: 1 });
    db.e_booklet_access_code_redemptions.findFirst.mockResolvedValue(null);
    db.e_booklet_access_codes.updateMany.mockResolvedValue({ count: 0 });
    const service = new EBookletRedemptionService(db);

    await expect(service.redeemCode("KLM-FREECODE123", 56, { termsAccepted: true })).rejects.toThrow("redemption limit");
    expect(db.e_booklet_access_code_redemptions.create).not.toHaveBeenCalled();
  });

  test("concurrent same-student redemption returns the existing redemption after capacity race", async () => {
    const db = createDb();
    const activeCode = { id: 4, booklet_instance_id: 10, teacher_id: 9, kind: "free", max_redemptions: 1, redeemed_count: 0, status: "active", expires_at: null, bound_student_id: null, term_id: 1 };
    const existing = { id: 42, access_code_id: 4, student_id: 55, access_id: 88 };
    db.e_booklet_access_codes.findUnique.mockResolvedValue(activeCode);
    db.e_booklet_access_code_redemptions.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(existing);
    db.e_booklet_access_codes.updateMany.mockResolvedValue({ count: 0 });
    const service = new EBookletRedemptionService(db);

    await expect(service.redeemCode("KLM-FREECODE123", 55, { termsAccepted: true })).resolves.toEqual(expect.objectContaining({ ...existing, bookletInstanceId: 10, accessId: 88 }));
    expect(db.e_booklet_access_code_redemptions.create).not.toHaveBeenCalled();
  });

  test("concurrent same-student redemption returns existing redemption after unique create race", async () => {
    const db = createDb();
    const activeCode = { id: 4, booklet_instance_id: 10, teacher_id: 9, kind: "free", max_redemptions: 10, redeemed_count: 0, status: "active", expires_at: null, bound_student_id: null, term_id: 1 };
    const existing = { id: 43, access_code_id: 4, student_id: 55, access_id: 88 };
    db.e_booklet_access_codes.findUnique.mockResolvedValue(activeCode);
    db.e_booklet_access_code_redemptions.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(existing);
    db.e_booklet_access_codes.updateMany.mockResolvedValue({ count: 1 });
    db.e_booklet_access.upsert.mockResolvedValue({ id: 88, user_id: 55 });
    db.e_booklet_access_code_redemptions.create.mockRejectedValue({ code: "P2002" });
    const service = new EBookletRedemptionService(db);

    await expect(service.redeemCode("KLM-FREECODE123", 55, { termsAccepted: true })).resolves.toEqual(expect.objectContaining({ ...existing, bookletInstanceId: 10, accessId: 88 }));
    expect(db.e_booklet_access_codes.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ redeemed_count: { decrement: 1 } }) }));
  });

  test("free-code same-student create race never burns capacity on unique conflict", async () => {
    const db = createDb();
    const activeCode = { id: 4, booklet_instance_id: 10, teacher_id: 9, kind: "free", max_redemptions: 1, redeemed_count: 0, status: "active", expires_at: null, bound_student_id: null, term_id: 1 };
    const existing = { id: 44, access_code_id: 4, student_id: 55, access_id: 88, counted_for_progress: false };
    db.e_booklet_access_codes.findUnique.mockResolvedValue(activeCode);
    db.e_booklet_access_code_redemptions.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(existing);
    db.e_booklet_access_codes.updateMany.mockResolvedValue({ count: 1 });
    db.e_booklet_access.upsert.mockResolvedValue({ id: 88, user_id: 55 });
    db.e_booklet_access_code_redemptions.create.mockRejectedValue({ code: "P2002" });
    const service = new EBookletRedemptionService(db);

    await expect(service.redeemCode("KLM-FREECODE123", 55, { termsAccepted: true })).resolves.toEqual(expect.objectContaining({ id: 44, accessId: 88 }));
    expect(db.e_booklet_access_codes.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ redeemed_count: { decrement: 1 } }) }));
  });

  test("terms acceptance unique conflict is idempotent and re-reads the acceptance", async () => {
    const db = createDb();
    const accepted = { id: 70, teacher_id: 9, term_id: 1, acceptance_type: "code_generation" };
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, name: "Term 1", status: "active", code_generation_terms: "Terms" });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(accepted);
    db.e_booklet_teacher_terms_acceptances.create.mockRejectedValue({ code: "P2002" });
    const service = new EBookletTermsService(db);

    await expect(service.acceptLatestTerms(9, "code_generation")).resolves.toBe(accepted);
    expect(db.e_booklet_teacher_terms_acceptances.findFirst).toHaveBeenCalledTimes(2);
  });

  test("active terms creation translates DB unique races to a clean conflict", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue(null);
    db.e_booklet_terms.create.mockRejectedValue({ code: "P2002" });
    const service = new EBookletTermsService(db);

    await expect(service.createTerms({ name: "Term", codeGenerationTerms: "Terms", rewardClaimTerms: "Rewards", startsAt: new Date(), status: "active" }, 1)).rejects.toThrow("already has an active terms version");
  });

  test("updateTerms rejects activation attempts that bypass activation invariants", async () => {
    const db = createDb();
    db.e_booklet_terms.findUnique.mockResolvedValue({ id: 1, status: "draft", starts_at: new Date(), ends_at: null });
    const service = new EBookletTermsService(db);

    await expect(service.updateTerms(1, { status: "active" })).rejects.toThrow("Use the activate endpoint");
    expect(db.e_booklet_terms.update).not.toHaveBeenCalled();
  });

  test("milestone service records earned achievements without wallet credit until reward claim", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, status: "active" });
    db.e_booklet_access_code_redemptions.count.mockResolvedValue(12);
    db.e_booklet_milestones.findMany.mockResolvedValue([{ id: 1, term_id: 1, target_paid_redemptions: 10, milestone_price: 200, previous_price_snapshot: 150, reward_amount_snapshot: 75, active: true }]);
    db.e_booklet_milestone_achievements.findUnique.mockResolvedValue(null);
    db.e_booklet_milestone_achievements.create.mockResolvedValue({ id: 6, milestone_id: 1, term_id: 1, reward_amount: 75 });
    const service = new EBookletMilestoneService(db);

    const result: any = await service.evaluateTeacherMilestones(9);

    expect(db.e_booklet_access_code_redemptions.count).toHaveBeenCalledWith({ where: { counted_for_progress: true, access_code: { teacher_id: 9, term_id: 1, kind: "paid" } } });
    expect(result.awarded).toHaveLength(1);
    expect(db.teacher_wallet_ledger.create).not.toHaveBeenCalled();
  });

  test("milestone evaluation uses only currently effective active terms", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, status: "active", starts_at: new Date("2027-01-01T00:00:00.000Z"), ends_at: null });
    db.e_booklet_access_code_redemptions.count.mockResolvedValue(0);
    db.e_booklet_milestones.findMany.mockResolvedValue([]);
    const service = new EBookletMilestoneService(db);

    await service.evaluateTeacherMilestones(9);

    expect(db.e_booklet_terms.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        status: "active",
        starts_at: expect.objectContaining({ lte: expect.any(Date) }),
        OR: [{ ends_at: null }, { ends_at: expect.objectContaining({ gt: expect.any(Date) }) }],
      }),
    }));
  });

  test("milestone service lists teacher-scoped progress and claimable achievement data", async () => {
    const db = createDb();
    const claimedAt = new Date("2026-06-01T00:00:00.000Z");
    db.e_booklet_milestones.findMany.mockResolvedValue([
      { id: 1, term_id: 1, title: "First", target_paid_redemptions: 5, reward_amount_snapshot: 50, active: true },
      { id: 2, term_id: 1, title: "Second", target_paid_redemptions: 10, reward_amount_snapshot: 90, active: true },
    ]);
    db.e_booklet_milestone_achievements.findMany.mockResolvedValue([
      { id: 11, teacher_id: 9, term_id: 1, milestone_id: 1, paid_redemptions_snapshot: 7, reward_amount: 50, claimed_at: claimedAt },
    ]);
    db.e_booklet_access_code_redemptions.count.mockResolvedValue(8);
    const service = new EBookletMilestoneService(db);

    const result: any = await service.listMilestones(1, 9);

    expect(db.e_booklet_milestones.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { term_id: 1, active: true } }));
    expect(db.e_booklet_milestone_achievements.findMany).toHaveBeenCalledWith({ where: { teacher_id: 9, term_id: 1 } });
    expect(db.e_booklet_access_code_redemptions.count).toHaveBeenCalledWith({ where: { counted_for_progress: true, access_code: { teacher_id: 9, term_id: 1, kind: "paid" } } });
    expect(result[0]).toEqual(expect.objectContaining({ progress_count: 8, paid_redemptions_snapshot: 7, achievement_id: 11, milestone_achievement_id: 11, claimed_at: claimedAt, reward_amount: 50 }));
    expect(result[1]).toEqual(expect.objectContaining({ progress_count: 8, paid_redemptions_snapshot: 8, achievement: null, achievement_id: null, claimed_at: null, reward_amount: 90 }));
  });

  test("milestone service lets admin list inactive milestones without teacher progress enrichment", async () => {
    const db = createDb();
    db.e_booklet_milestones.findMany.mockResolvedValue([
      { id: 1, term_id: 1, title: "Active", target_paid_redemptions: 5, active: true },
      { id: 2, term_id: 1, title: "Inactive", target_paid_redemptions: 10, active: false },
    ]);
    const service = new EBookletMilestoneService(db);

    const result: any = await service.listMilestones(1, undefined, true);

    expect(db.e_booklet_milestones.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { term_id: 1 } }));
    expect(db.e_booklet_milestone_achievements.findMany).not.toHaveBeenCalled();
    expect(db.e_booklet_access_code_redemptions.count).not.toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual(expect.objectContaining({ active: false }));
  });

  test("milestone progress groups paid redemptions by teacher and excludes free shared entries", async () => {
    const db = createDb();
    db.e_booklet_milestone_achievements.findMany.mockResolvedValue([
      { id: 11, teacher_id: 9, term_id: 1, milestone_id: 1, reward_amount: 50 },
    ]);
    db.e_booklet_access_code_redemptions.findMany.mockResolvedValue([
      { id: 1, counted_for_progress: true, access_code: { teacher_id: 9, term_id: 1, teacher: { id: 9, name: "Teacher One", email: "teacher1@example.com" } } },
      { id: 2, counted_for_progress: true, access_code: { teacher_id: 9, term_id: 1, teacher: { id: 9, name: "Teacher One", email: "teacher1@example.com" } } },
      { id: 3, counted_for_progress: true, access_code: { teacher_id: 12, term_id: 1, teacher: { id: 12, name: "Teacher Two", email: "teacher2@example.com" } } },
    ]);
    const service = new EBookletMilestoneService(db);

    const result: any = await service.listProgress(1);

    expect(db.e_booklet_access_code_redemptions.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { counted_for_progress: true, access_code: { kind: "paid", term_id: 1 } },
    }));
    expect(result.paidRedemptions).toBe(3);
    expect(result.teacherProgress).toEqual([
      expect.objectContaining({ teacherId: 9, teacherName: "Teacher One", paidRedemptions: 2, achievements: [expect.objectContaining({ id: 11 })] }),
      expect.objectContaining({ teacherId: 12, teacherName: "Teacher Two", paidRedemptions: 1, achievements: [] }),
    ]);
  });

  test("milestone service persists notification recipients on create and update", async () => {
    const db = createDb();
    db.e_booklet_milestones.create.mockResolvedValue({ id: 1, notification_recipients: "teacher_and_admins" });
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1 });
    db.e_booklet_milestones.update.mockResolvedValue({ id: 1, notification_recipients: "admins" });
    const service = new EBookletMilestoneService(db);

    await service.createMilestone({ termId: 1, title: "Milestone", targetPaidRedemptions: 10, milestonePrice: 200, rewardAmountSnapshot: 25, notificationRecipients: "teacher_and_admins" }, 1);
    await service.updateMilestone(1, { notificationRecipients: "teacher" });

    expect(db.e_booklet_milestones.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ notification_recipients: "teacher_and_admins" }) }));
    expect(db.e_booklet_milestones.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 }, data: expect.objectContaining({ notification_recipients: "admins" }) }));
  });

  test("milestone service accepts disabled reward zero amount on create and update", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1 });
    db.e_booklet_milestones.create.mockResolvedValue({ id: 1, reward_amount_snapshot: 0 });
    db.e_booklet_milestones.update.mockResolvedValue({ id: 1, reward_amount_snapshot: 0 });
    const service = new EBookletMilestoneService(db);

    await expect(service.createMilestone({ termId: 1, title: "Milestone", targetPaidRedemptions: 10, milestonePrice: 200, rewardAmountSnapshot: 0 }, 1)).resolves.toEqual(expect.objectContaining({ reward_amount_snapshot: 0 }));
    await expect(service.updateMilestone(1, { rewardAmountSnapshot: 0 })).resolves.toEqual(expect.objectContaining({ reward_amount_snapshot: 0 }));

    expect(db.e_booklet_milestones.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ reward_amount_snapshot: 0 }) }));
    expect(db.e_booklet_milestones.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 }, data: expect.objectContaining({ reward_amount_snapshot: 0 }) }));
  });

  test("milestone evaluation persists zero reward achievements for disabled reward milestones", async () => {
    const db = createDb();
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, status: "active" });
    db.e_booklet_access_code_redemptions.count.mockResolvedValue(10);
    db.e_booklet_milestones.findMany.mockResolvedValue([
      { id: 1, term_id: 1, target_paid_redemptions: 10, milestone_price: 200, previous_price_snapshot: 250, reward_amount_snapshot: 0, active: true },
    ]);
    db.e_booklet_milestone_achievements.findUnique.mockResolvedValue(null);
    db.e_booklet_milestone_achievements.create.mockResolvedValue({ id: 6, milestone_id: 1, term_id: 1, reward_amount: 0 });
    const service = new EBookletMilestoneService(db);

    await expect(service.evaluateTeacherMilestones(9, 1)).resolves.toEqual(expect.objectContaining({ awarded: [expect.objectContaining({ reward_amount: 0 })] }));

    expect(db.e_booklet_milestone_achievements.create).toHaveBeenCalledWith({ data: expect.objectContaining({ reward_amount: 0 }) });
  });

  test("milestone service rejects invalid numeric create and update payloads", async () => {
    const db = createDb();
    const service = new EBookletMilestoneService(db);

    await expect(service.createMilestone({ termId: 1, title: "Bad", targetPaidRedemptions: 0, milestonePrice: 200 })).rejects.toThrow("target paid redemptions");
    await expect(service.createMilestone({ termId: 1, title: "Bad", targetPaidRedemptions: 10, milestonePrice: -1 })).rejects.toThrow("milestone price");
    await expect(service.createMilestone({ termId: Number.NaN, title: "Bad", targetPaidRedemptions: 10, milestonePrice: 200 })).rejects.toThrow("term ID");
    db.e_booklet_terms.findFirst.mockResolvedValueOnce(null);
    await expect(service.createMilestone({ termId: 99, title: "Bad", targetPaidRedemptions: 10, milestonePrice: 200, rewardAmountSnapshot: 25 })).rejects.toThrow("E-booklet terms not found");
    await expect(service.updateMilestone(1, { targetPaidRedemptions: -2 })).rejects.toThrow("target paid redemptions");
    await expect(service.updateMilestone(1, { rewardAmountSnapshot: Number.NaN })).rejects.toThrow("reward amount");
    expect(db.e_booklet_milestones.create).not.toHaveBeenCalled();
    expect(db.e_booklet_milestones.update).not.toHaveBeenCalled();
  });

  test("claim reward requires explicit reward terms acceptance", async () => {
    const db = createDb();
    const service = new EBookletMilestoneService(db);

    await expect(service.claimReward(9, 6, { termsAccepted: false })).rejects.toThrow("Reward claim terms must be accepted");
    expect(db.e_booklet_milestone_achievements.findFirst).not.toHaveBeenCalled();
    expect(db.teacher_wallet_ledger.create).not.toHaveBeenCalled();
  });

  test("claim reward accepts terms once and then credits wallet idempotently", async () => {
    const db = createDb();
    const achievement = { id: 6, teacher_id: 9, term_id: 1, reward_amount: 75, claimed_at: null, reward_terms_accepted_at: null };
    db.e_booklet_milestone_achievements.findFirst
      .mockResolvedValueOnce(achievement)
      .mockResolvedValueOnce({ ...achievement, claimed_at: new Date(), reward_terms_accepted_at: new Date() })
      .mockResolvedValueOnce({ ...achievement, claimed_at: new Date(), reward_terms_accepted_at: new Date() });
    db.e_booklet_milestone_achievements.updateMany.mockResolvedValue({ count: 1 });
    db.e_booklet_terms.findFirst.mockResolvedValue({ id: 1, reward_claim_terms: "Reward claim terms v1" });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValue(null);
    db.e_booklet_teacher_terms_acceptances.create.mockResolvedValue({ id: 71, acceptance_type: "reward_claim" });
    db.e_booklet_milestone_achievements.update.mockResolvedValue({ ...achievement, claimed_at: new Date(), reward_terms_accepted_at: new Date() });
    db.teacher_wallets.upsert.mockResolvedValue({ id: 11, teacher_id: 9, balance: 75 });
    db.teacher_wallet_ledger.findFirst.mockResolvedValue(null);
    db.teacher_wallet_ledger.create.mockResolvedValue({ id: 20, amount: 75, type: "credit", source: "milestone_reward" });
    const service = new EBookletMilestoneService(db);

    await expect(service.claimReward(9, 6, { termsAccepted: true })).resolves.toEqual(expect.objectContaining({ achievement: expect.any(Object), walletCredit: expect.any(Object) }));
    await expect(service.claimReward(9, 6, { termsAccepted: true })).resolves.toEqual(expect.objectContaining({ claimed: true, alreadyClaimed: true }));
    expect(db.teacher_wallet_ledger.create).toHaveBeenCalledTimes(1);
    expect(db.e_booklet_teacher_terms_acceptances.create).toHaveBeenCalledWith({ data: expect.objectContaining({ acceptance_type: "reward_claim", terms_snapshot: "Reward claim terms v1" }) });
    expect(db.e_booklet_milestone_achievements.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 6, teacher_id: 9, claimed_at: null } }));
    expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
  });

  test("concurrent reward claim loser returns already claimed without duplicate acceptance or wallet credit", async () => {
    const db = createDb();
    const achievement = { id: 6, teacher_id: 9, term_id: 1, reward_amount: 75, claimed_at: null, reward_terms_accepted_at: null };
    const claimed = { ...achievement, claimed_at: new Date(), reward_terms_accepted_at: new Date() };
    db.e_booklet_milestone_achievements.findFirst.mockResolvedValueOnce(achievement).mockResolvedValueOnce(claimed);
    db.e_booklet_milestone_achievements.updateMany.mockResolvedValue({ count: 0 });
    const service = new EBookletMilestoneService(db);

    await expect(service.claimReward(9, 6, { termsAccepted: true })).resolves.toEqual({ claimed: true, alreadyClaimed: true, achievement: claimed });
    expect(db.e_booklet_teacher_terms_acceptances.create).not.toHaveBeenCalled();
    expect(db.teacher_wallet_ledger.create).not.toHaveBeenCalled();
  });

  test("reward claim ignores concurrent duplicate acceptance after winning atomic claim", async () => {
    const db = createDb();
    const achievement = { id: 6, teacher_id: 9, term_id: 1, reward_amount: 75, claimed_at: null, reward_terms_accepted_at: null };
    const claimed = { ...achievement, claimed_at: new Date(), reward_terms_accepted_at: new Date() };
    db.e_booklet_milestone_achievements.findFirst.mockResolvedValueOnce(achievement).mockResolvedValueOnce(claimed);
    db.e_booklet_milestone_achievements.updateMany.mockResolvedValue({ count: 1 });
    db.e_booklet_teacher_terms_acceptances.findFirst.mockResolvedValue(null);
    db.e_booklet_teacher_terms_acceptances.create.mockRejectedValue({ code: "P2002" });
    db.teacher_wallets.upsert.mockResolvedValue({ id: 11, teacher_id: 9, balance: 75 });
    db.teacher_wallet_ledger.findFirst.mockResolvedValue(null);
    db.teacher_wallet_ledger.create.mockResolvedValue({ id: 20, amount: 75, type: "credit", source: "milestone_reward" });
    const service = new EBookletMilestoneService(db);

    await expect(service.claimReward(9, 6, { termsAccepted: true })).resolves.toEqual(expect.objectContaining({ walletCredit: expect.any(Object) }));
    expect(db.teacher_wallet_ledger.create).toHaveBeenCalledTimes(1);
  });

  test("milestone reorder refuses to move milestones across terms", async () => {
    const db = createDb();
    db.e_booklet_milestones.findFirst.mockResolvedValue(null);
    const service = new EBookletMilestoneService(db);

    await expect(service.reorderMilestones(1, [{ id: 99, sortOrder: 1 }])).rejects.toThrow("Milestone not found");
    expect(db.e_booklet_milestones.update).not.toHaveBeenCalled();
  });

  test("teacher wallet applies to e-booklet purchases using server purchase price and is idempotent per e-booklet purchase", async () => {
    const db = createDb();
    db.teacher_wallets.findUnique.mockResolvedValue({ id: 11, teacher_id: 9, balance: 100 });
    db.e_booklet_purchases.findFirst
      .mockResolvedValueOnce({ id: 500, teacher_id: 9, price: 200, wallet_credit_applied: 0, final_payable_price: 200, status: "pending" })
      .mockResolvedValueOnce({ id: 500, teacher_id: 9, price: 200, wallet_credit_applied: 40, final_payable_price: 160, status: "pending" });
    db.teacher_wallet_ledger.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 22, amount: -40, e_booklet_purchase_id: 500 });
    db.teacher_wallets.updateMany.mockResolvedValue({ count: 1 });
    db.teacher_wallet_ledger.create.mockResolvedValue({ id: 22, amount: -40, type: "debit", source: "order_spend", balance_after: 60 });
    db.e_booklet_purchases.update.mockResolvedValue({ id: 500, price: 200, wallet_credit_applied: 40, final_payable_price: 160 });
    const service = new TeacherWalletService(db);

    await expect(service.applyToPurchase({ teacherId: 9, purchaseId: 500, purchaseTotal: 1, requestedAmount: 40, couponApplied: true })).rejects.toThrow("cannot be stacked with coupons");
    await expect(service.applyToPurchase({ teacherId: 9, purchaseId: 500, purchaseTotal: 1, requestedAmount: 40 })).resolves.toEqual(expect.objectContaining({ walletCreditApplied: 40, finalTotal: 160 }));
    await expect(service.applyToPurchase({ teacherId: 9, purchaseId: 500, purchaseTotal: 1, requestedAmount: 40 })).resolves.toEqual(expect.objectContaining({ alreadyApplied: true }));
    expect(db.e_booklet_purchases.findFirst).toHaveBeenCalledWith({ where: { id: 500, teacher_id: 9 } });
    expect(db.purchases.findFirst).not.toHaveBeenCalled();
    expect(db.coupon_usages.findFirst).not.toHaveBeenCalled();
    expect(db.teacher_wallets.updateMany).toHaveBeenCalledWith({ where: { teacher_id: 9, balance: { gte: 40 } }, data: { balance: { decrement: 40 } } });
    expect(db.teacher_wallet_ledger.create).toHaveBeenCalledWith({ data: expect.objectContaining({ teacher_id: 9, wallet_id: 11, amount: -40, e_booklet_purchase_id: 500, type: "debit", source: "order_spend", balance_after: 60 }) });
    expect(db.e_booklet_purchases.update).toHaveBeenCalledWith({ where: { id: 500 }, data: { wallet_credit_applied: 40, final_payable_price: 160, admin_notes: "Wallet credit applied: 40" } });
    expect(db.$transaction).toHaveBeenCalled();
  });

  test("teacher wallet idempotent retry returns existing structured final total without re-discounting price", async () => {
    const db = createDb();
    db.e_booklet_purchases.findFirst.mockResolvedValue({ id: 501, teacher_id: 9, price: 100, wallet_credit_applied: 20, final_payable_price: 80, status: "pending" });
    db.teacher_wallet_ledger.findFirst.mockResolvedValue({ id: 23, amount: -20, e_booklet_purchase_id: 501 });
    const service = new TeacherWalletService(db);

    await expect(service.applyToPurchase({ teacherId: 9, purchaseId: 501, purchaseTotal: 100, requestedAmount: 20 })).resolves.toEqual(expect.objectContaining({ walletCreditApplied: 20, finalTotal: 80, alreadyApplied: true }));
    expect(db.e_booklet_purchases.update).not.toHaveBeenCalled();
  });

  test("teacher wallet rejects unowned e-booklet purchases and failed atomic debit", async () => {
    const db = createDb();
    db.teacher_wallets.findUnique.mockResolvedValue({ id: 11, teacher_id: 9, balance: 100 });
    db.e_booklet_purchases.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 500, teacher_id: 9, price: 200, status: "pending" });
    db.teacher_wallets.updateMany.mockResolvedValue({ count: 0 });
    const service = new TeacherWalletService(db);

    await expect(service.applyToPurchase({ teacherId: 9, purchaseId: 999, purchaseTotal: 200, requestedAmount: 40 })).rejects.toThrow("E-booklet purchase not found");
    await expect(service.applyToPurchase({ teacherId: 9, purchaseId: 500, purchaseTotal: 200, requestedAmount: 40 })).rejects.toThrow("available credit");
    expect(db.e_booklet_purchases.update).not.toHaveBeenCalled();
  });

  test("hash lookup normalizes codes without persisting plaintext", () => {
    expect(hashEBookletAccessCode(" klm-abc123 ")).toBe(hashEBookletAccessCode("KLM-ABC123"));
  });
});
