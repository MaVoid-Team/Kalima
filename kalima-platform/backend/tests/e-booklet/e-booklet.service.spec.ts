import crypto from "crypto";
import { EBookletService } from "../../src/apps/store-api/services/e-booklet.service";
import { hashInviteToken } from "../../src/apps/store-api/utils/e-booklet-token";

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
    e_booklet_file_assets: {
      create: jest.fn(),
      findUnique: jest.fn(),
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
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    purchases: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    e_booklet_purchases: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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
          template: { id: 3, title: "Grade 5 Arabic", category_id: 4 },
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
      expect(result.data[0].internal_price).toBeUndefined();
      expect(JSON.stringify(result.data[0])).not.toContain("70");
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
    test("public checkout creates purchase, one-use invite, and student purchase link for the selected instance", async () => {
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
      });
      db.e_booklet_access.count.mockResolvedValue(2);
      db.purchases.create.mockResolvedValue({ id: 91, status: "pending" });
      db.e_booklet_invites.create.mockResolvedValue({ id: 92 });
      db.e_booklet_student_purchase_links.create.mockResolvedValue({ id: 93 });

      const service = new EBookletService(db);
      const result: any = await service.createPublicCheckoutRequest(55, {
        instance_id: 10,
        template_id: 3,
        template_version_id: 8,
        terms_version: "v1",
      });

      expect(db.e_booklet_instances.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ id: 10, status: "active", access_expires_at: { gt: expect.any(Date) } }),
      }));
      expect(db.purchases.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ user_id: 55, subtotal: 150, total: 150, status: "pending" }),
      }));
      expect(db.e_booklet_invites.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          booklet_instance_id: 10,
          teacher_id: 7,
          share_token_ciphertext: expect.any(String),
          max_uses: 1,
          expires_at: expiry,
        }),
      }));
      expect(db.e_booklet_student_purchase_links.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          purchase_id: 91,
          invite_id: 92,
          booklet_instance_id: 10,
          student_id: 55,
          marketing_price_snapshot: 150,
        }),
      }));
      expect(result).toEqual(expect.objectContaining({ purchase_id: 91, student_purchase_link_id: 93, booklet_instance_id: 10 }));
    });

    test("public checkout creates zero-total confirmed purchases only when store price is zero", async () => {
      const db = createMockDb();
      db.e_booklet_instances.findFirst.mockResolvedValue({
        id: 10,
        teacher_id: 7,
        template_id: 3,
        template_version_id: 8,
        invite_quota: 5,
        access_expires_at: new Date("2027-01-15T10:30:00.000Z"),
        status: "active",
        student_marketing_price: 0,
        internal_price: 70,
      });
      db.e_booklet_access.count.mockResolvedValue(0);
      db.purchases.create.mockResolvedValue({ id: 91, status: "confirmed" });
      db.e_booklet_invites.create.mockResolvedValue({ id: 92 });
      db.e_booklet_student_purchase_links.create.mockResolvedValue({ id: 93 });

      const service = new EBookletService(db);
      await service.createPublicCheckoutRequest(55, { instance_id: 10, template_id: 3, template_version_id: 8 });

      expect(db.purchases.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ subtotal: 0, total: 0, status: "confirmed" }),
      }));
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
    test("allows the same active device again and can list active viewer devices", async () => {
      const db = createMockDb();
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 9,
        status: "active",
        booklet_instance: { id: 10, status: "active", access_expires_at: new Date("2026-12-31T00:00:00.000Z") },
      });
      db.e_booklet_devices.findFirst.mockResolvedValue({ id: 1, device_fingerprint: "dev-1" });
      db.e_booklet_devices.update.mockResolvedValue({ id: 1, device_fingerprint: "dev-1" });
      db.e_booklet_devices.findMany = jest.fn().mockResolvedValue([{ id: 1, device_fingerprint: "dev-1", status: "active" }]);
      const service = new EBookletService(db);

      await expect(service.bindViewerDevice(10, 55, { deviceFingerprint: "dev-1", userAgent: "ua" })).resolves.toEqual({ id: 1, device_fingerprint: "dev-1" });
      await expect(service.listViewerDevices(10, 55)).resolves.toEqual([{ id: 1, device_fingerprint: "dev-1", status: "active" }]);
      expect(db.e_booklet_devices.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 }, data: expect.objectContaining({ user_agent: "ua" }) }));
      expect(db.e_booklet_devices.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { booklet_instance_id: 10, user_id: 55, status: "active" } }));
    });

    test("first-binds a viewer device and blocks a second device by default", async () => {
      const db = createMockDb();
      db.e_booklet_access.findFirst.mockResolvedValue({
        id: 9,
        status: "active",
        booklet_instance: { id: 10, status: "active", access_expires_at: new Date("2026-12-31T00:00:00.000Z") },
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
      const service = new EBookletService(db);

      await expect(service.acceptInvitePasscode("token", 55, { termsAccepted: true, passcode: "000000" })).rejects.toThrow("Invalid e-booklet invite passcode.");
      expect(JSON.stringify(db.e_booklet_analytics_events.create.mock.calls)).not.toContain("000000");
      await service.acceptInvitePasscode("token", 55, { termsAccepted: true, passcode: "123456", termsVersion: "v1" });
      expect(db.e_booklet_analytics_events.create).toHaveBeenCalledWith({ data: expect.objectContaining({ event_type: "access_created", source: "offline_passcode", marketing_price_snapshot: 150 }) });
      await expect(service.getTeacherAnalytics(9, { instanceId: 10 })).resolves.toEqual(expect.objectContaining({ revenue: expect.objectContaining({ offlineEstimated: 150 }) }));
      expect(db.e_booklet_analytics_events.groupBy).toHaveBeenLastCalledWith(expect.objectContaining({ where: expect.objectContaining({ teacher_id: 9, booklet_instance_id: 10 }) }));
      expect(JSON.stringify(await service.getTeacherAnalytics(9, {}))).not.toContain("internal_price");
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
      db.purchases.findFirst.mockResolvedValue({ id: 500, user_id: 55, payment_screenshot_id: 700 });
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
        booklet_instance: { id: 10, status: "active", access_expires_at: new Date("2026-01-01T00:00:00.000Z") },
      });

      const service = new EBookletService(db);
      await expect(service.getHotspotContent(77, 55)).rejects.toThrow("This e-booklet has expired.");
      expect(db.e_booklet_instances.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: expect.objectContaining({ status: "archived", archive_reason: "expired" }),
      });
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
        booklet_instance: { id: 10, status: "active", access_expires_at: null },
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
      const result: any = await service.getAuthorizedHotspotAsset(77, 123, 55);

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

      await expect(service.getAuthorizedHotspotAsset(77, 123, 55)).rejects.toThrow("You do not have access to this hotspot asset.");
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
