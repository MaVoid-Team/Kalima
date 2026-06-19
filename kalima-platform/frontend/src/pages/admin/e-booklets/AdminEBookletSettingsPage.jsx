import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CalendarRange, KeyRound, RefreshCcw, Save, Settings, ShieldCheck, Smartphone, Truck } from "lucide-react";
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

export default function AdminEBookletSettingsPage() {
  const { settings, loading, fetchSettings, updateSettings } = useAdminEBookletSettings();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setForm(toForm(settings));
  }, [settings]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    await updateSettings(toPayload(form));
  };

  return (
    <form className="space-y-6" data-testid="admin-e-booklet-settings-page" onSubmit={submit}>
      <section className="rounded-2xl border bg-background p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Settings className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">E-Booklet Settings</h2>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                Configure global defaults and policies used across the eBooklet workspace.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={fetchSettings} disabled={loading}>
              <RefreshCcw className="me-2 h-4 w-4" />
              Refresh
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="me-2 h-4 w-4" />
              Save settings
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link className="rounded-2xl border bg-background p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md" to="/admin/e-booklets/settings/terms-milestones">
          <CalendarRange className="h-5 w-5 text-primary" />
          <h3 className="mt-4 font-semibold">Terms & Milestones</h3>
          <p className="mt-2 text-sm text-muted-foreground">Manage active eBooklet terms and milestone rewards.</p>
        </Link>
      </div>

      <SettingsSection icon={Truck} title="Delivery Defaults" description="Starting values for new eBooklet deliveries and invite setup.">
        <Field label="Default invite quota" hint="How many student invites a delivered eBooklet starts with.">
          <Input type="number" min="0" value={form.defaultInviteQuota} onChange={(event) => updateField("defaultInviteQuota", event.target.value)} />
        </Field>
        <Field label="Access duration days" hint="Leave blank for no automatic access expiry default.">
          <Input type="number" min="0" value={form.defaultAccessDurationDays} onChange={(event) => updateField("defaultAccessDurationDays", event.target.value)} />
        </Field>
        <Field label="Invite expiration days" hint="Leave blank when invite links/codes should not expire by default.">
          <Input type="number" min="0" value={form.defaultInviteExpirationDays} onChange={(event) => updateField("defaultInviteExpirationDays", event.target.value)} />
        </Field>
        <Field label="Default delivery notes">
          <Textarea value={form.defaultDeliveryNotes} onChange={(event) => updateField("defaultDeliveryNotes", event.target.value)} placeholder="Optional internal delivery guidance" />
        </Field>
      </SettingsSection>

      <SettingsSection icon={ShieldCheck} title="Pricing Defaults" description="Default prices copied into eBooklet delivery and access decisions.">
        <Field label="Student marketing price" hint="Public-facing suggested student price.">
          <Input type="number" min="0" step="0.01" value={form.defaultStudentMarketingPrice} onChange={(event) => updateField("defaultStudentMarketingPrice", event.target.value)} />
        </Field>
        <Field label="Internal teacher cost" hint="Internal baseline cost used for teacher/access economics.">
          <Input type="number" min="0" step="0.01" value={form.defaultInternalPrice} onChange={(event) => updateField("defaultInternalPrice", event.target.value)} />
        </Field>
      </SettingsSection>

      <SettingsSection icon={KeyRound} title="Access-Code Policy" description="Defaults and limits for generated eBooklet access codes.">
        <Field label="Default access-code kind">
          <Select value={form.defaultAccessCodeKind} onValueChange={(value) => updateField("defaultAccessCodeKind", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Max bulk access codes" hint="Upper bound for one bulk generation request.">
          <Input type="number" min="1" value={form.maxBulkAccessCodes} onChange={(event) => updateField("maxBulkAccessCodes", event.target.value)} />
        </Field>
        <Field label="Access-code expiration days" hint="Leave blank when generated codes should not expire by default.">
          <Input type="number" min="0" value={form.defaultAccessCodeExpirationDays} onChange={(event) => updateField("defaultAccessCodeExpirationDays", event.target.value)} />
        </Field>
        <ToggleRow
          label="Require terms before code generation"
          hint="Teachers must accept current eBooklet terms before creating access codes."
          checked={form.requireTermsForCodeGeneration}
          onCheckedChange={(value) => updateField("requireTermsForCodeGeneration", value)}
        />
      </SettingsSection>

      <SettingsSection icon={Smartphone} title="Device Policy" description="Default viewer device limits and reset guidance.">
        <Field label="Allowed student devices">
          <Input type="number" min="1" value={form.defaultAllowedDevicesPerStudent} onChange={(event) => updateField("defaultAllowedDevicesPerStudent", event.target.value)} />
        </Field>
        <Field label="Allowed teacher devices">
          <Input type="number" min="1" value={form.defaultAllowedDevicesPerTeacher} onChange={(event) => updateField("defaultAllowedDevicesPerTeacher", event.target.value)} />
        </Field>
        <Field label="Device reset policy">
          <Textarea value={form.deviceResetPolicy} onChange={(event) => updateField("deviceResetPolicy", event.target.value)} placeholder="Explain when admins should reset or expand device access" />
        </Field>
      </SettingsSection>

      <SettingsSection icon={Bell} title="Notification Rules" description="Choose who should be notified for key eBooklet events.">
        <ToggleRow label="Notify admins on delivery" checked={form.notifyAdminsOnDelivery} onCheckedChange={(value) => updateField("notifyAdminsOnDelivery", value)} />
        <ToggleRow label="Notify teacher on delivery" checked={form.notifyTeacherOnDelivery} onCheckedChange={(value) => updateField("notifyTeacherOnDelivery", value)} />
        <ToggleRow label="Notify admins on milestone" checked={form.notifyAdminsOnMilestone} onCheckedChange={(value) => updateField("notifyAdminsOnMilestone", value)} />
        <ToggleRow label="Notify teacher on milestone" checked={form.notifyTeacherOnMilestone} onCheckedChange={(value) => updateField("notifyTeacherOnMilestone", value)} />
        <ToggleRow label="Notify admins on access-code redemption" checked={form.notifyAdminsOnAccessCodeRedemption} onCheckedChange={(value) => updateField("notifyAdminsOnAccessCodeRedemption", value)} />
      </SettingsSection>
    </form>
  );
}
