import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BarChart3, CalendarDays, Download, Eye, FileText, Filter, Link2, MonitorSmartphone, RefreshCcw, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeacherEBookletAnalytics, useTeacherEBooklets } from "@/hooks/useEBookletAccess";
import { getEBookletDisplayTitle } from "@/utils/eBookletTitleUtils";

const DATE_RANGES = ["7d", "30d", "all", "custom"];
const SOURCES = ["all", "offline_passcode", "online_purchase", "free_invite"];

const toIsoStartOfDay = (value) => value ? new Date(`${value}T00:00:00.000`).toISOString() : undefined;
const toIsoEndOfDay = (value) => value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined;

const getDateRange = ({ range, startDate, endDate }) => {
  if (range === "all") return {};
  if (range === "custom") {
    return {
      startDate: toIsoStartOfDay(startDate),
      endDate: toIsoEndOfDay(endDate),
    };
  }
  const days = range === "7d" ? 7 : 30;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { startDate: start.toISOString() };
};

const numberValue = (value) => Number(value ?? 0).toLocaleString();
const eventCount = (analytics, key) => Number(analytics?.events?.[key] ?? 0);
const sourceCount = (analytics, key) => Number(analytics?.sourceBreakdown?.[key] ?? 0);

function FieldShell({ label, children, className = "" }) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 text-sm font-medium text-foreground ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-primary/15 bg-background p-5 shadow-sm transition-colors hover:border-primary/30">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary/25 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-3 text-3xl font-bold leading-none tracking-tight text-foreground">{value}</div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {helper && <div className="mt-4 border-t border-dashed border-border pt-3 text-xs leading-5 text-muted-foreground">{helper}</div>}
    </div>
  );
}

export default function TeacherEBookletAnalyticsPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    range: searchParams.get("range") || "30d",
    instanceId: searchParams.get("instanceId") || "all",
    source: searchParams.get("source") || "all",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });
  const { items, fetchTeacherEBooklets } = useTeacherEBooklets();
  const { analytics, loading, fetchAnalytics, exportCsv } = useTeacherEBookletAnalytics();

  useEffect(() => {
    fetchTeacherEBooklets().catch(() => {});
  }, [fetchTeacherEBooklets]);

  const apiFilters = useMemo(() => {
    const next = { ...getDateRange(filters) };
    if (filters.instanceId !== "all") next.instanceId = filters.instanceId;
    if (filters.source !== "all") next.source = filters.source;
    return next;
  }, [filters]);

  useEffect(() => {
    fetchAnalytics(apiFilters).catch(() => {});
    const params = new URLSearchParams();
    params.set("range", filters.range);
    if (filters.instanceId !== "all") params.set("instanceId", filters.instanceId);
    if (filters.source !== "all") params.set("source", filters.source);
    if (filters.range === "custom" && filters.startDate) params.set("startDate", filters.startDate);
    if (filters.range === "custom" && filters.endDate) params.set("endDate", filters.endDate);
    setSearchParams(params, { replace: true });
  }, [apiFilters, fetchAnalytics, filters, setSearchParams]);

  const rows = useMemo(() => items.map((access) => {
    const instance = access.booklet_instance || {};
    const expiry = instance.access_expires_at || instance.expires_at;
    const expired = expiry && new Date(expiry).getTime() <= Date.now();
    return { access, instance, expiry, expired };
  }), [items]);

  const selectedRows = useMemo(
    () => filters.instanceId === "all" ? rows : rows.filter(({ instance }) => String(instance.id) === String(filters.instanceId)),
    [filters.instanceId, rows],
  );

  const activeFilters = useMemo(() => {
    const chips = [];
    chips.push(t(`analytics.dateRanges.${filters.range}`));
    if (filters.instanceId !== "all") {
      const selected = rows.find(({ instance }) => String(instance.id) === String(filters.instanceId));
      chips.push(getEBookletDisplayTitle(selected?.instance, t("analytics.filters.instanceValue", { id: filters.instanceId })));
    }
    if (filters.source !== "all") chips.push(t(`analytics.sources.${filters.source}`));
    if (filters.range === "custom" && (filters.startDate || filters.endDate)) chips.push([filters.startDate, filters.endDate].filter(Boolean).join(" - "));
    return chips;
  }, [filters, rows, t]);

  const updateFilter = (key, value) => setFilters((current) => ({
    ...current,
    [key]: value,
    ...(key === "range" && value !== "custom" ? { startDate: "", endDate: "" } : {}),
  }));
  const clearFilters = () => setFilters({ range: "30d", instanceId: "all", source: "all", startDate: "", endDate: "" });
  const formatDate = (value) => value ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(value)) : t("teacher.invites.noExpiry");
  const online = Number(analytics?.revenue?.onlineApproved ?? 0);
  const offline = Number(analytics?.revenue?.offlineEstimated ?? 0);
  const totalSeats = selectedRows.reduce((sum, row) => sum + Number(row.instance.invite_quota || 0), 0);
  const usedSeats = selectedRows.reduce((sum, row) => sum + Number(row.instance.used_invites_count || 0), 0);

  return (
    <div className="space-y-6" data-testid="teacher-e-booklet-analytics-page">
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-background p-5 shadow-sm sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/30 to-transparent" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("teacher.analytics.title")}</h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">{t("teacher.analytics.description")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map((label) => <Badge key={label} variant="outline" className="rounded-full">{label}</Badge>)}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:self-center">
            <Button className="rounded-full px-5" onClick={() => exportCsv(apiFilters)} disabled={loading}>
              <Download className="h-4 w-4" />
              {t("teacher.analytics.exportReport")}
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5"><Link to="/teacher/e-booklets">{t("common.backToMyEBooklets")}</Link></Button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/15 bg-background p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Filter className="h-4 w-4 text-primary" />
            {t("teacher.analytics.advancedFilters")}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full">{t("analytics.filters.live")}</Badge>
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <RefreshCcw className="h-4 w-4" />
              {t("analytics.filters.clear")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
          <FieldShell label={t("analytics.filters.dateRange")} className="xl:col-span-2">
            <Select value={filters.range} onValueChange={(value) => updateFilter("range", value)}>
              <SelectTrigger className="h-11 rounded-xl bg-background"><SelectValue /></SelectTrigger>
              <SelectContent position="popper" align="start" className="z-[9999] border-primary/20 bg-background text-foreground shadow-2xl">
                {DATE_RANGES.map((value) => <SelectItem key={value} value={value}>{t(`analytics.dateRanges.${value}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldShell>

          <FieldShell label={t("analytics.filters.instance")} className="xl:col-span-4">
            <Select value={filters.instanceId} onValueChange={(value) => updateFilter("instanceId", value)}>
              <SelectTrigger className="h-11 rounded-xl bg-background"><SelectValue /></SelectTrigger>
              <SelectContent position="popper" align="start" className="z-[9999] max-w-[min(34rem,calc(100vw-2rem))] border-primary/20 bg-background text-foreground shadow-2xl">
                <SelectItem value="all">{t("analytics.filters.allInstances")}</SelectItem>
                {rows.map(({ instance }) => <SelectItem key={instance.id} value={String(instance.id)}>{getEBookletDisplayTitle(instance, t("common.eBooklet"))}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldShell>

          <FieldShell label={t("analytics.filters.source")} className="xl:col-span-3">
            <Select value={filters.source} onValueChange={(value) => updateFilter("source", value)}>
              <SelectTrigger className="h-11 rounded-xl bg-background"><SelectValue /></SelectTrigger>
              <SelectContent position="popper" align="start" className="z-[9999] border-primary/20 bg-background text-foreground shadow-2xl">
                {SOURCES.map((value) => <SelectItem key={value} value={value}>{t(`analytics.sources.${value}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldShell>

          <FieldShell label={t("analytics.filters.startDate")} className="xl:col-span-1">
            <Input className="h-11 rounded-xl" type="date" value={filters.startDate} onChange={(event) => updateFilter("startDate", event.target.value)} disabled={filters.range !== "custom"} />
          </FieldShell>

          <FieldShell label={t("analytics.filters.endDate")} className="xl:col-span-2">
            <Input className="h-11 rounded-xl" type="date" value={filters.endDate} onChange={(event) => updateFilter("endDate", event.target.value)} disabled={filters.range !== "custom"} />
          </FieldShell>
        </div>
      </section>

      {loading && <div className="rounded-2xl border border-primary/15 bg-background p-4 text-sm text-muted-foreground">{t("analytics.loading")}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Eye} label={t("analytics.metrics.inviteOpens")} value={numberValue(eventCount(analytics, "invite_opened"))} helper={t("analytics.metrics.uniqueAnonymous", { value: numberValue(analytics?.inviteOpens?.approximateUniqueAnonymousVisitors ?? eventCount(analytics, "invite_opened")) })} />
        <MetricCard icon={Users} label={t("analytics.metrics.loggedInStudents")} value={numberValue(eventCount(analytics, "access_created"))} helper={t("analytics.metrics.accessCreated")} />
        <MetricCard icon={Link2} label={t("analytics.metrics.revenueEstimate")} value={numberValue(online + offline)} helper={t("analytics.metrics.teacherRevenueHelper", { online: numberValue(online), offline: numberValue(offline) })} />
        <MetricCard icon={MonitorSmartphone} label={t("analytics.metrics.opensSeatsDevices")} value={numberValue(eventCount(analytics, "viewer_opened") + eventCount(analytics, "page_viewed"))} helper={t("analytics.metrics.seats", { value: numberValue(usedSeats) })} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border bg-background p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4 text-primary" />{t("teacher.analytics.reportTitle")}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("teacher.analytics.reportDescription")}</p>
            </div>
            <Badge variant="outline" className="shrink-0 rounded-full">{t("teacher.analytics.teacherScoped")}</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border p-3 text-sm"><div className="text-muted-foreground">{t("teacher.analytics.reportPeriod")}</div><div className="mt-1 font-semibold">{t(`analytics.dateRanges.${filters.range}`)}</div></div>
            <div className="rounded-xl border p-3 text-sm"><div className="text-muted-foreground">{t("teacher.analytics.reportRevenue")}</div><div className="mt-1 font-semibold">{numberValue(online + offline)}</div></div>
            <div className="rounded-xl border p-3 text-sm"><div className="text-muted-foreground">{t("teacher.analytics.reportAccess")}</div><div className="mt-1 font-semibold">{numberValue(eventCount(analytics, "access_created"))}</div></div>
            <div className="rounded-xl border p-3 text-sm"><div className="text-muted-foreground">{t("teacher.analytics.reportSeats")}</div><div className="mt-1 font-semibold">{numberValue(usedSeats)} / {numberValue(totalSeats)}</div></div>
          </div>
        </section>

        <section className="rounded-2xl border bg-background p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold"><TrendingUp className="h-4 w-4 text-primary" />{t("teacher.analytics.sourceBreakdown")}</h2>
          <div className="mt-4 space-y-2 text-sm">
            {SOURCES.filter((source) => source !== "all").map((source) => (
              <div key={source} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <span className="min-w-0 truncate">{t(`analytics.sources.${source}`)}</span>
                <Badge variant="outline" className="shrink-0 rounded-full">{numberValue(sourceCount(analytics, source))}</Badge>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="rounded-2xl border bg-background shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold">{t("teacher.analytics.instancesTitle")}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{t("teacher.analytics.instancesDescription")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="kalima-data-table min-w-full">
            <thead className="text-start">
              <tr>
                <th className="px-4 py-3 text-start">{t("common.eBooklet")}</th>
                <th className="px-4 py-3 text-start">{t("common.status")}</th>
                <th className="kalima-number px-4 py-3">{t("teacher.quota")}</th>
                <th className="kalima-number px-4 py-3">{t("teacher.used")}</th>
                <th className="px-4 py-3 text-start">{t("teacher.expiry")}</th>
                <th className="px-4 py-3 text-start">{t("analytics.metrics.deviceAccess")}</th>
                <th className="kalima-actions px-4 py-3">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {selectedRows.map(({ access, instance, expiry, expired }) => (
                <tr key={access.id}>
                  <td className="kalima-truncate px-4 py-3 font-medium" title={getEBookletDisplayTitle(instance, t("common.eBooklet"))}>{getEBookletDisplayTitle(instance, t("common.eBooklet"))}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className="rounded-full">{t(`statuses.${instance.status || "active"}`)}</Badge></td>
                  <td className="kalima-number px-4 py-3">{numberValue(instance.invite_quota)}</td>
                  <td className="kalima-number px-4 py-3">{numberValue(instance.used_invites_count)}</td>
                  <td className="kalima-date px-4 py-3"><CalendarDays className="me-1 inline h-4 w-4" />{formatDate(expiry)}</td>
                  <td className="px-4 py-3"><ShieldCheck className="me-1 inline h-4 w-4" />{expired ? t("statuses.revoked") : access.device_lock_status || t("statuses.active")}</td>
                  <td className="kalima-actions px-4 py-3"><Button size="sm" variant="outline" onClick={() => updateFilter("instanceId", String(instance.id))}>{t("analytics.drilldown")}</Button></td>
                </tr>
              ))}
              {selectedRows.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">{t("teacher.emptyTitle")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
