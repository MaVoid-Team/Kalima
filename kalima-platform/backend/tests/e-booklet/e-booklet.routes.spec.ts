import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres?schema=test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const mockService = {
  listPublishedTemplates: jest.fn(),
  createTemplate: jest.fn(),
  listTemplateVersions: jest.fn(),
  listVersionHotspots: jest.fn(),
  createInvite: jest.fn(),
  acceptInvite: jest.fn(),
  getViewerPage: jest.fn(),
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

  test("accepts student invite tokens through the e-booklet invite namespace", async () => {
    mockService.acceptInvite.mockResolvedValue({
      alreadyHadAccess: false,
      bookletInstanceId: 10,
      access: { id: 12 },
    });

    await request(app)
      .post("/api/v2/e-booklet-invites/raw-token/accept")
      .set("Authorization", `Bearer ${tokenFor("Student", 55)}`)
      .set("User-Agent", "node-superagent-test")
      .send()
      .expect(200)
      .expect((res) => {
        expect(res.body.data.bookletInstanceId).toBe(10);
      });

    expect(mockService.acceptInvite).toHaveBeenCalledWith("raw-token", 55, {
      ipAddress: expect.any(String),
      userAgent: expect.stringContaining("node-superagent"),
    });
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
});
