import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { CreateTeachesAtDto, UpdateTeachesAtDto } from "../dtos/teaches-at.dto";
import { teaches_at, location_type_enum } from "../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../../libs/errors";

class TeachesAtService {
  constructor(private db: PrismaClient = prisma) {}

  async createTeachesAt(dto: CreateTeachesAtDto): Promise<teaches_at> {
    // ensure user exists
    const user = await this.db.users.findUnique({ where: { id: dto.user_id } });
    if (!user) throw new NotFoundError("User not found");

    const created = await this.db.teaches_at.create({
      data: {
        user_id: dto.user_id!,
        location_name: dto.location_name,
        location_type: (dto.location_type ?? null) as location_type_enum | null,
        active: dto.active ?? true,
      },
    });

    return created;
  }

  async getAllTeachesAt(filters?: {
    user_id?: number;
    location_type?: string;
    active?: boolean;
  }): Promise<teaches_at[]> {
    const where: any = {};
    if (filters?.user_id !== undefined) where.user_id = filters.user_id;
    if (filters?.location_type !== undefined)
      where.location_type = filters.location_type as location_type_enum;
    if (filters?.active !== undefined) where.active = filters.active;
    return this.db.teaches_at.findMany({ where, orderBy: { id: "asc" } });
  }

  async getById(id: number): Promise<teaches_at> {
    const item = await this.db.teaches_at.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("TeachesAt record not found");
    return item;
  }

  async updateTeachesAt(
    id: number,
    dto: UpdateTeachesAtDto,
  ): Promise<teaches_at> {
    const existing = await this.db.teaches_at.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("TeachesAt record not found");

    if (dto.user_id !== undefined) {
      const user = await this.db.users.findUnique({
        where: { id: dto.user_id },
      });
      if (!user) throw new NotFoundError("User not found");
    }

    const data: any = {};
    if (dto.user_id !== undefined) data.user_id = dto.user_id;
    if (dto.location_name !== undefined) data.location_name = dto.location_name;
    if (dto.location_type !== undefined)
      data.location_type = dto.location_type as location_type_enum;
    if (dto.active !== undefined) data.active = dto.active;

    return this.db.teaches_at.update({ where: { id }, data });
  }

  async deleteTeachesAt(id: number): Promise<void> {
    const existing = await this.db.teaches_at.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("TeachesAt record not found");
    await this.db.teaches_at.delete({ where: { id } });
  }
}

export const teachesAtService = new TeachesAtService();
