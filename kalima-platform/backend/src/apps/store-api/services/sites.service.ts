import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { CreateSiteDto, UpdateSiteDto } from "../dtos/site.dto";
import { sites } from "../generated/prisma";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../libs/errors";

class SitesService {
  constructor(private db: PrismaClient = prisma) {}

  async createSite(dto: CreateSiteDto): Promise<sites> {
    const existing = await this.db.sites.findFirst({
      where: { title: dto.title },
    });
    if (existing)
      throw new ConflictError("Site with this title already exists");

    const s = await this.db.sites.create({
      data: { title: dto.title, active: dto.active ?? true },
    });
    return s;
  }

  async getAllSites(filters?: { active?: boolean }): Promise<sites[]> {
    const where: any = {};
    if (filters?.active !== undefined) where.active = filters.active;
    return this.db.sites.findMany({ where, orderBy: { title: "asc" } });
  }

  async getSiteById(id: number): Promise<sites> {
    const s = await this.db.sites.findUnique({ where: { id } });
    if (!s) throw new NotFoundError("Site not found");
    return s;
  }

  async updateSite(id: number, dto: UpdateSiteDto): Promise<sites> {
    const s = await this.db.sites.findUnique({ where: { id } });
    if (!s) throw new NotFoundError("Site not found");

    if (dto.title && dto.title !== s.title) {
      const existing = await this.db.sites.findFirst({
        where: { title: dto.title },
      });
      if (existing)
        throw new ConflictError("Site with this title already exists");
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.active !== undefined) data.active = dto.active;

    return this.db.sites.update({ where: { id }, data });
  }

  async deleteSite(id: number): Promise<void> {
    const s = await this.db.sites.findUnique({ where: { id } });
    if (!s) throw new NotFoundError("Site not found");

    // prevent delete if social_media entries exist (they will be cascade? schema has SET NULL on site delete)
    const smCount = await this.db.social_media.count({
      where: { site_id: id },
    });
    if (smCount > 0) {
      throw new BadRequestError(
        "Cannot delete site while related social media entries exist",
      );
    }

    await this.db.sites.delete({ where: { id } });
  }
}

export const sitesService = new SitesService();
