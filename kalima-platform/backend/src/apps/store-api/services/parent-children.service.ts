import type { PrismaClient } from "../../../libs/db/prisma";
import { prisma } from "../../../libs/db/prisma";
import {
  CreateParentChildDto,
  UpdateParentChildDto,
} from "../dtos/parent-children.dto";
import { parent_children } from "../generated/prisma/client";
import { NotFoundError, ConflictError } from "../../../libs/errors";

class ParentChildrenService {
  constructor(private db: PrismaClient = prisma) {}

  async createParentChild(dto: CreateParentChildDto): Promise<parent_children> {
    // verify parent exists
    const p = await this.db.parents.findUnique({
      where: { user_id: dto.parent_user_id },
    });
    if (!p) throw new NotFoundError("Parent not found");

    // verify student exists
    const s = await this.db.students.findUnique({
      where: { user_id: dto.student_user_id },
    });
    if (!s) throw new NotFoundError("Student not found");

    // unique check
    const existing = await this.db.parent_children.findFirst({
      where: {
        parent_user_id: dto.parent_user_id,
        student_user_id: dto.student_user_id,
      },
    });
    if (existing)
      throw new ConflictError("Parent-child relation already exists");

    const created = await this.db.parent_children.create({
      data: {
        parent_user_id: dto.parent_user_id!,
        student_user_id: dto.student_user_id,
      },
    });
    return created;
  }

  async getAllParentChildren(filters?: {
    parent_user_id?: number;
    student_user_id?: number;
  }): Promise<parent_children[]> {
    const where: any = {};
    if (filters?.parent_user_id !== undefined)
      where.parent_user_id = filters.parent_user_id;
    if (filters?.student_user_id !== undefined)
      where.student_user_id = filters.student_user_id;

    return this.db.parent_children.findMany({ where, orderBy: { id: "asc" } });
  }

  async getById(id: number): Promise<parent_children> {
    const item = await this.db.parent_children.findUnique({ where: { id } });
    if (!item) throw new NotFoundError("Parent-child record not found");
    return item;
  }

  async updateParentChild(
    id: number,
    dto: UpdateParentChildDto,
  ): Promise<parent_children> {
    const existing = await this.db.parent_children.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundError("Parent-child record not found");

    if (dto.parent_user_id !== undefined) {
      const p = await this.db.parents.findUnique({
        where: { user_id: dto.parent_user_id },
      });
      if (!p) throw new NotFoundError("Parent not found");
    }

    if (dto.student_user_id !== undefined) {
      const s = await this.db.students.findUnique({
        where: { user_id: dto.student_user_id },
      });
      if (!s) throw new NotFoundError("Student not found");
    }

    // if changing pair, ensure uniqueness
    const newParent = dto.parent_user_id ?? existing.parent_user_id;
    const newStudent = dto.student_user_id ?? existing.student_user_id;
    if (
      newParent !== existing.parent_user_id ||
      newStudent !== existing.student_user_id
    ) {
      const dup = await this.db.parent_children.findFirst({
        where: { parent_user_id: newParent, student_user_id: newStudent },
      });
      if (dup) throw new ConflictError("Parent-child relation already exists");
    }

    const data: any = {};
    if (dto.parent_user_id !== undefined)
      data.parent_user_id = dto.parent_user_id;
    if (dto.student_user_id !== undefined)
      data.student_user_id = dto.student_user_id;

    return this.db.parent_children.update({ where: { id }, data });
  }

  async deleteParentChild(id: number): Promise<void> {
    const existing = await this.db.parent_children.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundError("Parent-child record not found");
    await this.db.parent_children.delete({ where: { id } });
  }
}

export const parentChildrenService = new ParentChildrenService();
