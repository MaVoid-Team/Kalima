import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres?schema=test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

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
  getViewerPage: jest.fn(),
  getAdminViewerMetadata: jest.fn(),
  getAdminViewerPage: jest.fn(),
  getAdminViewerPageHotspots: jest.fn(),
  getAdminHotspotContent: jest.fn(),
  getAdminAuthorizedHotspotAsset: jest.fn(),
  bindViewerDevice: jest.fn(),
  listViewerDevices: jest.fn(),
  resetViewerDevices: jest.fn(),
  addDeviceAllowance: jest.fn(),
  approveStudentPurchaseLink: jest.fn(),
  getAuthorizedHotspotAsset: jest.fn(),
  createFileAsset: jest.fn(),
  recordInviteOpen: jest.fn(),
  getTeacherAnalytics: jest.fn(),
  getAdminAnalytics: jest.fn(),
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
    for (const serviceGroup of Object.values(mockDomainServices)) {
      for (const fn of Object.values(serviceGroup)) {
        (fn as jest.Mock).mockReset();
      }
    }
  });

  test("serves e-booklet store as active teacher-specific instances", async () => {
    mockService.listPublicInstances.mockResolvedValue({
      data: [{ id: 10, display_title: "Grade 5 Arabic with Ms Sara", teacher: { id: 7, name: "Sara" }, remaining_seats: 4 }],
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
          { id: 10, display_title: "Grade 5 Arabic with Ms Sara", teacher: { id: 7, name: "Sara" }, remaining_seats: 4 },
        ]);
      });

    expect(mockService.listPublicInstances).toHaveBeenCalledWith({
      categoryId: undefined,
      limit: 20,
      page: 1,
      search: undefined,
    });
  });

  test("serves e-booklet store detail by teacher instance id", async () => {
    mockService.getPublicInstance.mockResolvedValue({ id: 10, display_title: "Grade 5 Arabic with Ms Sara" });

    await request(app)
      .get("/api/v2/e-booklet-store/instances/10")
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toEqual({ id: 10, display_title: "Grade 5 Arabic with Ms Sara" });
      });

    expect(mockService.getPublicInstance).toHaveBeenCalledWith(10);
  });

  test("blocks non-admin users from admin e-booklet template creation", async () => {
    await request(app)
      .post("/api/v2/admin/e-booklet-templates")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 2)}`)
      .send({ title: "Teacher should not create", price: 100 })
      .expect(403);

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

  test("public checkout requires auth and creates an instance-scoped purchase request", async () => {
    mockService.createPublicCheckoutRequest.mockResolvedValue({ purchase_id: 91 });

    await request(app)
      .post("/api/v2/e-booklet-checkout")
      .send({ template_id: 3, template_version_id: 4, branding_json: {} })
      .expect(401);

    await request(app)
      .post("/api/v2/e-booklet-checkout")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 77, "store")}`)
      .send({ instance_id: 7, template_id: 3, template_version_id: 4, branding_json: {}, price: 0, terms_accepted: true })
      .expect(403);

    await request(app)
      .post("/api/v2/e-booklet-checkout")
      .set("Authorization", `Bearer ${tokenFor("Student", 55, "academy")}`)
      .send({ instance_id: 7, template_id: 3, template_version_id: 4, branding_json: {}, price: 0, terms_accepted: true })
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toEqual({ purchase_id: 91 });
      });

    expect(mockService.createPurchaseRequest).not.toHaveBeenCalled();
    expect(mockService.createPublicCheckoutRequest).toHaveBeenCalledWith(
      55,
      expect.objectContaining({ instance_id: 7, template_id: 3, template_version_id: 4, terms_accepted: true }),
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

  test("allows teachers to create invite links for their own e-booklet instances", async () => {
    mockService.createInvite.mockResolvedValue({
      invite: { id: 8, booklet_instance_id: 10 },
      token: "raw-token",
    });

    await request(app)
      .post("/api/v2/teacher/e-booklets/10/invites")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 2)}`)
      .send({ max_uses: 5 })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.token).toBe("raw-token");
      });

    expect(mockService.createInvite).toHaveBeenCalledWith(10, 2, {
      max_uses: 5,
    });
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
    mockService.createStudentPurchaseLink.mockResolvedValue({ id: 14, purchase_id: 500 });

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
      .expect(200);

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
    mockService.exportAdminAnalyticsCsv.mockResolvedValue("id,event_type\n1,access_created");

    await request(app)
      .get("/api/v2/e-booklet-invites/raw-token/open?source=whatsapp")
      .set("x-e-booklet-session", "anon-1")
      .expect(200);
    await request(app)
      .get("/api/v2/teacher/e-booklet-analytics?instance_id=10")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 9)}`)
      .expect(200);
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

    expect(mockService.recordInviteOpen).toHaveBeenCalledWith("raw-token", expect.objectContaining({ anonymousSessionId: "anon-1", source: "whatsapp" }));
    expect(mockService.getTeacherAnalytics).toHaveBeenCalledWith(9, expect.objectContaining({ instanceId: 10 }));
    expect(mockService.getAdminAnalytics).toHaveBeenCalledWith(expect.objectContaining({ teacherId: 9 }));
    expect(mockService.exportAdminAnalyticsCsv).toHaveBeenCalled();
  });

  test("marks viewer page responses as private no-store", async () => {
    mockService.getViewerPage.mockResolvedValue({
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

    expect(mockService.getViewerPage).toHaveBeenCalledWith(10, 1, 55);
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
      .get("/api/v2/admin/e-booklet-viewer/hotspots/77/content")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .expect(200);

    expect(mockService.getAdminViewerMetadata).toHaveBeenCalledWith(10, 1);
    expect(mockService.getAdminViewerPage).toHaveBeenCalledWith(10, 1, 1);
    expect(mockService.getAdminViewerPageHotspots).toHaveBeenCalledWith(10, 1);
    expect(mockService.getAdminHotspotContent).toHaveBeenCalledWith(77);
    expect(mockService.bindViewerDevice).not.toHaveBeenCalled();
  });

  test("binds/lists viewer devices and exposes admin device reset/allowance/approval routes", async () => {
    mockService.bindViewerDevice.mockResolvedValue({ id: 1, device_fingerprint: "dev-1" });
    mockService.listViewerDevices.mockResolvedValue([{ id: 1, device_fingerprint: "dev-1" }]);
    mockService.resetViewerDevices.mockResolvedValue({ count: 1 });
    mockService.addDeviceAllowance.mockResolvedValue({ allowed_devices: 2 });
    mockService.approveStudentPurchaseLink.mockResolvedValue({ purchase_id: 500, access_id: 88 });

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
      .expect(200);

    expect(mockService.bindViewerDevice).toHaveBeenCalledWith(10, 55, expect.objectContaining({ deviceFingerprint: "dev-1", deviceLabel: "iPad" }));
    expect(mockService.listViewerDevices).toHaveBeenCalledWith(10, 55);
    expect(mockService.resetViewerDevices).toHaveBeenCalledWith(10, 55, 1, "replacement");
    expect(mockService.addDeviceAllowance).toHaveBeenCalledWith(10, 55, 1, 2, "second tablet");
    expect(mockService.approveStudentPurchaseLink).toHaveBeenCalledWith(500, 1);
  });

  test("serves authorized hotspot assets with private no-store headers", async () => {
    mockService.getAuthorizedHotspotAsset.mockResolvedValue({
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
      .get("/api/v2/e-booklet-viewer/hotspots/77/assets/123")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .expect(200)
      .expect("Cache-Control", "private, no-store")
      .expect("Pragma", "no-cache")
      .expect("Expires", "0")
      .expect("Content-Type", /audio\/mpeg/);

    expect(mockService.getAuthorizedHotspotAsset).toHaveBeenCalledWith(77, 123, 55);
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
      .expect(201);

    expect(mockDomainServices.accessCodes.generateCode).toHaveBeenCalledWith(expect.objectContaining({ teacherId: 9, kind: "paid" }));
    mockDomainServices.accessCodes.generateCode.mockClear();

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
    mockDomainServices.accessCodes.generateCode.mockResolvedValue({ code: "KLM-ABC123XYZ789", whatsappMessage: "كود الدخول للبوكليت الإلكتروني: KLM-ABC123XYZ789", record: { id: 7, kind: "paid", code_hash: "hash" } });
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
