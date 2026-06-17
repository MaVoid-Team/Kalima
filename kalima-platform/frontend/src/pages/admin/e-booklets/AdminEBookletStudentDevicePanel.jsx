import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, HardDrive, RefreshCcw, RotateCcw, ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminEBookletDevices } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";

const resolveUserId = (student) => student?.user_id || student?.user?.id || student?.id || "";
const resolveStudentName = (student, fallback) => student?.user?.name || student?.user?.email || fallback;

export default function AdminEBookletStudentDevicePanel({
  instanceId,
  userId,
  student,
  expanded = true,
  showFullPageLink = true,
  onSummaryRefresh,
}) {
  const { t, i18n } = useTranslation("eBooklets");
  const { devices, loading, fetchDevices, resetDevices, addDeviceAllowance } = useAdminEBookletDevices();
  const resolvedUserId = userId || resolveUserId(student);
  const studentName = resolveStudentName(student, t("common.student", { defaultValue: "Student" }));
  const [reason, setReason] = useState("");
  const [allowedDevices, setAllowedDevices] = useState(String(student?.devices_summary?.allowed_devices ?? 1));

  useEffect(() => {
    setAllowedDevices(String(student?.devices_summary?.allowed_devices ?? 1));
  }, [student?.devices_summary?.allowed_devices]);

  useEffect(() => {
    if (!expanded || !instanceId || !resolvedUserId) return;
    fetchDevices(instanceId, resolvedUserId).catch(() => {});
  }, [expanded, fetchDevices, instanceId, resolvedUserId]);

  const reasonRequired = reason.trim().length === 0;
  const actionsDisabled = !instanceId || !resolvedUserId || loading || reasonRequired;

  const formatDate = (value) => {
    if (!value) return t("admin.devices.never");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.devices.never");
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(date);
  };

  const sortedDevices = useMemo(() => (Array.isArray(devices) ? devices : []), [devices]);

  const refreshDevices = async () => {
    await fetchDevices(instanceId, resolvedUserId);
    await onSummaryRefresh?.();
  };

  const handleAllowance = async () => {
    await addDeviceAllowance(instanceId, resolvedUserId, allowedDevices, reason.trim());
    setReason("");
    await refreshDevices();
  };

  const handleReset = async () => {
    await resetDevices(instanceId, resolvedUserId, reason.trim());
    setReason("");
    await refreshDevices();
  };

  return (
    <section className="mt-3 rounded-lg border bg-muted/20 p-3" data-testid="admin-e-booklet-student-device-panel">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <HardDrive className="h-4 w-4 text-primary" />
            {t("admin.devices.inlineTitle", { name: studentName })}
          </h4>
          <p className="text-xs text-muted-foreground">{t("admin.devices.inlineHint", { defaultValue: "Manage device allowance and resets without exposing raw device metadata." })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {showFullPageLink && (
            <Button asChild size="sm" variant="outline">
              <Link to={`/admin/e-booklet-instances/${instanceId}/devices?userId=${resolvedUserId}`}>
                <ExternalLink className="h-4 w-4" />{t("admin.instances.openFullDevicesPage")}
              </Link>
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={refreshDevices} disabled={!instanceId || !resolvedUserId || loading}>
            <RefreshCcw className="h-4 w-4" />{t("common.refresh")}
          </Button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 rounded-md border bg-background p-3 lg:grid-cols-[1fr_180px_auto]">
        <div className="space-y-1">
          <Label>{t("admin.devices.reason")}</Label>
          <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t("admin.devices.reasonPlaceholder")} />
          {reasonRequired && <p className="text-[11px] text-muted-foreground">{t("admin.devices.reasonRequired", { defaultValue: "A reason is required before allowance or reset actions." })}</p>}
        </div>
        <div className="space-y-1">
          <Label>{t("admin.devices.allowedDevices")}</Label>
          <Input type="number" min="1" value={allowedDevices} onChange={(event) => setAllowedDevices(event.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <Button variant="outline" onClick={handleAllowance} disabled={actionsDisabled}>
            <ShieldPlus className="h-4 w-4" />{t("admin.devices.allow")}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={actionsDisabled}>
            <RotateCcw className="h-4 w-4" />{t("admin.devices.reset")}
          </Button>
        </div>
      </div>

      {loading && <div className="mt-3 rounded-md border bg-background p-4 text-center text-sm text-muted-foreground">{t("admin.devices.loading")}</div>}
      {!loading && sortedDevices.length === 0 && <div className="mt-3 rounded-md border bg-background p-4 text-center text-sm text-muted-foreground">{t("admin.devices.emptyInline")}</div>}
      <div className="mt-3 grid gap-2">
        {sortedDevices.map((device) => (
          <div key={device.id} className="rounded-md border bg-background p-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{device.device_label || t("admin.devices.unnamed")}</div>
              <Badge variant="outline">{t(`statuses.${device.status}`, { defaultValue: device.status })}</Badge>
            </div>
            <div className="mt-2 grid gap-1 text-muted-foreground sm:grid-cols-2">
              <span>{t("admin.devices.lastSeen", { value: formatDate(device.last_seen_at) })}</span>
              <span>{t("admin.devices.bound", { value: formatDate(device.first_seen_at || device.created_at) })}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
