import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import { CreateSubjectDto, UpdateSubjectDto } from "../dtos/subject.dto";
import { subjects } from "../generated/prisma/client";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../libs/errors";

class SubjectsService {
  constructor(private db: PrismaClient = prisma) {}

  async createSubject(dto: CreateSubjectDto): Promise<subjects> {
    const existing = await this.db.subjects.findFirst({
      where: { title: dto.title },
    });
    if (existing)
      throw new ConflictError("Subject with this title already exists");

    const s = await this.db.subjects.create({
      data: { title: dto.title, active: dto.active ?? true },
    });
    return s;
  }

  async getAllSubjects(filters?: { active?: boolean }): Promise<subjects[]> {
    const where: any = {};
    if (filters?.active !== undefined) where.active = filters.active;
    return this.db.subjects.findMany({ where, orderBy: { title: "asc" } });
  }

  async getSubjectById(id: number): Promise<subjects> {
    const s = await this.db.subjects.findUnique({ where: { id } });
    if (!s) throw new NotFoundError("Subject not found");
    return s;
  }

  async updateSubject(id: number, dto: UpdateSubjectDto): Promise<subjects> {
    const s = await this.db.subjects.findUnique({ where: { id } });
    if (!s) throw new NotFoundError("Subject not found");

    if (dto.title && dto.title !== s.title) {
      const existing = await this.db.subjects.findFirst({
        where: { title: dto.title },
      });
      if (existing)
        throw new ConflictError("Subject with this title already exists");
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.active !== undefined) data.active = dto.active;

    return this.db.subjects.update({ where: { id }, data });
  }

  async deleteSubject(id: number): Promise<void> {
    const s = await this.db.subjects.findUnique({ where: { id } });
    if (!s) throw new NotFoundError("Subject not found");

    // Prevent delete when related teachers exist
    const teacherCount = await this.db.teachers.count({
      where: { subject_id: id },
    });
    if (teacherCount > 0)
      throw new BadRequestError(
        "Cannot delete subject while related teachers exist",
      );

    await this.db.subjects.delete({ where: { id } });
  }
}

export const subjectsService = new SubjectsService();
