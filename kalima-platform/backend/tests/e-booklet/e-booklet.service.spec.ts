import crypto from "crypto";
import { EBookletService } from "../../src/apps/store-api/services/e-booklet.service";
import { hashInviteToken } from "../../src/apps/store-api/utils/e-booklet-token";

function createMockDb(overrides: Record<string, unknown> = {}) {
  const db: any = {
    e_booklet_templates: {
      findUnique: jest.fn(),
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
    },
    e_booklet_file_assets: {
      create: jest.fn(),
    },
    e_booklet_devices: {
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    e_booklet_device_allowances: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    e_booklet_student_purchase_links: {
      create: jest.fn(),
    },
    purchases: {
      findFirst: jest.fn(),
    },
    e_booklet_purchases: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    e_booklet_invites: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    e_booklet_instances: {
      create: jest.fn(),
      update: jest.fn(),
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
    },
    e_booklet_audit_logs: {
      create: jest.fn(),
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
          passcode_hint: "last 6",
        }),
      }));
      expect(db.e_booklet_invites.create.mock.calls[0][0].data.passcode_hash).not.toBe("123456");
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
      expect(result).toBe(hotspots);
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
  });

  describe("V2 device binding", () => {
    test("first-binds a viewer device and blocks a second device by default", async () => {
      const db = createMockDb();
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
    });

    test("admin can reset devices and grant an additional-device allowance", async () => {
      const db = createMockDb();
      db.e_booklet_device_allowances.upsert.mockResolvedValue({ allowed_devices: 2 });
      const service = new EBookletService(db);
      await service.resetViewerDevices(10, 55, 1, "replacement phone");
      await service.addDeviceAllowance(10, 55, 1, 2, "second tablet");
      expect(db.e_booklet_devices.updateMany).toHaveBeenCalledWith({
        where: { booklet_instance_id: 10, user_id: 55, status: "active" },
        data: expect.objectContaining({ status: "reset", reset_by_admin_id: 1 }),
      });
      expect(db.e_booklet_device_allowances.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { booklet_instance_id_user_id: { booklet_instance_id: 10, user_id: 55 } },
        create: expect.objectContaining({ allowed_devices: 2 }),
        update: expect.objectContaining({ allowed_devices: 2 }),
      }));
    });
  });

  describe("V2 access paths, terms, pricing, and expiry", () => {
    test("requires student terms before online, passcode-direct, or free access", async () => {
      const service = new EBookletService(createMockDb());
      await expect(service.createStudentPurchaseLink("token", 55, { termsAccepted: false })).rejects.toThrow("Student terms acceptance is required.");
      await expect(service.acceptInvitePasscode("token", 55, { passcode: "123456", termsAccepted: false })).rejects.toThrow("Student terms acceptance is required.");
      await expect(service.acceptFreeInvite("token", 55, { termsAccepted: false })).rejects.toThrow("Student terms acceptance is required.");
    });

    test("uses online purchase link for priced instances and passcode/free access without generic purchase", async () => {
      const db = createMockDb();
      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 2,
        booklet_instance_id: 10,
        passcode_hash: hmacPasscode("123456"),
        max_uses: null,
        used_count: 0,
        booklet_instance: { id: 10, invite_quota: 10, status: "active", student_marketing_price: 150, internal_price: 60 },
      });
      db.purchases.findFirst.mockResolvedValue({ id: 500, user_id: 55 });
      db.e_booklet_student_purchase_links.create.mockResolvedValue({ id: 20, purchase_id: 500 });
      db.e_booklet_access.findFirst.mockResolvedValue(null);
      db.e_booklet_access.count.mockResolvedValue(0);
      db.e_booklet_access.create.mockResolvedValue({ id: 30 });
      const service = new EBookletService(db);
      await service.createStudentPurchaseLink("token", 55, { termsAccepted: true, termsVersion: "v1", purchaseId: 500 });
      await service.acceptInvitePasscode("token", 55, { termsAccepted: true, passcode: "123456" });
      expect(db.e_booklet_student_purchase_links.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ purchase_id: 500, marketing_price_snapshot: 150, terms_version: "v1" }),
      });
      expect(db.e_booklet_access.create).toHaveBeenCalledWith({ data: expect.objectContaining({ access_source: "offline_passcode" }) });
    });

    test("creates zero-price free invite access without a purchase link", async () => {
      const db = createMockDb();
      db.e_booklet_invites.findFirst.mockResolvedValue({
        id: 2,
        booklet_instance_id: 10,
        max_uses: null,
        used_count: 0,
        booklet_instance: { id: 10, invite_quota: 10, status: "active", student_marketing_price: 0, internal_price: 0 },
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

      await expect(service.createStudentPurchaseLink("token", 55, { termsAccepted: true, purchaseId: 999 })).rejects.toThrow("Purchase does not belong to this student.");
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
      await expect(service.acceptFreeInvite("token", 55, { termsAccepted: true })).rejects.toThrow("This e-booklet invite has reached its access limit.");
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
        "This e-booklet invite has reached its access limit.",
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
        booklet_instance: {
          id: 10,
          status: "active",
          template_version_id: 22,
          teacher: { id: 99, name: "Ms. Sara" },
          template: { id: 7, title: "Grade 5 Arabic" },
          template_version: {
            id: 22,
            page_count: 3,
          },
        },
      });

      const service = new EBookletService(db);

      const result = await service.getViewerPage(10, 2, 55);

      expect(result).toEqual(
        expect.objectContaining({
          pageNumber: 2,
          renderMode: "server-page",
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

      await expect(service.getViewerPage(10, 4, 55)).rejects.toThrow(
        "Invalid e-booklet page number.",
      );
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
        booklet_instance: { id: 10, status: "active" },
      });

      const service = new EBookletService(db);

      const result = await service.getHotspotContent(77, 55);
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
        booklet_instance: { id: 10, status: "active", access_expires_at: new Date("2026-01-01T00:00:00.000Z") },
      });

      const service = new EBookletService(db);
      await expect(service.getHotspotContent(77, 55)).rejects.toThrow("This e-booklet has expired.");
      expect(db.e_booklet_instances.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: expect.objectContaining({ status: "archived", archive_reason: "expired" }),
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
