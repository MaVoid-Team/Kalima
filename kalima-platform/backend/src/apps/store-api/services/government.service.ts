import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { CreateGovernmentDto, UpdateGovernmentDto } from "../dtos/government.dto";
import { government } from "../generated/prisma";
import { BadRequestError, NotFoundError, ConflictError } from "../../../libs/errors";

class GovernmentService {
  constructor(private db: PrismaClient = prisma) {}

  async createGovernment(dto: CreateGovernmentDto): Promise<government> {
    const existing = await this.db.government.findFirst({
      where: { title: dto.title },
    });
    if (existing) throw new ConflictError("Government with this title already exists");

    const g = await this.db.government.create({
      data: {
        title: dto.title,
        active: dto.active ?? true,
      },
    });

    return g;
  }

  async getAllGovernments(filters?: { active?: boolean }): Promise<government[]> {
    const where: any = {};
    if (filters?.active !== undefined) where.active = filters.active;
    const list = await this.db.government.findMany({ where, orderBy: { title: "asc" } });
    return list;
  }

  async getGovernmentById(id: number): Promise<government> {
    const g = await this.db.government.findUnique({ where: { id } });
    if (!g) throw new NotFoundError("Government not found");
    return g;
  }

  async updateGovernment(id: number, dto: UpdateGovernmentDto): Promise<government> {
    const g = await this.db.government.findUnique({ where: { id } });
    if (!g) throw new NotFoundError("Government not found");

    if (dto.title && dto.title !== g.title) {
      const existing = await this.db.government.findFirst({ where: { title: dto.title } });
      if (existing) throw new ConflictError("Government with this title already exists");
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.active !== undefined) data.active = dto.active;

    const updated = await this.db.government.update({ where: { id }, data });
    return updated;
  }

  async deleteGovernment(id: number): Promise<void> {
    const g = await this.db.government.findUnique({ where: { id } });
    if (!g) throw new NotFoundError("Government not found");

    // Prevent delete if there are dependent records
    const [zonesCount, teachersCount, studentsCount, parentsCount] = await Promise.all([
      this.db.zones.count({ where: { government_id: id } }),
      this.db.teachers.count({ where: { government_id: id } }),
      this.db.students.count({ where: { government_id: id } }),
      this.db.parents.count({ where: { government_id: id } }),
    ]);

    if (zonesCount || teachersCount || studentsCount || parentsCount) {
      throw new BadRequestError(
        "Cannot delete government while related zones/teachers/students/parents exist",
      );
    }

    await this.db.government.delete({ where: { id } });
  }
}

export const governmentService = new GovernmentService();
