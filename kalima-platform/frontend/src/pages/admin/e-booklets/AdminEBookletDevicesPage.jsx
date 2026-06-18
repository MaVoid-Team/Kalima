import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { HardDrive, RefreshCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminEBookletDevices, useAdminEBookletInstances } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";
import AdminEBookletStudentDevicePanel from "./AdminEBookletStudentDevicePanel";

export default function AdminEBookletDevicesPage() {
  const { t } = useTranslation("eBooklets");
  const { instanceId: routeInstanceId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [instanceId, setInstanceId] = useState(routeInstanceId || searchParams.get("instanceId") || "");
  const [userId, setUserId] = useState(searchParams.get("userId") || "");
  const { students, loading, fetchDevices, fetchStudents } = useAdminEBookletDevices();
  const { instances, loading: instancesLoading, fetchInstances } = useAdminEBookletInstances();

  useEffect(() => { fetchInstances({ limit: 100 }).catch(() => {}); }, [fetchInstances]);

  useEffect(() => {
    if (routeInstanceId) setInstanceId(routeInstanceId);
  }, [routeInstanceId]);

  useEffect(() => {
    if (instanceId) fetchStudents(instanceId).catch(() => {});
  }, [fetchStudents, instanceId]);

  useEffect(() => {
    if (instanceId && userId) fetchDevices(instanceId, userId).catch(() => {});
  }, [fetchDevices, instanceId, userId]);

  const selectedStudent = useMemo(
    () => students.find((row) => String(row.user_id || row.user?.id) === String(userId)),
    [students, userId],
  );

  const runSearch = () => {
    setSearchParams({ instanceId, userId });
    fetchDevices(instanceId, userId).catch(() => {});
  };

  return (
    <div className="space-y-6" data-testid="admin-e-booklet-devices-page">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ms-2 mb-2"><Link to="/admin/e-booklets/access">{t("admin.devices.backToInstances")}</Link></Button>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><HardDrive className="h-8 w-8 text-primary" />{t("admin.devices.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.devices.description")}</p>
      </div>
      <section className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-2"><Label>{t("admin.devices.instanceId")}</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={instanceId} onChange={(event) => { setInstanceId(event.target.value); setUserId(""); }} disabled={Boolean(routeInstanceId)}><option value="">{instancesLoading ? t("admin.instances.loading") : t("admin.devices.selectInstance", { defaultValue: "Select an instance" })}</option>{instances.map((instance) => <option key={instance.id} value={instance.id}>{instance.display_title || instance.template?.title || `${t("common.eBooklet")} #${instance.id}`}</option>)}</select></div>
        <div className="space-y-2"><Label>{t("admin.devices.student", { defaultValue: "Student" })}</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={userId} onChange={(event) => setUserId(event.target.value)} disabled={!instanceId || loading}><option value="">{loading ? t("admin.devices.loading") : t("admin.devices.selectStudent", { defaultValue: "Select a student" })}</option>{students.map((row) => { const id = row.user_id || row.user?.id; const label = row.user?.name || row.user?.email || `${t("admin.devices.userId")} #${id}`; return <option key={row.id || id} value={id}>{label}</option>; })}</select><Input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder={t("admin.devices.manualUserId", { defaultValue: "Manual student ID fallback" })} /></div>
        <Button className="self-end" onClick={runSearch} disabled={!instanceId || !userId || loading}><RefreshCcw className="h-4 w-4" />{t("common.refresh")}</Button>
      </section>
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"><Users className="me-2 inline h-4 w-4" />{selectedStudent ? t("admin.devices.selectedStudent", { defaultValue: "Selected student access is loaded from this e-booklet instance." }) : t("admin.devices.studentSelectorHint", { defaultValue: "Choose an instance to load students with access, then select a student before resetting or allowing devices." })}</div>
      {selectedStudent ? (
        <AdminEBookletStudentDevicePanel
          instanceId={instanceId}
          userId={userId}
          student={selectedStudent}
          expanded
          showFullPageLink={false}
        />
      ) : (
        <section className="rounded-lg border bg-background p-4">
          <h2 className="font-semibold">{t("admin.devices.studentsDevices")}</h2>
          <div className="mt-4 rounded-md border p-6 text-center text-sm text-muted-foreground">{t("admin.devices.empty")}</div>
        </section>
      )}
    </div>
  );
}
