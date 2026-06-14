import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BarChart3, CalendarDays, Eye, Link2, MonitorSmartphone, ShieldCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTeacherEBookletAnalytics, useTeacherEBooklets } from "@/hooks/useEBookletAccess";

const DATE_RANGES = ["7d", "30d", "all"];

const getDateRange = (range) => {
  if (range === "all") return {};
  const days = range === "7d" ? 7 : 30;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { startDate: start.toISOString() };
};

const numberValue = (value) => Number(value ?? 0).toLocaleString();

const eventCount = (analytics, key) => Number(analytics?.events?.[key] ?? 0);

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">{label}</div>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {helper && <div className="mt-1 text-xs text-muted-foreground">{helper}</div>}
    </div>
  );
}

export default function TeacherEBookletAnalyticsPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialInstanceId = searchParams.get("instanceId") || "all";
  const [range, setRange] = useState(searchParams.get("range") || "30d");
  const [instanceId, setInstanceId] = useState(initialInstanceId);
  const { items, fetchTeacherEBooklets } = useTeacherEBooklets();
  const { analytics, loading, fetchAnalytics } = useTeacherEBookletAnalytics();

  useEffect(() => {
    fetchTeacherEBooklets().catch(() => {});
  }, [fetchTeacherEBooklets]);

  useEffect(() => {
    const filters = { ...getDateRange(range) };
    if (instanceId !== "all") filters.instanceId = instanceId;
    fetchAnalytics(filters).catch(() => {});
    const params = new URLSearchParams();
    params.set("range", range);
    if (instanceId !== "all") params.set("instanceId", instanceId);
    setSearchParams(params, { replace: true });
  }, [fetchAnalytics, instanceId, range, setSearchParams]);

  const rows = useMemo(() => items.map((access) => {
    const instance = access.booklet_instance || {};
    const expiry = instance.access_expires_at || instance.expires_at;
    const expired = expiry && new Date(expiry).getTime() <= Date.now();
    return { access, instance, expiry, expired };
  }), [items]);

  const formatDate = (value) => value ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(value)) : t("teacher.invites.noExpiry");
  const online = Number(analytics?.revenue?.onlineApproved ?? 0);
  const offline = Number(analytics?.revenue?.offlineEstimated ?? 0);

  return (
    <div className="space-y-6" data-testid="teacher-e-booklet-analytics-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <BarChart3 className="h-8 w-8 text-primary" />
            {t("teacher.analytics.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("teacher.analytics.description")}</p>
        </div>
        <Button asChild variant="outline"><Link to="/teacher/e-booklets">{t("common.backToMyEBooklets")}</Link></Button>
      </div>

      <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">{t("analytics.filters.dateRange")}</span>
          <select className="w-full rounded-md border bg-background px-3 py-2" value={range} onChange={(event) => setRange(event.target.value)}>
            {DATE_RANGES.map((value) => <option key={value} value={value}>{t(`analytics.dateRanges.${value}`)}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">{t("analytics.filters.instance")}</span>
          <select className="w-full rounded-md border bg-background px-3 py-2" value={instanceId} onChange={(event) => setInstanceId(event.target.value)}>
            <option value="all">{t("analytics.filters.allInstances")}</option>
            {rows.map(({ instance }) => <option key={instance.id} value={instance.id}>{instance.display_title || instance.template?.title || t("common.eBooklet")}</option>)}
          </select>
        </label>
      </div>

      {loading && <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">{t("analytics.loading")}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Eye} label={t("analytics.metrics.inviteOpens")} value={numberValue(eventCount(analytics, "invite_opened"))} helper={t("analytics.metrics.uniqueAnonymous", { value: numberValue(eventCount(analytics, "invite_opened")) })} />
        <MetricCard icon={Users} label={t("analytics.metrics.loggedInStudents")} value={numberValue(eventCount(analytics, "access_created"))} helper={t("analytics.metrics.accessCreated")} />
        <MetricCard icon={Link2} label={t("analytics.metrics.revenueEstimate")} value={numberValue(online + offline)} helper={t("analytics.metrics.teacherRevenueHelper", { online: numberValue(online), offline: numberValue(offline) })} />
        <MetricCard icon={MonitorSmartphone} label={t("analytics.metrics.opensSeatsDevices")} value={numberValue(eventCount(analytics, "viewer_opened") + eventCount(analytics, "page_viewed"))} helper={t("analytics.metrics.seats", { value: numberValue(rows.reduce((sum, row) => sum + Number(row.instance.used_invites_count || 0), 0)) })} />
      </div>

      <div className="rounded-lg border bg-background">
        <div className="border-b p-4">
          <h2 className="font-semibold">{t("teacher.analytics.instancesTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("teacher.analytics.instancesDescription")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-start text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">{t("common.eBooklet")}</th>
                <th className="px-4 py-3 text-start">{t("common.status")}</th>
                <th className="px-4 py-3 text-start">{t("teacher.quota")}</th>
                <th className="px-4 py-3 text-start">{t("teacher.used")}</th>
                <th className="px-4 py-3 text-start">{t("teacher.expiry")}</th>
                <th className="px-4 py-3 text-start">{t("analytics.metrics.deviceAccess")}</th>
                <th className="px-4 py-3 text-start">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ access, instance, expiry, expired }) => (
                <tr key={access.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{instance.display_title || instance.template?.title || t("common.eBooklet")}</td>
                  <td className="px-4 py-3"><Badge variant="outline">{t(`statuses.${instance.status || "active"}`)}</Badge></td>
                  <td className="px-4 py-3">{numberValue(instance.invite_quota)}</td>
                  <td className="px-4 py-3">{numberValue(instance.used_invites_count)}</td>
                  <td className="px-4 py-3"><CalendarDays className="me-1 inline h-4 w-4" />{formatDate(expiry)}</td>
                  <td className="px-4 py-3"><ShieldCheck className="me-1 inline h-4 w-4" />{expired ? t("statuses.revoked") : access.device_lock_status || t("statuses.active")}</td>
                  <td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => setInstanceId(String(instance.id))}>{t("analytics.drilldown")}</Button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">{t("teacher.emptyTitle")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
