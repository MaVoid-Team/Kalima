import AppreciationService from "./appreciation.service";
import { PrismaClient, role_enum } from "../generated/prisma/client";
import {
  BadRequestError,
  NotFoundError,
} from "../../../libs/errors";

function getMockPrismaClient() {
  if (!(global as any)._mockAppreciationPrismaClient) {
    (global as any)._mockAppreciationPrismaClient = {
      users: {
        findUnique: jest.fn(),
      },
      user_appreciation_pages: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      user_appreciation_comments: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
  }

  return (global as any)._mockAppreciationPrismaClient;
}

const mockPrismaClient = getMockPrismaClient();

jest.mock("../generated/prisma/client", () => {
  const actual = jest.requireActual("../generated/prisma/client");
  return {
    ...actual,
    PrismaClient: jest.fn().mockImplementation(() => getMockPrismaClient()),
  };
});

jest.mock("../../../libs/db/prisma", () => ({
  prisma: getMockPrismaClient(),
  PrismaClient: jest.fn().mockImplementation(() => getMockPrismaClient()),
}));

describe("AppreciationService", () => {
  let service: AppreciationService;

  beforeEach(() => {
    mockPrismaClient.users.findUnique.mockReset();
    mockPrismaClient.user_appreciation_pages.findUnique.mockReset();
    mockPrismaClient.user_appreciation_pages.upsert.mockReset();
    mockPrismaClient.user_appreciation_comments.create.mockReset();
    mockPrismaClient.user_appreciation_comments.findFirst.mockReset();
    mockPrismaClient.user_appreciation_comments.update.mockReset();
    mockPrismaClient.user_appreciation_comments.delete.mockReset();
    process.env.APP_URL = "https://kalima.test";
    service = new AppreciationService(mockPrismaClient as unknown as PrismaClient);
  });

  describe("getOrCreateAdminPage", () => {
    it("creates a page once and reuses the same token on repeated calls", async () => {
      mockPrismaClient.users.findUnique.mockResolvedValue({
        id: 42,
        name: "Amina Hassan",
      });

      mockPrismaClient.user_appreciation_pages.upsert.mockResolvedValue({
        id: 10,
        user_id: 42,
        token: "stable-token",
        _count: { user_appreciation_comments: 0 },
      });

      const created = await service.getOrCreateAdminPage(42);
      const fetched = await service.getOrCreateAdminPage(42);

      expect(created.token).toBe("stable-token");
      expect(fetched.token).toBe("stable-token");
      expect(mockPrismaClient.user_appreciation_pages.upsert).toHaveBeenCalledTimes(2);
    });

    it("rejects invalid user ids", async () => {
      await expect(service.getOrCreateAdminPage(0)).rejects.toBeInstanceOf(
        BadRequestError,
      );
    });
  });

  describe("getPublicPage", () => {
    it("resolves a valid token with newest comments first", async () => {
      mockPrismaClient.user_appreciation_pages.findUnique.mockResolvedValue({
        id: 9,
        user_id: 42,
        token: "public-token",
        users: {
          id: 42,
          name: "Amina Hassan",
          role: role_enum.Teacher,
          user_roles: [{ role: role_enum.Teacher }],
        },
        user_appreciation_comments: [
          {
            id: 2,
            author_name: "Youssef",
            comment: "Newest",
            created_at: new Date("2026-05-02T10:00:00Z"),
          },
          {
            id: 1,
            author_name: "Mona",
            comment: "Older",
            created_at: new Date("2026-05-01T10:00:00Z"),
          },
        ],
      });

      const result = await service.getPublicPage("public-token");

      expect(result.user.name).toBe("Amina Hassan");
      expect(result.user.roleLabel).toBe("Teacher");
      expect(result.comments.map((comment) => comment.comment)).toEqual([
        "Newest",
        "Older",
      ]);
    });

    it("rejects unknown tokens", async () => {
      mockPrismaClient.user_appreciation_pages.findUnique.mockResolvedValue(null);

      await expect(service.getPublicPage("missing-token")).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  describe("createComment", () => {
    it("accepts a valid comment and returns the created row", async () => {
      mockPrismaClient.user_appreciation_pages.findUnique.mockResolvedValue({
        id: 9,
        user_id: 42,
        token: "public-token",
        users: {
          id: 42,
          name: "Amina Hassan",
          role: role_enum.Teacher,
          user_roles: [{ role: role_enum.Teacher }],
        },
      });

      mockPrismaClient.user_appreciation_comments.create.mockResolvedValue({
        id: 3,
        author_name: "Karim",
        comment: "Thank you for everything.",
        created_at: new Date("2026-05-02T12:00:00Z"),
      });

      const result = await service.createComment("public-token", {
        authorName: " Karim ",
        comment: " Thank you for everything. ",
      });

      expect(mockPrismaClient.user_appreciation_comments.create).toHaveBeenCalledWith({
        data: {
          page_id: 9,
          author_name: "Karim",
          comment: "Thank you for everything.",
        },
        select: {
          id: true,
          author_name: true,
          comment: true,
          created_at: true,
        },
      });
      expect(result.authorName).toBe("Karim");
    });
  });

  describe("admin comment management", () => {
    it("updates a comment only when it belongs to the requested user's page", async () => {
      mockPrismaClient.user_appreciation_pages.findUnique.mockResolvedValue({ id: 9 });
      mockPrismaClient.user_appreciation_comments.findFirst.mockResolvedValue({ id: 3 });
      mockPrismaClient.user_appreciation_comments.update.mockResolvedValue({
        id: 3,
        author_name: "Edited Student",
        comment: "Edited message",
        created_at: new Date("2026-05-02T12:00:00Z"),
      });

      const result = await service.updateComment(42, 3, {
        authorName: " Edited Student ",
        comment: " Edited message ",
      });

      expect(mockPrismaClient.user_appreciation_comments.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: {
          author_name: "Edited Student",
          comment: "Edited message",
        },
        select: {
          id: true,
          author_name: true,
          comment: true,
          created_at: true,
        },
      });
      expect(result.comment).toBe("Edited message");
    });

    it("does not update a comment owned by another appreciation page", async () => {
      mockPrismaClient.user_appreciation_pages.findUnique.mockResolvedValue({ id: 9 });
      mockPrismaClient.user_appreciation_comments.findFirst.mockResolvedValue(null);

      await expect(
        service.updateComment(42, 99, {
          authorName: "Edited Student",
          comment: "Edited message",
        }),
      ).rejects.toBeInstanceOf(NotFoundError);

      expect(mockPrismaClient.user_appreciation_comments.update).not.toHaveBeenCalled();
    });

    it("deletes a comment only after the page ownership check", async () => {
      mockPrismaClient.user_appreciation_pages.findUnique.mockResolvedValue({ id: 9 });
      mockPrismaClient.user_appreciation_comments.findFirst.mockResolvedValue({ id: 3 });

      await service.deleteComment(42, 3);

      expect(mockPrismaClient.user_appreciation_comments.delete).toHaveBeenCalledWith({
        where: { id: 3 },
      });
    });
  });
});
