import { BadRequestError } from "../../../libs/errors";

const SETTINGS_ID = 1;
const DEFAULT_PREVIEW_PAGE_LIMIT = 10;
const MAX_PREVIEW_PAGE_LIMIT = 200;

const defaults = {
  id: SETTINGS_ID,
  default_invite_quota: 0,
  default_access_duration_days: null,
  default_invite_expiration_days: null,
  default_delivery_notes: null,
  default_student_marketing_price: 0,
  default_internal_price: 0,
  default_access_code_kind: "paid",
  max_bulk_access_codes: 100,
  default_access_code_expiration_days: null,
  require_terms_for_code_generation: true,
  default_allowed_devices_per_student: 1,
  default_allowed_devices_per_teacher: 2,
  preview_page_limit: DEFAULT_PREVIEW_PAGE_LIMIT,
  device_reset_policy: null,
  notify_admins_on_delivery: true,
  notify_teacher_on_delivery: true,
  notify_admins_on_milestone: true,
  notify_teacher_on_milestone: true,
  notify_admins_on_access_code_redemption: false,
};

type SettingsInput = Record<string, unknown>;

export class EBookletSettingsService {
  constructor(private readonly db: any) {}

  private nonNegativeInt(value: unknown, label: string, nullable = false): number | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === "") {
      if (nullable) return null;
      throw new BadRequestError(`Invalid ${label}.`);
    }
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric < 0) throw new BadRequestError(`Invalid ${label}.`);
    return numeric;
  }

  private positiveInt(value: unknown, label: string): number | undefined {
    if (value === undefined) return undefined;
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric <= 0) throw new BadRequestError(`Invalid ${label}.`);
    return numeric;
  }

  private boundedPositiveInt(value: unknown, label: string, max: number): number | undefined {
    const numeric = this.positiveInt(value, label);
    if (numeric !== undefined && numeric > max) throw new BadRequestError(`${label} cannot exceed ${max}.`);
    return numeric;
  }

  private async readPreviewPageLimit(): Promise<number> {
    if (!this.db.$queryRawUnsafe) return DEFAULT_PREVIEW_PAGE_LIMIT;
    try {
      const rows = await this.db.$queryRawUnsafe(
        "SELECT preview_page_limit FROM e_booklet_global_settings WHERE id = 1 LIMIT 1",
      );
      const value = Array.isArray(rows) ? rows[0]?.preview_page_limit : undefined;
      const numeric = Number(value ?? DEFAULT_PREVIEW_PAGE_LIMIT);
      return Number.isInteger(numeric) && numeric >= 1 && numeric <= MAX_PREVIEW_PAGE_LIMIT
        ? numeric
        : DEFAULT_PREVIEW_PAGE_LIMIT;
    } catch {
      return DEFAULT_PREVIEW_PAGE_LIMIT;
    }
  }

  private money(value: unknown, label: string): number | undefined {
    if (value === undefined) return undefined;
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) throw new BadRequestError(`Invalid ${label}.`);
    return numeric;
  }

  private optionalText(value: unknown): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const text = String(value).trim();
    return text ? text : null;
  }

  private optionalBoolean(value: unknown): boolean | undefined {
    if (value === undefined) return undefined;
    return value === true || value === "true" || value === "1" || value === 1;
  }

  private accessCodeKind(value: unknown): string | undefined {
    if (value === undefined) return undefined;
    const kind = String(value);
    if (kind !== "paid" && kind !== "free") throw new BadRequestError("Invalid default access code kind.");
    return kind;
  }

  private normalize(input: SettingsInput, adminUserId: number) {
    const data: Record<string, unknown> = { updated_by: adminUserId, updated_at: new Date() };
    const set = (key: string, value: unknown) => {
      if (value !== undefined) data[key] = value;
    };

    set("default_invite_quota", this.nonNegativeInt(input.defaultInviteQuota ?? input.default_invite_quota, "default invite quota"));
    set("default_access_duration_days", this.nonNegativeInt(input.defaultAccessDurationDays ?? input.default_access_duration_days, "default access duration", true));
    set("default_invite_expiration_days", this.nonNegativeInt(input.defaultInviteExpirationDays ?? input.default_invite_expiration_days, "default invite expiration", true));
    set("default_delivery_notes", this.optionalText(input.defaultDeliveryNotes ?? input.default_delivery_notes));
    set("default_student_marketing_price", this.money(input.defaultStudentMarketingPrice ?? input.default_student_marketing_price, "default student marketing price"));
    set("default_internal_price", this.money(input.defaultInternalPrice ?? input.default_internal_price, "default internal price"));
    set("default_access_code_kind", this.accessCodeKind(input.defaultAccessCodeKind ?? input.default_access_code_kind));
    set("max_bulk_access_codes", this.positiveInt(input.maxBulkAccessCodes ?? input.max_bulk_access_codes, "max bulk access codes"));
    set("default_access_code_expiration_days", this.nonNegativeInt(input.defaultAccessCodeExpirationDays ?? input.default_access_code_expiration_days, "default access code expiration", true));
    set("require_terms_for_code_generation", this.optionalBoolean(input.requireTermsForCodeGeneration ?? input.require_terms_for_code_generation));
    set("default_allowed_devices_per_student", this.positiveInt(input.defaultAllowedDevicesPerStudent ?? input.default_allowed_devices_per_student, "default allowed student devices"));
    set("default_allowed_devices_per_teacher", this.positiveInt(input.defaultAllowedDevicesPerTeacher ?? input.default_allowed_devices_per_teacher, "default allowed teacher devices"));
    const previewPageLimit = this.boundedPositiveInt(input.previewPageLimit ?? input.preview_page_limit, "preview page limit", MAX_PREVIEW_PAGE_LIMIT);
    set("preview_page_limit", previewPageLimit);
    set("device_reset_policy", this.optionalText(input.deviceResetPolicy ?? input.device_reset_policy));
    set("notify_admins_on_delivery", this.optionalBoolean(input.notifyAdminsOnDelivery ?? input.notify_admins_on_delivery));
    set("notify_teacher_on_delivery", this.optionalBoolean(input.notifyTeacherOnDelivery ?? input.notify_teacher_on_delivery));
    set("notify_admins_on_milestone", this.optionalBoolean(input.notifyAdminsOnMilestone ?? input.notify_admins_on_milestone));
    set("notify_teacher_on_milestone", this.optionalBoolean(input.notifyTeacherOnMilestone ?? input.notify_teacher_on_milestone));
    set("notify_admins_on_access_code_redemption", this.optionalBoolean(input.notifyAdminsOnAccessCodeRedemption ?? input.notify_admins_on_access_code_redemption));

    return { data, previewPageLimit };
  }

  async getSettings() {
    const settings = await this.db.e_booklet_global_settings.upsert({
      where: { id: SETTINGS_ID },
      create: defaults,
      update: {},
    });
    const numeric = Number(settings?.preview_page_limit);
    const previewPageLimit = Number.isInteger(numeric) && numeric >= 1 && numeric <= MAX_PREVIEW_PAGE_LIMIT
      ? numeric
      : await this.readPreviewPageLimit();
    return { ...settings, preview_page_limit: previewPageLimit };
  }

  async updateSettings(input: SettingsInput, adminUserId: number) {
    const { data } = this.normalize(input, adminUserId);
    const settings = await this.db.e_booklet_global_settings.upsert({
      where: { id: SETTINGS_ID },
      create: { ...defaults, ...data, id: SETTINGS_ID },
      update: data,
    });
    const numeric = Number(settings?.preview_page_limit ?? data.preview_page_limit);
    const previewPageLimit = Number.isInteger(numeric) && numeric >= 1 && numeric <= MAX_PREVIEW_PAGE_LIMIT
      ? numeric
      : await this.readPreviewPageLimit();
    return { ...settings, preview_page_limit: previewPageLimit };
  }
}
