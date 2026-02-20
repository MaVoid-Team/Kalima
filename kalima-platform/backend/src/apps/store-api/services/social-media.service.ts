import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import {
  CreateSocialMediaDto,
  UpdateSocialMediaDto,
} from "../dtos/social-media.dto";
import { social_media } from "../generated/prisma/client";
import { NotFoundError, BadRequestError } from "../../../libs/errors";

class SocialMediaService {
  constructor(private db: PrismaClient = prisma) {}

  async createSocialMedia(dto: CreateSocialMediaDto): Promise<social_media> {
    // teacher_user_id must be provided by controller (either explicit or filled from authenticated teacher)
    if (dto.teacher_user_id === undefined) {
      throw new BadRequestError("teacher_user_id is required");
    }

    const user = await this.db.users.findUnique({
      where: { id: dto.teacher_user_id },
    });
    if (!user) throw new NotFoundError("Teacher (user) not found");

    if (dto.site_id !== undefined) {
      const site = await this.db.sites.findUnique({
        where: { id: dto.site_id },
      });
      if (!site) throw new NotFoundError("Site not found");
    }

    const created = await this.db.social_media.create({
      data: {
        teacher_user_id: dto.teacher_user_id,
        site_id: dto.site_id ?? null,
        url: dto.url,
        active: dto.active ?? true,
      },
    });

    return created;
  }

  async getAllSocialMedia(filters?: {
    teacher_user_id?: number;
    site_id?: number;
    active?: boolean;
  }): Promise<social_media[]> {
    const where: any = {};
    if (filters?.teacher_user_id !== undefined)
      where.teacher_user_id = filters.teacher_user_id;
    if (filters?.site_id !== undefined) where.site_id = filters.site_id;
    if (filters?.active !== undefined) where.active = filters.active;

    return this.db.social_media.findMany({ where, orderBy: { id: "asc" } });
  }

  async getById(id: number): Promise<social_media> {
    const s = await this.db.social_media.findUnique({ where: { id } });
    if (!s) throw new NotFoundError("Social media entry not found");
    return s;
  }

  async updateSocialMedia(
    id: number,
    dto: UpdateSocialMediaDto,
  ): Promise<social_media> {
    const s = await this.db.social_media.findUnique({ where: { id } });
    if (!s) throw new NotFoundError("Social media entry not found");

    if (dto.teacher_user_id !== undefined) {
      const user = await this.db.users.findUnique({
        where: { id: dto.teacher_user_id },
      });
      if (!user) throw new NotFoundError("Teacher (user) not found");
    }

    if (dto.site_id !== undefined) {
      const site = await this.db.sites.findUnique({
        where: { id: dto.site_id },
      });
      if (!site) throw new NotFoundError("Site not found");
    }

    const data: any = {};
    if (dto.teacher_user_id !== undefined)
      data.teacher_user_id = dto.teacher_user_id;
    if (dto.site_id !== undefined) data.site_id = dto.site_id;
    if (dto.url !== undefined) data.url = dto.url;
    if (dto.active !== undefined) data.active = dto.active;

    const updated = await this.db.social_media.update({ where: { id }, data });
    return updated;
  }

  async deleteSocialMedia(id: number): Promise<void> {
    const s = await this.db.social_media.findUnique({ where: { id } });
    if (!s) throw new NotFoundError("Social media entry not found");

    await this.db.social_media.delete({ where: { id } });
  }
}

export const socialMediaService = new SocialMediaService();
