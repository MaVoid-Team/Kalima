import crypto from "crypto";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../../../libs/errors";

export type EBookletAccessCodeKind = "paid" | "free";

function getAccessCodeSecret(): string {
  const secret = process.env.E_BOOKLET_ACCESS_CODE_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("E_BOOKLET_ACCESS_CODE_SECRET is not set");
  }
  return "dev-e-booklet-access-code-secret";
}

export function hashEBookletAccessCode(code: string): string {
  return crypto.createHmac("sha256", getAccessCodeSecret()).update(code.trim().toUpperCase()).digest("hex");
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

function arabicWhatsAppMessage(code: string, url: string): string {
  return `رابط البوكليت الإلكتروني: ${url}\nكود الدخول: ${code}\nافتح الرابط ثم أدخل الكود مرة واحدة لتفعيل الوصول.`;
}

export class EBookletAccessCodeService {
  constructor(private readonly db: any) {}

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

  private parseExpiresAt(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    const expiresAt = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(expiresAt.getTime())) throw new BadRequestError("Invalid expiration date.");
    if (expiresAt.getTime() <= Date.now()) throw new BadRequestError("Expiration date must be in the future.");
    return expiresAt;
  }

  async generateCode(input: {
    bookletInstanceId: number;
    teacherId: number;
    kind: EBookletAccessCodeKind;
    termId: number;
    expiresAt?: Date | string | null;
    maxRedemptions?: number | null;
    adminActorId?: number | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
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
      : await this.assertAcceptedGenerationTerms(input.teacherId, input.termId);
    if (!term) throw new NotFoundError("Active e-booklet terms not found.");
    const instance = await this.assertTeacherOwnsInstance(input.teacherId, input.bookletInstanceId);
    this.assertTermMatchesInstance(term, instance);

    const maxRedemptions = input.maxRedemptions ?? (input.kind === "paid" ? 1 : 999999);
    const expiresAt = this.parseExpiresAt(input.expiresAt);

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
          kind: input.kind,
          status: "active",
          max_redemptions: maxRedemptions,
          redeemed_count: 0,
          expires_at: expiresAt,
        },
      });
      if (input.adminActorId && this.db.e_booklet_audit_logs?.create) {
        await this.db.e_booklet_audit_logs.create({
          data: {
            actor_user_id: input.adminActorId,
            action: "admin_generate_free_access_code",
            entity_type: "e_booklet_access_code",
            entity_id: record.id,
            metadata_json: {
              teacher_id: input.teacherId,
              booklet_instance_id: input.bookletInstanceId,
              term_id: input.termId,
              kind: input.kind,
            },
            ip_address: input.ipAddress ?? null,
            user_agent: input.userAgent ?? null,
          },
        });
      }
      const url = redemptionUrl();
      return { code, redeemUrl: url, whatsappMessage: arabicWhatsAppMessage(code, url), record: this.sanitizeCodeRecord(record) };
    }

    throw new ConflictError("Unable to generate a unique e-booklet access code.");
  }

  async listCodes(filters: { teacherId?: number; bookletInstanceId?: number; termId?: number; kind?: EBookletAccessCodeKind } = {}) {
    return this.db.e_booklet_access_codes.findMany({
      where: {
        ...(filters.teacherId ? { teacher_id: filters.teacherId } : {}),
        ...(filters.bookletInstanceId ? { booklet_instance_id: filters.bookletInstanceId } : {}),
        ...(filters.termId ? { term_id: filters.termId } : {}),
        ...(filters.kind ? { kind: filters.kind } : {}),
      },
      orderBy: { created_at: "desc" },
    });
  }
}
