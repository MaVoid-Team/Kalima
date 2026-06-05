import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres?schema=test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const mockService = {
  listPublishedTemplates: jest.fn(),
  createTemplate: jest.fn(),
  createPurchaseRequest: jest.fn(),
  listTemplateVersions: jest.fn(),
  listVersionHotspots: jest.fn(),
  createInvite: jest.fn(),
  acceptInvite: jest.fn(),
  acceptFreeInvite: jest.fn(),
  acceptInvitePasscode: jest.fn(),
  createStudentPurchaseLink: jest.fn(),
  getViewerPage: jest.fn(),
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
) {
  return jwt.sign(
    {
      userId,
      roles: [{ role, portal: "store" }],
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  );
}

describe("e-booklet routes", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("serves e-booklet store from a namespace separate from products", async () => {
    mockService.listPublishedTemplates.mockResolvedValue({
      data: [{ id: 1, title: "Grade 5 Arabic Reading" }],
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
          { id: 1, title: "Grade 5 Arabic Reading" },
        ]);
      });

    expect(mockService.listPublishedTemplates).toHaveBeenCalledWith({
      categoryId: undefined,
      limit: 20,
      page: 1,
      search: undefined,
    });
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

  test("does not expose teacher checkout and uses admin deal creation for e_booklet_purchases", async () => {
    mockService.createPurchaseRequest.mockResolvedValue({ id: 99, teacher_id: 2 });

    await request(app)
      .post("/api/v2/e-booklet-checkout")
      .send({ template_id: 3, template_version_id: 4, branding_json: {} })
      .expect(404);

    await request(app)
      .post("/api/v2/e-booklet-checkout")
      .set("Authorization", `Bearer ${tokenFor("Teacher", 2)}`)
      .send({ template_id: 3, template_version_id: 4, branding_json: {} })
      .expect(404);

    await request(app)
      .post("/api/v2/admin/e-booklet-purchases")
      .set("Authorization", `Bearer ${tokenFor("Admin", 1)}`)
      .send({ teacher_id: 2, template_id: 3, template_version_id: 4, branding_json: {}, price: 120 })
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toEqual({ id: 99, teacher_id: 2 });
      });

    expect(mockService.createPurchaseRequest).toHaveBeenCalledTimes(1);
    expect(mockService.createPurchaseRequest).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ teacher_id: 2, template_id: 3, template_version_id: 4 }),
      1,
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
    expect(mockService.createStudentPurchaseLink).toHaveBeenCalledWith("raw-token", 55, expect.objectContaining({ purchaseId: 500, termsAccepted: true }));
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
});
