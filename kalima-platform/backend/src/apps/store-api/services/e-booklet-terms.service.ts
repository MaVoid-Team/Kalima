import { BadRequestError, NotFoundError } from "../../../libs/errors";

type AcceptanceType = "code_generation" | "reward_claim";

export interface TermsMeta {
  ipAddress?: string;
  userAgent?: string;
  milestoneAchievementId?: number;
}

export class EBookletTermsService {
  constructor(private readonly db: any) {}

  private isUniqueConflict(error: any) {
    return error?.code === "P2002";
  }

  private parseStatus(status: unknown = "draft"): "draft" | "active" | "archived" {
    if (status === "draft" || status === "active" || status === "archived") return status;
    throw new BadRequestError("Invalid e-booklet terms status.");
  }

  private parseDate(value: Date | string | undefined | null, label: string, required = true): Date | null {
    if (value === undefined || value === null || value === "") {
      if (required) throw new BadRequestError(`Invalid ${label}.`);
      return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) throw new BadRequestError(`Invalid ${label}.`);
    return date;
  }

  private assertDateWindow(startsAt: Date, endsAt: Date | null) {
    if (endsAt && endsAt <= startsAt) throw new BadRequestError("Terms end date must be after start date.");
  }

  private assertCurrentWindow(startsAt: Date, endsAt: Date | null) {
    const now = new Date();
    if (startsAt > now) throw new BadRequestError("Terms cannot be activated before their start date.");
    if (endsAt && endsAt <= now) throw new BadRequestError("Expired terms cannot be activated.");
  }

  async createTerms(
    input: {
      name: string;
      description?: string | null;
      templateId?: number | null;
      codeGenerationTerms?: string | null;
      rewardClaimTerms?: string | null;
      startsAt: Date | string;
      endsAt?: Date | string | null;
      status?: "draft" | "active" | "archived" | string;
    },
    adminUserId: number,
  ) {
    const status = this.parseStatus(input.status ?? "draft");
    const startsAt = this.parseDate(input.startsAt, "start date") as Date;
    const endsAt = this.parseDate(input.endsAt, "end date", false);
    this.assertDateWindow(startsAt, endsAt);
    if (status === "active") this.assertCurrentWindow(startsAt, endsAt);
    const templateId = input.templateId ?? null;
    if (status === "active") {
      const active = await this.db.e_booklet_terms.findFirst({
        where: {
          status: "active",
          ...(templateId === null ? { template_id: null } : { template_id: templateId }),
        },
      });
      if (active) {
        throw new BadRequestError("This e-booklet scope already has an active terms version.");
      }
    }

    try {
      return await this.db.e_booklet_terms.create({
        data: {
          template_id: templateId,
          name: input.name,
          description: input.description ?? null,
          status,
          active_guard: status === "active" ? `template:${templateId ?? "global"}` : null,
          starts_at: startsAt,
          ends_at: endsAt,
          code_generation_terms: input.codeGenerationTerms ?? null,
          reward_claim_terms: input.rewardClaimTerms ?? null,
          created_by: adminUserId,
        },
      });
    } catch (error) {
      if (status === "active" && this.isUniqueConflict(error)) {
        throw new BadRequestError("This e-booklet scope already has an active terms version.");
      }
      throw error;
    }
  }

  async listTerms(filters: { templateId?: number | null; status?: string } = {}) {
    return this.db.e_booklet_terms.findMany({
      where: {
        ...(filters.templateId === undefined ? {} : filters.templateId === null ? { template_id: null } : { template_id: filters.templateId }),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: [{ starts_at: "desc" }, { id: "desc" }],
    });
  }

  async updateTerms(
    id: number,
    input: {
      name?: string;
      description?: string | null;
      codeGenerationTerms?: string | null;
      rewardClaimTerms?: string | null;
      startsAt?: Date | string;
      endsAt?: Date | string | null;
      status?: "draft" | "active" | "archived" | string;
    },
  ) {
    const existing = await this.db.e_booklet_terms.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("E-booklet terms not found.");
    if (existing.status === "active" && (
      input.codeGenerationTerms !== undefined
      || input.rewardClaimTerms !== undefined
      || input.startsAt !== undefined
      || input.endsAt !== undefined
    )) {
      throw new BadRequestError("Active terms policy text and date window cannot be edited in place.");
    }
    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.codeGenerationTerms !== undefined) data.code_generation_terms = input.codeGenerationTerms;
    if (input.rewardClaimTerms !== undefined) data.reward_claim_terms = input.rewardClaimTerms;
    const startsAt = input.startsAt !== undefined ? this.parseDate(input.startsAt, "start date") as Date : new Date(existing.starts_at);
    const endsAt = input.endsAt !== undefined ? this.parseDate(input.endsAt, "end date", false) : (existing.ends_at ? new Date(existing.ends_at) : null);
    if (input.startsAt !== undefined || input.endsAt !== undefined) {
      this.assertDateWindow(startsAt, endsAt);
      data.starts_at = startsAt;
      data.ends_at = endsAt;
    }
    if (input.status !== undefined) {
      const status = this.parseStatus(input.status);
      if (status === "active") {
        throw new BadRequestError("Use the activate endpoint to activate e-booklet terms.");
      }
      data.status = status;
      data.active_guard = null;
    }

    return this.db.e_booklet_terms.update({
      where: { id },
      data,
    });
  }

  async activateTerms(id: number, adminUserId: number) {
    const transaction = typeof this.db.$transaction === "function" ? this.db.$transaction.bind(this.db) : async (callback: any) => callback(this.db);
    return transaction(async (tx: any) => {
      const term = await tx.e_booklet_terms.findUnique({ where: { id } });
      if (!term) throw new NotFoundError("E-booklet terms not found.");
      const startsAt = this.parseDate(term.starts_at, "start date") as Date;
      const endsAt = this.parseDate(term.ends_at, "end date", false);
      this.assertDateWindow(startsAt, endsAt);
      this.assertCurrentWindow(startsAt, endsAt);

      await tx.e_booklet_terms.updateMany({
        where: {
          status: "active",
          id: { not: id },
          ...(term.template_id === null ? { template_id: null } : { template_id: term.template_id }),
        },
        data: {
          status: "archived",
          active_guard: null,
          updated_by: adminUserId,
          updated_at: new Date(),
        },
      });

      return tx.e_booklet_terms.update({
        where: { id },
        data: {
          status: "active",
          active_guard: `template:${term.template_id ?? "global"}`,
          updated_by: adminUserId,
          updated_at: new Date(),
        },
      });
    });
  }

  async getLatestActiveTerms(templateId?: number | null) {
    const now = new Date();
    const currentWindowWhere = {
      status: "active",
      starts_at: { lte: now },
      OR: [{ ends_at: null }, { ends_at: { gt: now } }],
    };
    const orderBy = { starts_at: "desc" };
    const findActive = (template_id?: number | null) => this.db.e_booklet_terms.findFirst({
      where: {
        ...currentWindowWhere,
        ...(template_id === undefined ? {} : { template_id }),
      },
      orderBy,
    });

    let terms = await findActive(templateId === undefined ? undefined : templateId);
    if (!terms && templateId !== undefined && templateId !== null) {
      terms = await findActive(null);
    }
    if (!terms) throw new NotFoundError("Active e-booklet terms not found.");
    return terms;
  }

  private snapshotFor(terms: any, acceptanceType: AcceptanceType): string | null {
    if (acceptanceType === "reward_claim") return terms.reward_claim_terms ?? null;
    return terms.code_generation_terms ?? null;
  }

  async acceptLatestTerms(
    teacherId: number,
    acceptanceType: AcceptanceType,
    meta: TermsMeta = {},
    templateId?: number | null,
  ) {
    const terms = await this.getLatestActiveTerms(templateId);
    const existing = await this.db.e_booklet_teacher_terms_acceptances.findFirst({
      where: {
        teacher_id: teacherId,
        term_id: terms.id,
        acceptance_type: acceptanceType,
        milestone_achievement_id: meta.milestoneAchievementId ?? null,
      },
    });
    if (existing) return existing;

    try {
      return await this.db.e_booklet_teacher_terms_acceptances.create({
        data: {
          teacher_id: teacherId,
          term_id: terms.id,
          acceptance_type: acceptanceType,
          milestone_achievement_id: meta.milestoneAchievementId ?? null,
          terms_snapshot: this.snapshotFor(terms, acceptanceType),
          terms_version: terms.name ?? null,
          ip_address: meta.ipAddress,
          user_agent: meta.userAgent,
        },
      });
    } catch (error) {
      if (!this.isUniqueConflict(error)) throw error;
      const racedAcceptance = await this.db.e_booklet_teacher_terms_acceptances.findFirst({
        where: {
          teacher_id: teacherId,
          term_id: terms.id,
          acceptance_type: acceptanceType,
          milestone_achievement_id: meta.milestoneAchievementId ?? null,
        },
      });
      if (racedAcceptance) return racedAcceptance;
      throw error;
    }
  }
}
