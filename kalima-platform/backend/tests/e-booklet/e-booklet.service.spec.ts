import { EBookletService } from "../../src/apps/store-api/services/e-booklet.service";
import { hashInviteToken } from "../../src/apps/store-api/utils/e-booklet-token";

function createMockDb(overrides: Record<string, unknown> = {}) {
  const db = {
    e_booklet_templates: {
      findUnique: jest.fn(),
    },
    e_booklet_template_versions: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    e_booklet_hotspots: {
      findMany: jest.fn(),
    },
    e_booklet_invites: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    e_booklet_instances: {
      update: jest.fn(),
    },
    e_booklet_access: {
      findFirst: jest.fn(),
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
    $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) => {
      return callback(db);
    }),
    ...overrides,
  };

  return db as any;
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
