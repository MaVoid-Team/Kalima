import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { CreateZoneDto, UpdateZoneDto } from "../dtos/zone.dto";
import { zones } from "../generated/prisma";
import { BadRequestError, NotFoundError, ConflictError } from "../../../libs/errors";

class ZonesService {
  constructor(private db: PrismaClient = prisma) {}

  async createZone(dto: CreateZoneDto): Promise<zones> {
    // validate government exists
    const gov = await this.db.government.findUnique({ where: { id: dto.government_id } });
    if (!gov) throw new NotFoundError("Government not found");

    // unique title per government
    const existing = await this.db.zones.findFirst({
      where: { title: dto.title, government_id: dto.government_id },
    });
    if (existing) throw new ConflictError("Zone with this title already exists for the government");

    const z = await this.db.zones.create({
      data: {
        title: dto.title,
        government_id: dto.government_id,
        active: dto.active ?? true,
      },
    });

    return z;
  }

  async getAllZones(filters?: { government_id?: number; active?: boolean }): Promise<zones[]> {
    const where: any = {};
    if (filters?.government_id !== undefined) where.government_id = filters.government_id;
    if (filters?.active !== undefined) where.active = filters.active;

    const list = await this.db.zones.findMany({ where, orderBy: { title: "asc" } });
    return list;
  }

  async getZonesByGovernment(governmentId: number): Promise<zones[]> {
    const gov = await this.db.government.findUnique({ where: { id: governmentId } });
    if (!gov) throw new NotFoundError("Government not found");

    return this.getAllZones({ government_id: governmentId });
  }

  async getZoneById(id: number): Promise<zones> {
    const z = await this.db.zones.findUnique({ where: { id } });
    if (!z) throw new NotFoundError("Zone not found");
    return z;
  }

  async updateZone(id: number, dto: UpdateZoneDto): Promise<zones> {
    const z = await this.db.zones.findUnique({ where: { id } });
    if (!z) throw new NotFoundError("Zone not found");

    if (dto.government_id !== undefined) {
      const gov = await this.db.government.findUnique({ where: { id: dto.government_id } });
      if (!gov) throw new NotFoundError("Government not found");
    }

    // if title/government combination changes, ensure uniqueness
    const newTitle = dto.title ?? z.title;
    const newGovId = dto.government_id ?? z.government_id;
    if (newTitle !== z.title || newGovId !== z.government_id) {
      const existing = await this.db.zones.findFirst({ where: { title: newTitle, government_id: newGovId } });
      if (existing && existing.id !== id) {
        throw new ConflictError("Zone with this title already exists for the government");
      }
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.government_id !== undefined) data.government_id = dto.government_id;
    if (dto.active !== undefined) data.active = dto.active;

    const updated = await this.db.zones.update({ where: { id }, data });
    return updated;
  }

  async deleteZone(id: number): Promise<void> {
    const z = await this.db.zones.findUnique({ where: { id } });
    if (!z) throw new NotFoundError("Zone not found");

    // Prevent delete if related records exist
    const [parentsCount, studentsCount, teachersCount] = await Promise.all([
      this.db.parents.count({ where: { zone_id: id } }),
      this.db.students.count({ where: { zone_id: id } }),
      this.db.teachers.count({ where: { zone_id: id } }),
    ]);

    if (parentsCount || studentsCount || teachersCount) {
      throw new BadRequestError("Cannot delete zone while related parents/students/teachers exist");
    }

    await this.db.zones.delete({ where: { id } });
  }
}

export const zonesService = new ZonesService();
