import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BarChart3, HardDrive, RefreshCcw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminEBookletDevices, useAdminEBookletInstances } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";

const numberValue = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asUserId = (student) => student?.user_id || student?.user?.id;

export default function AdminEBookletInstanceStudentsPage() {
  const { instanceId } = useParams();
  const { t, i18n } = useTranslation("eBooklets");
  const { students, loading, fetchStudents } = useAdminEBookletDevices();
  const { instances, fetchInstances } = useAdminEBookletInstances();

  useEffect(() => {
    fetchStudents(instanceId).catch(() => {});
    fetchInstances({ limit: 100 }).catch(() => {});
  }, [fetchInstances, fetchStudents, instanceId]);

  const instance = useMemo(() => instances.find((row) => String(row.id) === String(instanceId)), [instances, instanceId]);

  const formatDate = (value, withTime = false) => {
    if (!value) return t("admin.instances.noExpiry");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.instances.noExpiry");
    return new Intl.DateTimeFormat(i18n.language, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
  };

  const title = instance?.display_title || instance?.template?.title || t("common.eBooklet");
  const teacherName = instance?.teacher?.name || instance?.teacher?.email;

  return (
    <div className="space-y-6" data-testid="admin-e-booklet-instance-students-page">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ms-2 mb-2">
            <Link to="/admin/e-booklet-instances"><ArrowLeft className="h-4 w-4" />{t("admin.students.backToInstances")}</Link>
          </Button>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight"><Users className="h-8 w-8 text-primary" />{t("admin.students.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.students.description")}</p>
        </div>
        <Button variant="outline" onClick={() => fetchStudents(instanceId)} disabled={loading}>
          <RefreshCcw className="h-4 w-4" />{t("common.refresh")}
        </Button>
      </div>

      <section className="rounded-lg border bg-background p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs uppercase text-muted-foreground">{t("common.eBooklet")}</div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {teacherName && <p className="text-sm text-muted-foreground">{teacherName}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{t("admin.students.studentCount", { count: students.length })}</Badge>
            {instance?.status && <Badge variant="secondary">{t(`statuses.${instance.status}`, { defaultValue: instance.status })}</Badge>}
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-background p-4">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">{t("admin.instances.studentsForEBooklet")}</h2>
            <p className="text-xs text-muted-foreground">{t("admin.instances.studentsForEBookletHint")}</p>
          </div>
        </div>

        {loading && <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">{t("admin.instances.studentsLoading")}</div>}
        {!loading && students.length === 0 && <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">{t("admin.instances.studentsEmpty")}</div>}
        {!loading && students.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <th className="p-3">{t("common.student")}</th>
                  <th className="p-3">{t("common.access")}</th>
                  <th className="p-3">{t("admin.instances.studentAnalytics")}</th>
                  <th className="p-3">{t("admin.instances.deviceSummary")}</th>
                  <th className="p-3">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const userId = asUserId(student);
                  const analytics = student.analytics_summary || {};
                  const devicesSummary = student.devices_summary || {};
                  const source = analytics.source || student.access_source;
                  return (
                    <tr key={student.id || `${instanceId}:${userId}`} className="border-b last:border-0 align-top">
                      <td className="p-3">
                        <div className="font-medium">{student.user?.name || t("common.student")}</div>
                        <div className="text-xs text-muted-foreground">{student.user?.email || `${t("admin.devices.userId")} #${userId}`}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <Badge className="w-fit" variant="outline">{t(`statuses.${student.status}`, { defaultValue: student.status })}</Badge>
                          <span className="text-xs text-muted-foreground">{t("admin.instances.accessSource", { source: source || t("common.manual") })}</span>
                          <span className="text-xs text-muted-foreground">{t("admin.instances.grantedAt", { value: formatDate(student.granted_at, true) })}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {source && <Badge variant="secondary">{source}</Badge>}
                          <Badge variant="outline">{t("admin.instances.analyticsAccess", { count: numberValue(analytics.access_created) })}</Badge>
                          <Badge variant="outline">{t("admin.instances.analyticsDevices", { count: numberValue(analytics.device_bound) })}</Badge>
                          <Badge variant="outline">{t("admin.instances.analyticsPages", { count: numberValue(analytics.page_viewed) })}</Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="grid gap-1 text-xs text-muted-foreground">
                          <span>{t("admin.instances.activeDevices", { count: numberValue(devicesSummary.active_count) })}</span>
                          <span>{t("admin.instances.allowedDevices", { count: numberValue(devicesSummary.allowed_devices, 1) })}</span>
                          <span>{t("admin.instances.lastSeen", { value: formatDate(devicesSummary.last_seen_at, true) })}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/admin/e-booklet-instances/${instanceId}/devices?userId=${userId}`}><HardDrive className="h-4 w-4" />{t("admin.students.manageDevices")}</Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
