import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { PDFDocument } from "pdf-lib";

jest.mock("../../src/apps/store-api/services/image.service", () => ({
  imageService: { uploadImage: jest.fn().mockResolvedValue({ id: 700 }) },
}));

jest.mock("../../src/apps/store-api/services/checkout-validation.service", () => ({
  validatePaymentForCheckout: jest.fn().mockResolvedValue({ phone_number: "01000000000" }),
}));

import { EBookletService } from "../../src/apps/store-api/services/e-booklet.service";
import { hashInviteToken } from "../../src/apps/store-api/utils/e-booklet-token";

function createViewerPageToken(input: {
  instanceId: number;
  pageNumber: number;
  userId: number;
  expiresAt?: Date;
}) {
  const body = Buffer.from(JSON.stringify({
    instanceId: input.instanceId,
    pageNumber: input.pageNumber,
    userId: input.userId,
    expiresAt: (input.expiresAt || new Date(Date.now() + 300_000)).toISOString(),
  })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", process.env.E_BOOKLET_PAGE_TOKEN_SECRET || process.env.JWT_SECRET || "dev-e-booklet-page-token-secret")
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

function createMockDb(overrides: Record<string, unknown> = {}) {
  const db: any = {
    e_booklet_templates: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    e_booklet_template_versions: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    e_booklet_hotspots: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    e_booklet_hotspot_presets: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    e_booklet_hotspot_preset_usages: {
      count: jest.fn(),
      create: jest.fn(),
    },
    e_booklet_file_assets: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    e_booklet_devices: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    e_booklet_device_allowances: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    e_booklet_student_purchase_links: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    purchases: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    payment_methods: {
      findFirst: jest.fn().mockResolvedValue({ id: 1, phone_number: "01000000000", name: "Wallet" }),
    },
    e_booklet_purchases: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    e_booklet_purchase_required_fields: {
      createMany: jest.fn(),
    },
    e_booklet_invites: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    e_booklet_instances: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    e_booklet_access: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    e_booklet_invite_redemptions: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    e_booklet_access_code_redemptions: {
      findMany: jest.fn(),
    },
    e_booklet_audit_logs: {
      create: jest.fn(),
    },
    e_booklet_analytics_events: {
      create: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    ...overrides,
  };

  db.$transaction = jest.fn(async (callback: (tx: any) => Promise<unknown>) => {
    return callback(db);
  });

  return db as any;
}

function hmacPasscode(passcode: string): string {
  const pepper =
    process.env.E_BOOKLET_PASSCODE_PEPPER ||
    process.env.APP_SECRET ||
    process.env.JWT_SECRET ||
    process.env.E_BOOKLET_PAGE_TOKEN_SECRET ||
    "dev-e-booklet-passcode-pepper";
  return crypto.createHmac("sha256", pepper).update(passcode).digest("hex");
}

describe("EBookletService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function writeTestPdf(filename: string) {
    const uploadDir = path.resolve(process.cwd(), "uploads/e-booklets/private");
    await fs.mkdir(uploadDir, { recursive: true });
    const pdf = await PDFDocument.create();
    pdf.addPage([300, 400]);
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, Buffer.from(await pdf.save()));
    return filePath;
  }

  describe("validateTeacherDocumentForDelivery", () => {
    test("blocks delivery when uploaded page count differs from template version", async () => {
      const db = createMockDb();
      db.e_booklet_template_versions.findUnique.mockResolvedValue({
        id: 22,
        page_count: 32,
        page_dimensions_json: [{ width: 800, height: 1100 }],
      });

      const service = new EBookletService(db);

      await expect(
        service.validateTeacherDocumentForDelivery({
          templateVersionId: 22,
          uploadedPageCount: 30,
          uploadedPageDimensions: [{ width: 800, height: 1100 }],
        }),
      ).rejects.toThrow(
        "Expected: 32 pages. Uploaded file: 30 pages. Please upload a file with the same number of pages.",
      );
    });

    test("returns a warning when page dimensions differ but page count matches", async () => {
      const db = createMockDb();
      db.e_booklet_template_versions.findUnique.mockResolvedValue({
        id: 22,
        page_count: 32,
        page_dimensions_json: [
          { width: 800, height: 1100 },
          { width: 800, height: 1100 },
        ],
      });

      const service = new EBookletService(db);

      const result = await service.validateTeacherDocumentForDelivery({
        templateVersionId: 22,
        uploadedPageCount: 32,
        uploadedPageDimensions: [
          { width: 800, height: 1100 },
          { width: 612, height: 792 },
        ],
      });

      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual([
        "This file has the same page count, but some page dimensions differ from the template. Hotspot positions may not align correctly.",
      ]);
    });
  });

  describe("listInstanceStudents", () => {
    test("returns active students with safe device and analytics summaries", async () => {
      const db = createMockDb();
      const grantedAt = new Date("2026-02-01T10:00:00.000Z");
      const lastSeen = new Date("2026-02-03T12:30:00.000Z");
      db.e_booklet_instances.findFirst.mockResolvedValue({ id: 10 });
      db.e_booklet_access.findMany.mockResolvedValue([
        {
          id: 100,
          booklet_instance_id: 10,
          user_id: 55,
          role: "student",
          status: "active",
          access_source: "online_purchase",
          granted_at: grantedAt,
          user: { id: 55, name: "Student One", email: "one@example.com" },
        },
        {
          id: 101,
          booklet_instance_id: 10,
          user_id: 56,
          role: "student",
          status: "active",
          access_source: "offline_passcode",
          granted_at: grantedAt,
          user: { id: 56, name: "Student Two", email: "two@example.com" },
        },
      ]);
      db.e_booklet_devices.findMany.mockResolvedValue([
        { id: 1, user_id: 55, status: "active", last_seen_at: lastSeen, user_agent: "hidden", ip_address: "hidden" },
        { id: 2, user_id: 55, status: "reset", last_seen_at: new Date("2026-02-02T12:00:00.000Z") },
        { id: 3, user_id: 56, status: "active", last_seen_at: new Date("2026-02-01T12:00:00.000Z") },
      ]);
      db.e_booklet_device_allowances.findMany.mockResolvedValue([
        { booklet_instance_id: 10, user_id: 55, allowed_devices: 3 },
      ]);
      db.e_booklet_analytics_events.findMany.mockResolvedValue([
        { student_id: 55, event_type: "access_created", source: "online_purchase", marketing_price_snapshot: { toJSON: () => "120" } },
        { student_id: 55, event_type: "device_bound", source: "online_purchase", marketing_price_snapshot: null },
        { student_id: 55, event_type: "page_viewed", source: "online_purchase", marketing_price_snapshot: null },
        { student_id: 56, event_type: "access_created", source: "offline_passcode", marketing_price_snapshot: 80 },
      ]);

      const service = new EBookletService(db);
      const result: any = await service.listInstanceStudents(10);

      expect(db.e_booklet_access.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { booklet_instance_id: { in: [10] }, role: "student", status: "active" },
      }));
      expect(result[0].devices_summary).toEqual({
        active_count: 1,
        total_count: 2,
        last_seen_at: "2026-02-03T12:30:00.000Z",
        allowed_devices: 3,
      });
      expect(result[0].analytics_summary).toMatchObject({
        access_created: 1,
        device_bound: 1,
        page_viewed: 1,
        source: "online_purchase",
        marketing_price_snapshot: "120",
      });
      expect(result[1].devices_summary.allowed_devices).toBe(1);
      expect(result[0]).not.toHaveProperty("ip_address");
      expect(result[0]).not.toHaveProperty("user_agent");
    });

    test("keeps teacher ownership scoping", async () => {
      const db = createMockDb();
      db.e_booklet_instances.findFirst.mockResolvedValue(null);
      const service = new EBookletService(db);

      await expect(service.listInstanceStudents(10, 99)).rejects.toThrow("Teacher e-booklet not found");
      expect(db.e_booklet_instances.findFirst).toHaveBeenCalledWith({
        where: { id: 10, teacher_id: 99 },
        select: { id: true },
      });
      expect(db.e_booklet_access.findMany).not.toHaveBeenCalled();
    });
  });

  describe("listInstances", () => {
    test("embeds nested students with device, analytics, and purchase references for admin grouping", async () => {
      const db = createMockDb();
      const grantedAt = new Date("2026-02-01T10:00:00.000Z");
      db.e_booklet_instances.findMany.mockResolvedValue([
        {
          id: 10,
          teacher_id: 8,
          status: "active",
          teacher: { id: 8, name: "Teacher One", email: "teacher@example.com" },
          devices: [{ id: 1, status: "active" }, { id: 2, status: "reset" }],
          _count: { access_records: 1, invites: 0 },
        },
      ]);
      db.e_booklet_instances.count.mockResolvedValue(1);
      db.e_booklet_access.findMany.mockResolvedValue([
        { id: 100, booklet_instance_id: 10, user_id: 55, role: "student", status: "active", access_source: "access_code", granted_at: grantedAt, user: { id: 55, name: "Student One", email: "one@example.com" } },
      ]);
      db.e_booklet_devices.findMany.mockResolvedValue([
        { id: 9, booklet_instance_id: 10, user_id: 55, status: "active", last_seen_at: grantedAt },
      ]);
      db.e_booklet_device_allowances.findMany.mockResolvedValue([
        { booklet_instance_id: 10, user_id: 55, allowed_devices: 2 },
      ]);
      db.e_booklet_analytics_events.findMany.mockResolvedValue([
        { booklet_instance_id: 10, student_id: 55, event_type: "viewer_opened", source: "access_code", marketing_price_snapshot: { toJSON: () => "75" } },
      ]);
      db.e_booklet_invite_redemptions.findMany.mockResolvedValue([]);
      db.e_booklet_access_code_redemptions.findMany.mockResolvedValue([
        { booklet_instance_id: 10, student_id: 55, access_code_id: 77, purchase_id: null, redeemed_at: grantedAt, counted_for_progress: false },
      ]);

      const service = new EBookletService(db);
      const result: any = await service.listInstances({ page: 1, limit: 20 });

      expect(result.data[0].used_devices_count).toBe(1);
      expect(result.data[0].students).toHaveLength(1);
      expect(result.data[0].students[0].devices_summary).toEqual({ active_count: 1, total_count: 1, last_seen_at: "2026-02-01T10:00:00.000Z", allowed_devices: 2 });
      expect(result.data[0].students[0].analytics_summary).toMatchObject({ viewer_opened: 1, source: "access_code", marketing_price_snapshot: "75" });
      expect(result.data[0].students[0].purchase_reference).toMatchObject({ source: "access_code", access_code_id: 77, counted_for_progress: false });
    });
  });

  describe("listUserEBooklets", () => {
    test("serializes nested Date and Decimal-like values for teacher/student dashboards", async () => {
      const db = createMockDb();
      const expiry = new Date("2027-01-15T10:30:00.000Z");
      const grantedAt = new Date("2026-01-01T08:00:00.000Z");
      db.e_booklet_access.findMany.mockResolvedValue([
        {
          id: 5,
          user_id: 55,
          role: "student",
          status: "active",
          granted_at: grantedAt,
          booklet_instance: {
            id: 10,
            access_expires_at: expiry,
            internal_price: { toJSON: () => "30" },
            student_marketing_price: { toJSON: () => "50" },
            devices: [{ status: "active" }, { status: "revoked" }],
            template: { id: 1, created_at: grantedAt },
          },
        },
      ]);

      const service = new EBookletService(db);
      const result: any = await service.listUserEBooklets(55, "student");

      expect(result[0].granted_at).toBe("2026-01-01T08:00:00.000Z");
      expect(result[0].booklet_instance.access_expires_at).toBe("2027-01-15T10:30:00.000Z");
      expect(result[0].booklet_instance.template.created_at).toBe("2026-01-01T08:00:00.000Z");
      expect(result[0].booklet_instance.student_marketing_price).toBe("50");
      expect(result[0].booklet_instance.internal_price).toBeUndefined();
      expect(result[0].booklet_instance.used_devices_count).toBe(1);
    });
  });

  describe("admin write DTO persistence", () => {
    test("persists template, purchase, delivery pricing/expiry, and invite passcode fields", async () => {
      const db = createMockDb();
      db.e_booklet_templates.create.mockResolvedValue({ id: 1 });
      db.e_booklet_templates.update.mockResolvedValue({ id: 1 });
      db.e_booklet_purchases.create.mockResolvedValue({ id: 2 });
      db.e_booklet_purchases.findUnique.mockResolvedValue({
        id: 2,
        teacher_id: 9,
        template_id: 3,
        template_version_id: 4,
        branding_json: { name: "Teacher" },
        price: 120,
        marketing_price: 150,
        internal_price: 70,
        status: "paid",
        instances: [],
      });
      db.e_booklet_template_versions.findUnique.mockResolvedValue({ id: 4, page_count: 2, page_dimensions_json: null });
      db.e_booklet_instances.create.mockResolvedValue({ id: 10 });
      db.e_booklet_access.create.mockResolvedValue({ id: 11 });
      db.e_booklet_invites.create = jest.fn().mockResolvedValue({ id: 12 });
      db.e_booklet_instances.findFirst = jest.fn().mockResolvedValue({ id: 10, teacher_id: 9, status: "active" });

      const service = new EBookletService(db);
      await service.createTemplate({ title: "Template", price: 100, marketing_price: 140 }, 1);
      await service.updateTemplate(1, { marketing_price: 130 });
      await service.createPurchaseRequest(9, {
        template_id: 3,
        template_version_id: 4,
        price: 120,
        marketing_price: 150,
        internal_price: 70,
        branding_json: {},
      });
      await service.deliverPurchase(2, {
        custom_document_file_id: 99,
        display_title: "Delivered",
        invite_quota: 5,
        page_count: 2,
        access_expires_at: "2026-12-31T00:00:00.000Z",
        student_marketing_price: 160,
        internal_price: 80,
      }, 1);
      await service.createInvite(10, 9, { passcode: "123456", passcode_hint: "last 6", max_uses: 1 });

      expect(db.e_booklet_templates.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ marketing_price: 140 }) }));
      expect(db.e_booklet_templates.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ marketing_price: 130 }) }));
      expect(db.e_booklet_purchases.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ marketing_price: 150, internal_price: 70 }) }));
      expect(db.e_booklet_instances.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          access_expires_at: new Date("2026-12-31T00:00:00.000Z"),
          student_marketing_price: 160,
          internal_price: 80,
        }),
      }));
      expect(db.e_booklet_invites.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          passcode_hash: expect.any(String),
          passcode_ciphertext: expect.any(String),
          passcode_hint: "last 6",
        }),
      }));
      expect(db.e_booklet_invites.create.mock.calls[0][0].data.passcode_hash).not.toBe("123456");
      expect(db.e_booklet_invites.create.mock.calls[0][0].data.passcode_ciphertext).not.toBe("123456");
    });

    test("blocks purchase delivery before payment approval", async () => {
      const db = createMockDb();
      db.e_booklet_purchases.findUnique.mockResolvedValue({
        id: 2,
        teacher_id: 9,
        template_id: 3,
        template_version_id: 4,
        branding_json: {},
        price: 120,
        marketing_price: 150,
        internal_price: 70,
        status: "pending",
        instances: [],
      });

      const service = new EBookletService(db);
      await expect(service.deliverPurchase(2, {
        custom_document_file_id: 99,
        display_title: "Delivered",
        invite_quota: 5,
        page_count: 2,
        access_expires_at: "2026-12-31T00:00:00.000Z",
      }, 1)).rejects.toThrow("Payment must be approved before delivering the e-booklet.");
      expect(db.e_booklet_instances.create).not.toHaveBeenCalled();
      expect(db.e_booklet_instances.update).not.toHaveBeenCalled();
    });

    test("delivery reuses the paid approval instance instead of creating a duplicate", async () => {
      const db = createMockDb();
      db.e_booklet_purchases.findUnique.mockResolvedValue({
        id: 2,
        teacher_id: 9,
        template_id: 3,
        template_version_id: 4,
        branding_json: { name: "Teacher" },
        price: 120,
        marketing_price: 150,
        internal_price: 70,
        status: "ready",
        instances: [{ id: 10, purchase_id: 2, teacher_id: 9, status: "active" }],
      });
      db.e_booklet_template_versions.findUnique.mockResolvedValue({ id: 4, page_count: 2, page_dimensions_json: null });
      db.e_booklet_instances.update.mockResolvedValue({ id: 10, purchase_id: 2, teacher_id: 9, status: "active" });
      db.e_booklet_access.findFirst.mockResolvedValue({ id: 11, booklet_instance_id: 10, user_id: 9, role: "teacher" });

      const service = new EBookletService(db);
      await service.deliverPurchase(2, {
        custom_document_file_id: 99,
        display_title: "Delivered",
        invite_quota: 5,
        page_count: 2,
        access_expires_at: "2026-12-31T00:00:00.000Z",
        student_marketing_price: 160,
        internal_price: 80,
      }, 1);

      expect(db.e_booklet_instances.create).not.toHaveBeenCalled();
      expect(db.e_booklet_instances.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 10 },
        data: expect.objectContaining({
          custom_document_file_id: 99,
          display_title: "Delivered",
          access_expires_at: new Date("2026-12-31T00:00:00.000Z"),
          student_marketing_price: 160,
          internal_price: 80,
        }),
      }));
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
    });

    test("teacher invite list returns copyable passcode from encrypted storage without exposing hashes", async () => {
      const db = createMockDb();
      db.e_booklet_instances.findFirst.mockResolvedValue({ id: 10, teacher_id: 9, status: "active" });
      db.e_booklet_invites.create.mockImplementation(async (args: any) => ({
        id: 2,
        booklet_instance_id: 10,
        teacher_id: 9,
        passcode_hash: args.data.passcode_hash,
        passcode_ciphertext: args.data.passcode_ciphertext,
        passcode_hint: args.data.passcode_hint,
        max_uses: args.data.max_uses,
        used_count: 0,
        expires_at: null,
        status: "active",
        created_at: new Date("2026-06-10T00:00:00.000Z"),
      }));
      const service = new EBookletService(db);

      await service.createInvite(10, 9, { passcode: "123456", passcode_hint: "last 6", max_uses: 1 });
      const storedInvite = db.e_booklet_invites.create.mock.calls[0][0].data;
      db.e_booklet_invites.findMany.mockResolvedValue([{ id: 2, booklet_instance_id: 10, teacher_id: 9, ...storedInvite, used_count: 0, expires_at: null, status: "active", created_at: new Date("2026-06-10T00:00:00.000Z") }]);

      const invites: any = await service.listInvites(10, 9);

      expect(invites[0]).toEqual(expect.objectContaining({ token: expect.any(String), passcode: "123456", has_passcode: true }));
      expect(invites[0].passcode_hash).toBeUndefined();
      expect(JSON.stringify(invites)).not.toContain(storedInvite.passcode_hash);
    });

    test("public store lists active unexpired teacher-specific instances with remaining student seats", async () => {
      const db = createMockDb();
      const expiry = new Date("2027-01-15T10:30:00.000Z");
      db.e_booklet_instances.findMany.mockResolvedValue([
        {
          id: 10,
          display_title: "Grade 5 Arabic with Ms Sara",
          invite_quota: 5,
          access_expires_at: expiry,
          student_marketing_price: { toJSON: () => "150" },
          internal_price: { toJSON: () => "70" },
          teacher: { id: 7, name: "Sara" },
          template: {
            id: 3,
            title: "Grade 5 Arabic",
            category_id: 4,
            cover_file_id: 44,
            cover_file: {
              id: 44,
              file_type: "image",
              mime_type: "image/png",
              original_filename: "cover.png",
              size_bytes: 1234,
              storage_key: "e-booklets/private/private-cover.png",
            },
          },
          template_version: { id: 8, version_number: 2 },
          access_records: [{ id: 1 }, { id: 2 }],
        },
      ]);
      db.e_booklet_instances.count.mockResolvedValue(1);

      const service = new EBookletService(db);
      const result: any = await service.listPublicInstances({ page: 1, limit: 20, search: "Arabic", categoryId: 4 });

      expect(db.e_booklet_instances.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: "active",
          access_expires_at: { gt: expect.any(Date) },
          template: expect.objectContaining({ category_id: 4 }),
        }),
      }));
      expect(result.data[0]).toEqual(expect.objectContaining({
        id: 10,
        display_title: "Grade 5 Arabic with Ms Sara",
        student_marketing_price: "150",
        remaining_seats: 3,
        used_seats: 2,
        teacher: { id: 7, name: "Sara" },
      }));
      expect(result.data[0].template.cover_url).toBe("/api/v2/e-booklet-store/covers/44");
      expect(result.data[0].template.cover_file).toEqual(expect.objectContaining({
        id: 44,
        url: "/api/v2/e-booklet-store/covers/44",
      }));
      expect(result.data[0].template.cover_file.storage_key).toBeUndefined();
      expect(result.data[0].internal_price).toBeUndefined();
      expect(JSON.stringify(result.data[0])).not.toContain("70");
      expect(JSON.stringify(result.data[0])).not.toContain("private-cover.png");
    });

    test("public store detail returns one active instance and rejects unavailable instances", async () => {
      const db = createMockDb();
      db.e_booklet_instances.findFirst
        .mockResolvedValueOnce({
          id: 10,
          display_title: "Grade 5 Arabic with Ms Sara",
          invite_quota: 1,
          access_expires_at: new Date("2027-01-15T10:30:00.000Z"),
          student_marketing_price: 0,
          internal_price: 25,
          teacher: { id: 7, name: "Sara" },
          template: { id: 3, title: "Grade 5 Arabic" },
          template_version: { id: 8, version_number: 2 },
          access_records: [],
        })
        .mockResolvedValueOnce(null);

      const service = new EBookletService(db);
      const result: any = await service.getPublicInstance(10);

      expect(result).toEqual(expect.objectContaining({ id: 10, remaining_seats: 1, student_marketing_price: 0 }));
      expect(result.internal_price).toBeUndefined();
      await expect(service.getPublicInstance(99)).rejects.toThrow("E-booklet instance not found");
    });
    test("lists teacher e-booklet orders from teacher purchases, not student order links", async () => {
      const db = createMockDb();
      db.e_booklet_purchases.findMany.mockResolvedValue([
        {
          id: 91,
          teacher_id: 55,
          status: "customization_in_progress",
          price: 250,
          created_at: new Date("2026-06-17T10:00:00.000Z"),
          template: { id: 3, title: "Math booklet" },
          template_version: { id: 8, version_number: 1 },
          instances: [],
        },
      ]);
      db.e_booklet_purchases.count.mockResolvedValue(1);

      const service = new EBookletService(db);
      const result: any = await service.listPublicOrders(55, { page: 2, limit: 5, status: "customization_in_progress" });

      expect(db.e_booklet_purchases.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          teacher_id: 55,
          status: "customization_in_progress",
        },
        include: {
          template: true,
          template_version: true,
          instances: true,
        },
        orderBy: { created_at: "desc" },
        skip: 5,
        take: 5,
      }));
      expect(db.purchases.findMany).not.toHaveBeenCalled();
      expect(db.e_booklet_purchases.count).toHaveBeenCalledWith({
        where: {
          teacher_id: 55,
          status: "customization_in_progress",
        },
      });
      expect(result).toEqual(expect.objectContaining({ data: expect.any(Array), total: 1, page: 2, limit: 5 }));
      expect(result.data[0]).toEqual(expect.objectContaining({
        id: 91,
        teacher_id: 55,
        status: "customization_in_progress",
        template: expect.objectContaining({ title: "Math booklet" }),
      }));
    });

    test("lists admin e-booklet purchases with shared search, date, total, and status filters", async () => {
      const db = createMockDb();
      db.e_booklet_purchases.findMany.mockResolvedValue([{ id: 91, status: "pending" }]);
      db.e_booklet_purchases.count.mockResolvedValue(1);

      const service = new EBookletService(db);
      const result: any = await service.listPurchases({
        page: 2,
        limit: 5,
        status: "pending",
        search: "Sara",
        startDate: "2026-06-01T00:00:00.000Z",
        endDate: "2026-06-30T23:59:59.000Z",
        minTotal: 100,
        maxTotal: 300,
      });

      const expectedWhere = expect.objectContaining({
        status: "pending",
        created_at: {
          gte: new Date("2026-06-01T00:00:00.000Z"),
          lte: new Date("2026-06-30T23:59:59.000Z"),
        },
        AND: expect.arrayContaining([
          {
            OR: [
              { final_payable_price: { not: null, gte: 100, lte: 300 } },
              { final_payable_price: null, price: { gte: 100, lte: 300 } },
            ],
          },
          {
            OR: expect.arrayContaining([
              { teacher: { name: { contains: "Sara", mode: "insensitive" } } },
              { template: { title: { contains: "Sara", mode: "insensitive" } } },
              { payment_reference: { contains: "Sara", mode: "insensitive" } },
            ]),
          },
        ]),
      });

      expect(db.e_booklet_purchases.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expectedWhere,
        orderBy: { created_at: "desc" },
        skip: 5,
        take: 5,
      }));
      expect(db.e_booklet_purchases.count).toHaveBeenCalledWith({ where: expectedWhere });
      expect(result).toEqual(expect.objectContaining({ data: [{ id: 91, status: "pending" }], total: 1, page: 2, limit: 5 }));
    });

    test("treats admin purchase date-only endDate as the end of that day", async () => {
      const db = createMockDb();
      db.e_booklet_purchases.findMany.mockResolvedValue([]);
      db.e_booklet_purchases.count.mockResolvedValue(0);

      const service = new EBookletService(db);
      await service.listPurchases({
        startDate: "2026-06-01",
        endDate: "2026-06-30",
      });

      expect(db.e_booklet_purchases.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          created_at: {
            gte: new Date("2026-06-01T00:00:00.000Z"),
            lte: new Date("2026-06-30T23:59:59.999Z"),
          },
        }),
      }));
    });

    test("admin approval of a teacher checkout purchase creates the teacher management instance and access", async () => {
      const db = createMockDb();
      db.e_booklet_purchases.findUnique.mockResolvedValue({
        id: 91,
        teacher_id: 55,
        template_id: 3,
        template_version_id: 8,
        branding_json: { teacherName: "Sara" },
        price: 150,
        marketing_price: 150,
        internal_price: 0,
        status: "pending",
        instances: [],
      });
      db.e_booklet_instances.create.mockResolvedValue({ id: 10, purchase_id: 91, teacher_id: 55, status: "active" });
      db.e_booklet_access.create.mockResolvedValue({ id: 11 });
      db.e_booklet_purchases.update.mockResolvedValue({ id: 91, status: "ready" });

      const service = new EBookletService(db);
      const result: any = await service.updatePurchaseStatus(91, "paid", "Payment approved");

      expect(db.e_booklet_instances.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          purchase_id: 91,
          teacher_id: 55,
          template_id: 3,
          template_version_id: 8,
          branding_json: { teacherName: "Sara" },
          display_title: "Teacher e-booklet #91",
          invite_quota: 0,
          status: "active",
        }),
      }));
      expect(db.e_booklet_access.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          booklet_instance_id: 10,
          user_id: 55,
          role: "teacher",
          status: "active",
        }),
      }));
      expect(db.e_booklet_purchases.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 91 },
        data: expect.objectContaining({ status: "ready", admin_notes: "Payment approved" }),
      }));
      expect(result).toEqual(expect.objectContaining({ id: 91, status: "ready" }));
    });

    test("admin rejection of a teacher checkout purchase does not create teacher management access", async () => {
      const db = createMockDb();
      db.e_booklet_purchases.update.mockResolvedValue({ id: 91, status: "rejected" });

      const service = new EBookletService(db);
      await service.updatePurchaseStatus(91, "rejected", "Invalid proof");

      expect(db.e_booklet_purchases.findUnique).not.toHaveBeenCalled();
      expect(db.e_booklet_instances.create).not.toHaveBeenCalled();
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
      expect(db.e_booklet_purchases.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 91 },
        data: expect.objectContaining({ status: "rejected", admin_notes: "Invalid proof" }),
      }));
    });

    test("admin approval retry reuses existing teacher management records", async () => {
      const db = createMockDb();
      db.e_booklet_purchases.findUnique.mockResolvedValue({
        id: 91,
        teacher_id: 55,
        template_id: 3,
        template_version_id: 8,
        branding_json: null,
        price: 150,
        marketing_price: 150,
        internal_price: 0,
        status: "ready",
        instances: [{ id: 10, purchase_id: 91, teacher_id: 55, status: "active" }],
      });
      db.e_booklet_access.findFirst.mockResolvedValue({ id: 11, booklet_instance_id: 10, user_id: 55, role: "teacher" });
      db.e_booklet_purchases.update.mockResolvedValue({ id: 91, status: "ready" });

      const service = new EBookletService(db);
      await service.updatePurchaseStatus(91, "paid", "Approved again");

      expect(db.e_booklet_instances.create).not.toHaveBeenCalled();
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
      expect(db.e_booklet_purchases.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 91 },
        data: expect.objectContaining({ status: "ready", admin_notes: "Approved again" }),
      }));
    });

    test("public teacher checkout accepts template items and creates pending e-booklet purchases without requiring delivered instances", async () => {
      const db = createMockDb();
      db.e_booklet_templates.findFirst
        .mockResolvedValueOnce({
          id: 3,
          title: "Math booklet",
          price: 150,
          marketing_price: 150,
          currency: "EGP",
          versions: [{ id: 8, status: "active" }],
        })
        .mockResolvedValueOnce({
          id: 4,
          title: "Science booklet",
          price: 100,
          marketing_price: 100,
          currency: "EGP",
          versions: [{ id: 9, status: "active" }],
        });
      db.e_booklet_purchases.create
        .mockResolvedValueOnce({ id: 91, status: "pending", price: 150, currency: "EGP" })
        .mockResolvedValueOnce({ id: 92, status: "pending", price: 100, currency: "EGP" });

      const service = new EBookletService(db);
      const result: any = await service.createPublicCheckoutRequest(55, {
        items: [
          { template_id: 3, template_version_id: 8 },
          { template_id: 4, template_version_id: 9 },
        ],
        terms_version: "v1",
        terms_accepted: true,
        payment_method_id: 1,
        numberTransferredFrom: "01000000000",
      }, { buffer: Buffer.from("png"), mimetype: "image/png", originalname: "proof.png" } as any);

      expect(db.e_booklet_instances.findFirst).not.toHaveBeenCalled();
      expect(db.e_booklet_purchases.create).toHaveBeenCalledTimes(2);
      expect(db.e_booklet_purchases.create).toHaveBeenNthCalledWith(1, expect.objectContaining({
        data: expect.objectContaining({ teacher_id: 55, template_id: 3, template_version_id: 8, price: 150, status: "pending", payment_screenshot_id: expect.any(Number) }),
      }));
      expect(db.e_booklet_purchases.create).toHaveBeenNthCalledWith(2, expect.objectContaining({
        data: expect.objectContaining({ teacher_id: 55, template_id: 4, template_version_id: 9, price: 100, status: "pending", payment_screenshot_id: expect.any(Number) }),
      }));
      expect(db.purchases.create).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ purchase_id: 91, item_count: 2, total: 250, next_url: "/e-booklet-orders" }));
    });

    test("public checkout creates teacher purchase for the selected instance without student order links", async () => {
      const db = createMockDb();
      const expiry = new Date("2027-01-15T10:30:00.000Z");
      db.e_booklet_instances.findFirst.mockResolvedValue({
        id: 10,
        teacher_id: 7,
        template_id: 3,
        template_version_id: 8,
        invite_quota: 5,
        access_expires_at: expiry,
        status: "active",
        student_marketing_price: 150,
        internal_price: 70,
        template: { currency: "EGP" },
      });
      db.e_booklet_access.count.mockResolvedValue(2);
      db.e_booklet_student_purchase_links.count.mockResolvedValue(0);
      db.e_booklet_purchases.create.mockResolvedValue({ id: 91, status: "pending", price: 150, currency: "EGP" });

      const service = new EBookletService(db);
      const result: any = await service.createPublicCheckoutRequest(55, {
        instance_id: 10,
        template_id: 3,
        template_version_id: 8,
        terms_version: "v1",
        terms_accepted: true,
        payment_method_id: 1,
        numberTransferredFrom: "01000000000",
      }, { buffer: Buffer.from("png"), mimetype: "image/png", originalname: "proof.png" } as any);

      expect(db.e_booklet_instances.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ id: 10, status: "active", access_expires_at: { gt: expect.any(Date) } }),
      }));
      expect(db.e_booklet_student_purchase_links.count).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ booklet_instance_id: 10, access_id: null }),
      }));
      expect(db.e_booklet_purchases.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          teacher_id: 55,
          template_id: 3,
          template_version_id: 8,
          price: 150,
          marketing_price: 150,
          internal_price: 70,
          access_expires_at: expiry,
          status: "pending",
          payment_method: "1",
          payment_reference: "01000000000",
          payment_screenshot_id: expect.any(Number),
        }),
      }));
      expect(db.purchases.create).not.toHaveBeenCalled();
      expect(db.e_booklet_invites.create).not.toHaveBeenCalled();
      expect(db.e_booklet_student_purchase_links.create).not.toHaveBeenCalled();
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ purchase_id: 91, booklet_instance_id: 10, next_url: "/e-booklet-orders" }));
    });

    test("public instance checkout validates and stores configured required fields", async () => {
      const db = createMockDb();
      const expiry = new Date("2027-01-15T10:30:00.000Z");
      const instance = {
        id: 10,
        teacher_id: 7,
        template_id: 3,
        template_version_id: 8,
        invite_quota: 5,
        access_expires_at: expiry,
        status: "active",
        student_marketing_price: 0,
        internal_price: 70,
        template: {
          currency: "EGP",
          required_fields: [{
            id: 21,
            field_definition_id: 12,
            is_required: true,
            active: true,
            required_field_definitions: { id: 12, label: "Student phone", active: true, is_deleted: false },
          }],
        },
      };
      db.e_booklet_instances.findFirst.mockResolvedValue(instance);
      db.e_booklet_access.count.mockResolvedValue(0);
      db.e_booklet_student_purchase_links.count.mockResolvedValue(0);
      db.e_booklet_purchases.create.mockResolvedValue({ id: 91, status: "ready", price: 0, currency: "EGP" });

      const service = new EBookletService(db);

      await expect(service.createPublicCheckoutRequest(55, {
        instance_id: 10,
        template_id: 3,
        template_version_id: 8,
        terms_accepted: true,
      })).rejects.toThrow("Student phone is required for this e-booklet purchase");

      const result: any = await service.createPublicCheckoutRequest(55, {
        instance_id: 10,
        template_id: 3,
        template_version_id: 8,
        required_field_values: [{ field_definition_id: 12, value: "01012345678" }],
        terms_accepted: true,
      });

      expect(db.e_booklet_purchase_required_fields.createMany).toHaveBeenCalledWith({
        data: [{ purchase_id: 91, field_definition_id: 12, value: "01012345678" }],
        skipDuplicates: true,
      });
      expect(result).toEqual(expect.objectContaining({ purchase_id: 91, booklet_instance_id: 10, next_url: "/e-booklet-orders" }));
    });

    test("public checkout creates teacher purchases for multiple e-booklet items without student links", async () => {
      const db = createMockDb();
      const expiry = new Date("2027-01-15T10:30:00.000Z");
      db.e_booklet_instances.findFirst
        .mockResolvedValueOnce({
          id: 10,
          teacher_id: 7,
          template_id: 3,
          template_version_id: 8,
          invite_quota: 5,
          access_expires_at: expiry,
          status: "active",
          student_marketing_price: 150,
          internal_price: 70,
          template: { currency: "EGP" },
        })
        .mockResolvedValueOnce({
          id: 11,
          teacher_id: 8,
          template_id: 4,
          template_version_id: 9,
          invite_quota: 4,
          access_expires_at: expiry,
          status: "active",
          student_marketing_price: 100,
          internal_price: 40,
          template: { currency: "EGP" },
        });
      db.e_booklet_access.count.mockResolvedValue(0);
      db.e_booklet_student_purchase_links.count.mockResolvedValue(0);
      db.e_booklet_purchases.create
        .mockResolvedValueOnce({ id: 91, status: "pending", price: 150, currency: "EGP" })
        .mockResolvedValueOnce({ id: 92, status: "pending", price: 100, currency: "EGP" });

      const service = new EBookletService(db);
      const result: any = await service.createPublicCheckoutRequest(55, {
        items: [
          { instance_id: 10, template_id: 3, template_version_id: 8 },
          { instance_id: 11, template_id: 4, template_version_id: 9 },
        ],
        terms_version: "v1",
        terms_accepted: true,
        payment_method_id: 1,
        numberTransferredFrom: "01000000000",
      }, { buffer: Buffer.from("png"), mimetype: "image/png", originalname: "proof.png" } as any);

      expect(db.e_booklet_purchases.create).toHaveBeenCalledTimes(2);
      expect(db.e_booklet_purchases.create).toHaveBeenNthCalledWith(1, expect.objectContaining({
        data: expect.objectContaining({ teacher_id: 55, template_id: 3, template_version_id: 8, price: 150, status: "pending", payment_screenshot_id: expect.any(Number) }),
      }));
      expect(db.e_booklet_purchases.create).toHaveBeenNthCalledWith(2, expect.objectContaining({
        data: expect.objectContaining({ teacher_id: 55, template_id: 4, template_version_id: 9, price: 100, status: "pending", payment_screenshot_id: expect.any(Number) }),
      }));
      expect(db.purchases.create).not.toHaveBeenCalled();
      expect(db.e_booklet_invites.create).not.toHaveBeenCalled();
      expect(db.e_booklet_student_purchase_links.create).not.toHaveBeenCalled();
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ purchase_id: 91, item_count: 2, total: 250, next_url: "/e-booklet-orders" }));
    });

    test("public checkout rejects when pending checkout links reserve all remaining seats", async () => {
      const db = createMockDb();
      db.e_booklet_instances.findFirst.mockResolvedValue({
        id: 10,
        teacher_id: 7,
        template_id: 3,
        template_version_id: 8,
        invite_quota: 2,
        access_expires_at: new Date("2027-01-15T10:30:00.000Z"),
        status: "active",
        student_marketing_price: 150,
        internal_price: 70,
      });
      db.e_booklet_access.count.mockResolvedValue(1);
      db.e_booklet_student_purchase_links.count.mockResolvedValue(1);

      const service = new EBookletService(db);

      await expect(service.createPublicCheckoutRequest(55, {
        instance_id: 10,
        template_id: 3,
        template_version_id: 8,
        payment_method_id: 1,
        numberTransferredFrom: "01000000000",
        terms_accepted: true,
      }, { buffer: Buffer.from("png"), mimetype: "image/png", originalname: "proof.png" } as any)).rejects.toThrow("This e-booklet has reached its student seat limit");
      expect(db.purchases.create).not.toHaveBeenCalled();
    });

    test("public checkout creates zero-total ready teacher purchase only when store price is zero", async () => {
      const db = createMockDb();
      const expiry = new Date("2027-01-15T10:30:00.000Z");
      db.e_booklet_instances.findFirst.mockResolvedValue({
        id: 10,
        teacher_id: 7,
        template_id: 3,
        template_version_id: 8,
        invite_quota: 5,
        access_expires_at: expiry,
        status: "active",
        student_marketing_price: 0,
        internal_price: 70,
        template: { currency: "EGP" },
      });
      db.e_booklet_access.count.mockResolvedValue(0);
      db.e_booklet_student_purchase_links.count.mockResolvedValue(0);
      db.e_booklet_purchases.create.mockResolvedValue({ id: 91, status: "ready", price: 0, currency: "EGP" });

      const service = new EBookletService(db);
      const result: any = await service.createPublicCheckoutRequest(55, { instance_id: 10, template_id: 3, template_version_id: 8, terms_accepted: true });

      expect(db.e_booklet_purchases.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          teacher_id: 55,
          template_id: 3,
          template_version_id: 8,
          price: 0,
          marketing_price: 0,
          internal_price: 70,
          access_expires_at: expiry,
          status: "ready",
        }),
      }));
      expect(db.purchases.create).not.toHaveBeenCalled();
      expect(db.e_booklet_invites.create).not.toHaveBeenCalled();
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
      expect(db.e_booklet_student_purchase_links.update).not.toHaveBeenCalled();
      expect(db.e_booklet_invites.update).not.toHaveBeenCalled();
      expect(db.e_booklet_instances.update).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ purchase_id: 91, booklet_instance_id: 10, next_url: "/e-booklet-orders" }));
      expect(db.e_booklet_student_purchase_links.create).not.toHaveBeenCalled();
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
    });
  });

  describe("V2 hotspot upload type consistency", () => {
    const baseFile = {
      fieldname: "media",
      encoding: "7bit",
      destination: "",
      filename: "",
      path: "",
      size: 4,
      buffer: Buffer.from("test"),
      stream: undefined as any,
    };

    test("stores safe hotspot attachments as file and rejects mismatched requested media families", async () => {
      const db = createMockDb();
      db.e_booklet_file_assets.create.mockResolvedValue({ id: 77, file_type: "file" });
      const service = new EBookletService(db);

      await expect(service.createFileAsset({
        ...baseFile,
        originalname: "worksheet.docx",
        mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      } as any, { fileType: "image" })).rejects.toThrow("file_type=file");

      await expect(service.createFileAsset({
        ...baseFile,
        originalname: "worksheet.docx",
        mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      } as any, { fileType: "file" })).resolves.toEqual({ id: 77, file_type: "file" });

      expect(db.e_booklet_file_assets.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ file_type: "file", mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
      }));
    });

    test("requires image/video/audio requested types to match the uploaded MIME family", async () => {
      const db = createMockDb();
      db.e_booklet_file_assets.create.mockResolvedValue({ id: 78, file_type: "image" });
      const service = new EBookletService(db);

      await expect(service.createFileAsset({
        ...baseFile,
        originalname: "photo.png",
        mimetype: "image/png",
      } as any, { fileType: "video" })).rejects.toThrow("file_type=image");

      await expect(service.createFileAsset({
        ...baseFile,
        originalname: "photo.png",
        mimetype: "image/png",
      } as any, { fileType: "image" })).resolves.toEqual({ id: 78, file_type: "image" });
    });
  });

  describe("hotspot preset library", () => {
    const sourceHotspot = {
      id: 50,
      template_version_id: 8,
      page_number: 3,
      x_percent: 40.25,
      y_percent: 55.75,
      radius_percent: 1.8,
      reference_number: 7,
      shape: "circle",
      width_percent: 5,
      height_percent: 5,
      type: "question_answer",
      title: "Checkpoint",
      text_content: "Choose one",
      asset_file_id: null,
      trigger_type: "click",
      display_behavior: { color: "blue" },
      content_json: { version: 2, blocks: [{ type: "question_answer", text_content: "Q", answers: [{ text: "A", isCorrect: true }, { text: "B", isCorrect: false }] }] },
      interaction_json: { audio: { autoplay: false } },
      template_version: { id: 8, template_id: 3 },
    };

    test("creates a preset from a saved hotspot with normalized tags and source placement", async () => {
      const db = createMockDb();
      db.e_booklet_hotspots.findUnique.mockResolvedValue(sourceHotspot);
      db.e_booklet_hotspot_presets.create.mockImplementation(async ({ data }: any) => ({ id: 1, ...data, is_active: true }));
      const service = new EBookletService(db);

      const result: any = await service.createHotspotPreset({
        source_hotspot_id: 50,
        name: "  Checkpoint preset  ",
        description: " Reusable ",
        tags: ["Grammar", "grammar", " quiz "],
      }, 9);

      expect(db.e_booklet_hotspot_presets.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Checkpoint preset",
          description: "Reusable",
          tags_json: ["Grammar", "quiz"],
          type: "question_answer",
          default_page_number: 3,
          default_x_percent: 40.25,
          default_y_percent: 55.75,
          source_template_id: 3,
          source_template_version_id: 8,
          source_hotspot_id: 50,
          created_by: 9,
        }),
      });
      expect(result.tags).toEqual(["Grammar", "quiz"]);
    });

    test("lists active presets with search, type, and tag filtering", async () => {
      const db = createMockDb();
      db.e_booklet_hotspot_presets.findMany.mockResolvedValue([
        { id: 1, name: "Grammar quiz", tags_json: ["grammar"], type: "question_answer", title: "Checkpoint", content_json: sourceHotspot.content_json, is_active: true },
        { id: 2, name: "Image info", tags_json: ["visual"], type: "image", title: "Diagram", content_json: { version: 2, blocks: [] }, is_active: true },
      ]);
      const service = new EBookletService(db);

      const result: any = await service.listHotspotPresets({ search: "check", type: "question_answer", tag: "grammar", page: 1, limit: 10 });

      expect(db.e_booklet_hotspot_presets.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { is_active: true, type: "question_answer" },
      }));
      expect(result.total).toBe(1);
      expect(result.data[0]).toEqual(expect.objectContaining({ id: 1, tags: ["grammar"] }));
    });

    test("inserts a preset as a normal hotspot and records usage in one transaction", async () => {
      const db = createMockDb();
      db.e_booklet_template_versions.findUnique.mockResolvedValue({ id: 8, template_id: 3 });
      db.e_booklet_hotspot_presets.findUnique.mockResolvedValue({ ...sourceHotspot, id: 1, is_active: true, default_page_number: 2, default_x_percent: 10, default_y_percent: 20 });
      db.e_booklet_hotspots.findFirst.mockResolvedValue({ reference_number: 12 });
      db.e_booklet_hotspots.create.mockImplementation(async ({ data }: any) => ({ id: 99, ...data }));
      db.e_booklet_hotspot_preset_usages.create.mockResolvedValue({ id: 5 });
      const service = new EBookletService(db);

      const result: any = await service.createHotspotFromPreset(8, { preset_id: 1, page_number: 5, x_percent: 44, y_percent: 66 }, 9);

      expect(db.e_booklet_hotspots.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template_version_id: 8,
          page_number: 5,
          x_percent: 44,
          y_percent: 66,
          reference_number: 13,
          type: "question_answer",
          created_by: 9,
        }),
      });
      expect(db.e_booklet_hotspot_preset_usages.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          preset_id: 1,
          target_template_id: 3,
          target_template_version_id: 8,
          target_hotspot_id: 99,
          used_by: 9,
        }),
      });
      expect(result.id).toBe(99);
    });

    test("deletes unused presets and archives used presets", async () => {
      const db = createMockDb();
      db.e_booklet_hotspot_preset_usages.count.mockResolvedValueOnce(0).mockResolvedValueOnce(2);
      db.e_booklet_hotspot_presets.delete.mockResolvedValue({ id: 1 });
      db.e_booklet_hotspot_presets.update.mockResolvedValue({ id: 2, is_active: false, tags_json: [] });
      const service = new EBookletService(db);

      await expect(service.deleteHotspotPreset(1)).resolves.toEqual({ action: "deleted" });
      await expect(service.deleteHotspotPreset(2)).resolves.toEqual(expect.objectContaining({ action: "archived" }));
      expect(db.e_booklet_hotspot_presets.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(db.e_booklet_hotspot_presets.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 2 }, data: expect.objectContaining({ is_active: false }) }));
    });

    test("restores archived presets and rejects missing preset ids cleanly", async () => {
      const db = createMockDb();
      db.e_booklet_hotspot_presets.findUnique
        .mockResolvedValueOnce({ id: 3 })
        .mockResolvedValueOnce(null);
      db.e_booklet_hotspot_presets.update.mockResolvedValue({ id: 3, is_active: true, tags_json: [] });
      const service = new EBookletService(db);

      await expect(service.restoreHotspotPreset(3, 9)).resolves.toEqual(expect.objectContaining({ id: 3, is_active: true }));
      await expect(service.restoreHotspotPreset(404, 9)).rejects.toThrow("E-booklet hotspot preset not found");
      expect(db.e_booklet_hotspot_presets.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 3 }, data: expect.objectContaining({ is_active: true, updated_by: 9 }) }));
      expect(db.e_booklet_hotspot_presets.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("admin template editing reads", () => {
    test("lists versions for an existing template with usage counts", async () => {
      const db = createMockDb();
      const versions = [
        {
          id: 12,
          template_id: 4,
          version_number: 2,
          status: "draft",
          _count: { hotspots: 3, instances: 0, purchases: 0 },
        },
      ];
      db.e_booklet_templates.findUnique.mockResolvedValue({ id: 4 });
      db.e_booklet_template_versions.findMany.mockResolvedValue(versions);

      const service = new EBookletService(db);
      const result = await service.listTemplateVersions(4);

      expect(db.e_booklet_templates.findUnique).toHaveBeenCalledWith({
        where: { id: 4 },
        select: { id: true },
      });
      expect(db.e_booklet_template_versions.findMany).toHaveBeenCalledWith({
        where: { template_id: 4 },
        include: {
          base_document_file: true,
          rendered_document_file: true,
          _count: { select: { hotspots: true, instances: true, purchases: true } },
        },
        orderBy: { version_number: "desc" },
      });
      expect(result).toBe(versions);
    });

    test("lists only active hotspots for a specific template version page", async () => {
      const db = createMockDb();
      const hotspots = [{ id: 7, page_number: 2, is_active: true }];
      db.e_booklet_hotspots.findMany.mockResolvedValue(hotspots);

      const service = new EBookletService(db);
      const result = await service.listVersionHotspots(12, 2);

      expect(db.e_booklet_hotspots.findMany).toHaveBeenCalledWith({
        where: {
          template_version_id: 12,
          is_active: true,
          page_number: 2,
        },
        orderBy: [
          { page_number: "asc" },
          { sort_order: "asc" },
          { created_at: "asc" },
        ],
      });
      expect(result).toEqual([
        expect.objectContaining({
          id: 7,
          page_number: 2,
          is_active: true,
          content_json: { version: 2, blocks: [{ type: undefined }] },
        }),
      ]);
    });
  });

  describe("V2 hotspot validation and reference numbers", () => {
    test("accepts primary audio content with supplementary text", () => {
      const service = new EBookletService(createMockDb());
      expect(() =>
        service.validateHotspotContent({
          type: "audio",
          asset_file_id: 123,
          content_json: { blocks: [{ type: "audio", asset_file_id: 123, supplementary_text: "Read this note." }] },
        }),
      ).not.toThrow();
    });

    test("requires assets, URLs, one correct Q&A answer, and only accepts real YouTube URLs", () => {
      const service = new EBookletService(createMockDb());
      expect(() => service.validateHotspotContent({ type: "file" })).toThrow("File hotspots require an attached file asset.");
      expect(() =>
        service.validateHotspotContent({ type: "link", content_json: { blocks: [{ type: "link", url: "ftp://example.com" }] } }),
      ).toThrow("Link hotspots require a valid HTTP/HTTPS URL.");
      expect(() =>
        service.validateHotspotContent({
          type: "question_answer",
          content_json: { blocks: [{ type: "question_answer", answers: [{ isCorrect: true }, { isCorrect: true }] }] },
        }),
      ).toThrow("Q&A hotspots require exactly one correct answer.");
      expect(() =>
        service.validateHotspotContent({
          type: "video",
          content_json: { blocks: [{ type: "video", source: "youtube", youtube_url: "https://example.com/video" }] },
        }),
      ).toThrow("YouTube video hotspots require a valid YouTube HTTP/HTTPS URL.");
      expect(() =>
        service.validateHotspotContent({
          type: "video",
          content_json: { blocks: [{ type: "video", source: "youtube", youtube_url: "https://youtu.be/dQw4w9WgXcQ" }] },
        }),
      ).not.toThrow();
    });

    test("auto-assigns the next stable reference number when creating hotspots", async () => {
      const db = createMockDb();
      db.e_booklet_hotspots.findFirst.mockResolvedValue({ reference_number: 7 });
      db.e_booklet_hotspots.create.mockResolvedValue({ id: 99, reference_number: 8 });
      const service = new EBookletService(db);
      const result = await service.createHotspot(
        {
          template_version_id: 22,
          page_number: 1,
          x_percent: 10,
          y_percent: 20,
          radius_percent: 2,
          type: "link",
          content_json: { blocks: [{ type: "link", url: "https://kalima.example" }] },
        },
        1,
      );
      expect(db.e_booklet_hotspots.findFirst).toHaveBeenCalledWith({
        where: { template_version_id: 22 },
        orderBy: { reference_number: "desc" },
        select: { reference_number: true },
      });
      expect(db.e_booklet_hotspots.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ reference_number: 8 }) }));
      expect(result).toEqual({ id: 99, reference_number: 8 });
    });

    test("normalizes legacy text and asset hotspots to the V2 content shape on reads", async () => {
      const db = createMockDb();
      db.e_booklet_hotspots.findMany.mockResolvedValue([
        {
          id: 1,
          type: "text",
          title: "Legacy note",
          text_content: "Read me",
          asset_file_id: null,
          content_json: null,
        },
        {
          id: 2,
          type: "image",
          title: "Legacy image",
          text_content: "Caption",
          asset_file_id: 44,
          content_json: null,
        },
      ]);
      const service = new EBookletService(db);

      const result: any = await service.listVersionHotspots(22, 1);

      expect(result[0].content_json).toEqual({
        version: 2,
        blocks: [{ type: "text", text_content: "Read me" }],
      });
      expect(result[1].content_json).toEqual({
        version: 2,
        blocks: [{ type: "image", asset_file_id: 44, supplementary_text: "Caption" }],
      });
    });

    test("preserves and validates multi-block V2 hotspot content on create and update", async () => {
      const db = createMockDb();
      db.e_booklet_hotspots.findFirst.mockResolvedValue(null);
      db.e_booklet_hotspots.create.mockResolvedValue({ id: 100 });
      db.e_booklet_hotspots.findUnique.mockResolvedValue({
        id: 100,
        type: "audio",
        asset_file_id: 123,
        content_json: { blocks: [{ type: "audio", asset_file_id: 123 }] },
      });
      db.e_booklet_hotspots.update.mockResolvedValue({ id: 100 });
      const service = new EBookletService(db);

      await service.createHotspot(
        {
          template_version_id: 22,
          page_number: 1,
          x_percent: 10,
          y_percent: 20,
          type: "audio",
          content_json: {
            version: 2,
            blocks: [
              { type: "audio", asset_file_id: 123, supplementary_text: "Listen first" },
              { type: "text", text_content: "Then answer." },
            ],
          },
        },
        1,
      );

      expect(db.e_booklet_hotspots.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          content_json: {
            version: 2,
            blocks: [
              { type: "audio", asset_file_id: 123, supplementary_text: "Listen first" },
              { type: "text", text_content: "Then answer." },
            ],
          },
        }),
      }));

      await expect(service.updateHotspot(100, {
        type: "link",
        content_json: { blocks: [{ type: "link", url: "javascript:alert(1)" }] },
      }, 1)).rejects.toThrow("Link hotspots require a valid HTTP/HTTPS URL.");
    });
  });

  describe("V2 device binding", () => {
    test("allows teacher-owned e-booklets without binding a viewer device", async () => {
      const db = createMockDb();
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 9,
        user_id: 55,
        role: "teacher",
        status: "active",
        booklet_instance: { id: 10, status: "active", access_expires_at: new Date("2026-12-31T00:00:00.000Z") },
      });
      const service = new EBookletService(db);

      await expect(service.bindViewerDevice(10, 55, { deviceFingerprint: "dev-2" })).resolves.toEqual({
        booklet_instance_id: 10,
        user_id: 55,
        status: "allowed",
        binding_exempt: true,
      });

      expect(db.$transaction).not.toHaveBeenCalled();
      expect(db.e_booklet_devices.findFirst).not.toHaveBeenCalled();
      expect(db.e_booklet_devices.count).not.toHaveBeenCalled();
      expect(db.e_booklet_devices.create).not.toHaveBeenCalled();
    });

    test("allows the same active device again and can list safe active viewer devices", async () => {
      const db = createMockDb();
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 9,
        status: "active",
        booklet_instance: { id: 10, status: "active", access_expires_at: new Date("2026-12-31T00:00:00.000Z") },
      });
      db.e_booklet_devices.findFirst.mockResolvedValue({ id: 1, device_fingerprint: "dev-1" });
      db.e_booklet_devices.update.mockResolvedValue({ id: 1, device_fingerprint: "dev-1" });
      db.e_booklet_devices.findMany = jest.fn().mockResolvedValue([{ id: 1, device_label: "Tablet", status: "active" }]);
      const service = new EBookletService(db);

      await expect(service.bindViewerDevice(10, 55, { deviceFingerprint: "dev-1", userAgent: "ua" })).resolves.toEqual({ id: 1, device_fingerprint: "dev-1" });
      await expect(service.listViewerDevices(10, 55)).resolves.toEqual([{ id: 1, device_label: "Tablet", status: "active" }]);
      expect(db.e_booklet_devices.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 }, data: expect.objectContaining({ user_agent: "ua" }) }));
      expect(db.e_booklet_devices.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { booklet_instance_id: 10, user_id: 55, status: "active" },
        select: expect.not.objectContaining({ device_fingerprint: true, user_agent: true, ip_address: true }),
      }));
    });

    test("first-binds a viewer device and blocks a second device by default", async () => {
      const db = createMockDb();
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 9,
        status: "active",
        access_source: "offline_passcode",
        booklet_instance: { id: 10, status: "active", access_expires_at: new Date("2026-12-31T00:00:00.000Z"), teacher_id: 9, template_id: 3 },
      });
      db.e_booklet_devices.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      db.e_booklet_devices.count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
      db.e_booklet_device_allowances.findUnique.mockResolvedValue(null);
      db.e_booklet_devices.create.mockResolvedValue({ id: 1, device_fingerprint: "dev-1" });
      const service = new EBookletService(db);
      await expect(service.bindViewerDevice(10, 55, { deviceFingerprint: "dev-1" })).resolves.toEqual({ id: 1, device_fingerprint: "dev-1" });
      await expect(service.bindViewerDevice(10, 55, { deviceFingerprint: "dev-2" })).rejects.toThrow("This e-booklet is already bound to another device.");
      expect(db.$transaction).toHaveBeenCalledTimes(2);
      expect(db.$transaction).toHaveBeenNthCalledWith(1, expect.any(Function), { isolationLevel: "Serializable" });
      expect(db.$transaction).toHaveBeenNthCalledWith(2, expect.any(Function), { isolationLevel: "Serializable" });
      expect(db.e_booklet_analytics_events.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          event_type: "device_bound",
          teacher_id: 9,
          student_id: 55,
          template_id: 3,
          booklet_instance_id: 10,
          access_id: 9,
          source: "offline_passcode",
          metadata: expect.objectContaining({ device_label_present: false }),
        }),
      });
    });

    test("admin can reset devices and grant an additional-device allowance", async () => {
      const db = createMockDb();
      db.e_booklet_device_allowances.upsert.mockResolvedValue({ allowed_devices: 2 });
      const service = new EBookletService(db);
      await expect(service.resetViewerDevices(10, 55, 1, "   ")).rejects.toThrow("A reason is required for device admin actions.");
      await expect(service.addDeviceAllowance(10, 55, 1, 2, "")).rejects.toThrow("A reason is required for device admin actions.");
      await service.resetViewerDevices(10, 55, 1, "  replacement phone  ");
      await service.addDeviceAllowance(10, 55, 1, 2, "  second tablet  ");
      expect(db.e_booklet_devices.updateMany).toHaveBeenCalledWith({
        where: { booklet_instance_id: 10, user_id: 55, status: "active" },
        data: expect.objectContaining({ status: "reset", reset_by_admin_id: 1, reset_reason: "replacement phone" }),
      });
      expect(db.e_booklet_device_allowances.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { booklet_instance_id_user_id: { booklet_instance_id: 10, user_id: 55 } },
        create: expect.objectContaining({ allowed_devices: 2, reason: "second tablet" }),
        update: expect.objectContaining({ allowed_devices: 2, reason: "second tablet" }),
      }));
    });
  });

  describe("V2 access paths, terms, pricing, and expiry", () => {
    test("records analytics events without raw wrong passcodes and returns scoped teacher/admin summaries", async () => {
      const db = createMockDb();
      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 2,
        booklet_instance_id: 10,
        teacher_id: 9,
        passcode_hash: hmacPasscode("123456"),
        max_uses: null,
        used_count: 0,
        booklet_instance: { id: 10, invite_quota: 10, status: "active", student_marketing_price: 150, internal_price: 60, teacher_id: 9, template_id: 3 },
      });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(0);
      db.e_booklet_access.create.mockResolvedValue({ id: 30, access_source: "offline_passcode" });
      db.e_booklet_analytics_events.groupBy.mockResolvedValue([{ event_type: "access_created", _count: { _all: 1 } }]);
      db.e_booklet_analytics_events.aggregate.mockResolvedValue({ _sum: { marketing_price_snapshot: 150 } });
      db.e_booklet_instances.findMany.mockResolvedValue([{ id: 10, invite_quota: 10, used_invites_count: 1, status: "active", access_expires_at: null }]);
      const service = new EBookletService(db);

      await expect(service.acceptInvitePasscode("token", 55, { termsAccepted: true, passcode: "000000" })).rejects.toThrow("Invalid e-booklet invite passcode.");
      expect(JSON.stringify(db.e_booklet_analytics_events.create.mock.calls)).not.toContain("000000");
      await service.acceptInvitePasscode("token", 55, { termsAccepted: true, passcode: "123456", termsVersion: "v1" });
      expect(db.e_booklet_analytics_events.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          event_type: "access_created",
          source: "offline_passcode",
          marketing_price_snapshot: 150,
          internal_price_snapshot: 60,
        }),
      });
      await expect(service.getTeacherAnalytics(9, { instanceId: 10 })).resolves.toEqual(expect.objectContaining({ revenue: expect.objectContaining({ offlineEstimated: 150 }) }));
      expect(db.e_booklet_analytics_events.groupBy).toHaveBeenLastCalledWith(expect.objectContaining({ where: expect.objectContaining({ teacher_id: 9, booklet_instance_id: { in: [10] } }) }));
      expect(JSON.stringify(await service.getTeacherAnalytics(9, {}))).not.toContain("internal_price");
    });

    test("scopes teacher analytics to source-of-truth owned instances before aggregating events", async () => {
      const db = createMockDb();
      db.e_booklet_instances.findMany.mockResolvedValue([{ id: 10, invite_quota: 5, used_invites_count: 2, status: "active", access_expires_at: null }]);
      db.e_booklet_analytics_events.groupBy.mockResolvedValue([]);
      db.e_booklet_analytics_events.aggregate.mockResolvedValue({ _sum: { marketing_price_snapshot: 0 }, _count: { _all: 0 }, _min: { created_at: null }, _max: { created_at: null } });
      const service = new EBookletService(db);

      await service.getTeacherAnalytics(9, { instanceId: 10 });

      expect(db.e_booklet_instances.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { teacher_id: 9, id: 10 },
        select: expect.objectContaining({ id: true }),
      }));
      expect(db.e_booklet_analytics_events.groupBy).toHaveBeenCalledWith(expect.objectContaining({
        by: ["event_type"],
        where: expect.objectContaining({ teacher_id: 9, booklet_instance_id: { in: [10] } }),
      }));
      expect(db.e_booklet_analytics_events.groupBy).not.toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ booklet_instance_id: 10 }),
      }));
    });

    test("requires access expiry at delivery and archives expired active instances in bulk", async () => {
      const db = createMockDb();
      db.e_booklet_purchases.findUnique.mockResolvedValue({
        id: 2,
        teacher_id: 9,
        template_id: 3,
        template_version_id: 4,
        branding_json: {},
        price: 120,
        marketing_price: 150,
        internal_price: 70,
        status: "paid",
        instances: [],
      });
      db.e_booklet_instances.updateMany.mockResolvedValue({ count: 2 });
      const service = new EBookletService(db);

      await expect(service.deliverPurchase(2, { custom_document_file_id: 99, display_title: "No expiry", invite_quota: 5, page_count: 2 }, 1)).rejects.toThrow("Access expiry is required for delivered e-booklets.");
      const now = new Date("2026-06-02T00:00:00.000Z");
      await expect(service.archiveExpiredInstances(now)).resolves.toEqual({ count: 2 });
      expect(db.e_booklet_instances.updateMany).toHaveBeenCalledWith({
        where: { status: "active", access_expires_at: { lte: now } },
        data: expect.objectContaining({ status: "archived", archive_reason: "expired", archived_at: now }),
      });
    });

    test("blocks online student purchase links and still requires terms for passcode/free access", async () => {
      const service = new EBookletService(createMockDb());
      await expect(service.createStudentPurchaseLink("token", 55, { termsAccepted: false })).rejects.toThrow("Direct student e-booklet purchase is disabled");
      await expect(service.acceptInvitePasscode("token", 55, { passcode: "123456", termsAccepted: false })).rejects.toThrow("Student terms acceptance is required.");
      await expect(service.acceptFreeInvite("token", 55, { termsAccepted: false })).rejects.toThrow("Student terms acceptance is required.");
    });

    test("blocks online purchase links and keeps passcode/free access without generic purchase", async () => {
      const db = createMockDb();
      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 2,
        booklet_instance_id: 10,
        passcode_hash: hmacPasscode("123456"),
        max_uses: null,
        used_count: 0,
        booklet_instance: { id: 10, invite_quota: 10, status: "active", student_marketing_price: 150, internal_price: 60 },
      });
      db.purchases.findFirst.mockResolvedValue({ id: 500, user_id: 55, payment_screenshot_id: 700 });
      db.e_booklet_student_purchase_links.create.mockResolvedValue({ id: 20, purchase_id: 500 });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(0);
      db.e_booklet_access.create.mockResolvedValue({ id: 30 });
      const service = new EBookletService(db);
      await expect(service.createStudentPurchaseLink("token", 55, { termsAccepted: true, termsVersion: "v1", purchaseId: 500 })).rejects.toThrow("Direct student e-booklet purchase is disabled");
      await service.acceptInvitePasscode("token", 55, { termsAccepted: true, passcode: "123456" });
      expect(db.e_booklet_student_purchase_links.create).not.toHaveBeenCalled();
      expect(db.e_booklet_access.create).toHaveBeenCalledWith({ data: expect.objectContaining({ access_source: "offline_passcode" }) });
    });

    test("auto-grants student access when an online student purchase link is approved", async () => {
      const db = createMockDb();
      db.e_booklet_student_purchase_links.findUnique.mockResolvedValue({
        purchase_id: 500,
        invite_id: 2,
        booklet_instance_id: 10,
        student_id: 55,
        access_id: null,
        invite: { id: 2, max_uses: null, used_count: 0 },
        booklet_instance: { id: 10, invite_quota: 10, status: "active" },
      });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(0);
      db.e_booklet_access.create.mockResolvedValue({ id: 88, access_source: "online_purchase" });
      db.e_booklet_student_purchase_links.update.mockResolvedValue({ purchase_id: 500, access_id: 88 });
      const service = new EBookletService(db);

      await expect(service.approveStudentPurchaseLink(500, 1)).resolves.toEqual({ purchase_id: 500, access_id: 88 });
      expect(db.e_booklet_access.create).toHaveBeenCalledWith({ data: expect.objectContaining({ access_source: "online_purchase", source_invite_id: 2, user_id: 55 }) });
      expect(db.e_booklet_student_purchase_links.update).toHaveBeenCalledWith(expect.objectContaining({ where: { purchase_id: 500 }, data: expect.objectContaining({ access_id: 88, approved_at: expect.any(Date) }) }));
      expect(db.e_booklet_audit_logs.create).toHaveBeenCalledWith({ data: expect.objectContaining({ actor_user_id: 1, action: "student_purchase_approved", entity_id: 10 }) });
    });

    test("student purchase approval records approval-time analytics from the reserved purchase price snapshot", async () => {
      const db = createMockDb();
      db.e_booklet_student_purchase_links.findUnique.mockResolvedValue({
        purchase_id: 500,
        invite_id: 2,
        booklet_instance_id: 10,
        student_id: 55,
        access_id: null,
        terms_version: "v1",
        marketing_price_snapshot: 150,
        invite: { id: 2, max_uses: null, used_count: 0, teacher_id: 9 },
        booklet_instance: {
          id: 10,
          invite_quota: 10,
          status: "active",
          teacher_id: 9,
          template_id: 3,
          student_marketing_price: 999,
          internal_price: 60,
        },
      });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(0);
      db.e_booklet_access.create.mockResolvedValue({ id: 88, access_source: "online_purchase" });
      db.e_booklet_student_purchase_links.update.mockResolvedValue({ purchase_id: 500, access_id: 88 });
      const service = new EBookletService(db);

      await service.approveStudentPurchaseLink(500, 1);

      expect(db.e_booklet_analytics_events.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          event_type: "access_created",
          source: "online_purchase",
          marketing_price_snapshot: 150,
          internal_price_snapshot: 60,
        }),
      });
      expect(JSON.stringify(db.e_booklet_analytics_events.create.mock.calls)).not.toContain("999");
    });

    test("student purchase approval is idempotent for already-approved links", async () => {
      const db = createMockDb();
      const approvedLink = {
        purchase_id: 500,
        invite_id: 2,
        booklet_instance_id: 10,
        student_id: 55,
        access_id: 88,
        approved_at: new Date("2026-01-02T00:00:00.000Z"),
        invite: { id: 2, max_uses: null, used_count: 1 },
        booklet_instance: { id: 10, invite_quota: 10, status: "active" },
      };
      db.e_booklet_student_purchase_links.findUnique.mockResolvedValue(approvedLink);

      const service = new EBookletService(db);

      await expect(service.approveStudentPurchaseLink(500, 1)).resolves.toEqual(approvedLink);
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
      expect(db.e_booklet_invites.update).not.toHaveBeenCalled();
      expect(db.e_booklet_instances.update).not.toHaveBeenCalled();
      expect(db.e_booklet_student_purchase_links.update).not.toHaveBeenCalled();
    });

    test("student purchase approval rejects when active access and pending links exhaust quota", async () => {
      const db = createMockDb();
      db.e_booklet_student_purchase_links.findUnique.mockResolvedValue({
        purchase_id: 500,
        invite_id: 2,
        booklet_instance_id: 10,
        student_id: 55,
        access_id: null,
        invite: { id: 2, max_uses: null, used_count: 0 },
        booklet_instance: { id: 10, invite_quota: 2, status: "active" },
      });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(1);
      db.e_booklet_student_purchase_links.count.mockResolvedValue(1);

      const service = new EBookletService(db);

      await expect(service.approveStudentPurchaseLink(500, 1)).rejects.toThrow("student seat limit");
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
    });

    test("creates zero-price free invite access without a purchase link even when internal price is nonzero", async () => {
      const db = createMockDb();
      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 2,
        booklet_instance_id: 10,
        max_uses: null,
        used_count: 0,
        booklet_instance: { id: 10, invite_quota: 10, status: "active", student_marketing_price: 0, internal_price: 25 },
      });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(0);
      db.e_booklet_access.create.mockResolvedValue({ id: 31, access_source: "free_invite" });

      const service = new EBookletService(db);
      const result = await service.acceptFreeInvite("token", 55, { termsAccepted: true, termsVersion: "v1" });

      expect(db.e_booklet_student_purchase_links.create).not.toHaveBeenCalled();
      expect(db.e_booklet_access.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          booklet_instance_id: 10,
          user_id: 55,
          access_source: "free_invite",
          terms_version: "v1",
          status: "active",
        }),
      });
      expect(result).toEqual({ id: 31, access_source: "free_invite" });
    });

    test("rejects arbitrary generic purchase IDs, passcode invites without a stored hash, and paid free invites", async () => {
      const db = createMockDb();
      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 2,
        booklet_instance_id: 10,
        max_uses: null,
        used_count: 0,
        booklet_instance: { id: 10, invite_quota: 10, status: "active", student_marketing_price: 150, internal_price: 60 },
      });
      db.purchases.findFirst.mockResolvedValue(null);
      const service = new EBookletService(db);

      await expect(service.createStudentPurchaseLink("token", 55, { termsAccepted: true, purchaseId: 999 })).rejects.toThrow("Direct student e-booklet purchase is disabled");
      await expect(service.acceptInvitePasscode("token", 55, { termsAccepted: true, passcode: "123456" })).rejects.toThrow("This e-booklet invite does not allow passcode access.");
      await expect(service.acceptFreeInvite("token", 55, { termsAccepted: true })).rejects.toThrow("This e-booklet invite requires purchase.");
    });

    test("enforces passcode/free invite max uses and seat quota", async () => {
      const db = createMockDb();
      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 2,
        booklet_instance_id: 10,
        passcode_hash: hmacPasscode("123456"),
        max_uses: 1,
        used_count: 1,
        booklet_instance: { id: 10, invite_quota: 1, status: "active", student_marketing_price: 0, internal_price: 0 },
      });
      const service = new EBookletService(db);

      await expect(service.acceptInvitePasscode("token", 55, { termsAccepted: true, passcode: "123456" })).rejects.toThrow("This e-booklet invite has reached its access limit.");

      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 2,
        booklet_instance_id: 10,
        max_uses: null,
        used_count: 0,
        booklet_instance: { id: 10, invite_quota: 1, status: "active", student_marketing_price: 0, internal_price: 0 },
      });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(1);
      await expect(service.acceptFreeInvite("token", 55, { termsAccepted: true })).rejects.toThrow("student seat limit");
    });

    test("does not expose internal price in user booklet lists or viewer metadata", async () => {
      const db = createMockDb();
      const access = {
        id: 1,
        booklet_instance: {
          id: 10,
          status: "active",
          internal_price: 60,
          template: { id: 7, title: "Grade 5" },
          template_version: { id: 22, internal_price: 10 },
        },
      };
      db.e_booklet_access.findMany.mockResolvedValue([access]);
      db.e_booklet_access.findFirst.mockResolvedValue(access);

      const service = new EBookletService(db);
      expect(JSON.stringify(await service.listUserEBooklets(55, "student"))).not.toContain("internal_price");
      expect(JSON.stringify(await service.getViewerMetadata(10, 55))).not.toContain("internal_price");
    });

    test("generic purchase approval hook is intentionally deferred outside Phase 1", () => {
      expect((new EBookletService(createMockDb()) as any).approveGenericPurchase).toBeUndefined();
    });

    test("enforces internal price <= effective marketing price and supports instance override", () => {
      const service = new EBookletService(createMockDb());
      expect(() => service.validateInstancePricing({ marketing_price: 100, internal_price: 101 })).toThrow("Internal price cannot exceed marketing price.");
      expect(service.validateInstancePricing({ template_marketing_price: 100, student_marketing_price: 80, internal_price: 60 })).toEqual({ marketingPrice: 80, internalPrice: 60 });
    });

    test("rejects quota reductions below active and pending reserved seats", async () => {
      const db = createMockDb();
      db.e_booklet_instances.findUnique.mockResolvedValue({ id: 10, invite_quota: 5 });
      db.e_booklet_access.count.mockResolvedValue(2);
      db.e_booklet_student_purchase_links.count.mockResolvedValue(2);
      const service = new EBookletService(db);

      await expect(service.updateQuota(10, 3)).rejects.toThrow("below existing student seats");
      expect(db.e_booklet_instances.update).not.toHaveBeenCalled();
    });

    test("free and passcode invite acceptance count pending reservations before creating access", async () => {
      const db = createMockDb();
      db.e_booklet_invites.findFirst
        .mockResolvedValueOnce({
          id: 2,
          booklet_instance_id: 10,
          max_uses: null,
          used_count: 0,
          booklet_instance: { id: 10, invite_quota: 2, status: "active", student_marketing_price: 0, internal_price: 0 },
        })
        .mockResolvedValueOnce({
          id: 3,
          booklet_instance_id: 11,
          passcode_hash: hmacPasscode("123456"),
          max_uses: null,
          used_count: 0,
          booklet_instance: { id: 11, invite_quota: 2, status: "active", student_marketing_price: 0, internal_price: 0 },
        });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(1);
      db.e_booklet_student_purchase_links.count.mockResolvedValue(1);
      const service = new EBookletService(db);

      await expect(service.acceptFreeInvite("free-token", 55, { termsAccepted: true })).rejects.toThrow("student seat limit");
      await expect(service.acceptInvitePasscode("pass-token", 55, { termsAccepted: true, passcode: "123456" })).rejects.toThrow("student seat limit");
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
    });

    test("blocks viewer access after expiry and archives the instance", async () => {
      const db = createMockDb();
      db.e_booklet_access.findFirst.mockResolvedValue({
        booklet_instance: { id: 10, status: "active", access_expires_at: new Date("2026-01-01T00:00:00.000Z") },
      });
      const service = new EBookletService(db);
      await expect(service.assertViewerAccess(10, 55, new Date("2026-02-01T00:00:00.000Z"))).rejects.toThrow("This e-booklet has expired.");
      expect(db.e_booklet_instances.update).toHaveBeenCalledWith({ where: { id: 10 }, data: expect.objectContaining({ status: "archived", archive_reason: "expired" }) });
    });
  });

  describe("acceptInvite", () => {
    test("creates access and redemption transactionally when quota remains", async () => {
      const db = createMockDb();
      const rawToken = "invite-token";
      const tokenHash = hashInviteToken(rawToken);
      const invite = {
        id: 7,
        token_hash: tokenHash,
        status: "active",
        expires_at: null,
        booklet_instance_id: 10,
        teacher_id: 99,
        max_uses: null,
        used_count: 0,
        e_booklet_instances: {
          id: 10,
          status: "active",
          invite_quota: 2,
        },
      };
      const createdAccess = {
        id: 100,
        booklet_instance_id: 10,
        user_id: 55,
        role: "student",
        status: "active",
      };

      db.e_booklet_invites.findFirst.mockResolvedValue(invite);
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(1);
      db.e_booklet_access.create.mockResolvedValue(createdAccess);

      const service = new EBookletService(db);

      const result = await service.acceptInvite(rawToken, 55, {
        ipAddress: "127.0.0.1",
        userAgent: "jest",
      });

      expect(db.$transaction).toHaveBeenCalledTimes(1);
      expect(db.e_booklet_invites.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { token_hash: tokenHash } }),
      );
      expect(db.e_booklet_access.count).toHaveBeenCalledWith({
        where: {
          booklet_instance_id: 10,
          role: "student",
          status: "active",
        },
      });
      expect(db.e_booklet_access.create).toHaveBeenCalledWith({
        data: {
          booklet_instance_id: 10,
          user_id: 55,
          role: "student",
          source_invite_id: 7,
          status: "active",
        },
      });
      expect(db.e_booklet_invite_redemptions.create).toHaveBeenCalledWith({
        data: {
          invite_id: 7,
          booklet_instance_id: 10,
          student_id: 55,
          ip_address: "127.0.0.1",
          user_agent: "jest",
        },
      });
      expect(db.e_booklet_invites.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { used_count: { increment: 1 } },
      });
      expect(result).toEqual({
        alreadyHadAccess: false,
        access: createdAccess,
        bookletInstanceId: 10,
      });
    });

    test("does not consume quota when student already has active access", async () => {
      const db = createMockDb();
      const existingAccess = {
        id: 101,
        booklet_instance_id: 10,
        user_id: 55,
        role: "student",
        status: "active",
      };

      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 7,
        token_hash: hashInviteToken("invite-token"),
        status: "active",
        expires_at: null,
        booklet_instance_id: 10,
        teacher_id: 99,
        max_uses: null,
        used_count: 0,
        e_booklet_instances: {
          id: 10,
          status: "active",
          invite_quota: 2,
        },
      });
      db.e_booklet_access.findFirst.mockResolvedValue(existingAccess);

      const service = new EBookletService(db);

      const result = await service.acceptInvite("invite-token", 55);

      expect(db.e_booklet_access.count).not.toHaveBeenCalled();
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
      expect(db.e_booklet_invites.update).not.toHaveBeenCalled();
      expect(result).toEqual({
        alreadyHadAccess: true,
        access: existingAccess,
        bookletInstanceId: 10,
      });
    });

    test("blocks invite redemption when active student access has reached quota", async () => {
      const db = createMockDb();

      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 7,
        token_hash: hashInviteToken("invite-token"),
        status: "active",
        expires_at: null,
        booklet_instance_id: 10,
        teacher_id: 99,
        max_uses: null,
        used_count: 0,
        e_booklet_instances: {
          id: 10,
          status: "active",
          invite_quota: 2,
        },
      });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(2);

      const service = new EBookletService(db);

      await expect(service.acceptInvite("invite-token", 55)).rejects.toThrow(
        "student seat limit",
      );
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
      expect(db.e_booklet_invite_redemptions.create).not.toHaveBeenCalled();
    });

    test("blocks legacy invite redemption when active plus pending reservations exhaust quota", async () => {
      const db = createMockDb();

      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 7,
        token_hash: hashInviteToken("invite-token"),
        status: "active",
        expires_at: null,
        booklet_instance_id: 10,
        teacher_id: 99,
        max_uses: null,
        used_count: 0,
        e_booklet_instances: {
          id: 10,
          status: "active",
          invite_quota: 2,
        },
      });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(1);
      db.e_booklet_student_purchase_links.count.mockResolvedValue(1);

      const service = new EBookletService(db);

      await expect(service.acceptInvite("invite-token", 55)).rejects.toThrow(
        "student seat limit",
      );
      expect(db.e_booklet_access.create).not.toHaveBeenCalled();
      expect(db.e_booklet_invite_redemptions.create).not.toHaveBeenCalled();
    });
  });

  describe("viewer hardening", () => {
    test("returns a short-lived page token and rejects out-of-range page requests", async () => {
      const db = createMockDb();
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 1,
        booklet_instance_id: 10,
        user_id: 55,
        status: "active",
        access_source: "offline_passcode",
        booklet_instance: {
          id: 10,
          status: "active",
          template_version_id: 22,
          teacher_id: 99,
          template_id: 7,
          access_source: "offline_passcode",
          teacher: { id: 99, name: "Ms. Sara" },
          template: { id: 7, title: "Grade 5 Arabic" },
          custom_document_file_id: 99,
          template_version: {
            id: 22,
            page_count: 3,
            base_document_file_id: null,
            rendered_document_file_id: null,
          },
        },
      });

      const service = new EBookletService(db);

      const result = await service.getViewerPage(10, 2, 55);

      expect(result).toEqual(
        expect.objectContaining({
          pageNumber: 2,
          renderMode: "pdf-document",
          documentAssetId: 99,
          message: null,
          pageAccessToken: expect.stringMatching(
            /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
          ),
          expiresAt: expect.any(Date),
          cacheControl: "private, no-store",
          watermark: {
            teacherName: "Ms. Sara",
            templateTitle: "Grade 5 Arabic",
          },
        }),
      );
      expect(db.e_booklet_audit_logs.create).toHaveBeenCalledWith({
        data: {
          actor_user_id: 55,
          action: "page_viewed",
          entity_type: "e_booklet_instance",
          entity_id: 10,
          metadata_json: { page_number: 2 },
        },
      });
      expect(db.e_booklet_analytics_events.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          event_type: "page_viewed",
          teacher_id: 99,
          student_id: 55,
          template_id: 7,
          booklet_instance_id: 10,
          access_id: 1,
          source: "offline_passcode",
          metadata: expect.objectContaining({ page_number: 2 }),
        }),
      });

      await expect(service.getViewerPage(10, 4, 55)).rejects.toThrow(
        "Invalid e-booklet page number.",
      );
    });

    test("returns a controlled error when the authorized viewer PDF file is missing", async () => {
      const db = createMockDb();
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 1,
        booklet_instance_id: 10,
        user_id: 55,
        status: "active",
        booklet_instance: {
          id: 10,
          status: "active",
          custom_document_file_id: 99,
          access_expires_at: null,
          template_version: {
            id: 22,
            page_count: 3,
            base_document_file_id: 88,
            rendered_document_file_id: 77,
          },
        },
      });
      db.e_booklet_file_assets.findUnique.mockResolvedValue({
        id: 99,
        file_type: "pdf",
        storage_key: "e-booklets/private/definitely-missing-viewer-file.pdf",
        original_filename: "lesson.pdf",
        mime_type: "application/pdf",
        size_bytes: 1024,
        visibility: "private",
      });

      const service = new EBookletService(db);

      await expect(service.getAuthorizedViewerDocument(10, 55, 1, createViewerPageToken({ instanceId: 10, pageNumber: 1, userId: 55 }))).rejects.toThrow(
        "E-booklet PDF file is not available.",
      );
    });

    test("falls back to the rendered template PDF when the custom document file is missing", async () => {
      const db = createMockDb();
      const fallbackFilename = `viewer-fallback-${Date.now()}.pdf`;
      const fallbackPath = await writeTestPdf(fallbackFilename);
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 1,
        booklet_instance_id: 10,
        user_id: 55,
        status: "active",
        booklet_instance: {
          id: 10,
          status: "active",
          custom_document_file_id: 99,
          access_expires_at: null,
          template_version: {
            id: 22,
            page_count: 3,
            base_document_file_id: null,
            rendered_document_file_id: 77,
          },
        },
      });
      db.e_booklet_file_assets.findUnique
        .mockResolvedValueOnce({
          id: 99,
          file_type: "pdf",
          storage_key: "e-booklets/private/definitely-missing-viewer-file.pdf",
          original_filename: "custom.pdf",
          mime_type: "application/pdf",
          size_bytes: 1024,
          visibility: "private",
        })
        .mockResolvedValueOnce({
          id: 77,
          file_type: "pdf",
          storage_key: `e-booklets/private/${fallbackFilename}`,
          original_filename: "rendered.pdf",
          mime_type: "application/pdf",
          size_bytes: 1024,
          visibility: "private",
        });
      const service = new EBookletService(db);

      try {
        const result: any = await service.getAuthorizedViewerDocument(10, 55, 1, createViewerPageToken({ instanceId: 10, pageNumber: 1, userId: 55 }));

        expect(result.asset.id).toBe(77);
        expect(result.asset.original_filename).toBe("rendered-page-1.pdf");
        expect(result.absolutePath).toBe(fallbackPath);
        expect(Buffer.isBuffer(result.pageBuffer)).toBe(true);
      } finally {
        await fs.unlink(fallbackPath).catch(() => undefined);
      }
    });

    test("requires valid page-scoped tokens before serving viewer PDF pages", async () => {
      const db = createMockDb();
      const service = new EBookletService(db);

      await expect(service.getAuthorizedViewerDocument(10, 55, 1, "")).rejects.toThrow(
        "A valid e-booklet page token is required.",
      );
      await expect(service.getAuthorizedViewerDocument(10, 55, 2, createViewerPageToken({ instanceId: 10, pageNumber: 1, userId: 55 }))).rejects.toThrow(
        "A valid e-booklet page token is required.",
      );
      await expect(service.getAuthorizedViewerDocument(10, 55, 1, createViewerPageToken({ instanceId: 10, pageNumber: 1, userId: 55, expiresAt: new Date(Date.now() - 1_000) }))).rejects.toThrow(
        "A valid e-booklet page token is required.",
      );
      expect(db.e_booklet_access.findFirst).not.toHaveBeenCalled();
    });

    test("does not expose private storage keys from hotspot content", async () => {
      const db = createMockDb();
      db.e_booklet_hotspots.findUnique.mockResolvedValue({
        id: 77,
        template_version_id: 22,
        page_number: 2,
        x_percent: 42.5,
        y_percent: 67.2,
        radius_percent: 1.8,
        type: "audio",
        title: "Listen",
        text_content: null,
        asset_file_id: 123,
        trigger_type: "click",
        display_behavior: "popover",
        asset_file: {
          id: 123,
          file_type: "audio",
          storage_key: "e-booklets/private/audio.mp3",
          original_filename: "audio.mp3",
          mime_type: "audio/mpeg",
          size_bytes: 1024,
          visibility: "private",
        },
        template_version: {
          instances: [{ id: 10 }],
        },
      });
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 1,
        booklet_instance: { id: 10, status: "active", template_version_id: 22 },
      });

      const service = new EBookletService(db);

      const result = await service.getHotspotContent(10, 77, 55);
      const serialized = JSON.stringify(result);

      expect(serialized).not.toContain("storage_key");
      expect(serialized).not.toContain("e-booklets/private/audio.mp3");
      expect(serialized).not.toContain("instances");
      expect(result).toEqual(
        expect.objectContaining({
          id: 77,
          asset_file_id: 123,
          asset_file: {
            id: 123,
            file_type: "audio",
            original_filename: "audio.mp3",
            mime_type: "audio/mpeg",
            size_bytes: 1024,
            visibility: "private",
          },
          content_json: {
            version: 2,
            blocks: [{ type: "audio", asset_file_id: 123 }],
          },
        }),
      );
    });

    test("checks active viewer access including expiry before returning hotspot content", async () => {
      const db = createMockDb();
      db.e_booklet_hotspots.findUnique.mockResolvedValue({
        id: 77,
        template_version: { instances: [{ id: 10 }] },
      });
      db.e_booklet_access.findFirst.mockResolvedValue({
        booklet_instance: { id: 10, status: "active", template_version_id: 22, access_expires_at: new Date("2026-01-01T00:00:00.000Z") },
      });

      const service = new EBookletService(db);
      await expect(service.getHotspotContent(10, 77, 55)).rejects.toThrow("This e-booklet has expired.");
      expect(db.e_booklet_instances.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: expect.objectContaining({ status: "archived", archive_reason: "expired" }),
      });
    });

    test("denies inactive hotspot content even when the viewer can access the instance", async () => {
      const db = createMockDb();
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 1,
        booklet_instance: { id: 10, status: "active", template_version_id: 22, access_expires_at: null },
      });
      db.e_booklet_hotspots.findUnique.mockResolvedValue({
        id: 77,
        template_version_id: 22,
        is_active: false,
      });

      const service = new EBookletService(db);

      await expect(service.getHotspotContent(10, 77, 55)).rejects.toThrow("You do not have access to this hotspot.");
    });

    test("authorizes hotspot asset access by active instance access and audits the download", async () => {
      const db = createMockDb();
      db.e_booklet_hotspots.findUnique.mockResolvedValue({
        id: 77,
        template_version_id: 22,
        asset_file_id: null,
        content_json: { blocks: [{ type: "audio", asset_file_id: 123 }] },
        template_version: { instances: [{ id: 10 }] },
      });
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 1,
        booklet_instance: { id: 10, status: "active", template_version_id: 22, access_expires_at: null },
      });
      db.e_booklet_file_assets.findUnique.mockResolvedValue({
        id: 123,
        file_type: "audio",
        storage_key: "e-booklets/private/audio.mp3",
        original_filename: "audio.mp3",
        mime_type: "audio/mpeg",
        size_bytes: 1024,
        visibility: "private",
      });

      const service = new EBookletService(db);
      const result: any = await service.getAuthorizedHotspotAsset(10, 77, 123, 55);

      expect(result.asset).toEqual(expect.objectContaining({ id: 123, original_filename: "audio.mp3" }));
      expect(result.absolutePath).toContain("audio.mp3");
      expect(result.cacheControl).toBe("private, no-store");
      expect(db.e_booklet_audit_logs.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actor_user_id: 55,
          action: "hotspot_file_downloaded",
          entity_type: "e_booklet_hotspot",
          entity_id: 77,
          metadata_json: { asset_id: 123, booklet_instance_id: 10 },
        }),
      });
    });

    test("denies hotspot asset access without active access or when asset is not referenced by hotspot", async () => {
      const db = createMockDb();
      db.e_booklet_hotspots.findUnique.mockResolvedValue({
        id: 77,
        asset_file_id: 999,
        content_json: { blocks: [] },
        template_version: { instances: [] },
      });
      const service = new EBookletService(db);

      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 1,
        booklet_instance: { id: 10, status: "active", template_version_id: 22, access_expires_at: null },
      });

      await expect(service.getAuthorizedHotspotAsset(10, 77, 123, 55)).rejects.toThrow("You do not have access to this hotspot asset.");
    });

    test("denies inactive hotspot assets even when the asset is referenced", async () => {
      const db = createMockDb();
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 1,
        booklet_instance: { id: 10, status: "active", template_version_id: 22, access_expires_at: null },
      });
      db.e_booklet_hotspots.findUnique.mockResolvedValue({
        id: 77,
        template_version_id: 22,
        is_active: false,
        asset_file_id: 123,
        content_json: { blocks: [] },
      });

      const service = new EBookletService(db);

      await expect(service.getAuthorizedHotspotAsset(10, 77, 123, 55)).rejects.toThrow("You do not have access to this hotspot asset.");
      expect(db.e_booklet_file_assets.findUnique).not.toHaveBeenCalled();
    });

    test("denies inactive admin hotspot content and assets", async () => {
      const db = createMockDb();
      db.e_booklet_hotspots.findUnique.mockResolvedValueOnce({
        id: 77,
        is_active: false,
        template_version: { instances: [{ id: 10 }] },
      });
      db.e_booklet_hotspots.findUnique.mockResolvedValueOnce({
        id: 77,
        is_active: false,
        asset_file_id: 123,
        content_json: { blocks: [] },
        template_version: { instances: [{ id: 10 }] },
      });

      const service = new EBookletService(db);

      await expect(service.getAdminHotspotContent(10, 77)).rejects.toThrow("E-booklet hotspot not found for this instance.");
      await expect(service.getAdminAuthorizedHotspotAsset(10, 77, 123)).rejects.toThrow("You do not have access to this hotspot asset.");
      expect(db.e_booklet_file_assets.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("revokeStudentAccess", () => {
    test("requires the acting teacher to own the e-booklet instance", async () => {
      const db = createMockDb();
      db.e_booklet_instances.findFirst.mockResolvedValue(null);
      const service = new EBookletService(db);

      await expect(service.revokeStudentAccess(10, 55, 9)).rejects.toThrow("Teacher e-booklet not found");

      expect(db.e_booklet_instances.findFirst).toHaveBeenCalledWith({
        where: { id: 10, teacher_id: 9 },
        select: { id: true },
      });
      expect(db.e_booklet_audit_logs.create).not.toHaveBeenCalled();
      expect(db.e_booklet_access.updateMany).not.toHaveBeenCalled();
    });

    test("revokes active student access after teacher ownership is verified", async () => {
      const db = createMockDb();
      db.e_booklet_instances.findFirst.mockResolvedValue({ id: 10 });
      db.e_booklet_access.updateMany.mockResolvedValue({ count: 1 });
      const service = new EBookletService(db);

      await expect(service.revokeStudentAccess(10, 55, 9)).resolves.toEqual({ count: 1 });

      expect(db.e_booklet_instances.findFirst).toHaveBeenCalledWith({
        where: { id: 10, teacher_id: 9 },
        select: { id: true },
      });
      expect(db.e_booklet_audit_logs.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actor_user_id: 9,
          action: "student_access_revoked",
          entity_type: "e_booklet_instance",
          entity_id: 10,
          metadata_json: { student_id: 55 },
        }),
      });
      expect(db.e_booklet_access.updateMany).toHaveBeenCalledWith({
        where: {
          booklet_instance_id: 10,
          user_id: 55,
          role: "student",
          status: "active",
        },
        data: {
          status: "revoked",
          revoked_at: expect.any(Date),
        },
      });
    });
  });

  describe("revokeTeacherAccess", () => {
    test("revoking teacher access also revokes active student access for the instance", async () => {
      const db = createMockDb();
      const revokedAt = new Date("2026-05-06T10:00:00.000Z");
      const service = new EBookletService(db);

      await service.revokeTeacherAccess(10, 1, revokedAt);

      expect(db.e_booklet_instances.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: {
          status: "suspended",
          updated_at: revokedAt,
        },
      });
      expect(db.e_booklet_access.updateMany).toHaveBeenCalledWith({
        where: {
          booklet_instance_id: 10,
          status: "active",
        },
        data: {
          status: "revoked",
          revoked_at: revokedAt,
        },
      });
      expect(db.e_booklet_audit_logs.create).toHaveBeenCalledWith({
        data: {
          actor_user_id: 1,
          action: "teacher_access_revoked",
          entity_type: "e_booklet_instance",
          entity_id: 10,
          metadata_json: {
            cascaded_student_access: true,
          },
        },
      });
    });
  });
});
