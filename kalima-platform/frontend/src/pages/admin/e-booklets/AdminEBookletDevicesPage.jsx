import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { HardDrive, RefreshCcw, RotateCcw, ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminEBookletDevices, useAdminEBookletInstances } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";

export default function AdminEBookletDevicesPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const { instanceId: routeInstanceId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [instanceId, setInstanceId] = useState(routeInstanceId || searchParams.get("instanceId") || "");
  const [userId, setUserId] = useState(searchParams.get("userId") || "");
  const [reason, setReason] = useState("");
  const [allowedDevices, setAllowedDevices] = useState("2");
  const { devices, loading, fetchDevices, resetDevices, addDeviceAllowance } = useAdminEBookletDevices();
  const { instances, loading: instancesLoading, fetchInstances } = useAdminEBookletInstances();

  useEffect(() => { fetchInstances({ limit: 100 }).catch(() => {}); }, [fetchInstances]);

  useEffect(() => {
    if (routeInstanceId) setInstanceId(routeInstanceId);
  }, [routeInstanceId]);

  useEffect(() => {
    if (instanceId && userId) fetchDevices(instanceId, userId).catch(() => {});
  }, [fetchDevices, instanceId, userId]);

  const runSearch = () => {
    setSearchParams({ instanceId, userId });
    fetchDevices(instanceId, userId).catch(() => {});
  };
  const reset = async () => { await resetDevices(instanceId, userId, reason); setReason(""); fetchDevices(instanceId, userId); };
  const allow = async () => { await addDeviceAllowance(instanceId, userId, allowedDevices, reason); fetchDevices(instanceId, userId); };
  const formatDate = (value) => {
    if (!value) return t("admin.devices.never");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.devices.never");
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(date);
  };

  return (
    <div className="space-y-6" data-testid="admin-e-booklet-devices-page">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ms-2 mb-2"><Link to="/admin/e-booklet-instances">{t("admin.devices.backToInstances")}</Link></Button>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><HardDrive className="h-8 w-8 text-primary" />{t("admin.devices.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.devices.description")}</p>
      </div>
      <section className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-2"><Label>{t("admin.devices.instanceId")}</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={instanceId} onChange={(event) => setInstanceId(event.target.value)} disabled={Boolean(routeInstanceId)}><option value="">{instancesLoading ? t("admin.instances.loading") : t("admin.devices.selectInstance", { defaultValue: "Select an instance" })}</option>{instances.map((instance) => <option key={instance.id} value={instance.id}>{instance.display_title || instance.template?.title || `${t("common.eBooklet")} #${instance.id}`}</option>)}</select><Input value={instanceId} onChange={(event) => setInstanceId(event.target.value)} placeholder="123" disabled={Boolean(routeInstanceId)} /></div>
        <div className="space-y-2"><Label>{t("admin.devices.userId")}</Label><Input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="456" /></div>
        <Button className="self-end" onClick={runSearch} disabled={!instanceId || !userId || loading}><RefreshCcw className="h-4 w-4" />{t("common.refresh")}</Button>
      </section>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{t("admin.devices.discoveryUnavailable", { defaultValue: "Admin APIs expose instance discovery, but no admin student/access selector endpoint for a selected instance. Enter the student user ID manually; actions stay disabled until both IDs are present." })}</div>
      <section className="grid gap-4 rounded-lg border bg-background p-4 lg:grid-cols-[1fr_240px_240px]">
        <div className="space-y-2"><Label>{t("admin.devices.reason")}</Label><Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t("admin.devices.reasonPlaceholder")} /></div>
        <div className="space-y-2"><Label>{t("admin.devices.allowedDevices")}</Label><Input type="number" min="1" value={allowedDevices} onChange={(event) => setAllowedDevices(event.target.value)} /></div>
        <div className="flex items-end gap-2"><Button variant="outline" onClick={allow} disabled={!instanceId || !userId || loading}><ShieldPlus className="h-4 w-4" />{t("admin.devices.allow")}</Button><Button variant="outline" onClick={reset} disabled={!instanceId || !userId || loading}><RotateCcw className="h-4 w-4" />{t("admin.devices.reset")}</Button></div>
      </section>
      <section className="rounded-lg border bg-background p-4">
        <h2 className="font-semibold">{t("admin.devices.studentsDevices")}</h2>
        {loading && <div className="mt-4 rounded-md border p-6 text-center text-sm text-muted-foreground">{t("admin.devices.loading")}</div>}
        {!loading && devices.length === 0 && <div className="mt-4 rounded-md border p-6 text-center text-sm text-muted-foreground">{t("admin.devices.empty")}</div>}
        <div className="mt-4 grid gap-3">
          {devices.map((device) => <div key={device.id} className="rounded-md border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div className="font-medium">{device.device_label || t("admin.devices.unnamed")}</div><Badge variant="outline">{t(`statuses.${device.status}`, { defaultValue: device.status })}</Badge></div><div className="mt-2 grid gap-1 text-xs text-muted-foreground md:grid-cols-2"><div>{t("admin.devices.lastSeen", { value: formatDate(device.last_seen_at) })}</div><div>{t("admin.devices.bound", { value: formatDate(device.created_at) })}</div><div className="truncate">{device.user_agent}</div><div className="truncate">{device.ip_address}</div></div></div>)}
        </div>
      </section>
    </div>
  );
}
