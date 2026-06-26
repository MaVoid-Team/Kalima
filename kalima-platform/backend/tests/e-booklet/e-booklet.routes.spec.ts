import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import path from "path";
import os from "os";
import { promises as fs } from "fs";
import { isRefreshSessionActive } from "../../src/libs/auth/jwt";

process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres?schema=test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

jest.mock("../../src/libs/auth/jwt", () => ({
  verifyAccessToken: (token: string) =>
    jwt.verify(token, process.env.JWT_SECRET as string),
  isRefreshSessionActive: jest.fn().mockResolvedValue(true),
}));

const mockDomainServices = {
  terms: {
    getLatestActiveTerms: jest.fn(),
    acceptLatestTerms: jest.fn(),
    createTerms: jest.fn(),
    listTerms: jest.fn(),
    updateTerms: jest.fn(),
    activateTerms: jest.fn(),
  },
  accessCodes: {
    generateCode: jest.fn(),
    generateCodes: jest.fn(),
    listCodes: jest.fn(),
  },
  redemptions: {
    redeemCode: jest.fn(),
  },
  milestones: {
    listMilestones: jest.fn(),
    createMilestone: jest.fn(),
    updateMilestone: jest.fn(),
    deleteMilestone: jest.fn(),
    reorderMilestones: jest.fn(),
    listProgress: jest.fn(),
    claimReward: jest.fn(),
    evaluateTeacherMilestones: jest.fn(),
  },
  wallet: {
    getWallet: jest.fn(),
    listLedger: jest.fn(),
    listRewardLots: jest.fn(),
    previewPurchase: jest.fn(),
    applyToPurchase: jest.fn(),
  },
};

jest.mock("../../src/apps/store-api/services/e-booklet-domain.service", () => ({
  getEBookletDomainServices: () => mockDomainServices,
}), { virtual: true });

const mockService = {
  listPublicInstances: jest.fn(),
  getPublicInstance: jest.fn(),
  listPublishedTemplates: jest.fn(),
  getPublishedTemplateById: jest.fn(),
  getPublicPreviewMetadata: jest.fn(),
  getPublicPreviewPage: jest.fn(),
  getPublicPreviewPageHotspots: jest.fn(),
  getPublicPreviewHotspotContent: jest.fn(),
  getPublicPreviewHotspotAsset: jest.fn(),
  getPublicPreviewDocumentPagePreview: jest.fn(),
  getPublicCoverFileAsset: jest.fn(),
  createPublicCheckoutRequest: jest.fn(),
  createTemplate: jest.fn(),
  createPurchaseRequest: jest.fn(),
  listTemplateVersions: jest.fn(),
  listVersionHotspots: jest.fn(),
  listUserEBooklets: jest.fn(),
  createInvite: jest.fn(),
  acceptInvite: jest.fn(),
  acceptFreeInvite: jest.fn(),
  acceptInvitePasscode: jest.fn(),
  createStudentPurchaseLink: jest.fn(),
  getPublicViewerMetadata: jest.fn(),
  getPublicViewerPage: jest.fn(),
  getPublicViewerPageHotspots: jest.fn(),
  getPublicHotspotContent: jest.fn(),
  getPublicHotspotAsset: jest.fn(),
  getPublicAuthorizedViewerDocument: jest.fn(),
  getPublicAuthorizedViewerDocumentPagePreview: jest.fn(),
  getAdminViewerMetadata: jest.fn(),
  getAdminViewerPage: jest.fn(),
  getAdminViewerPageHotspots: jest.fn(),
  getAdminHotspotContent: jest.fn(),
  getAdminAuthorizedHotspotAsset: jest.fn(),
  getAdminAuthorizedViewerDocument: jest.fn(),
  bindViewerDevice: jest.fn(),
  listViewerDevices: jest.fn(),
  resetViewerDevices: jest.fn(),
  addDeviceAllowance: jest.fn(),
  approveStudentPurchaseLink: jest.fn(),
  createFileAsset: jest.fn(),
  restoreHotspotPreset: jest.fn(),
  recordInviteOpen: jest.fn(),
  getTeacherAnalytics: jest.fn(),
  getAdminAnalytics: jest.fn(),
  exportTeacherAnalyticsCsv: jest.fn(),
  exportAdminAnalyticsCsv: jest.fn(),
};

jest.mock("../../src/apps/store-api/services/e-booklet.service", () => ({
  getEBookletService: () => mockService,
}));

function createApp() {
  const eBookletRoutes =
    require("../../src/apps/store-api/routes/v2/e-booklet.routes").default;
  const app = express();
  app.use(express.json());
  app.use("/api/v2", eBookletRoutes);
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  });
  return app;
}

function tokenFor(
  role: "Admin" | "SubAdmin" | "Moderator" | "Teacher" | "Student",
  userId = 1,
  portal = "store",
) {
  return jwt.sign(
    {
      userId,
      sessionId: userId + 1000,
      roles: [{ role, portal }],
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  );
}

describe("e-booklet routes", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
    (isRefreshSessionActive as jest.Mock).mockResolvedValue(true);
    for (const serviceGroup of Object.values(mockDomainServices)) {
      for (const fn of Object.values(serviceGroup)) {
        (fn as jest.Mock).mockReset();
      }
    }
  });

  test("serves e-booklet store as published reusable teacher templates, not teacher instances", async () => {
    mockService.listPublishedTemplates.mockResolvedValue({
      data: [{ id: 10, title: "Grade 5 Arabic", slug: "grade-5-arabic", category: { id: 2, title: "Arabic" } }],
      total: 1,
      page: 1,
      limit: 20,
    });

    await request(app)
      .get("/api/v2/e-booklet-store")
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([
          { id: 10, title: "Grade 5 Arabic", slug: "grade-5-arabic", category: { id: 2, title: "Arabic" } },
        ]);
      });

    expect(mockService.listPublishedTemplates).toHaveBeenCalledWith({
      categoryId: undefined,
      limit: 20,
      page: 1,
      search: undefined,
    });
    expect(mockService.listPublicInstances).not.toHaveBeenCalled();
  });

  test("serves public e-booklet store detail by canonical template id", async () => {
    mockService.getPublishedTemplateById.mockResolvedValue({ id: 10, title: "Grade 5 Arabic" });

    await request(app)
      .get("/api/v2/e-booklet-store/10")
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual({ id: 10, title: "Grade 5 Arabic" });
      });

    expect(mockService.getPublishedTemplateById).toHaveBeenCalledWith(10);
    expect(mockService.getPublicInstance).not.toHaveBeenCalled();
  });

  test("serves public e-booklet preview metadata, pages, hotspots, and hotspot content without auth", async () => {
    mockService.getPublicPreviewMetadata.mockResolvedValue({
      preview_mode: true,
      preview_page_limit: 10,
      preview_page_count: 10,
      total_page_count: 42,
    });
    mockService.getPublicPreviewPage.mockResolvedValue({
      pageNumber: 2,
      renderMode: "pdf-document",
      previewMode: true,
      previewPageLimit: 10,
    });
    mockService.getPublicPreviewPageHotspots.mockResolvedValue([
      {
        id: 77,
        page_number: 2,
        x_percent: 25,
        y_percent: 35,
        type: "text",
        is_locked: true,
      },
    ]);
    mockService.getPublicPreviewHotspotContent.mockResolvedValue({
      id: 77,
      type: "text",
      title: "Sample note",
      content_json: { version: 2, blocks: [{ type: "text", text_content: "Preview answer" }] },
      is_locked: false,
    });

    await request(app)
      .get("/api/v2/e-booklet-store/10/preview/metadata")
      .expect(200)
      .expect((res) => {
        expect(res.body.data.preview_page_limit).toBe(10);
        expect(res.body.data.total_page_count).toBe(42);
      });

    await request(app)
      .get("/api/v2/e-booklet-store/10/preview/pages/2")
      .expect(200)
      .expect((res) => {
        expect(res.body.data.previewMode).toBe(true);
      });

    await request(app)
      .get("/api/v2/e-booklet-store/10/preview/pages/2/hotspots")
      .expect(200)
      .expect((res) => {
        expect(res.body.data[0]).toEqual(expect.objectContaining({ id: 77, is_locked: true }));
        expect(res.body.data[0]).not.toHaveProperty("asset_file_id");
      });

    await request(app)
      .get("/api/v2/e-booklet-store/10/preview/hotspots/77/content")
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual(expect.objectContaining({
          id: 77,
          is_locked: false,
          content_json: { version: 2, blocks: [{ type: "text", text_content: "Preview answer" }] },
        }));
      });

    expect(mockService.getPublicPreviewMetadata).toHaveBeenCalledWith(10);
    expect(mockService.getPublicPreviewPage).toHaveBeenCalledWith(10, 2);
    expect(mockService.getPublicPreviewPageHotspots).toHaveBeenCalledWith(10, 2);
    expect(mockService.getPublicPreviewHotspotContent).toHaveBeenCalledWith(10, 77);
  });

  test("returns configured preview page-limit errors from public preview pages", async () => {
    mockService.getPublicPreviewPage.mockRejectedValue(
      Object.assign(new Error("Preview is limited to the first 10 e-booklet pages."), { statusCode: 400 }),
    );

    await request(app)
      .get("/api/v2/e-booklet-store/10/preview/pages/11")
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain("first 10");
      });

    expect(mockService.getPublicPreviewPage).toHaveBeenCalledWith(10, 11);
  });

  test("keeps legacy public e-booklet detail route by teacher instance id", async () => {
    mockService.getPublicInstance.mockResolvedValue({ id: 10, display_title: "Grade 5 Arabic with Ms Sara" });

    await request(app)
      .get("/api/v2/e-booklet-store/instances/10")
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual({ id: 10, display_title: "Grade 5 Arabic with Ms Sara" });
      });

    expect(mockService.getPublicInstance).toHaveBeenCalledWith(10);
  });

  test("serves public store cover images without admin auth", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ebooklet-cover-"));
    const coverPath = path.join(tempDir, "cover.png");
    await fs.writeFile(coverPath, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    mockService.getPublicCoverFileAsset.mockResolvedValue({
      asset: { id: 44, mime_type: "image/png", original_filename: "cover.png" },
      absolutePath: coverPath,
    });

    await request(app)
      .get("/api/v2/e-booklet-store/covers/44")
      .expect(200)
      .expect("Content-Type", /image\/png/);

    expect(mockService.getPublicCoverFileAsset).toHaveBeenCalledWith(44);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test("blocks non-admin users from admin e-booklet template creation", async () => {
    await request(app)
      .post("/api/v2/admin/e-booklet-templates")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 2)}`)
      .send({ title: "Teacher should not create", price: 100 })
      .expect(403);

    expect(mockService.createTemplate).not.toHaveBeenCalled();
  });

  test("rejects protected e-booklet routes when the backing auth session is inactive", async () => {
    (isRefreshSessionActive as jest.Mock).mockResolvedValueOnce(false);

    await request(app)
      .post("/api/v2/admin/e-booklet-templates")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ title: "Inactive session", price: 100 })
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toBe("Session expired");
      });

    expect(mockService.createTemplate).not.toHaveBeenCalled();
  });

  test("allows admin users to create e-booklet templates", async () => {
    mockService.createTemplate.mockResolvedValue({ id: 44, title: "Template" });

    await request(app)
      .post("/api/v2/admin/e-booklet-templates")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ title: "Template", description: "Reusable", price: 150 })
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toEqual({ id: 44, title: "Template" });
      });

    expect(mockService.createTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Template", price: 150 }),
      1,
    );
  });

  test("teacher checkout requires store teacher auth and creates a purchase request", async () => {
    mockService.createPublicCheckoutRequest.mockResolvedValue({ purchase_id: 91 });

    await request(app)
      .post("/api/v2/e-booklet-checkout")
      .send({ template_id: 3, template_version_id: 4, branding_json: {} })
      .expect(401);

    await request(app)
      .post("/api/v2/e-booklet-checkout")
      .set("Authorization", `Bearer ${tokenFor("Student", 55, "academy")}`)
      .send({ instance_id: 7, template_id: 3, template_version_id: 4, branding_json: {}, price: 0, terms_accepted: true })
      .expect(403);

    await request(app)
      .post("/api/v2/e-booklet-checkout")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 77, "store")}`)
      .send({ instance_id: 7, template_id: 3, template_version_id: 4, branding_json: {}, price: 0, terms_accepted: true })
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toEqual({ purchase_id: 91 });
      });

    expect(mockService.createPurchaseRequest).not.toHaveBeenCalled();
    expect(mockService.createPublicCheckoutRequest).toHaveBeenCalledWith(
      77,
      expect.objectContaining({ instance_id: 7, template_id: 3, template_version_id: 4, terms_accepted: true }),
      undefined,
      undefined,
    );
  });

  test("rejects non-PDF main e-booklet document uploads while hotspot media still accepts safe attachments", async () => {
    mockService.createFileAsset.mockResolvedValue({ id: 77 });

    await request(app)
      .post("/api/v2/admin/e-booklet-files/document")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .attach("document", Buffer.from("docx"), {
        filename: "main.docx",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain("Allowed: PDF only");
      });

    await request(app)
      .post("/api/v2/admin/e-booklet-files/hotspot-media")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .field("file_type", "image")
      .attach("media", Buffer.from("png"), {
        filename: "worksheet.png",
        contentType: "image/png",
      })
      .expect(201);

    await request(app)
      .post("/api/v2/admin/e-booklet-files/hotspot-media")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .field("file_type", "file")
      .attach("media", Buffer.from("docx"), {
        filename: "worksheet.docx",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      .expect(201);

    expect(mockService.createFileAsset).toHaveBeenCalledTimes(2);
    expect(mockService.createFileAsset).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.objectContaining({ fileType: "file" }),
    );
  });

  test("accepts supported hotspot video uploads and passes file_type=video", async () => {
    mockService.createFileAsset.mockResolvedValue({ id: 88, file_type: "video" });

    await request(app)
      .post("/api/v2/admin/e-booklet-files/hotspot-media")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .field("file_type", "video")
      .attach("media", Buffer.from("video"), {
        filename: "clip.m4v",
        contentType: "video/x-m4v",
      })
      .expect(201);

    expect(mockService.createFileAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        fieldname: "media",
        originalname: "clip.m4v",
        mimetype: "video/x-m4v",
      }),
      expect.objectContaining({ fileType: "video" }),
    );
  });

  test("accepts safe hotspot uploads with browser fallback MIME values", async () => {
    mockService.createFileAsset.mockResolvedValue({ id: 89, file_type: "file" });

    await request(app)
      .post("/api/v2/admin/e-booklet-files/hotspot-media")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .field("file_type", "file")
      .attach("media", Buffer.from("xlsx"), {
        filename: "worksheet.xlsx",
        contentType: "application/octet-stream",
      })
      .expect(201);

    expect(mockService.createFileAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        fieldname: "media",
        originalname: "worksheet.xlsx",
        mimetype: "application/octet-stream",
      }),
      expect.objectContaining({ fileType: "file" }),
    );
  });

  test("allows admin users to list template versions for the editor", async () => {
    mockService.listTemplateVersions.mockResolvedValue([
      { id: 5, version_number: 2, status: "draft" },
    ]);

    await request(app)
      .get("/api/v2/admin/e-booklet-templates/44/versions")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual([
          { id: 5, version_number: 2, status: "draft" },
        ]);
      });

    expect(mockService.listTemplateVersions).toHaveBeenCalledWith(44);
  });

  test("allows admin users to reload saved hotspots by version and page", async () => {
    mockService.listVersionHotspots.mockResolvedValue([
      { id: 9, page_number: 3, type: "audio" },
    ]);

    await request(app)
      .get("/api/v2/admin/e-booklet-template-versions/5/hotspots?page_number=3")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual([
          { id: 9, page_number: 3, type: "audio" },
        ]);
      });

    expect(mockService.listVersionHotspots).toHaveBeenCalledWith(5, 3);
  });

  test("allows admin users to restore archived hotspot presets", async () => {
    mockService.restoreHotspotPreset.mockResolvedValue({ id: 12, is_active: true });

    await request(app)
      .post("/api/v2/admin/e-booklet-hotspot-presets/12/restore")
      .set("Authorization", `Bearer ${tokenFor("Admin", 9)}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({ success: true, data: { id: 12, is_active: true } });
      });

    expect(mockService.restoreHotspotPreset).toHaveBeenCalledWith(12, 9);
  });

  test("blocks legacy teacher invite links and requires access-code sharing", async () => {
    await request(app)
      .post("/api/v2/teacher/e-booklets/10/invites")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 2)}`)
      .send({ max_uses: 5 })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain("copying the generated redeem code or WhatsApp template message");
      });

    expect(mockService.createInvite).not.toHaveBeenCalled();
  });

  test("rejects empty legacy invite acceptance bodies instead of bypassing access rules", async () => {
    await request(app)
      .post("/api/v2/e-booklet-invites/raw-token/accept")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain("Invite accessPath is required");
      });

    expect(mockService.acceptInvite).not.toHaveBeenCalled();
    expect(mockService.acceptFreeInvite).not.toHaveBeenCalled();
    expect(mockService.acceptInvitePasscode).not.toHaveBeenCalled();
    expect(mockService.createStudentPurchaseLink).not.toHaveBeenCalled();
  });

  test("dispatches student invite acceptance to explicit Phase 1 access paths", async () => {
    mockService.acceptFreeInvite.mockResolvedValue({ id: 12, access_source: "free_invite" });
    mockService.acceptInvitePasscode.mockResolvedValue({ id: 13, access_source: "offline_passcode" });
    mockService.createStudentPurchaseLink.mockRejectedValue(Object.assign(new Error("Direct student e-booklet purchase is disabled."), { statusCode: 403 }));

    await request(app)
      .post("/api/v2/e-booklet-invites/raw-token/accept")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .send({ accessPath: "free", termsAccepted: true, termsVersion: "v1" })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.access_source).toBe("free_invite");
      });

    await request(app)
      .post("/api/v2/e-booklet-invites/raw-token/accept")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .send({ accessPath: "offline_passcode", passcode: "123456", termsAccepted: true })
      .expect(200);

    await request(app)
      .post("/api/v2/e-booklet-invites/raw-token/accept")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .send({ accessPath: "online_purchase", purchaseId: 500, paymentProofFileId: 321, termsAccepted: true })
      .expect(403);

    expect(mockService.acceptInvite).not.toHaveBeenCalled();
    expect(mockService.acceptFreeInvite).toHaveBeenCalledWith("raw-token", 55, expect.objectContaining({ termsAccepted: true, termsVersion: "v1" }));
    expect(mockService.acceptInvitePasscode).toHaveBeenCalledWith("raw-token", 55, expect.objectContaining({ passcode: "123456", termsAccepted: true }), expect.objectContaining({ ipAddress: expect.any(String) }));
    expect(mockService.createStudentPurchaseLink).toHaveBeenCalledWith("raw-token", 55, expect.objectContaining({ purchaseId: 500, termsAccepted: true }), undefined);
  });

  test("allows academy student accounts to accept e-booklet invites and list granted booklets", async () => {
    mockService.acceptInvitePasscode.mockResolvedValue({ id: 13, access_source: "offline_passcode" });
    mockService.listUserEBooklets.mockResolvedValue([{ id: 13 }]);

    await request(app)
      .post("/api/v2/e-booklet-invites/raw-token/accept")
      .set("Authorization", `Bearer ${tokenFor("Student", 55, "academy")}`)
      .send({ accessPath: "offline_passcode", passcode: "123456", termsAccepted: true })
      .expect(200);

    await request(app)
      .get("/api/v2/student/e-booklets")
      .set("Authorization", `Bearer ${tokenFor("Student", 55, "academy")}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual([{ id: 13 }]);
      });

    expect(mockService.acceptInvitePasscode).toHaveBeenCalledWith("raw-token", 55, expect.objectContaining({ passcode: "123456", termsAccepted: true }), expect.objectContaining({ ipAddress: expect.any(String) }));
    expect(mockService.listUserEBooklets).toHaveBeenCalledWith(55, "student");
  });

  test("records anonymous invite opens and exposes scoped analytics APIs", async () => {
    mockService.recordInviteOpen.mockResolvedValue({ invite_id: 2, has_passcode: true });
    mockService.getTeacherAnalytics.mockResolvedValue({ events: { invite_opened: 3 }, revenue: { offlineEstimated: 150 } });
    mockService.getAdminAnalytics.mockResolvedValue({ events: { access_created: 2 }, revenue: { marketing: 300, internal: 120 } });
    mockService.exportTeacherAnalyticsCsv.mockResolvedValue("id,event_type\n1,access_created");
    mockService.exportAdminAnalyticsCsv.mockResolvedValue("id,event_type\n1,access_created");

    await request(app)
      .get("/api/v2/e-booklet-invites/raw-token/open?source=whatsapp")
      .set("x-e-booklet-session", "anon-1")
      .expect(200);
    await request(app)
      .get("/api/v2/teacher/e-booklet-analytics?instance_id=10&source=offline_passcode&teacher_id=999")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .expect(200);
    await request(app)
      .get("/api/v2/teacher/e-booklet-analytics.csv?instance_id=10&source=offline_passcode&teacher_id=999")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .expect(200)
      .expect("Content-Type", /text\/csv/);
    await request(app)
      .get("/api/v2/admin/e-booklet-analytics?teacher_id=9")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200);
    await request(app)
      .get("/api/v2/admin/e-booklet-analytics.csv")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200)
      .expect("Content-Type", /text\/csv/);
    await request(app)
      .get("/api/v2/admin/e-booklet-analytics?teacher_id=9")
      .set("Authorization", `Bearer ${tokenFor("Moderator", 4)}`)
      .expect(403);
    await request(app)
      .get("/api/v2/admin/e-booklet-analytics.csv")
      .set("Authorization", `Bearer ${tokenFor("Moderator", 4)}`)
      .expect(403);
    await request(app)
      .get("/api/v2/teacher/e-booklet-analytics.csv")
      .set("Authorization", `Bearer ${tokenFor("Student", 55, "academy")}`)
      .expect(403);

    expect(mockService.recordInviteOpen).toHaveBeenCalledWith("raw-token", expect.objectContaining({ anonymousSessionId: "anon-1", source: "whatsapp" }));
    expect(mockService.getTeacherAnalytics).toHaveBeenCalledWith(9, expect.objectContaining({ instanceId: 10, source: "offline_passcode" }));
    expect(mockService.getTeacherAnalytics).not.toHaveBeenCalledWith(999, expect.anything());
    expect(mockService.exportTeacherAnalyticsCsv).toHaveBeenCalledWith(9, expect.objectContaining({ instanceId: 10, source: "offline_passcode" }));
    expect(mockService.exportTeacherAnalyticsCsv).not.toHaveBeenCalledWith(999, expect.anything());
    expect(mockService.getAdminAnalytics).toHaveBeenCalledWith(expect.objectContaining({ teacherId: 9 }));
    expect(mockService.exportAdminAnalyticsCsv).toHaveBeenCalled();
  });

  test("marks viewer page responses as private no-store", async () => {
    mockService.getPublicViewerPage.mockResolvedValue({
      pageNumber: 1,
      pageAccessToken: "short-lived-token",
    });

    await request(app)
      .get("/api/v2/e-booklet-viewer/10/pages/1")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .expect(200)
      .expect("Cache-Control", "private, no-store")
      .expect("Pragma", "no-cache")
      .expect("Expires", "0")
      .expect((res) => {
        expect(res.body.data.pageAccessToken).toBe("short-lived-token");
      });

    expect(mockService.getPublicViewerPage).toHaveBeenCalledWith(10, 1);
  });

  test("propagates public viewer metadata availability errors", async () => {
    const error: any = new Error("This e-booklet is not available until payment is confirmed and customization is complete.");
    error.statusCode = 403;
    mockService.getPublicViewerMetadata.mockRejectedValue(error);

    await request(app)
      .get("/api/v2/e-booklet-viewer/10/metadata")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 55)}`)
      .expect(403)
      .expect((res) => {
        expect(res.body.message).toBe("This e-booklet is not available until payment is confirmed and customization is complete.");
      });

    expect(mockService.getPublicViewerMetadata).toHaveBeenCalledWith(10);
  });

  test("rejects authorized viewer PDF document requests without a page", async () => {
    await request(app)
      .get("/api/v2/e-booklet-viewer/10/document")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .expect(400)
      .expect((res) => expect(res.body.message).toContain("document page is required"));

    expect(mockService.getPublicAuthorizedViewerDocument).not.toHaveBeenCalled();
  });

  test("passes requested PDF page number to the authorized viewer document service", async () => {
    mockService.getPublicAuthorizedViewerDocument.mockResolvedValue({
      asset: { original_filename: "lesson-page-2.pdf", mime_type: "application/pdf" },
      absolutePath: "/not-used-for-page-buffer.pdf",
      pageBuffer: Buffer.from("%PDF-1.4\n%page-2\n"),
      cacheControl: "private, no-store",
    });

    await request(app)
      .get("/api/v2/e-booklet-viewer/10/document?page=2")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .set("X-E-Booklet-Page-Token", "page-token")
      .expect(200)
      .expect("Cache-Control", "private, no-store")
      .expect("Content-Type", /application\/pdf/)
      .expect("Content-Disposition", /inline; filename="lesson-page-2.pdf"/);

    expect(mockService.getPublicAuthorizedViewerDocument).toHaveBeenCalledWith(10, 2, "page-token");
  });

  test("does not accept viewer page tokens from query parameters", async () => {
    mockService.getPublicAuthorizedViewerDocument.mockResolvedValue({
      asset: { original_filename: "lesson-page-2.pdf", mime_type: "application/pdf" },
      absolutePath: "/not-used-for-page-buffer.pdf",
      pageBuffer: Buffer.from("%PDF-1.4\n%page-2\n"),
      cacheControl: "private, no-store",
    });

    await request(app)
      .get("/api/v2/e-booklet-viewer/10/document?page=2&token=query-token")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .expect(200);

    expect(mockService.getPublicAuthorizedViewerDocument).toHaveBeenCalledWith(10, 2, "");
  });

  test("passes requested admin PDF page token to the authorized viewer document service", async () => {
    mockService.getAdminAuthorizedViewerDocument.mockResolvedValue({
      asset: { original_filename: "lesson-page-1.pdf", mime_type: "application/pdf" },
      absolutePath: "/not-used-for-page-buffer.pdf",
      pageBuffer: Buffer.from("%PDF-1.4\n%page-1\n"),
      cacheControl: "private, no-store",
    });

    await request(app)
      .get("/api/v2/admin/e-booklet-viewer/10/document?page=1")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .set("X-E-Booklet-Page-Token", "admin-page-token")
      .expect(200)
      .expect("Content-Type", /application\/pdf/);

    expect(mockService.getAdminAuthorizedViewerDocument).toHaveBeenCalledWith(10, 1, "admin-page-token", 1);
  });

  test("does not accept admin viewer page tokens from query parameters", async () => {
    mockService.getAdminAuthorizedViewerDocument.mockResolvedValue({
      asset: { original_filename: "lesson-page-1.pdf", mime_type: "application/pdf" },
      absolutePath: "/not-used-for-page-buffer.pdf",
      pageBuffer: Buffer.from("%PDF-1.4\n%page-1\n"),
      cacheControl: "private, no-store",
    });

    await request(app)
      .get("/api/v2/admin/e-booklet-viewer/10/document?page=1&token=query-token")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200);

    expect(mockService.getAdminAuthorizedViewerDocument).toHaveBeenCalledWith(10, 1, "", 1);
  });

  test("serves admin view mode without student access or device binding", async () => {
    mockService.getAdminViewerMetadata.mockResolvedValue({ admin_view_mode: true, booklet_instance_id: 10 });
    mockService.getAdminViewerPage.mockResolvedValue({ pageNumber: 1, adminViewMode: true });
    mockService.getAdminViewerPageHotspots.mockResolvedValue([{ id: 77, title: "Intro" }]);
    mockService.getAdminHotspotContent.mockResolvedValue({ id: 77, title: "Intro" });

    await request(app)
      .get("/api/v2/admin/e-booklet-viewer/10/metadata")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200)
      .expect("Cache-Control", "private, no-store");

    await request(app)
      .get("/api/v2/admin/e-booklet-viewer/10/pages/1")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200)
      .expect("Cache-Control", "private, no-store");

    await request(app)
      .get("/api/v2/admin/e-booklet-viewer/10/pages/1/hotspots")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200);

    await request(app)
      .get("/api/v2/admin/e-booklet-viewer/10/hotspots/77/content")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200);

    await request(app)
      .get("/api/v2/admin/e-booklet-viewer/10/hotspots/77/content")
      .set("Authorization", `Bearer ${tokenFor("Moderator", 4)}`)
      .expect(403);

    expect(mockService.getAdminViewerMetadata).toHaveBeenCalledWith(10, 1);
    expect(mockService.getAdminViewerPage).toHaveBeenCalledWith(10, 1, 1);
    expect(mockService.getAdminViewerPageHotspots).toHaveBeenCalledWith(10, 1);
    expect(mockService.getAdminHotspotContent).toHaveBeenCalledWith(10, 77);
    expect(mockService.bindViewerDevice).not.toHaveBeenCalled();
  });

  test("binds/lists viewer devices, exposes admin device reset/allowance routes, and blocks direct purchase approval", async () => {
    mockService.bindViewerDevice.mockResolvedValue({ id: 1, device_fingerprint: "dev-1" });
    mockService.listViewerDevices.mockResolvedValue([{ id: 1, device_fingerprint: "dev-1" }]);
    mockService.resetViewerDevices.mockResolvedValue({ count: 1 });
    mockService.addDeviceAllowance.mockResolvedValue({ allowed_devices: 2 });

    await request(app)
      .post("/api/v2/e-booklet-viewer/10/devices/bind")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .send({ deviceFingerprint: "dev-1", deviceLabel: "iPad" })
      .expect(200);

    await request(app)
      .get("/api/v2/admin/e-booklet-instances/10/users/55/devices")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200);

    await request(app)
      .post("/api/v2/admin/e-booklet-instances/10/users/55/devices/reset")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ reason: "replacement" })
      .expect(200);

    await request(app)
      .post("/api/v2/admin/e-booklet-instances/10/users/55/device-allowance")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ allowedDevices: 2, reason: "second tablet" })
      .expect(200);

    await request(app)
      .post("/api/v2/admin/e-booklet-student-purchases/500/approve")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(400);

    expect(mockService.bindViewerDevice).toHaveBeenCalledWith(10, 55, expect.objectContaining({ deviceFingerprint: "dev-1", deviceLabel: "iPad" }));
    expect(mockService.listViewerDevices).toHaveBeenCalledWith(10, 55);
    expect(mockService.resetViewerDevices).toHaveBeenCalledWith(10, 55, 1, "replacement");
    expect(mockService.addDeviceAllowance).toHaveBeenCalledWith(10, 55, 1, 2, "second tablet");
    expect(mockService.approveStudentPurchaseLink).not.toHaveBeenCalled();
  });

  test("serves authorized hotspot assets with private no-store headers", async () => {
    mockService.getPublicHotspotAsset.mockResolvedValue({
      asset: {
        id: 123,
        mime_type: "audio/mpeg",
        original_filename: "audio.mp3",
        size_bytes: 1024,
      },
      absolutePath: __filename,
      cacheControl: "private, no-store",
    });

    await request(app)
      .get("/api/v2/e-booklet-viewer/10/hotspots/77/assets/123")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .expect(200)
      .expect("Cache-Control", "private, no-store")
      .expect("Pragma", "no-cache")
      .expect("Expires", "0")
      .expect("Content-Type", /audio\/mpeg/);

    expect(mockService.getPublicHotspotAsset).toHaveBeenCalledWith(10, 77, 123);
  });

  test("returns a deliberate upgrade response for deprecated unscoped viewer hotspot routes", async () => {
    await request(app)
      .get("/api/v2/e-booklet-viewer/hotspots/77/content")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .expect(410)
      .expect((res) => expect(res.body.message).toContain("refresh the viewer"));

    await request(app)
      .get("/api/v2/e-booklet-viewer/hotspots/77/assets/123")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .expect(410)
      .expect((res) => expect(res.body.message).toContain("refresh the viewer"));
  });

  test("teacher reward claim requires explicit reward terms acceptance", async () => {
    await request(app)
      .post("/api/v2/teacher/e-booklet-milestone-achievements/99/claim")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({})
      .expect(400)
      .expect((res) => expect(res.body.message).toContain("Reward claim terms must be accepted"));

    expect(mockDomainServices.milestones.claimReward).not.toHaveBeenCalled();
  });

  test("access-code routes reject invalid generation payloads before services", async () => {
    await request(app)
      .post("/api/v2/admin/e-booklet-access-codes/free")
      .set("Authorization", `Bearer ${tokenFor("Moderator", 4)}`)
      .send({ bookletInstanceId: 10, teacherId: 9, termId: 1 })
      .expect(403);

    await request(app)
      .post("/api/v2/admin/e-booklet-access-codes/free")
      .set("Authorization", `Bearer ${tokenFor("SubAdmin", 5)}`)
      .send({ bookletInstanceId: 10, teacherId: 9, termId: 1 })
      .expect(201);

    expect(mockDomainServices.accessCodes.generateCode).toHaveBeenCalledWith(expect.objectContaining({ teacherId: 9, kind: "free" }));
    mockDomainServices.accessCodes.generateCode.mockClear();

    await request(app)
      .post("/api/v2/teacher/e-booklets/10/access-codes")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ kind: "trial", termId: 1 })
      .expect(400)
      .expect((res) => expect(res.body.message).toContain("Invalid access code kind"));

    await request(app)
      .post("/api/v2/teacher/e-booklets/10/access-codes")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ kind: "free", termId: 1, maxRedemptions: 20 })
      .expect(400)
      .expect((res) => expect(res.body.message).toContain("Teachers cannot generate free e-booklet access codes"));

    expect(mockDomainServices.accessCodes.generateCode).not.toHaveBeenCalled();
    mockDomainServices.accessCodes.generateCode.mockClear();

    await request(app)
      .post("/api/v2/teacher/e-booklets/10/access-codes/bulk")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ kind: "free", termId: 1, quantity: 3 })
      .expect(400)
      .expect((res) => expect(res.body.message).toContain("Teachers cannot generate free e-booklet access codes"));

    expect(mockDomainServices.accessCodes.generateCodes).not.toHaveBeenCalled();
    mockDomainServices.accessCodes.generateCodes.mockClear();

    await request(app)
      .post("/api/v2/teacher/e-booklets/10/access-codes/bulk")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ kind: "paid", termId: 1, quantity: 3 })
      .expect(201);

    expect(mockDomainServices.accessCodes.generateCodes).toHaveBeenCalledWith(expect.objectContaining({ teacherId: 9, kind: "paid", count: 3 }));
    mockDomainServices.accessCodes.generateCodes.mockClear();

    await request(app)
      .post("/api/v2/teacher/e-booklets/10/access-codes/bulk")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ kind: "paid", termId: 1, count: 101 })
      .expect(201);

    expect(mockDomainServices.accessCodes.generateCodes).toHaveBeenCalledWith(expect.objectContaining({ teacherId: 9, kind: "paid", count: 101 }));
    mockDomainServices.accessCodes.generateCodes.mockClear();

    await request(app)
      .get("/api/v2/teacher/e-booklets/10/access-codes?status=active")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .expect(200);

    expect(mockDomainServices.accessCodes.listCodes).toHaveBeenCalledWith(expect.objectContaining({ teacherId: 9, bookletInstanceId: 10, status: "active" }));
    mockDomainServices.accessCodes.listCodes.mockClear();

    await request(app)
      .post("/api/v2/teacher/e-booklets/10/access-codes")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ kind: "paid", termId: "not-a-number" })
      .expect(400)
      .expect((res) => expect(res.body.message).toContain("Invalid term ID"));

    await request(app)
      .post("/api/v2/admin/e-booklet-access-codes/free")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ bookletInstanceId: "x", teacherId: 9, termId: 1, maxRedemptions: 10 })
      .expect(400)
      .expect((res) => expect(res.body.message).toContain("Invalid instance ID"));

    await request(app)
      .post("/api/v2/admin/e-booklet-access-codes/free")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ bookletInstanceId: 10, teacherId: 9, termId: 1, maxRedemptions: 0 })
      .expect(400)
      .expect((res) => expect(res.body.message).toContain("Invalid max redemptions"));

    expect(mockDomainServices.accessCodes.generateCode).not.toHaveBeenCalled();
  });

  test("Phase 3 exposes terms, code, redemption, milestone, and wallet route contracts", async () => {
    mockDomainServices.terms.getLatestActiveTerms.mockResolvedValue({ id: 1, name: "Term", status: "active" });
    mockDomainServices.terms.acceptLatestTerms.mockResolvedValue({ id: 11, acceptance_type: "code_generation" });
    mockDomainServices.terms.createTerms.mockResolvedValue({ id: 2, name: "New term" });
    mockDomainServices.terms.listTerms.mockResolvedValue([{ id: 1, name: "Term", status: "active" }]);
    mockDomainServices.terms.updateTerms.mockResolvedValue({ id: 1, name: "Updated term", status: "draft" });
    mockDomainServices.terms.activateTerms.mockResolvedValue({ id: 1, name: "Updated term", status: "active" });
    mockDomainServices.accessCodes.generateCode.mockResolvedValue({ code: "KLM-ABC123XYZ789", whatsappMessage: "كود الدخول للمذكرة التفاعلية: KLM-ABC123XYZ789", record: { id: 7, kind: "paid", code_hash: "hash" } });
    mockDomainServices.redemptions.redeemCode.mockResolvedValue({ id: 8, access_id: 88, counted_for_progress: true });
    mockDomainServices.milestones.listMilestones.mockResolvedValue([{ id: 3, target_paid_redemptions: 10 }]);
    mockDomainServices.milestones.createMilestone.mockResolvedValue({ id: 4, target_paid_redemptions: 20 });
    mockDomainServices.milestones.updateMilestone.mockResolvedValue({ id: 4, title: "Updated milestone" });
    mockDomainServices.milestones.deleteMilestone.mockResolvedValue({ id: 4, active: false });
    mockDomainServices.milestones.reorderMilestones.mockResolvedValue([{ id: 4, sort_order: 1 }]);
    mockDomainServices.milestones.listProgress.mockResolvedValue({ termId: 1, paidRedemptions: 12, achievements: [] });
    mockDomainServices.milestones.claimReward.mockResolvedValue({ id: 99, claimed_at: new Date() });
    mockDomainServices.milestones.evaluateTeacherMilestones.mockResolvedValue({ termId: 1, paidFirstAccessCount: 12, awarded: [] });
    mockDomainServices.wallet.getWallet.mockResolvedValue({ id: 5, balance: 100 });
    mockDomainServices.wallet.listLedger.mockResolvedValue([{ id: 6, amount: 100 }]);
    mockDomainServices.wallet.listRewardLots.mockResolvedValue([{ id: 7, remaining_amount: 100 }]);
    mockDomainServices.wallet.previewPurchase.mockResolvedValue({ balance: 100, walletCreditApplied: 40, finalTotal: 160, canApply: true });
    mockDomainServices.wallet.applyToPurchase.mockResolvedValue({ purchase: { id: 500, total: 160 }, walletCreditApplied: 40, finalTotal: 160 });

    await request(app)
      .get("/api/v2/admin/e-booklet-terms?status=active")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200)
      .expect((res) => expect(res.body.data[0].name).toBe("Term"));

    await request(app)
      .post("/api/v2/admin/e-booklet-terms")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ name: "New term", startsAt: "2026-06-14T00:00:00.000Z" })
      .expect(201);

    await request(app)
      .patch("/api/v2/admin/e-booklet-terms/1")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ name: "Updated term" })
      .expect(200)
      .expect((res) => expect(res.body.data.name).toBe("Updated term"));

    await request(app)
      .post("/api/v2/admin/e-booklet-terms/1/activate")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200)
      .expect((res) => expect(res.body.data.status).toBe("active"));

    await request(app)
      .get("/api/v2/teacher/e-booklet-terms/current")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .expect(200)
      .expect((res) => expect(res.body.data.name).toBe("Term"));

    await request(app)
      .post("/api/v2/teacher/e-booklet-terms/accept-code-generation")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({})
      .expect(200);

    await request(app)
      .post("/api/v2/teacher/e-booklets/10/access-codes")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ kind: "paid", termId: 1 })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.code).toBe("KLM-ABC123XYZ789");
        expect(res.body.data.record.code_hash).toBeUndefined();
      });

    await request(app)
      .post("/api/v2/e-booklet-access-codes/redeem")
      .set("Authorization", `Bearer ${tokenFor("Student", 55, "academy")}`)
      .send({ code: "KLM-ABC123XYZ789", termsAccepted: true })
      .expect(200);

    await request(app)
      .post("/api/v2/e-booklet-access-codes/redeem")
      .set("Authorization", `Bearer ${tokenFor("Student", 55, "academy")}`)
      .send({ code: "KLM-ABC123XYZ789", termsAccepted: true, purchaseId: "abc" })
      .expect(400)
      .expect((res) => expect(res.body.message).toContain("Invalid purchase ID"));

    await request(app)
      .post("/api/v2/e-booklet-access-codes/redeem")
      .set("Authorization", `Bearer ${tokenFor("Student", 55, "academy")}`)
      .send({ code: "KLM-ABC123XYZ789", termsAccepted: true, purchaseId: "123" })
      .expect(200);

    expect(mockDomainServices.redemptions.redeemCode).toHaveBeenLastCalledWith("KLM-ABC123XYZ789", 55, expect.objectContaining({ purchaseId: 123 }));

    await request(app)
      .get("/api/v2/teacher/e-booklet-milestones")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .expect(200);

    await request(app)
      .get("/api/v2/admin/e-booklet-milestones?term_id=1")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200)
      .expect((res) => expect(res.body.data[0].target_paid_redemptions).toBe(10));

    await request(app)
      .get("/api/v2/admin/e-booklet-milestones?term_id=1")
      .set("Authorization", `Bearer ${tokenFor("Moderator", 2)}`)
      .expect(403);

    await request(app)
      .post("/api/v2/admin/e-booklet-milestones")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ termId: 1, title: "20 paid", targetPaidRedemptions: 20, milestonePrice: 200 })
      .expect(201);

    await request(app)
      .patch("/api/v2/admin/e-booklet-milestones/4")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ title: "Updated milestone" })
      .expect(200);

    await request(app)
      .post("/api/v2/admin/e-booklet-milestones/reorder")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ termId: 1, items: [{ id: 4, sortOrder: 1 }] })
      .expect(200);

    await request(app)
      .delete("/api/v2/admin/e-booklet-milestones/4")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200);

    await request(app)
      .post("/api/v2/admin/e-booklet-access-codes/free")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ bookletInstanceId: 10, teacherId: 9, termId: 1, maxRedemptions: 999999 })
      .expect(201);

    await request(app)
      .get("/api/v2/admin/e-booklet-progress?term_id=1")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200);

    await request(app)
      .post("/api/v2/teacher/e-booklet-milestones/evaluate")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ termId: 1 })
      .expect(200);

    await request(app)
      .get("/api/v2/teacher/e-booklet-wallet")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .expect(200);

    await request(app)
      .post("/api/v2/teacher/e-booklet-wallet/preview")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ purchaseTotal: 200, requestedAmount: 40 })
      .expect(200);

    await request(app)
      .post("/api/v2/teacher/e-booklet-wallet/preview")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ purchaseTotal: 200, requestedAmount: 40, couponApplied: "false" })
      .expect(200);

    await request(app)
      .post("/api/v2/teacher/e-booklet-milestone-achievements/99/claim")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ termsAccepted: true })
      .expect(200);

    await request(app)
      .post("/api/v2/teacher/e-booklet-wallet/apply")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ purchaseId: 500, purchaseTotal: 200, requestedAmount: 40 })
      .expect(200);

    expect(mockDomainServices.terms.listTerms).toHaveBeenCalledWith({ templateId: undefined, status: "active" });
    expect(mockDomainServices.terms.createTerms).toHaveBeenCalledWith(expect.objectContaining({ name: "New term" }), 1);
    expect(mockDomainServices.terms.updateTerms).toHaveBeenCalledWith(1, expect.objectContaining({ name: "Updated term" }));
    expect(mockDomainServices.terms.activateTerms).toHaveBeenCalledWith(1, 1);
    expect(mockDomainServices.terms.getLatestActiveTerms).toHaveBeenCalledWith(undefined);
    expect(mockDomainServices.terms.acceptLatestTerms).toHaveBeenCalledWith(9, "code_generation", expect.objectContaining({ ipAddress: expect.any(String) }), undefined);
    expect(mockDomainServices.accessCodes.generateCode).toHaveBeenCalledWith(expect.objectContaining({ bookletInstanceId: 10, teacherId: 9, kind: "paid", termId: 1 }));
    expect(mockDomainServices.redemptions.redeemCode).toHaveBeenCalledWith("KLM-ABC123XYZ789", 55, expect.objectContaining({ termsAccepted: true }));
    expect(mockDomainServices.milestones.listMilestones).toHaveBeenCalledWith(undefined, 9, false);
    expect(mockDomainServices.milestones.listMilestones).toHaveBeenCalledWith(1, undefined, true);
    expect(mockDomainServices.milestones.createMilestone).toHaveBeenCalledWith(expect.objectContaining({ termId: 1, targetPaidRedemptions: 20 }), 1);
    expect(mockDomainServices.milestones.updateMilestone).toHaveBeenCalledWith(4, expect.objectContaining({ title: "Updated milestone" }));
    expect(mockDomainServices.milestones.reorderMilestones).toHaveBeenCalledWith(1, [{ id: 4, sortOrder: 1 }]);
    expect(mockDomainServices.milestones.deleteMilestone).toHaveBeenCalledWith(4);
    expect(mockDomainServices.milestones.listProgress).toHaveBeenCalledWith(1);
    expect(mockDomainServices.accessCodes.generateCode).toHaveBeenCalledWith(expect.objectContaining({ bookletInstanceId: 10, teacherId: 9, kind: "free", termId: 1, maxRedemptions: 999999 }));
    expect(mockDomainServices.milestones.evaluateTeacherMilestones).toHaveBeenCalledWith(9, 1);
    expect(mockDomainServices.milestones.claimReward).toHaveBeenCalledWith(9, 99, expect.objectContaining({ ipAddress: expect.any(String) }));
    expect(mockDomainServices.wallet.getWallet).toHaveBeenCalledWith(9);
    expect(mockDomainServices.wallet.listLedger).toHaveBeenCalledWith(9);
    expect(mockDomainServices.wallet.previewPurchase).toHaveBeenCalledWith(expect.objectContaining({ teacherId: 9, purchaseTotal: 200, requestedAmount: 40 }));
    expect(mockDomainServices.wallet.previewPurchase).toHaveBeenCalledWith(expect.objectContaining({ couponApplied: false }));
    expect(mockDomainServices.wallet.applyToPurchase).toHaveBeenCalledWith(expect.objectContaining({ teacherId: 9, purchaseId: 500, purchaseTotal: 200, requestedAmount: 40 }));
  });

  test("rejects Phase 3 invalid terms/code/reuse/no-stacking flows", async () => {
    mockDomainServices.terms.getLatestActiveTerms.mockRejectedValue(Object.assign(new Error("Active e-booklet terms not found."), { statusCode: 404 }));
    mockDomainServices.redemptions.redeemCode
      .mockRejectedValueOnce(Object.assign(new Error("Invalid e-booklet access code."), { statusCode: 404 }))
      .mockRejectedValueOnce(Object.assign(new Error("This e-booklet access code has already been redeemed."), { statusCode: 403 }));
    mockDomainServices.wallet.previewPurchase.mockRejectedValue(Object.assign(new Error("Wallet credit cannot be stacked with coupons."), { statusCode: 400 }));
    mockDomainServices.wallet.applyToPurchase.mockRejectedValue(Object.assign(new Error("Wallet credit cannot be stacked with coupons."), { statusCode: 400 }));

    await request(app)
      .get("/api/v2/teacher/e-booklet-terms/current")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .expect(404);

    await request(app)
      .post("/api/v2/e-booklet-access-codes/redeem")
      .set("Authorization", `Bearer ${tokenFor("Student", 55, "academy")}`)
      .send({ code: "BAD-CODE", termsAccepted: true })
      .expect(404);

    await request(app)
      .post("/api/v2/e-booklet-access-codes/redeem")
      .set("Authorization", `Bearer ${tokenFor("Student", 56, "academy")}`)
      .send({ code: "KLM-REUSED", termsAccepted: true })
      .expect(403);

    await request(app)
      .post("/api/v2/teacher/e-booklet-wallet/preview")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ purchaseTotal: 200, requestedAmount: 40, couponApplied: true })
      .expect(400);

    await request(app)
      .post("/api/v2/teacher/e-booklet-wallet/apply")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .send({ purchaseId: 500, purchaseTotal: 200, requestedAmount: 40, couponApplied: true })
      .expect(400);
  });
});
