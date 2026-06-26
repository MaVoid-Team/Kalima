import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Bell, CalendarRange, CheckCircle2, Gift, Eye, KeyRound, RefreshCcw, Save, Settings, ShieldCheck, Smartphone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminEBookletSettings } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const emptyForm = {
  defaultInviteQuota: "0",
  defaultAccessDurationDays: "",
  defaultInviteExpirationDays: "",
  defaultDeliveryNotes: "",
  defaultStudentMarketingPrice: "0",
  defaultInternalPrice: "0",
  defaultAccessCodeKind: "paid",
  maxBulkAccessCodes: "100",
  defaultAccessCodeExpirationDays: "",
  requireTermsForCodeGeneration: true,
  defaultAllowedDevicesPerStudent: "1",
  defaultAllowedDevicesPerTeacher: "2",
  previewPageLimit: "10",
  defaultRewardExpiryDays: "120",
  deviceResetPolicy: "",
  notifyAdminsOnDelivery: true,
  notifyTeacherOnDelivery: true,
  notifyAdminsOnMilestone: true,
  notifyTeacherOnMilestone: true,
  notifyAdminsOnAccessCodeRedemption: false,
};

const numberOrNull = (value) => (value === "" || value === null || value === undefined ? null : Number(value));
const numberOrZero = (value) => Number(value || 0);

function toForm(settings) {
  if (!settings) return emptyForm;
  return {
    defaultInviteQuota: String(settings.default_invite_quota ?? 0),
    defaultAccessDurationDays: settings.default_access_duration_days == null ? "" : String(settings.default_access_duration_days),
    defaultInviteExpirationDays: settings.default_invite_expiration_days == null ? "" : String(settings.default_invite_expiration_days),
    defaultDeliveryNotes: settings.default_delivery_notes || "",
    defaultStudentMarketingPrice: String(settings.default_student_marketing_price ?? 0),
    defaultInternalPrice: String(settings.default_internal_price ?? 0),
    defaultAccessCodeKind: settings.default_access_code_kind || "paid",
    maxBulkAccessCodes: String(settings.max_bulk_access_codes ?? 100),
    defaultAccessCodeExpirationDays: settings.default_access_code_expiration_days == null ? "" : String(settings.default_access_code_expiration_days),
    requireTermsForCodeGeneration: Boolean(settings.require_terms_for_code_generation),
    defaultAllowedDevicesPerStudent: String(settings.default_allowed_devices_per_student ?? 1),
    defaultAllowedDevicesPerTeacher: String(settings.default_allowed_devices_per_teacher ?? 2),
    previewPageLimit: String(settings.preview_page_limit ?? 10),
    defaultRewardExpiryDays: String(settings.default_reward_expiry_days ?? 120),
    deviceResetPolicy: settings.device_reset_policy || "",
    notifyAdminsOnDelivery: Boolean(settings.notify_admins_on_delivery),
    notifyTeacherOnDelivery: Boolean(settings.notify_teacher_on_delivery),
    notifyAdminsOnMilestone: Boolean(settings.notify_admins_on_milestone),
    notifyTeacherOnMilestone: Boolean(settings.notify_teacher_on_milestone),
    notifyAdminsOnAccessCodeRedemption: Boolean(settings.notify_admins_on_access_code_redemption),
  };
}

function toPayload(form) {
  return {
    defaultInviteQuota: numberOrZero(form.defaultInviteQuota),
    defaultAccessDurationDays: numberOrNull(form.defaultAccessDurationDays),
    defaultInviteExpirationDays: numberOrNull(form.defaultInviteExpirationDays),
    defaultDeliveryNotes: form.defaultDeliveryNotes,
    defaultStudentMarketingPrice: numberOrZero(form.defaultStudentMarketingPrice),
    defaultInternalPrice: numberOrZero(form.defaultInternalPrice),
    defaultAccessCodeKind: form.defaultAccessCodeKind,
    maxBulkAccessCodes: numberOrZero(form.maxBulkAccessCodes),
    defaultAccessCodeExpirationDays: numberOrNull(form.defaultAccessCodeExpirationDays),
    requireTermsForCodeGeneration: form.requireTermsForCodeGeneration,
    defaultAllowedDevicesPerStudent: numberOrZero(form.defaultAllowedDevicesPerStudent),
    defaultAllowedDevicesPerTeacher: numberOrZero(form.defaultAllowedDevicesPerTeacher),
    previewPageLimit: numberOrZero(form.previewPageLimit),
    defaultRewardExpiryDays: numberOrZero(form.defaultRewardExpiryDays),
    deviceResetPolicy: form.deviceResetPolicy,
    notifyAdminsOnDelivery: form.notifyAdminsOnDelivery,
    notifyTeacherOnDelivery: form.notifyTeacherOnDelivery,
    notifyAdminsOnMilestone: form.notifyAdminsOnMilestone,
    notifyTeacherOnMilestone: form.notifyTeacherOnMilestone,
    notifyAdminsOnAccessCodeRedemption: form.notifyAdminsOnAccessCodeRedemption,
  };
}

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ToggleRow({ label, checked, onCheckedChange, hint }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/20 p-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SettingsCard({ icon: Icon, title, description, active, onClick, as: Component = "button", ...props }) {
  return (
    <Component
      type={Component === "button" ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group rounded-2xl border bg-background p-5 text-start shadow-sm transition hover:border-primary/40 hover:shadow-md",
        active && "border-primary/60 bg-primary/5 shadow-md",
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span className={cn("rounded-xl bg-primary/10 p-2 text-primary", active && "bg-primary text-primary-foreground")}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{title}</h3>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
    </Component>
  );
}

export default function AdminEBookletSettingsPage() {
  const { t } = useTranslation("eBooklets");
  const { settings, loading, fetchSettings, updateSettings } = useAdminEBookletSettings();
  const [form, setForm] = useState(emptyForm);
  const [activeSection, setActiveSection] = useState("delivery");
  const [saveState, setSaveState] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setForm(toForm(settings));
  }, [settings]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(toForm(settings));

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaveState("idle");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaveState("saving");
    try {
      await updateSettings(toPayload(form));
      setSaveState("saved");
      setLastSavedAt(new Date());
    } catch (error) {
      setSaveState("error");
      throw error;
    }
  };

  return (
    <form className="space-y-6" data-testid="admin-e-booklet-settings-page" onSubmit={submit}>
      <section className="rounded-2xl border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Settings className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">{t("admin.settings.title")}</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                {t("admin.settings.description")}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="min-h-6 text-sm">
              {saveState === "saved" && (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("admin.settings.savedStatus", {
                    time: lastSavedAt?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    defaultValue: "Saved at {{time}}",
                  })}
                </span>
              )}
              {saveState === "error" && (
                <span className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 font-medium text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {t("admin.settings.saveFailedStatus", { defaultValue: "Save failed. Try again." })}
                </span>
              )}
              {isDirty && saveState !== "saving" && saveState !== "error" && (
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-900">
                  {t("admin.settings.unsavedStatus", { defaultValue: "Unsaved changes" })}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={fetchSettings} disabled={loading}>
                <RefreshCcw className="me-2 h-4 w-4" />
                {t("admin.settings.refresh")}
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="me-2 h-4 w-4" />
                {saveState === "saving"
                  ? t("admin.settings.saving", { defaultValue: "Saving..." })
                  : saveState === "saved" && !isDirty
                    ? t("admin.settings.saved", { defaultValue: "Saved" })
                    : t("admin.settings.save")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SettingsCard
          icon={Truck}
          title={t("admin.settings.deliveryDefaults")}
          description={t("admin.settings.deliveryDefaultsDescription")}
          active={activeSection === "delivery"}
          onClick={() => setActiveSection("delivery")}
        />
        <SettingsCard
          icon={ShieldCheck}
          title={t("admin.settings.pricingDefaults")}
          description={t("admin.settings.pricingDefaultsDescription")}
          active={activeSection === "pricing"}
          onClick={() => setActiveSection("pricing")}
        />
        <SettingsCard
          icon={KeyRound}
          title={t("admin.settings.accessCodePolicy")}
          description={t("admin.settings.accessCodePolicyDescription")}
          active={activeSection === "accessCodes"}
          onClick={() => setActiveSection("accessCodes")}
        />
        <SettingsCard
          icon={Smartphone}
          title={t("admin.settings.devicePolicy")}
          description={t("admin.settings.devicePolicyDescription")}
          active={activeSection === "devices"}
          onClick={() => setActiveSection("devices")}
        />
        <SettingsCard
          icon={Eye}
          title={t("admin.settings.previewPolicy")}
          description={t("admin.settings.previewPolicyDescription")}
          active={activeSection === "preview"}
          onClick={() => setActiveSection("preview")}
        />
        <SettingsCard
          icon={Gift}
          title={t("admin.settings.rewardPolicy")}
          description={t("admin.settings.rewardPolicyDescription")}
          active={activeSection === "rewards"}
          onClick={() => setActiveSection("rewards")}
        />
        <SettingsCard
          icon={Bell}
          title={t("admin.settings.notificationRules")}
          description={t("admin.settings.notificationRulesDescription")}
          active={activeSection === "notifications"}
          onClick={() => setActiveSection("notifications")}
        />
        <SettingsCard
          as={Link}
          to="/admin/e-booklets/settings/terms-milestones"
          icon={CalendarRange}
          title={t("admin.settings.termsMilestonesTitle")}
          description={t("admin.settings.termsMilestonesDescription")}
        />
      </div>

      {activeSection === "delivery" && (
        <SettingsSection icon={Truck} title={t("admin.settings.deliveryDefaults")} description={t("admin.settings.deliveryDefaultsDescription")}>
          <Field label={t("admin.settings.defaultInviteQuota")} hint={t("admin.settings.defaultInviteQuotaHint")}>
            <Input type="number" min="0" value={form.defaultInviteQuota} onChange={(event) => updateField("defaultInviteQuota", event.target.value)} />
          </Field>
          <Field label={t("admin.settings.accessDurationDays")} hint={t("admin.settings.accessDurationDaysHint")}>
            <Input type="number" min="0" value={form.defaultAccessDurationDays} onChange={(event) => updateField("defaultAccessDurationDays", event.target.value)} />
          </Field>
          <Field label={t("admin.settings.inviteExpirationDays")} hint={t("admin.settings.inviteExpirationDaysHint")}>
            <Input type="number" min="0" value={form.defaultInviteExpirationDays} onChange={(event) => updateField("defaultInviteExpirationDays", event.target.value)} />
          </Field>
          <Field label={t("admin.settings.defaultDeliveryNotes")}>
            <Textarea value={form.defaultDeliveryNotes} onChange={(event) => updateField("defaultDeliveryNotes", event.target.value)} placeholder={t("admin.settings.defaultDeliveryNotesPlaceholder")} />
          </Field>
        </SettingsSection>
      )}

      {activeSection === "pricing" && (
        <SettingsSection icon={ShieldCheck} title={t("admin.settings.pricingDefaults")} description={t("admin.settings.pricingDefaultsDescription")}>
          <Field label={t("admin.settings.studentMarketingPrice")} hint={t("admin.settings.studentMarketingPriceHint")}>
            <Input type="number" min="0" step="0.01" value={form.defaultStudentMarketingPrice} onChange={(event) => updateField("defaultStudentMarketingPrice", event.target.value)} />
          </Field>
          <Field label={t("admin.settings.internalTeacherCost")} hint={t("admin.settings.internalTeacherCostHint")}>
            <Input type="number" min="0" step="0.01" value={form.defaultInternalPrice} onChange={(event) => updateField("defaultInternalPrice", event.target.value)} />
          </Field>
        </SettingsSection>
      )}

      {activeSection === "accessCodes" && (
        <SettingsSection icon={KeyRound} title={t("admin.settings.accessCodePolicy")} description={t("admin.settings.accessCodePolicyDescription")}>
          <Field label={t("admin.settings.defaultAccessCodeKind")}>
            <Select value={form.defaultAccessCodeKind} onValueChange={(value) => updateField("defaultAccessCodeKind", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">{t("admin.settings.paid")}</SelectItem>
                <SelectItem value="free">{t("admin.settings.free")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("admin.settings.maxBulkAccessCodes")} hint={t("admin.settings.maxBulkAccessCodesHint")}>
            <Input type="number" min="1" value={form.maxBulkAccessCodes} onChange={(event) => updateField("maxBulkAccessCodes", event.target.value)} />
          </Field>
          <Field label={t("admin.settings.accessCodeExpirationDays")} hint={t("admin.settings.accessCodeExpirationDaysHint")}>
            <Input type="number" min="0" value={form.defaultAccessCodeExpirationDays} onChange={(event) => updateField("defaultAccessCodeExpirationDays", event.target.value)} />
          </Field>
          <ToggleRow
            label={t("admin.settings.requireTermsBeforeCodeGeneration")}
            hint={t("admin.settings.requireTermsBeforeCodeGenerationHint")}
            checked={form.requireTermsForCodeGeneration}
            onCheckedChange={(value) => updateField("requireTermsForCodeGeneration", value)}
          />
        </SettingsSection>
      )}

      {activeSection === "devices" && (
        <SettingsSection icon={Smartphone} title={t("admin.settings.devicePolicy")} description={t("admin.settings.devicePolicyDescription")}>
          <Field label={t("admin.settings.allowedStudentDevices")}>
            <Input type="number" min="1" value={form.defaultAllowedDevicesPerStudent} onChange={(event) => updateField("defaultAllowedDevicesPerStudent", event.target.value)} />
          </Field>
          <Field label={t("admin.settings.allowedTeacherDevices")}>
            <Input type="number" min="1" value={form.defaultAllowedDevicesPerTeacher} onChange={(event) => updateField("defaultAllowedDevicesPerTeacher", event.target.value)} />
          </Field>
          <Field label={t("admin.settings.deviceResetPolicy")}>
            <Textarea value={form.deviceResetPolicy} onChange={(event) => updateField("deviceResetPolicy", event.target.value)} placeholder={t("admin.settings.deviceResetPolicyPlaceholder")} />
          </Field>
        </SettingsSection>
      )}

      {activeSection === "preview" && (
        <SettingsSection icon={Eye} title={t("admin.settings.previewPolicy")} description={t("admin.settings.previewPolicyDescription")}>
          <Field label={t("admin.settings.previewPageLimit")} hint={t("admin.settings.previewPageLimitHint")}>
            <Input type="number" min="1" max="200" value={form.previewPageLimit} onChange={(event) => updateField("previewPageLimit", event.target.value)} />
          </Field>
        </SettingsSection>
      )}

      {activeSection === "rewards" && (
        <SettingsSection icon={Gift} title={t("admin.settings.rewardPolicy")} description={t("admin.settings.rewardPolicyDescription")}>
          <Field label={t("admin.settings.defaultRewardExpiryDays")} hint={t("admin.settings.defaultRewardExpiryDaysHint")}>
            <Input type="number" min="1" value={form.defaultRewardExpiryDays} onChange={(event) => updateField("defaultRewardExpiryDays", event.target.value)} />
          </Field>
        </SettingsSection>
      )}

      {activeSection === "notifications" && (
        <SettingsSection icon={Bell} title={t("admin.settings.notificationRules")} description={t("admin.settings.notificationRulesDescription")}>
          <ToggleRow label={t("admin.settings.notifyAdminsOnDelivery")} checked={form.notifyAdminsOnDelivery} onCheckedChange={(value) => updateField("notifyAdminsOnDelivery", value)} />
          <ToggleRow label={t("admin.settings.notifyTeacherOnDelivery")} checked={form.notifyTeacherOnDelivery} onCheckedChange={(value) => updateField("notifyTeacherOnDelivery", value)} />
          <ToggleRow label={t("admin.settings.notifyAdminsOnMilestone")} checked={form.notifyAdminsOnMilestone} onCheckedChange={(value) => updateField("notifyAdminsOnMilestone", value)} />
          <ToggleRow label={t("admin.settings.notifyTeacherOnMilestone")} checked={form.notifyTeacherOnMilestone} onCheckedChange={(value) => updateField("notifyTeacherOnMilestone", value)} />
          <ToggleRow label={t("admin.settings.notifyAdminsOnAccessCodeRedemption")} checked={form.notifyAdminsOnAccessCodeRedemption} onCheckedChange={(value) => updateField("notifyAdminsOnAccessCodeRedemption", value)} />
        </SettingsSection>
      )}
    </form>
  );
}
