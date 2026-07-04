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
    <section className="mt-4 overflow-hidden rounded-xl border bg-background" data-testid="admin-e-booklet-student-device-panel">
      <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h4 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
            <HardDrive className="h-4 w-4 text-primary" />
            <span className="truncate">{t("admin.devices.inlineTitle", { name: studentName })}</span>
          </h4>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">{t("admin.devices.inlineHint", { defaultValue: "Manage device allowance and resets without exposing raw device metadata." })}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {showFullPageLink && (
            <Button asChild size="sm" variant="outline" className="h-8">
              <Link to={`/admin/e-booklets/access/${instanceId}/devices?userId=${resolvedUserId}`}>
                <ExternalLink className="h-4 w-4" />{t("admin.instances.openFullDevicesPage")}
              </Link>
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-8" onClick={refreshDevices} disabled={!instanceId || !resolvedUserId || loading}>
            <RefreshCcw className="h-4 w-4" />{t("common.refresh")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="space-y-2">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_8rem]">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t("admin.devices.reason")}</Label>
              <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t("admin.devices.reasonPlaceholder")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t("admin.devices.allowedDevices")}</Label>
              <Input type="number" min="1" value={allowedDevices} onChange={(event) => setAllowedDevices(event.target.value)} />
            </div>
          </div>
          {reasonRequired && <p className="text-[11px] text-muted-foreground">{t("admin.devices.reasonRequired", { defaultValue: "A reason is required before allowance or reset actions." })}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={handleAllowance} disabled={actionsDisabled}>
              <ShieldPlus className="h-4 w-4" />{t("admin.devices.allow")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} disabled={actionsDisabled}>
              <RotateCcw className="h-4 w-4" />{t("admin.devices.reset")}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/20">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>{t("admin.devices.device", { defaultValue: "Device" })}</span>
            <span>{t("admin.devices.status", { defaultValue: "Status" })}</span>
          </div>
          <div className="divide-y">
            {loading && <div className="px-3 py-5 text-center text-sm text-muted-foreground">{t("admin.devices.loading")}</div>}
            {!loading && sortedDevices.length === 0 && <div className="px-3 py-5 text-center text-sm text-muted-foreground">{t("admin.devices.emptyInline")}</div>}
            {!loading && sortedDevices.map((device) => (
              <div key={device.id} className="grid gap-3 px-3 py-3 text-xs sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{device.device_label || t("admin.devices.unnamed")}</div>
                  <div className="mt-1 grid gap-1 text-muted-foreground md:grid-cols-2">
                    <span className="min-w-0 truncate">{t("admin.devices.lastSeen", { value: formatDate(device.last_seen_at) })}</span>
                    <span className="min-w-0 truncate">{t("admin.devices.bound", { value: formatDate(device.first_seen_at || device.created_at) })}</span>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit justify-self-start sm:justify-self-end">{t(`statuses.${device.status}`, { defaultValue: device.status })}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
