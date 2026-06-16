import { useEffect, useMemo, useState } from "react";
import { HardDrive, RefreshCcw, RotateCcw, ShieldPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminEBookletDevices } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";

const asUserId = (student) => student?.user_id || student?.user?.id;

export default function AdminEBookletStudentDevicesPanel({
  instanceId,
  student,
  defaultAllowedDevices = 1,
  autoLoad = true,
  onChanged,
}) {
  const { t, i18n } = useTranslation("eBooklets");
  const userId = asUserId(student);
  const [reason, setReason] = useState("");
  const [allowedDevices, setAllowedDevices] = useState(String(defaultAllowedDevices || 1));
  const { devices, loading, fetchDevices, resetDevices, addDeviceAllowance } = useAdminEBookletDevices();

  useEffect(() => {
    setAllowedDevices(String(defaultAllowedDevices || 1));
  }, [defaultAllowedDevices]);

  useEffect(() => {
    if (autoLoad && instanceId && userId) {
      fetchDevices(instanceId, userId).catch(() => {});
    }
  }, [autoLoad, fetchDevices, instanceId, userId]);

  const studentLabel = useMemo(
    () => student?.user?.name || student?.user?.email || `${t("admin.devices.userId")} #${userId}`,
    [student, t, userId],
  );

  const formatDate = (value) => {
    if (!value) return t("admin.devices.never");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.devices.never");
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(date);
  };

  const refresh = () => fetchDevices(instanceId, userId).catch(() => {});

  const reset = async () => {
    await resetDevices(instanceId, userId, reason);
    setReason("");
    await fetchDevices(instanceId, userId);
    await onChanged?.();
  };

  const allow = async () => {
    await addDeviceAllowance(instanceId, userId, allowedDevices, reason);
    await fetchDevices(instanceId, userId);
    await onChanged?.();
  };

  return (
    <div className="space-y-4 rounded-md border bg-muted/20 p-3" data-testid="admin-e-booklet-inline-devices-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 font-medium"><HardDrive className="h-4 w-4 text-primary" />{t("admin.devices.inlineTitle", { name: studentLabel })}</div>
          <div className="text-xs text-muted-foreground">{student?.user?.email || `${t("admin.devices.userId")} #${userId}`}</div>
        </div>
        <Button size="sm" variant="outline" onClick={refresh} disabled={!instanceId || !userId || loading}>
          <RefreshCcw className="h-4 w-4" />{t("common.refresh")}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
        <div className="space-y-2">
          <Label>{t("admin.devices.reason")}</Label>
          <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t("admin.devices.reasonPlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label>{t("admin.devices.allowedDevices")}</Label>
          <Input type="number" min="1" value={allowedDevices} onChange={(event) => setAllowedDevices(event.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <Button size="sm" variant="outline" onClick={allow} disabled={!instanceId || !userId || loading}>
            <ShieldPlus className="h-4 w-4" />{t("admin.devices.allow")}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} disabled={!instanceId || !userId || loading}>
            <RotateCcw className="h-4 w-4" />{t("admin.devices.reset")}
          </Button>
        </div>
      </div>

      {loading && <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">{t("admin.devices.loading")}</div>}
      {!loading && devices.length === 0 && <div className="rounded-md border p-4 text-center text-sm text-muted-foreground">{t("admin.devices.emptyInline")}</div>}
      <div className="grid gap-2">
        {devices.map((device) => (
          <div key={device.id} className="rounded-md border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">{device.device_label || t("admin.devices.unnamed")}</div>
              <Badge variant="outline">{t(`statuses.${device.status}`, { defaultValue: device.status })}</Badge>
            </div>
            <div className="mt-2 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
              <div>{t("admin.devices.lastSeen", { value: formatDate(device.last_seen_at) })}</div>
              <div>{t("admin.devices.bound", { value: formatDate(device.created_at) })}</div>
              <div className="truncate">{device.user_agent}</div>
              <div className="truncate">{device.ip_address}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
