import type { PrismaClient } from "../../../libs/db/prisma";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../../libs/errors";
import { hashInviteToken } from "../utils/e-booklet-token";

type EBookletDb = PrismaClient | any;

export interface PageDimensions {
  width: number;
  height: number;
}

export interface ValidateTeacherDocumentInput {
  templateVersionId: number;
  uploadedPageCount: number;
  uploadedPageDimensions?: PageDimensions[];
}

export interface AcceptInviteMeta {
  ipAddress?: string;
  userAgent?: string;
}

function resolveDefaultPrisma(): PrismaClient {
  // Lazy require keeps service unit tests from needing DATABASE_URL.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("../../../libs/db/prisma").prisma;
}

function dimensionsDiffer(
  expected?: PageDimensions[] | null,
  uploaded?: PageDimensions[],
): boolean {
  if (!expected?.length || !uploaded?.length) return false;
  if (expected.length !== uploaded.length) return true;

  return expected.some((dimension, index) => {
    const uploadedDimension = uploaded[index];
    if (!uploadedDimension) return true;
    return (
      Number(dimension.width) !== Number(uploadedDimension.width) ||
      Number(dimension.height) !== Number(uploadedDimension.height)
    );
  });
}

export class EBookletService {
  constructor(private readonly db: EBookletDb = resolveDefaultPrisma()) {}

  private buildSlug(title: string): string {
    const base = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return base || `e-booklet-${Date.now()}`;
  }

  async listPublishedTemplates(filters: {
    search?: string;
    categoryId?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { status: "published" };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters.categoryId) {
      where.category_id = filters.categoryId;
    }

    const [data, total] = await Promise.all([
      this.db.e_booklet_templates.findMany({
        where,
        include: {
          cover_file: true,
          category: { select: { id: true, title: true } },
          versions: {
            where: { status: "active" },
            orderBy: { version_number: "desc" },
            take: 1,
            include: { _count: { select: { hotspots: true } } },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.e_booklet_templates.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getPublishedTemplateBySlug(slug: string): Promise<unknown> {
    const template = await this.db.e_booklet_templates.findFirst({
      where: { slug, status: "published" },
      include: {
        cover_file: true,
        category: { select: { id: true, title: true } },
        versions: {
          where: { status: "active" },
          orderBy: { version_number: "desc" },
          take: 1,
          include: { _count: { select: { hotspots: true } } },
        },
      },
    });
    if (!template) throw new NotFoundError("E-booklet template not found");
    return template;
  }

  async listAdminTemplates(filters: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.e_booklet_templates.findMany({
        where,
        include: {
          cover_file: true,
          category: { select: { id: true, title: true } },
          versions: { orderBy: { version_number: "desc" }, take: 1 },
          _count: { select: { purchases: true } },
        },
        orderBy: { updated_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.e_booklet_templates.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async createTemplate(dto: any, adminUserId: number): Promise<unknown> {
    const slug = dto.slug || this.buildSlug(dto.title);
    return this.db.e_booklet_templates.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        price: dto.price,
        currency: dto.currency || "EGP",
        category_id: dto.category_id,
        status: dto.status || "draft",
        created_by: adminUserId,
      },
      include: {
        cover_file: true,
        category: { select: { id: true, title: true } },
      },
    });
  }

  async getTemplateById(id: number): Promise<unknown> {
    const template = await this.db.e_booklet_templates.findUnique({
      where: { id },
      include: {
        cover_file: true,
        versions: { orderBy: { version_number: "desc" } },
      },
    });
    if (!template) throw new NotFoundError("E-booklet template not found");
    return template;
  }

  async updateTemplate(id: number, dto: any): Promise<unknown> {
    return this.db.e_booklet_templates.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }

  async createTemplateVersion(
    templateId: number,
    dto: any,
    adminUserId: number,
  ): Promise<unknown> {
    const latest = await this.db.e_booklet_template_versions.findFirst({
      where: { template_id: templateId },
      orderBy: { version_number: "desc" },
      select: { version_number: true },
    });

    return this.db.e_booklet_template_versions.create({
      data: {
        template_id: templateId,
        version_number: (latest?.version_number ?? 0) + 1,
        base_document_file_id: dto.base_document_file_id,
        rendered_document_file_id: dto.rendered_document_file_id,
        page_count: dto.page_count,
        page_dimensions_json: dto.page_dimensions_json,
        status: "draft",
        created_by: adminUserId,
      },
    });
  }

  async publishTemplateVersion(versionId: number): Promise<unknown> {
    const version = await this.db.e_booklet_template_versions.findUnique({
      where: { id: versionId },
      select: { id: true, template_id: true },
    });
    if (!version) throw new NotFoundError("E-booklet template version not found");

    return this.db.$transaction(async (tx: EBookletDb) => {
      await tx.e_booklet_template_versions.updateMany({
        where: { template_id: version.template_id, status: "active" },
        data: { status: "archived" },
      });
      const published = await tx.e_booklet_template_versions.update({
        where: { id: versionId },
        data: { status: "active", published_at: new Date() },
      });
      await tx.e_booklet_templates.update({
        where: { id: version.template_id },
        data: { status: "published", updated_at: new Date() },
      });
      return published;
    });
  }

  async createHotspot(dto: any, adminUserId: number): Promise<unknown> {
    return this.db.e_booklet_hotspots.create({
      data: {
        template_version_id: dto.template_version_id,
        page_number: dto.page_number,
        x_percent: dto.x_percent,
        y_percent: dto.y_percent,
        radius_percent: dto.radius_percent,
        type: dto.type,
        title: dto.title,
        text_content: dto.text_content,
        asset_file_id: dto.asset_file_id,
        trigger_type: dto.trigger_type || "click",
        display_behavior: dto.display_behavior,
        created_by: adminUserId,
      },
    });
  }

  async updateHotspot(
    hotspotId: number,
    dto: any,
    adminUserId: number,
  ): Promise<unknown> {
    return this.db.e_booklet_hotspots.update({
      where: { id: hotspotId },
      data: {
        ...dto,
        updated_by: adminUserId,
        updated_at: new Date(),
      },
    });
  }

  async deleteHotspot(hotspotId: number, adminUserId: number): Promise<unknown> {
    return this.db.e_booklet_hotspots.update({
      where: { id: hotspotId },
      data: {
        is_active: false,
        updated_by: adminUserId,
        updated_at: new Date(),
      },
    });
  }

  async createPurchaseRequest(teacherId: number, dto: any): Promise<unknown> {
    return this.db.e_booklet_purchases.create({
      data: {
        teacher_id: teacherId,
        template_id: dto.template_id,
        template_version_id: dto.template_version_id,
        price: dto.price ?? 0,
        currency: dto.currency || "EGP",
        branding_json: dto.branding_json,
        admin_notes: dto.notes,
        status: "pending",
      },
    });
  }

  async listPurchases(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: unknown[]; total: number; page: number; limit: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = filters.status ? { status: filters.status } : {};
    const [data, total] = await Promise.all([
      this.db.e_booklet_purchases.findMany({
        where,
        include: {
          teacher: { select: { id: true, name: true, email: true, phone: true } },
          template: true,
          template_version: true,
          instances: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.e_booklet_purchases.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async getPurchase(id: number): Promise<unknown> {
    const purchase = await this.db.e_booklet_purchases.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true, email: true, phone: true } },
        template: true,
        template_version: true,
        instances: true,
      },
    });
    if (!purchase) throw new NotFoundError("E-booklet purchase not found");
    return purchase;
  }

  async updatePurchaseStatus(id: number, status: string, adminNotes?: string) {
    return this.db.e_booklet_purchases.update({
      where: { id },
      data: {
        status,
        admin_notes: adminNotes,
        updated_at: new Date(),
      },
    });
  }

  async deliverPurchase(purchaseId: number, dto: any, adminUserId: number) {
    const purchase = await this.db.e_booklet_purchases.findUnique({
      where: { id: purchaseId },
    });
    if (!purchase) throw new NotFoundError("E-booklet purchase not found");

    await this.validateTeacherDocumentForDelivery({
      templateVersionId: purchase.template_version_id,
      uploadedPageCount: dto.page_count,
      uploadedPageDimensions: dto.page_dimensions,
    });

    return this.db.$transaction(async (tx: EBookletDb) => {
      const instance = await tx.e_booklet_instances.create({
        data: {
          purchase_id: purchase.id,
          teacher_id: purchase.teacher_id,
          template_id: purchase.template_id,
          template_version_id: purchase.template_version_id,
          custom_document_file_id: dto.custom_document_file_id,
          display_title: dto.display_title,
          branding_json: purchase.branding_json,
          invite_quota: dto.invite_quota,
          status: "active",
        },
      });

      await tx.e_booklet_access.create({
        data: {
          booklet_instance_id: instance.id,
          user_id: purchase.teacher_id,
          role: "teacher",
          status: "active",
        },
      });

      await tx.e_booklet_purchases.update({
        where: { id: purchase.id },
        data: { status: "ready", updated_at: new Date() },
      });

      await tx.e_booklet_audit_logs.create({
        data: {
          actor_user_id: adminUserId,
          action: "booklet_delivered",
          entity_type: "e_booklet_instance",
          entity_id: instance.id,
          metadata_json: { purchase_id: purchase.id },
        },
      });

      return instance;
    });
  }

  async listInstances(filters: {
    teacherId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (filters.teacherId) where.teacher_id = filters.teacherId;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.db.e_booklet_instances.findMany({
        where,
        include: {
          template: true,
          template_version: true,
          teacher: { select: { id: true, name: true, email: true } },
          _count: { select: { access_records: true, invites: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      this.db.e_booklet_instances.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async updateQuota(instanceId: number, inviteQuota: number): Promise<unknown> {
    return this.db.e_booklet_instances.update({
      where: { id: instanceId },
      data: { invite_quota: inviteQuota, updated_at: new Date() },
    });
  }

  async createInvite(instanceId: number, teacherId: number, dto: any) {
    const instance = await this.db.e_booklet_instances.findFirst({
      where: { id: instanceId, teacher_id: teacherId, status: "active" },
    });
    if (!instance) throw new NotFoundError("Teacher e-booklet not found");

    const { generateInviteToken } = await import("../utils/e-booklet-token");
    const token = generateInviteToken();
    const invite = await this.db.e_booklet_invites.create({
      data: {
        booklet_instance_id: instanceId,
        teacher_id: teacherId,
        token_hash: hashInviteToken(token),
        max_uses: dto.max_uses,
        expires_at: dto.expires_at ? new Date(dto.expires_at) : undefined,
        status: "active",
      },
    });
    return { invite, token };
  }

  async listInvites(instanceId: number, teacherId: number): Promise<unknown[]> {
    return this.db.e_booklet_invites.findMany({
      where: { booklet_instance_id: instanceId, teacher_id: teacherId },
      orderBy: { created_at: "desc" },
    });
  }

  async disableInvite(inviteId: number, teacherId: number): Promise<unknown> {
    return this.db.e_booklet_invites.updateMany({
      where: { id: inviteId, teacher_id: teacherId },
      data: { status: "disabled" },
    });
  }

  async listInstanceStudents(instanceId: number, teacherId?: number) {
    const instanceWhere: Record<string, unknown> = { id: instanceId };
    if (teacherId) instanceWhere.teacher_id = teacherId;
    const instance = await this.db.e_booklet_instances.findFirst({
      where: instanceWhere,
      select: { id: true },
    });
    if (!instance) throw new NotFoundError("Teacher e-booklet not found");

    return this.db.e_booklet_access.findMany({
      where: {
        booklet_instance_id: instanceId,
        role: "student",
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { granted_at: "desc" },
    });
  }

  async revokeStudentAccess(
    instanceId: number,
    studentId: number,
    actorUserId: number,
  ): Promise<unknown> {
    const revokedAt = new Date();
    await this.db.e_booklet_audit_logs.create({
      data: {
        actor_user_id: actorUserId,
        action: "student_access_revoked",
        entity_type: "e_booklet_instance",
        entity_id: instanceId,
        metadata_json: { student_id: studentId },
      },
    });
    return this.db.e_booklet_access.updateMany({
      where: {
        booklet_instance_id: instanceId,
        user_id: studentId,
        role: "student",
        status: "active",
      },
      data: { status: "revoked", revoked_at: revokedAt },
    });
  }

  async listUserEBooklets(userId: number, role: "teacher" | "student") {
    return this.db.e_booklet_access.findMany({
      where: {
        user_id: userId,
        role,
        status: "active",
      },
      include: {
        booklet_instance: {
          include: {
            template: true,
            teacher: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { granted_at: "desc" },
    });
  }

  async assertViewerAccess(instanceId: number, userId: number) {
    const access = await this.db.e_booklet_access.findFirst({
      where: {
        booklet_instance_id: instanceId,
        user_id: userId,
        status: "active",
      },
      include: {
        booklet_instance: {
          include: {
            template: true,
            template_version: true,
            teacher: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!access || access.booklet_instance?.status !== "active") {
      throw new ForbiddenError("You do not have access to this e-booklet.");
    }
    return access;
  }

  async getViewerMetadata(instanceId: number, userId: number) {
    const access = await this.assertViewerAccess(instanceId, userId);
    await this.db.e_booklet_audit_logs.create({
      data: {
        actor_user_id: userId,
        action: "booklet_opened",
        entity_type: "e_booklet_instance",
        entity_id: instanceId,
      },
    });
    return access;
  }

  async getViewerPage(instanceId: number, pageNumber: number, userId: number) {
    await this.assertViewerAccess(instanceId, userId);
    await this.db.e_booklet_audit_logs.create({
      data: {
        actor_user_id: userId,
        action: "page_viewed",
        entity_type: "e_booklet_instance",
        entity_id: instanceId,
        metadata_json: { page_number: pageNumber },
      },
    });
    return {
      pageNumber,
      renderMode: "server-page",
      message: "Page rendering pipeline is pending document renderer integration.",
    };
  }

  async getViewerPageHotspots(
    instanceId: number,
    pageNumber: number,
    userId: number,
  ) {
    const access: any = await this.assertViewerAccess(instanceId, userId);
    return this.db.e_booklet_hotspots.findMany({
      where: {
        template_version_id: access.booklet_instance.template_version_id,
        page_number: pageNumber,
        is_active: true,
      },
      orderBy: { sort_order: "asc" },
    });
  }

  async getHotspotContent(hotspotId: number, userId: number) {
    const hotspot = await this.db.e_booklet_hotspots.findUnique({
      where: { id: hotspotId },
      include: {
        asset_file: true,
        template_version: {
          include: {
            instances: {
              where: {
                access_records: {
                  some: { user_id: userId, status: "active" },
                },
              },
              take: 1,
            },
          },
        },
      },
    });
    if (!hotspot || !hotspot.template_version.instances.length) {
      throw new ForbiddenError("You do not have access to this hotspot.");
    }
    return hotspot;
  }

  async validateTeacherDocumentForDelivery(
    input: ValidateTeacherDocumentInput,
  ): Promise<{ valid: true; warnings: string[] }> {
    const templateVersion = await this.db.e_booklet_template_versions.findUnique({
      where: { id: input.templateVersionId },
      select: {
        id: true,
        page_count: true,
        page_dimensions_json: true,
      },
    });

    if (!templateVersion) {
      throw new NotFoundError("E-booklet template version not found");
    }

    if (templateVersion.page_count !== input.uploadedPageCount) {
      throw new BadRequestError(
        `This file does not match the selected e-booklet template. Expected: ${templateVersion.page_count} pages. Uploaded file: ${input.uploadedPageCount} pages. Please upload a file with the same number of pages.`,
      );
    }

    const expectedDimensions =
      templateVersion.page_dimensions_json as PageDimensions[] | null;
    const warnings: string[] = [];

    if (dimensionsDiffer(expectedDimensions, input.uploadedPageDimensions)) {
      warnings.push(
        "This file has the same page count, but some page dimensions differ from the template. Hotspot positions may not align correctly.",
      );
    }

    return { valid: true, warnings };
  }

  async acceptInvite(
    rawToken: string,
    studentId: number,
    meta: AcceptInviteMeta = {},
  ): Promise<{
    alreadyHadAccess: boolean;
    access: unknown;
    bookletInstanceId: number;
  }> {
    const tokenHash = hashInviteToken(rawToken);

    return this.db.$transaction(async (tx: EBookletDb) => {
      const invite = await tx.e_booklet_invites.findFirst({
        where: { token_hash: tokenHash },
        include: {
          booklet_instance: {
            select: {
              id: true,
              invite_quota: true,
              status: true,
            },
          },
        },
      });

      if (!invite) {
        throw new NotFoundError("E-booklet invite not found");
      }
      if (invite.status !== "active") {
        throw new ForbiddenError("This e-booklet invite is not active.");
      }
      if (invite.expires_at && new Date(invite.expires_at) <= new Date()) {
        throw new ForbiddenError("This e-booklet invite has expired.");
      }
      if (
        invite.max_uses !== null &&
        invite.max_uses !== undefined &&
        invite.used_count >= invite.max_uses
      ) {
        throw new ForbiddenError(
          "This e-booklet invite has reached its access limit.",
        );
      }

      const bookletInstance =
        invite.booklet_instance ?? invite.e_booklet_instances;
      if (!bookletInstance || bookletInstance.status !== "active") {
        throw new ForbiddenError("This e-booklet is not currently active.");
      }

      const existingAccess = await tx.e_booklet_access.findFirst({
        where: {
          booklet_instance_id: invite.booklet_instance_id,
          user_id: studentId,
          role: "student",
          status: "active",
        },
      });

      if (existingAccess) {
        return {
          alreadyHadAccess: true,
          access: existingAccess,
          bookletInstanceId: invite.booklet_instance_id,
        };
      }

      const activeStudentAccessCount = await tx.e_booklet_access.count({
        where: {
          booklet_instance_id: invite.booklet_instance_id,
          role: "student",
          status: "active",
        },
      });

      if (activeStudentAccessCount >= bookletInstance.invite_quota) {
        throw new ForbiddenError(
          "This e-booklet invite has reached its access limit.",
        );
      }

      const access = await tx.e_booklet_access.create({
        data: {
          booklet_instance_id: invite.booklet_instance_id,
          user_id: studentId,
          role: "student",
          source_invite_id: invite.id,
          status: "active",
        },
      });

      await tx.e_booklet_invite_redemptions.create({
        data: {
          invite_id: invite.id,
          booklet_instance_id: invite.booklet_instance_id,
          student_id: studentId,
          ip_address: meta.ipAddress,
          user_agent: meta.userAgent,
        },
      });

      await tx.e_booklet_invites.update({
        where: { id: invite.id },
        data: { used_count: { increment: 1 } },
      });

      await tx.e_booklet_instances.update({
        where: { id: invite.booklet_instance_id },
        data: { used_invites_count: { increment: 1 } },
      });

      await tx.e_booklet_audit_logs.create({
        data: {
          actor_user_id: studentId,
          action: "invite_redeemed",
          entity_type: "e_booklet_instance",
          entity_id: invite.booklet_instance_id,
          metadata_json: {
            invite_id: invite.id,
          },
          ip_address: meta.ipAddress,
          user_agent: meta.userAgent,
        },
      });

      return {
        alreadyHadAccess: false,
        access,
        bookletInstanceId: invite.booklet_instance_id,
      };
    });
  }

  async revokeTeacherAccess(
    bookletInstanceId: number,
    actorUserId: number,
    revokedAt = new Date(),
  ): Promise<void> {
    await this.db.e_booklet_instances.update({
      where: { id: bookletInstanceId },
      data: {
        status: "suspended",
        updated_at: revokedAt,
      },
    });

    await this.db.e_booklet_access.updateMany({
      where: {
        booklet_instance_id: bookletInstanceId,
        status: "active",
      },
      data: {
        status: "revoked",
        revoked_at: revokedAt,
      },
    });

    await this.db.e_booklet_audit_logs.create({
      data: {
        actor_user_id: actorUserId,
        action: "teacher_access_revoked",
        entity_type: "e_booklet_instance",
        entity_id: bookletInstanceId,
        metadata_json: {
          cascaded_student_access: true,
        },
      },
    });
  }
}

let serviceSingleton: EBookletService | null = null;

export function getEBookletService(): EBookletService {
  if (!serviceSingleton) {
    serviceSingleton = new EBookletService();
  }
  return serviceSingleton;
}
