import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, Eye, HardDrive, RefreshCcw, Save, ShieldOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAdminEBookletInstances } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";
import AdminEBookletStudentDevicePanel from "./AdminEBookletStudentDevicePanel";

const numberValue = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const optionalNumberValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function AdminEBookletInstancesPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const { instances, pagination, status, loading, fetchInstances, setStatus, setPage, updateQuota, revokeTeacherAccess } = useAdminEBookletInstances();
  const [quotaDrafts, setQuotaDrafts] = useState({});
  const [expandedDeviceKey, setExpandedDeviceKey] = useState(null);

  useEffect(() => { fetchInstances().catch(() => {}); }, [fetchInstances]);
  useEffect(() => {
    setQuotaDrafts(Object.fromEntries(instances.map((instance) => [instance.id, instance.invite_quota ?? 0])));
  }, [instances]);

  const grouped = useMemo(() => instances.reduce((acc, instance) => {
    const key = instance.teacher?.id || "unknown";
    if (!acc[key]) acc[key] = { teacher: instance.teacher, rows: [] };
    acc[key].rows.push(instance);
    return acc;
  }, {}), [instances]);

  const formatDate = (value, withTime = false) => {
    if (!value) return t("admin.instances.noExpiry");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.instances.noExpiry");
    return new Intl.DateTimeFormat(i18n.language, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
  };

  const handleQuotaSave = async (instanceId) => {
    await updateQuota(instanceId, Number(quotaDrafts[instanceId] || 0));
    fetchInstances();
  };

  const handleRevoke = async (instanceId) => {
    if (!window.confirm(t("admin.instances.revokeConfirm"))) return;
    await revokeTeacherAccess(instanceId);
    fetchInstances();
  };


  return (
    <div className="space-y-6" data-testid="admin-e-booklet-instances-page">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><BookOpenCheck className="h-8 w-8 text-primary" />{t("admin.instances.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.instances.description")}</p>
        </div>
        <div className="flex gap-2">
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">{t("statuses.all")}</option><option value="active">{t("statuses.active")}</option><option value="archived">{t("statuses.archived")}</option><option value="revoked">{t("statuses.revoked")}</option>
          </select>
          <Button variant="outline" onClick={() => fetchInstances()} disabled={loading}><RefreshCcw className="h-4 w-4" />{t("common.refresh")}</Button>
        </div>
      </div>
      {loading && <div className="rounded-lg border bg-background p-8 text-center text-muted-foreground">{t("admin.instances.loading")}</div>}
      {!loading && instances.length === 0 && <div className="rounded-lg border bg-background p-8 text-center text-muted-foreground">{t("admin.instances.empty")}</div>}
      <div className="space-y-5">
        {Object.entries(grouped).map(([teacherId, group]) => (
          <section key={teacherId} className="rounded-lg border bg-background p-4">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-semibold">{group.teacher?.name || t("common.teacher")}</h2><p className="text-xs text-muted-foreground">{group.teacher?.email || t("admin.instances.teacherMissing")}</p></div>
              <Badge variant="outline">{t("admin.instances.instanceCount", { count: group.rows.length })}</Badge>
            </div>
            <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b text-left text-xs uppercase text-muted-foreground"><th className="py-2">{t("common.eBooklet")}</th><th>{t("common.status")}</th><th>{t("admin.instances.expiry")}</th><th>{t("admin.instances.studentSeatQuota", { defaultValue: "Student seat quota" })}</th><th>{t("admin.instances.usedStudentSeats", { defaultValue: "Used student seats" })}</th><th>{t("teacher.invites.usedDevices")}</th><th>{t("common.actions")}</th></tr></thead><tbody>
              {group.rows.map((instance) => {
                const usedSeats = numberValue(instance.used_invites_count, instance._count?.access_records || 0);
                const usedDevices = optionalNumberValue(instance.used_devices_count ?? instance.active_devices_count ?? instance.devices_count);
                const students = Array.isArray(instance.students) ? instance.students : [];
                return (
                  <Fragment key={instance.id}>
                    <tr className="border-b align-top">
                      <td className="py-3"><div className="font-medium">{instance.display_title || instance.template?.title || t("common.eBooklet")}</div><div className="text-xs text-muted-foreground">{instance.template_version?.version_label || instance.template_version?.version_number || t("common.version")}</div></td>
                      <td><Badge variant="outline">{t(`statuses.${instance.status}`, { defaultValue: instance.status })}</Badge></td>
                      <td>{formatDate(instance.access_expires_at || instance.expires_at)}</td>
                      <td><div className="flex max-w-[150px] items-center gap-2"><Input type="number" min="0" value={quotaDrafts[instance.id] ?? 0} onChange={(event) => setQuotaDrafts((current) => ({ ...current, [instance.id]: event.target.value }))} /><Button size="icon-sm" variant="outline" onClick={() => handleQuotaSave(instance.id)} title={t("common.save")}><Save className="h-4 w-4" /></Button></div></td>
                      <td>{usedSeats}</td>
                      <td>{usedDevices === null ? t("admin.instances.unavailable", { defaultValue: "Unavailable" }) : usedDevices}</td>
                      <td><div className="flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><Link to={`/admin/e-booklet-instances/${instance.id}/students`}><Users className="h-4 w-4" />{t("admin.instances.showStudents")}</Link></Button><Button asChild size="sm" variant="outline"><Link to={`/admin/e-booklet-instances/${instance.id}/view`}><Eye className="h-4 w-4" />{t("admin.instances.adminView")}</Link></Button><Button size="sm" variant="outline" onClick={() => handleRevoke(instance.id)} disabled={instance.status !== "active"}><ShieldOff className="h-4 w-4" />{t("admin.instances.revoke")}</Button></div></td>
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td colSpan={7} className="p-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Users className="h-4 w-4" />{t("admin.instances.nestedStudents", { defaultValue: "Students with access" })} <Badge variant="outline">{students.length}</Badge></div>
                        {students.length === 0 ? (
                          <div className="text-xs text-muted-foreground">{t("admin.instances.noStudents", { defaultValue: "No students have active access yet." })}</div>
                        ) : (
                          <div className="grid gap-2 md:grid-cols-2">
                            {students.map((student) => {
                              const studentUserId = student.user_id || student.user?.id;
                              const devicePanelKey = `${instance.id}-${studentUserId}`;
                              const devicesExpanded = expandedDeviceKey === devicePanelKey;
                              return (
                                <div key={student.id || devicePanelKey} className="rounded-md border bg-background p-3 text-xs">
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                      <div className="font-medium">{student.user?.name || student.user?.email || t("common.student", { defaultValue: "Student" })}</div>
                                      <div className="text-muted-foreground">{student.user?.email || `ID ${studentUserId}`}</div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => setExpandedDeviceKey(devicesExpanded ? null : devicePanelKey)}>
                                      <HardDrive className="h-4 w-4" />
                                      {devicesExpanded ? t("admin.instances.hideDevicesInline") : t("admin.instances.manageDevicesInline")}
                                    </Button>
                                  </div>
                                  <div className="mt-2 grid gap-1 sm:grid-cols-3">
                                    <span>{t("admin.instances.devices", { defaultValue: "Devices" })}: {student.devices_summary?.active_count ?? 0}/{student.devices_summary?.allowed_devices ?? 1}</span>
                                    <span>{t("admin.instances.viewerOpens", { defaultValue: "Viewer opens" })}: {student.analytics_summary?.viewer_opened ?? 0}</span>
                                    <span>{t("admin.instances.source", { defaultValue: "Source" })}: {student.purchase_reference?.source || student.analytics_summary?.source || student.access_source || "—"}</span>
                                  </div>
                                  {devicesExpanded && (
                                    <AdminEBookletStudentDevicePanel
                                      instanceId={instance.id}
                                      userId={studentUserId}
                                      student={student}
                                      expanded={devicesExpanded}
                                      onSummaryRefresh={() => fetchInstances()}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody></table></div>
          </section>
        ))}
      </div>
      <div className="flex items-center justify-between"><Button variant="outline" disabled={pagination.page <= 1 || loading} onClick={() => { setPage(pagination.page - 1); fetchInstances({ page: pagination.page - 1 }); }}>{t("common.previous")}</Button><span className="text-sm text-muted-foreground">{t("admin.instances.pagination", { page: pagination.page, total: pagination.total })}</span><Button variant="outline" disabled={pagination.page * pagination.limit >= pagination.total || loading} onClick={() => { setPage(pagination.page + 1); fetchInstances({ page: pagination.page + 1 }); }}>{t("common.next")}</Button></div>
    </div>
  );
}
