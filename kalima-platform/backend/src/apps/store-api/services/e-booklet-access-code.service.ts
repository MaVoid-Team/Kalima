import crypto from "crypto";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../../libs/errors";

export type EBookletAccessCodeKind = "paid" | "free";
const ACCESS_CODE_FORMATTING_CHARS = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;
const DEFAULT_ACCESS_CODE_SETTINGS = {
  default_access_code_kind: "paid" as EBookletAccessCodeKind,
  max_bulk_access_codes: 100,
  default_access_code_expiration_days: null as number | null,
  require_terms_for_code_generation: true,
};

function getAccessCodeSecret(): string {
  const secret = process.env.E_BOOKLET_ACCESS_CODE_SECRET || process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("E_BOOKLET_ACCESS_CODE_SECRET, ACCESS_TOKEN_SECRET, or JWT_SECRET is required");
  }
  return "dev-e-booklet-access-code-secret";
}

export function hashEBookletAccessCode(code: string): string {
  return crypto
    .createHmac("sha256", getAccessCodeSecret())
    .update(code.replace(ACCESS_CODE_FORMATTING_CHARS, "").trim().toUpperCase())
    .digest("hex");
}

function generatePlainCode(): string {
  return `KLM-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

function codeHint(code: string): string {
  return code.slice(-4);
}

function redemptionUrl(): string {
  const base = (process.env.APP_URL || process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${base}/e-booklet-code`;
}

function isolateLtr(value: string): string {
  return `\u2066${value}\u2069`;
}

function arabicWhatsAppMessage(code: string, url: string): string {
  return `رابط المذكرة التفاعلية: ${isolateLtr(url)}\nكود الدخول: ${isolateLtr(code)}\nافتح الرابط ثم أدخل الكود مرة واحدة لتفعيل الوصول.`;
}

export class EBookletAccessCodeService {
  constructor(private readonly db: any) {}

  private async getSettings() {
    if (!this.db.e_booklet_global_settings?.upsert) return DEFAULT_ACCESS_CODE_SETTINGS;
    const settings = await this.db.e_booklet_global_settings.upsert({
      where: { id: 1 },
      create: { id: 1, ...DEFAULT_ACCESS_CODE_SETTINGS },
      update: {},
    });
    return { ...DEFAULT_ACCESS_CODE_SETTINGS, ...settings };
  }

  private normalizeKind(kind: EBookletAccessCodeKind | null | undefined, settings: any): EBookletAccessCodeKind {
    if (kind) return kind;
    return settings.default_access_code_kind === "free" ? "free" : "paid";
  }

  private normalizeCount(count: number | null | undefined, settings: any): number {
    if (count === undefined || count === null) return 1;
    const maxBulkAccessCodes = Number(settings.max_bulk_access_codes ?? 100);
    if (!Number.isInteger(count) || count < 1 || !Number.isInteger(maxBulkAccessCodes) || count > maxBulkAccessCodes) {
      throw new BadRequestError(`Invalid access code count. Count must be between 1 and ${maxBulkAccessCodes}.`);
    }
    return count;
  }

  private async assertAcceptedGenerationTerms(teacherId: number, termId: number) {
    const now = new Date();
    const term = await this.db.e_booklet_terms.findFirst({
      where: {
        id: termId,
        status: "active",
        starts_at: { lte: now },
        OR: [{ ends_at: null }, { ends_at: { gt: now } }],
      },
    });
    if (!term) throw new NotFoundError("Active e-booklet terms not found.");

    const acceptance = await this.db.e_booklet_teacher_terms_acceptances.findFirst({
      where: {
        teacher_id: teacherId,
        term_id: termId,
        acceptance_type: "code_generation",
      },
    });
    if (!acceptance) {
      throw new ForbiddenError("Code-generation terms must be accepted before generating e-booklet codes.");
    }
    return term;
  }

  private async assertTeacherOwnsInstance(teacherId: number, bookletInstanceId: number) {
    const instance = await this.db.e_booklet_instances.findFirst({
      where: { id: bookletInstanceId, teacher_id: teacherId, status: "active" },
      include: { template: true },
    });
    if (!instance) throw new NotFoundError("E-booklet instance not found.");
    return instance;
  }

  private assertTermMatchesInstance(term: any, instance: any) {
    if (term.template_id !== null && term.template_id !== undefined && Number(term.template_id) !== Number(instance.template_id)) {
      throw new BadRequestError("Terms do not match this e-booklet template.");
    }
  }

  private sanitizeCodeRecord(record: any) {
    if (!record) return record;
    const { code_hash: _codeHash, ...safeRecord } = record;
    return safeRecord;
  }

  private async auditSafely(data: Record<string, unknown>) {
    if (!this.db.e_booklet_audit_logs?.create) return;
    try {
      await this.db.e_booklet_audit_logs.create({ data });
    } catch {
      // Access-code generation must not fail after the code is created because audit logging is unavailable.
    }
  }

  private async assertPaidSeatCapacity(instance: any, input: { teacherId: number; bookletInstanceId: number; kind: EBookletAccessCodeKind; requiredSeats: number }) {
    if (input.kind !== "paid") return;
    if (instance.invite_quota === null || instance.invite_quota === undefined) return;
    const inviteQuota = Number(instance.invite_quota ?? 0);
    const reserved = await this.db.e_booklet_access_codes.aggregate({
      where: {
        booklet_instance_id: input.bookletInstanceId,
        teacher_id: input.teacherId,
        kind: "paid",
        status: { in: ["active", "redeemed"] },
      },
      _sum: { max_redemptions: true },
    });
    const reservedSeats = Number(reserved?._sum?.max_redemptions ?? 0);
    if (reservedSeats + input.requiredSeats > inviteQuota) {
      throw new ConflictError("Not enough available student seats to generate paid e-booklet access codes.");
    }
  }

  private parseExpiresAt(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    const expiresAt = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(expiresAt.getTime())) throw new BadRequestError("Invalid expiration date.");
    if (expiresAt.getTime() <= Date.now()) throw new BadRequestError("Expiration date must be in the future.");
    return expiresAt;
  }

  private defaultExpiresAt(settings: any): Date | null {
    const days = Number(settings.default_access_code_expiration_days);
    if (!Number.isInteger(days) || days < 0) return null;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  async generateCode(input: {
    bookletInstanceId: number;
    teacherId: number;
    kind?: EBookletAccessCodeKind;
    termId: number;
    expiresAt?: Date | string | null;
    maxRedemptions?: number | null;
    adminActorId?: number | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    skipCapacityCheck?: boolean;
  }) {
    const settings = await this.getSettings();
    const kind = this.normalizeKind(input.kind, settings);
    if (!input.termId) throw new BadRequestError("Active terms are required to generate e-booklet codes.");
    const term = input.adminActorId
      ? await this.db.e_booklet_terms.findFirst({
        where: {
          id: input.termId,
          status: "active",
          starts_at: { lte: new Date() },
          OR: [{ ends_at: null }, { ends_at: { gt: new Date() } }],
        },
      })
      : settings.require_terms_for_code_generation === false
        ? await this.db.e_booklet_terms.findFirst({
          where: {
            id: input.termId,
            status: "active",
            starts_at: { lte: new Date() },
            OR: [{ ends_at: null }, { ends_at: { gt: new Date() } }],
          },
        })
        : await this.assertAcceptedGenerationTerms(input.teacherId, input.termId);
    if (!term) throw new NotFoundError("Active e-booklet terms not found.");
    const instance = await this.assertTeacherOwnsInstance(input.teacherId, input.bookletInstanceId);
    this.assertTermMatchesInstance(term, instance);

    const maxRedemptions = input.maxRedemptions ?? (kind === "paid" ? 1 : 999999);
    const expiresAt = input.expiresAt === undefined ? this.defaultExpiresAt(settings) : this.parseExpiresAt(input.expiresAt);
    if (!Number.isInteger(maxRedemptions) || maxRedemptions < 1) {
      throw new BadRequestError("Invalid max redemptions.");
    }
    if (!input.skipCapacityCheck) {
      await this.assertPaidSeatCapacity(instance, {
        teacherId: input.teacherId,
        bookletInstanceId: input.bookletInstanceId,
        kind,
        requiredSeats: maxRedemptions,
      });
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generatePlainCode();
      const codeHash = hashEBookletAccessCode(code);
      const existing = await this.db.e_booklet_access_codes.findUnique({
        where: { code_hash: codeHash },
      });
      if (existing) continue;

      const record = await this.db.e_booklet_access_codes.create({
        data: {
          booklet_instance_id: input.bookletInstanceId,
          term_id: input.termId,
          teacher_id: input.teacherId,
          code_hash: codeHash,
          code_hint: codeHint(code),
          kind,
          status: "active",
          max_redemptions: maxRedemptions,
          redeemed_count: 0,
          expires_at: expiresAt,
        },
      });
      if (input.adminActorId) {
        await this.auditSafely({
          actor_user_id: input.adminActorId,
          action: "admin_generate_free_access_code",
          entity_type: "e_booklet_access_code",
          entity_id: record.id,
          metadata_json: {
            teacher_id: input.teacherId,
            booklet_instance_id: input.bookletInstanceId,
            term_id: input.termId,
            kind,
          },
          ip_address: input.ipAddress ?? null,
          user_agent: input.userAgent ?? null,
        });
      }
      const url = redemptionUrl();
      return { code, redeemUrl: url, whatsappMessage: arabicWhatsAppMessage(code, url), record: this.sanitizeCodeRecord(record) };
    }

    throw new ConflictError("Unable to generate a unique e-booklet access code.");
  }

  async generateCodes(input: {
    bookletInstanceId: number;
    teacherId: number;
    kind?: EBookletAccessCodeKind;
    termId: number;
    count?: number | null;
    expiresAt?: Date | string | null;
    maxRedemptions?: number | null;
    adminActorId?: number | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const settings = await this.getSettings();
    const kind = this.normalizeKind(input.kind, settings);
    const count = this.normalizeCount(input.count, settings);
    const term = input.adminActorId
      ? await this.db.e_booklet_terms.findFirst({
        where: {
          id: input.termId,
          status: "active",
          starts_at: { lte: new Date() },
          OR: [{ ends_at: null }, { ends_at: { gt: new Date() } }],
        },
      })
      : settings.require_terms_for_code_generation === false
        ? await this.db.e_booklet_terms.findFirst({
          where: {
            id: input.termId,
            status: "active",
            starts_at: { lte: new Date() },
            OR: [{ ends_at: null }, { ends_at: { gt: new Date() } }],
          },
        })
        : await this.assertAcceptedGenerationTerms(input.teacherId, input.termId);
    if (!term) throw new NotFoundError("Active e-booklet terms not found.");
    const instance = await this.assertTeacherOwnsInstance(input.teacherId, input.bookletInstanceId);
    this.assertTermMatchesInstance(term, instance);
    const maxRedemptions = input.maxRedemptions ?? (kind === "paid" ? 1 : 999999);
    if (!Number.isInteger(maxRedemptions) || maxRedemptions < 1) {
      throw new BadRequestError("Invalid max redemptions.");
    }
    await this.assertPaidSeatCapacity(instance, {
      teacherId: input.teacherId,
      bookletInstanceId: input.bookletInstanceId,
      kind,
      requiredSeats: count * maxRedemptions,
    });
    const codes = [];
    for (let index = 0; index < count; index += 1) {
      codes.push(await this.generateCode({ ...input, kind, maxRedemptions, skipCapacityCheck: true }));
    }
    return { count: codes.length, codes };
  }

  async listCodes(filters: { teacherId?: number; bookletInstanceId?: number; termId?: number; kind?: EBookletAccessCodeKind; status?: string } = {}) {
    const records = await this.db.e_booklet_access_codes.findMany({
      where: {
        ...(filters.teacherId ? { teacher_id: filters.teacherId } : {}),
        ...(filters.bookletInstanceId ? { booklet_instance_id: filters.bookletInstanceId } : {}),
        ...(filters.termId ? { term_id: filters.termId } : {}),
        ...(filters.kind ? { kind: filters.kind } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { created_at: "desc" },
    });
    return records.map((record: any) => this.sanitizeCodeRecord(record));
  }
}
