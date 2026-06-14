import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { getEBookletService } from "../services/e-booklet.service";
import {
  AcceptEBookletInviteDto,
  CreateEBookletInviteDto,
  CreateEBookletTemplateDto,
  DeliverEBookletDto,
  EBookletCheckoutDto,
  PublicEBookletCheckoutDto,
  EBookletDeviceAllowanceDto,
  EBookletDeviceBindDto,
  EBookletInviteAccessPathDto,
  UpdateEBookletPurchaseStatusDto,
  UpdateEBookletQuotaDto,
  UpdateEBookletTemplateDto,
  UpsertEBookletHotspotDto,
} from "../dtos/e-booklet.dto";
import { BadRequestError, ValidationError } from "../../../libs/errors";

function normalizeMultipartEBookletBody(body: any) {
  const next = { ...(body || {}) };
  ["instance_id", "template_id", "template_version_id", "payment_method_id", "purchaseId", "paymentProofFileId"].forEach((key) => {
    if (next[key] !== undefined && next[key] !== null && next[key] !== "") next[key] = Number(next[key]);
  });
  ["terms_accepted", "termsAccepted"].forEach((key) => {
    if (next[key] !== undefined) next[key] = next[key] === true || next[key] === "true" || next[key] === "1";
  });
  return next;
}

async function validateDto<T extends object>(
  DtoClass: new () => T,
  body: unknown,
): Promise<T> {
  const dto = plainToInstance(DtoClass, body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    throw new ValidationError(
      errors.flatMap((err) => Object.values(err.constraints || {})),
    );
  }
  return dto;
}

function parseId(raw: string | string[] | undefined, label: string): number {
  const id = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestError(`Invalid ${label}`);
  }
  return id;
}

function parseOptionalId(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const id = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isInteger(id) || id <= 0) return undefined;
  return id;
}

function parseParam(raw: string | string[] | undefined, label: string): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    throw new BadRequestError(`Invalid ${label}`);
  }
  return value;
}

function currentUserId(req: Request): number {
  const userId = (req as any).user?.userId;
  if (!Number.isInteger(userId)) {
    throw new BadRequestError("Authenticated user id is missing");
  }
  return userId;
}

function pagination(req: Request) {
  return {
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  };
}

const ANALYTICS_SOURCES = new Set(["free_invite", "offline_passcode", "online_purchase", "invite_link", "qr_code", "teacher_share"]);

function parseOptionalPositiveInt(raw: unknown, label: string, max?: number): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isInteger(value) || value <= 0 || (max !== undefined && value > max)) {
    throw new BadRequestError(`Invalid ${label}`);
  }
  return value;
}

function parseOptionalIsoDate(raw: unknown, label: string): string | undefined {
  if (!raw) return undefined;
  const value = String(Array.isArray(raw) ? raw[0] : raw);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new BadRequestError(`Invalid ${label}`);
  return parsed.toISOString();
}

function analyticsFilters(req: Request) {
  const startDate = parseOptionalIsoDate(req.query.start_date, "start_date");
  const endDate = parseOptionalIsoDate(req.query.end_date, "end_date");
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new BadRequestError("start_date must be before end_date");
  }
  const source = req.query.source ? String(Array.isArray(req.query.source) ? req.query.source[0] : req.query.source) : undefined;
  if (source && !ANALYTICS_SOURCES.has(source)) throw new BadRequestError("Invalid analytics source");
  return {
    teacherId: parseOptionalPositiveInt(req.query.teacher_id, "teacher_id"),
    instanceId: parseOptionalPositiveInt(req.query.instance_id, "instance_id"),
    studentId: parseOptionalPositiveInt(req.query.student_id, "student_id"),
    startDate,
    endDate,
    source,
    limit: parseOptionalPositiveInt(req.query.limit, "limit", 10000),
  };
}

function inviteAnonymousSessionId(req: Request, res: Response): string {
  const cookieValue = String((req as any).cookies?.e_booklet_anon_session || "");
  const supplied = String(req.get("x-e-booklet-session") || req.query.session_id || cookieValue || "");
  const sessionId = /^[A-Za-z0-9._:-]{4,128}$/.test(supplied) ? supplied : crypto.randomUUID();
  res.cookie("e_booklet_anon_session", sessionId, { httpOnly: true, sameSite: "lax", maxAge: 180 * 24 * 60 * 60 * 1000 });
  return sessionId;
}

function setPrivateNoStore(res: Response) {
  res.set("Cache-Control", "private, no-store");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
}

export const eBookletController = {
  async uploadFileAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().createFileAsset(
        (req as any).file,
        {
          ownerType:
            typeof req.body?.owner_type === "string"
              ? req.body.owner_type
              : "admin",
          ownerId: parseOptionalId(req.body?.owner_id),
          fileType:
            typeof req.body?.file_type === "string" ? req.body.file_type : undefined,
        },
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async previewAdminFileAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { asset, absolutePath } =
        await getEBookletService().getPrivateFileAssetForAdmin(
          parseId(req.params.assetId, "file asset ID"),
        );
      setPrivateNoStore(res);
      res.type(asset.mime_type || "application/octet-stream");
      res.set(
        "Content-Disposition",
        `inline; filename="${String(asset.original_filename || "e-booklet-file").replace(/"/g, "")}"`,
      );
      res.sendFile(absolutePath);
    } catch (error) {
      next(error);
    }
  },

  async listStoreTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getEBookletService().listPublicInstances({
        search: req.query.search as string | undefined,
        categoryId: req.query.category_id
          ? parseInt(req.query.category_id as string, 10)
          : undefined,
        ...pagination(req),
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getStoreTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getPublicInstance(
        parseId(req.params.instanceId, "instance ID"),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createPublicCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(PublicEBookletCheckoutDto, normalizeMultipartEBookletBody(req.body));
      const data = await getEBookletService().createPublicCheckoutRequest(
        currentUserId(req),
        dto,
        (req as any).file,
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createPurchaseDeal(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(EBookletCheckoutDto, req.body);
      if (!dto.teacher_id) {
        throw new BadRequestError("Teacher ID is required for e-booklet deal creation.");
      }
      const data = await getEBookletService().createPurchaseRequest(
        dto.teacher_id,
        dto,
        currentUserId(req),
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listAdminTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getEBookletService().listAdminTemplates({
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
        ...pagination(req),
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async createTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(CreateEBookletTemplateDto, req.body);
      const data = await getEBookletService().createTemplate(
        dto,
        currentUserId(req),
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAdminTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getTemplateById(
        parseId(req.params.id, "template ID"),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(UpdateEBookletTemplateDto, req.body);
      const data = await getEBookletService().updateTemplate(
        parseId(req.params.id, "template ID"),
        dto,
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listTemplateVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().listTemplateVersions(
        parseId(req.params.id, "template ID"),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().createTemplateVersion(
        parseId(req.params.id, "template ID"),
        req.body,
        currentUserId(req),
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().updateTemplateVersion(
        parseId(req.params.versionId, "template version ID"),
        req.body,
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async publishVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().publishTemplateVersion(
        parseId(req.params.versionId, "template version ID"),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listVersionHotspots(req: Request, res: Response, next: NextFunction) {
    try {
      const pageNumber = req.query.page_number
        ? parseInt(req.query.page_number as string, 10)
        : undefined;
      const data = await getEBookletService().listVersionHotspots(
        parseId(req.params.versionId, "template version ID"),
        pageNumber,
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createHotspot(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(UpsertEBookletHotspotDto, req.body);
      const data = await getEBookletService().createHotspot(
        dto,
        currentUserId(req),
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updateHotspot(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().updateHotspot(
        parseId(req.params.hotspotId, "hotspot ID"),
        req.body,
        currentUserId(req),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async deleteHotspot(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().deleteHotspot(
        parseId(req.params.hotspotId, "hotspot ID"),
        currentUserId(req),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listPurchases(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getEBookletService().listPurchases({
        status: req.query.status as string | undefined,
        ...pagination(req),
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async getPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getPurchase(
        parseId(req.params.id, "purchase ID"),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async updatePurchaseStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(UpdateEBookletPurchaseStatusDto, req.body);
      const data = await getEBookletService().updatePurchaseStatus(
        parseId(req.params.id, "purchase ID"),
        dto.status,
        dto.admin_notes,
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async markPurchasePaid(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().updatePurchaseStatus(
        parseId(req.params.id, "purchase ID"),
        "paid",
        req.body?.admin_notes,
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async deliverPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(DeliverEBookletDto, req.body);
      const data = await getEBookletService().deliverPurchase(
        parseId(req.params.id, "purchase ID"),
        dto,
        currentUserId(req),
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listInstances(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await getEBookletService().listInstances({
        teacherId: req.query.teacher_id
          ? parseInt(req.query.teacher_id as string, 10)
          : undefined,
        status: req.query.status as string | undefined,
        ...pagination(req),
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async updateQuota(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(UpdateEBookletQuotaDto, req.body);
      const data = await getEBookletService().updateQuota(
        parseId(req.params.id, "instance ID"),
        dto.invite_quota,
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async revokeTeacherAccess(req: Request, res: Response, next: NextFunction) {
    try {
      await getEBookletService().revokeTeacherAccess(
        parseId(req.params.id, "instance ID"),
        currentUserId(req),
      );
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  async listTeacherEBooklets(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().listUserEBooklets(
        currentUserId(req),
        "teacher",
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listStudentEBooklets(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().listUserEBooklets(
        currentUserId(req),
        "student",
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listInvites(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().listInvites(
        parseId(req.params.instanceId, "instance ID"),
        currentUserId(req),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async createInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(CreateEBookletInviteDto, req.body);
      const data = await getEBookletService().createInvite(
        parseId(req.params.instanceId, "instance ID"),
        currentUserId(req),
        dto,
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async disableInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().disableInvite(
        parseId(req.params.inviteId, "invite ID"),
        currentUserId(req),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listInstanceStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().listInstanceStudents(
        parseId(req.params.instanceId, "instance ID"),
        req.path.startsWith("/admin/") ? undefined : currentUserId(req),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async revokeStudentAccess(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().revokeStudentAccess(
        parseId(req.params.instanceId, "instance ID"),
        parseId(req.params.studentId, "student ID"),
        currentUserId(req),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async recordInviteOpen(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().recordInviteOpen(
        parseParam(req.params.token, "invite token"),
        {
          anonymousSessionId: inviteAnonymousSessionId(req, res),
          source: req.query.source as string | undefined,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        },
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async teacherAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { teacherId: _ignored, studentId: _studentId, source: _source, ...filters } = analyticsFilters(req);
      const data = await getEBookletService().getTeacherAnalytics(currentUserId(req), filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async adminAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getAdminAnalytics(analyticsFilters(req));
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async exportAdminAnalyticsCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await getEBookletService().exportAdminAnalyticsCsv(analyticsFilters(req));
      res.type("text/csv");
      res.set("Content-Disposition", "attachment; filename=\"e-booklet-analytics.csv\"");
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  },

  async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const inviteToken = parseParam(req.params.token, "invite token");
      const dto = await validateDto(AcceptEBookletInviteDto, {
        ...normalizeMultipartEBookletBody(req.body),
        token: inviteToken,
      });
      const service = getEBookletService();
      const userId = currentUserId(req);
      let data;
      if (dto.accessPath === EBookletInviteAccessPathDto.free) {
        data = await service.acceptFreeInvite(inviteToken, userId, dto);
      } else if (dto.accessPath === EBookletInviteAccessPathDto.offline_passcode) {
        data = await service.acceptInvitePasscode(inviteToken, userId, dto, {
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          deviceFingerprint: req.get("x-e-booklet-device") || req.body?.deviceFingerprint,
        });
      } else if (dto.accessPath === EBookletInviteAccessPathDto.online_purchase) {
        data = await service.createStudentPurchaseLink(inviteToken, userId, dto, (req as any).file);
      } else {
        throw new BadRequestError("Invite accessPath is required.");
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getViewerMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getViewerMetadata(
        parseId(req.params.instanceId, "instance ID"),
        currentUserId(req),
      );
      setPrivateNoStore(res);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAdminViewerMetadata(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getAdminViewerMetadata(
        parseId(req.params.instanceId, "instance ID"),
        currentUserId(req),
      );
      setPrivateNoStore(res);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async bindViewerDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(EBookletDeviceBindDto, req.body);
      const data = await getEBookletService().bindViewerDevice(
        parseId(req.params.instanceId, "instance ID"),
        currentUserId(req),
        {
          deviceFingerprint: dto.deviceFingerprint,
          deviceLabel: dto.deviceLabel,
          userAgent: req.get("user-agent"),
          ipAddress: req.ip,
        },
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listViewerDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().listViewerDevices(
        parseId(req.params.instanceId, "instance ID"),
        parseId(req.params.userId, "user ID"),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async resetViewerDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().resetViewerDevices(
        parseId(req.params.instanceId, "instance ID"),
        parseId(req.params.userId, "user ID"),
        currentUserId(req),
        req.body?.reason,
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async addDeviceAllowance(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = await validateDto(EBookletDeviceAllowanceDto, req.body);
      const data = await getEBookletService().addDeviceAllowance(
        parseId(req.params.instanceId, "instance ID"),
        parseId(req.params.userId, "user ID"),
        currentUserId(req),
        dto.allowedDevices,
        dto.reason,
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async approveStudentPurchaseLink(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().approveStudentPurchaseLink(
        parseId(req.params.purchaseId, "purchase ID"),
        currentUserId(req),
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getViewerPage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getViewerPage(
        parseId(req.params.instanceId, "instance ID"),
        parseId(req.params.pageNumber, "page number"),
        currentUserId(req),
      );
      setPrivateNoStore(res);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAdminViewerPage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getAdminViewerPage(
        parseId(req.params.instanceId, "instance ID"),
        parseId(req.params.pageNumber, "page number"),
        currentUserId(req),
      );
      setPrivateNoStore(res);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getViewerPageHotspots(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getViewerPageHotspots(
        parseId(req.params.instanceId, "instance ID"),
        parseId(req.params.pageNumber, "page number"),
        currentUserId(req),
      );
      setPrivateNoStore(res);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAdminViewerPageHotspots(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getAdminViewerPageHotspots(
        parseId(req.params.instanceId, "instance ID"),
        parseId(req.params.pageNumber, "page number"),
      );
      setPrivateNoStore(res);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getHotspotContent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getHotspotContent(
        parseId(req.params.hotspotId, "hotspot ID"),
        currentUserId(req),
      );
      setPrivateNoStore(res);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAdminHotspotContent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await getEBookletService().getAdminHotspotContent(
        parseId(req.params.hotspotId, "hotspot ID"),
      );
      setPrivateNoStore(res);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async getAuthorizedHotspotAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { asset, absolutePath } = await getEBookletService().getAuthorizedHotspotAsset(
        parseId(req.params.hotspotId, "hotspot ID"),
        parseId(req.params.assetId, "asset ID"),
        currentUserId(req),
      );
      setPrivateNoStore(res);
      res.type(asset.mime_type || "application/octet-stream");
      res.set(
        "Content-Disposition",
        `inline; filename="${String(asset.original_filename || "e-booklet-file").replace(/"/g, "")}"`,
      );
      res.sendFile(absolutePath);
    } catch (error) {
      next(error);
    }
  },

  async getAdminAuthorizedHotspotAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { asset, absolutePath } = await getEBookletService().getAdminAuthorizedHotspotAsset(
        parseId(req.params.hotspotId, "hotspot ID"),
        parseId(req.params.assetId, "asset ID"),
      );
      setPrivateNoStore(res);
      res.type(asset.mime_type || "application/octet-stream");
      res.set(
        "Content-Disposition",
        `inline; filename="${String(asset.original_filename || "e-booklet-file").replace(/"/g, "")}"`,
      );
      res.sendFile(absolutePath);
    } catch (error) {
      next(error);
    }
  },
};
