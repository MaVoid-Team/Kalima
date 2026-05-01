import crypto from "crypto";
import { prisma } from "../../../libs/db/prisma";
import type { PrismaClient } from "../../../libs/db/prisma";
import {
  BadRequestError,
  NotFoundError,
} from "../../../libs/errors";
import { role_enum } from "../generated/prisma/client";

type AppreciationPageRecord = {
  id: number;
  user_id: number;
  token: string;
  users?: {
    id: number;
    name: string;
    role: role_enum | null;
    user_roles?: Array<{ role: role_enum }>;
  };
  user_appreciation_comments?: Array<{
    id: number;
    author_name: string;
    comment: string;
    created_at: Date | null;
  }>;
  _count?: {
    user_appreciation_comments: number;
  };
};

class AppreciationService {
  constructor(private db: PrismaClient = prisma) {}

  async getOrCreateAdminPage(userId: number) {
    this.ensureValidUserId(userId);

    const user = await this.db.users.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const page =
      (await this.db.user_appreciation_pages.findUnique({
        where: { user_id: userId },
        include: {
          _count: {
            select: {
              user_appreciation_comments: true,
            },
          },
        },
      })) ??
      (await this.db.user_appreciation_pages.create({
        data: {
          user_id: userId,
          token: this.generateToken(),
        },
        include: {
          _count: {
            select: {
              user_appreciation_comments: true,
            },
          },
        },
      }));

    return this.mapAdminPage(page);
  }

  async getAdminPage(userId: number) {
    this.ensureValidUserId(userId);

    const page = await this.db.user_appreciation_pages.findUnique({
      where: { user_id: userId },
      include: {
        _count: {
          select: {
            user_appreciation_comments: true,
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundError("Appreciation page not found");
    }

    return this.mapAdminPage(page);
  }

  async getPublicPage(token: string) {
    const page = await this.findPageByToken(token);

    return {
      user: {
        id: page.users!.id,
        name: page.users!.name,
        roleLabel: this.getRoleLabel(page.users!),
      },
      page: {
        token: page.token,
      },
      message: this.buildMessage(page.users!.name, this.getRoleLabel(page.users!)),
      comments: (page.user_appreciation_comments ?? []).map((comment) => ({
        id: comment.id,
        authorName: comment.author_name,
        comment: comment.comment,
        createdAt: comment.created_at,
      })),
    };
  }

  async createComment(
    token: string,
    input: { authorName: string; comment: string },
  ) {
    const page = await this.findPageByToken(token, false);

    const created = await this.db.user_appreciation_comments.create({
      data: {
        page_id: page.id,
        author_name: input.authorName.trim(),
        comment: input.comment.trim(),
      },
      select: {
        id: true,
        author_name: true,
        comment: true,
        created_at: true,
      },
    });

    return {
      id: created.id,
      authorName: created.author_name,
      comment: created.comment,
      createdAt: created.created_at,
    };
  }

  private async findPageByToken(token: string, includeComments = true) {
    const normalizedToken = token?.trim();

    if (!normalizedToken) {
      throw new NotFoundError("Appreciation page not found");
    }

    const page = await this.db.user_appreciation_pages.findUnique({
      where: { token: normalizedToken },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            role: true,
            user_roles: {
              select: { role: true },
              orderBy: { id: "asc" },
            },
          },
        },
        ...(includeComments
          ? {
              user_appreciation_comments: {
                orderBy: [
                  { created_at: "desc" },
                  { id: "desc" },
                ],
                select: {
                  id: true,
                  author_name: true,
                  comment: true,
                  created_at: true,
                },
              },
            }
          : {}),
      },
    });

    if (!page) {
      throw new NotFoundError("Appreciation page not found");
    }

    return page as AppreciationPageRecord;
  }

  private mapAdminPage(page: AppreciationPageRecord) {
    return {
      pageId: page.id,
      userId: page.user_id,
      token: page.token,
      publicUrl: this.buildPublicUrl(page.token),
      commentCount: page._count?.user_appreciation_comments ?? 0,
    };
  }

  private buildPublicUrl(token: string) {
    const appUrl = process.env.APP_URL?.trim();

    if (!appUrl) {
      return `/appreciation/${token}`;
    }

    return `${appUrl.replace(/\/+$/, "")}/appreciation/${token}`;
  }

  private buildMessage(name: string, roleLabel?: string | null) {
    return {
      headline: `Thank you, ${name}.`,
      body: roleLabel
        ? `Kalima is grateful for your partnership and everything you bring as a ${roleLabel}.`
        : "Kalima is grateful for your partnership and everything you bring to our community.",
    };
  }

  private getRoleLabel(user: {
    role: role_enum | null;
    user_roles?: Array<{ role: role_enum }>;
  }) {
    const rawRole = user.role ?? user.user_roles?.[0]?.role ?? null;
    if (!rawRole) {
      return null;
    }

    return rawRole.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  private ensureValidUserId(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestError("Invalid user ID");
    }
  }

  private generateToken() {
    return crypto.randomBytes(24).toString("hex");
  }
}

export const appreciationService = new AppreciationService();
export default AppreciationService;
