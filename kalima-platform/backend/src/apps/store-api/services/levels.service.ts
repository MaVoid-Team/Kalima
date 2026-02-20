import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { CreateLevelDto, UpdateLevelDto } from "../dtos/level.dto";
import { levels } from "../generated/prisma";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../libs/errors";

class LevelsService {
  constructor(private db: PrismaClient = prisma) {}

  async createLevel(dto: CreateLevelDto): Promise<levels> {
    const existing = await this.db.levels.findFirst({
      where: { title: dto.title },
    });
    if (existing)
      throw new ConflictError("Level with this title already exists");

    const created = await this.db.levels.create({
      data: { title: dto.title, active: dto.active ?? true },
    });
    return created;
  }

  async getAllLevels(filters?: { active?: boolean }): Promise<levels[]> {
    const where: any = {};
    if (filters?.active !== undefined) where.active = filters.active;
    return this.db.levels.findMany({ where, orderBy: { title: "asc" } });
  }

  async getLevelById(id: number): Promise<levels> {
    const lvl = await this.db.levels.findUnique({ where: { id } });
    if (!lvl) throw new NotFoundError("Level not found");
    return lvl;
  }

  async updateLevel(id: number, dto: UpdateLevelDto): Promise<levels> {
    const lvl = await this.db.levels.findUnique({ where: { id } });
    if (!lvl) throw new NotFoundError("Level not found");

    if (dto.title && dto.title !== lvl.title) {
      const existing = await this.db.levels.findFirst({
        where: { title: dto.title },
      });
      if (existing)
        throw new ConflictError("Level with this title already exists");
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.active !== undefined) data.active = dto.active;

    const updated = await this.db.levels.update({ where: { id }, data });
    return updated;
  }

  async deleteLevel(id: number): Promise<void> {
    const lvl = await this.db.levels.findUnique({ where: { id } });
    if (!lvl) throw new NotFoundError("Level not found");

    // prevent delete if students reference this level
    const studentsCount = await this.db.students.count({
      where: { level_id: id },
    });
    if (studentsCount > 0) {
      throw new BadRequestError(
        "Cannot delete level while students are assigned to it",
      );
    }

    await this.db.levels.delete({ where: { id } });
  }
}

export const levelsService = new LevelsService();
