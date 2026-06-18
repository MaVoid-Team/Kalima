import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, FileArchive, Filter, HardDrive, HeartPulse, Percent, Search, ShieldCheck, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminEBookletAnalytics, useAdminTeacherOptions } from "@/hooks/admin/useAdminEBooklets";

const DATE_RANGES = ["7d", "30d", "all"];
const SOURCES = ["all", "offline_passcode", "online_purchase", "free_invite"];

const getDateRange = (range) => {
  if (range === "all") return {};
  const days = range === "7d" ? 7 : 30;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { startDate: start.toISOString() };
};

const numberValue = (value) => Number(value ?? 0).toLocaleString();
const eventCount = (analytics, key) => Number(analytics?.events?.[key] ?? 0);
const teacherLabel = (teacher) => [teacher?.name, teacher?.email || teacher?.phone].filter(Boolean).join(" — ") || "Unnamed teacher";

function FieldShell({ label, children, className = "" }) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 text-sm font-medium text-foreground ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {children}
    </div>
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

export default function AdminEBookletAnalyticsPage() {
  const { t } = useTranslation("eBooklets");
  const { analytics, loading, fetchAnalytics, exportCsv } = useAdminEBookletAnalytics();
  const { teachers, loading: teachersLoading, fetchTeachers } = useAdminTeacherOptions();
  const [filters, setFilters] = useState({ range: "30d", teacherId: "", templateId: "", instanceId: "", source: "all" });
  const [teacherSearch, setTeacherSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const apiFilters = () => {
    const next = { ...getDateRange(filters.range) };
    if (filters.teacherId) next.teacherId = filters.teacherId;
    if (filters.instanceId) next.instanceId = filters.instanceId;
    if (filters.source !== "all") next.source = filters.source;
    return next;
  };

  useEffect(() => {
    fetchAnalytics(apiFilters()).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.range, filters.teacherId, filters.instanceId, filters.source]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchTeachers(teacherSearch).catch(() => {});
    }, 300);
    return () => window.clearTimeout(timer);
  }, [fetchTeachers, teacherSearch]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const teacherOptions = useMemo(() => {
    if (!selectedTeacher || teachers.some((teacher) => String(teacher.id) === String(selectedTeacher.id))) return teachers;
    return [selectedTeacher, ...teachers];
  }, [selectedTeacher, teachers]);
  const updateTeacherFilter = (teacherId) => {
    const nextTeacher = teacherOptions.find((teacher) => String(teacher.id) === String(teacherId)) || null;
    setSelectedTeacher(nextTeacher);
    updateFilter("teacherId", teacherId);
  };
  const marketing = Number(analytics?.revenue?.marketing ?? 0);
  const internal = Number(analytics?.revenue?.internal ?? 0);
  const margin = marketing - internal;

  return (
    <div className="space-y-6" data-testid="admin-e-booklet-analytics-page">
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-background p-5 shadow-sm sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/30 to-transparent" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.analytics.title")}</h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">{t("admin.analytics.description")}</p>
            </div>
          </div>
          <Button className="self-start rounded-full px-5 lg:self-center" onClick={() => exportCsv(apiFilters())} disabled={loading}>
            <Download className="h-4 w-4" />
            {t("admin.analytics.exportCsv")}
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/15 bg-background p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Filter className="h-4 w-4 text-primary" />
            {t("analytics.filters.title", "Analytics filters")}
          </div>
          <Badge variant="outline" className="rounded-full">{t("analytics.filters.live", "Live query")}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
          <FieldShell label={t("analytics.filters.dateRange")} className="xl:col-span-2">
            <Select value={filters.range} onValueChange={(value) => updateFilter("range", value)}>
              <SelectTrigger className="h-11 w-full rounded-xl bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="z-[9999] border-primary/20 bg-background text-foreground shadow-2xl">
                {DATE_RANGES.map((value) => <SelectItem key={value} value={value}>{t(`analytics.dateRanges.${value}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldShell>

          <FieldShell label={t("analytics.filters.teacherSearch", "Teacher search")} className="xl:col-span-3">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-11 rounded-xl ps-10" value={teacherSearch} onChange={(event) => setTeacherSearch(event.target.value)} placeholder={t("analytics.filters.teacherSearchPlaceholder")} />
            </div>
          </FieldShell>

          <FieldShell label={t("analytics.filters.teacher")} className="xl:col-span-3">
            <Select value={filters.teacherId || "all"} onValueChange={(value) => updateTeacherFilter(value === "all" ? "" : value)} disabled={teachersLoading && teacherOptions.length === 0}>
              <SelectTrigger className="h-11 w-full rounded-xl bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="z-[9999] max-w-[min(34rem,calc(100vw-2rem))] border-primary/20 bg-background text-foreground shadow-2xl">
                <SelectItem value="all">{teachersLoading ? t("analytics.filters.loadingTeachers") : t("analytics.filters.allTeachers")}</SelectItem>
                {teacherOptions.map((teacher) => <SelectItem key={teacher.id} value={String(teacher.id)}>{teacherLabel(teacher)}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldShell>

          <FieldShell label={t("analytics.filters.instance")} className="xl:col-span-2">
            <Input className="h-11 rounded-xl" value={filters.instanceId} onChange={(event) => updateFilter("instanceId", event.target.value)} placeholder={t("analytics.filters.instancePlaceholder")} />
          </FieldShell>

          <FieldShell label={t("analytics.filters.source")} className="xl:col-span-2">
            <Select value={filters.source} onValueChange={(value) => updateFilter("source", value)}>
              <SelectTrigger className="h-11 w-full rounded-xl bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="z-[9999] border-primary/20 bg-background text-foreground shadow-2xl">
                {SOURCES.map((value) => <SelectItem key={value} value={value}>{t(`analytics.sources.${value}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </FieldShell>

          <FieldShell label={t("analytics.filters.template")} className="md:col-span-2 xl:col-span-12">
            <Input className="h-11 rounded-xl bg-muted/40" value={filters.templateId} onChange={(event) => updateFilter("templateId", event.target.value)} placeholder={t("analytics.filters.templatePlaceholder")} disabled />
          </FieldShell>
        </div>
      </section>

      {loading && <div className="rounded-2xl border border-primary/15 bg-background p-4 text-sm text-muted-foreground">{t("analytics.loading")}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Wallet} label={t("analytics.metrics.approvedOnlineRevenue")} value={numberValue(marketing)} helper={t("analytics.metrics.estimatedOfflineRevenue", { value: numberValue(eventCount(analytics, "access_created")) })} />
        <MetricCard icon={Percent} label={t("analytics.metrics.internalCostMargin")} value={numberValue(margin)} helper={t("analytics.metrics.internalCost", { value: numberValue(internal) })} />
        <MetricCard icon={ShieldCheck} label={t("analytics.metrics.deviceSecurity")} value={numberValue(eventCount(analytics, "device_bound"))} helper={t("analytics.metrics.failedPasscodeSafe", { value: numberValue(eventCount(analytics, "passcode_failed")) })} />
        <MetricCard icon={HeartPulse} label={t("analytics.metrics.operationalHealth")} value={numberValue(eventCount(analytics, "viewer_opened") + eventCount(analytics, "page_viewed"))} helper={t("analytics.metrics.expiryArchive") } />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border bg-background p-5 shadow-sm">
          <h2 className="font-semibold">{t("admin.analytics.sourceBreakdown")}</h2>
          <div className="mt-4 space-y-2 text-sm">
            {SOURCES.filter((source) => source !== "all").map((source) => (
              <div key={source} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <span className="min-w-0 truncate">{t(`analytics.sources.${source}`)}</span>
                <Badge variant="outline" className="shrink-0 rounded-full">{filters.source === source ? t("analytics.filtered") : t("analytics.available")}</Badge>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border bg-background p-5 shadow-sm">
          <h2 className="font-semibold">{t("admin.analytics.deviceSecurityTitle")}</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="rounded-xl border p-3 leading-6"><HardDrive className="me-1 inline h-4 w-4 text-primary" />{t("admin.analytics.deviceSecurityCopy")}</div>
            <div className="rounded-xl border p-3 leading-6"><ShieldCheck className="me-1 inline h-4 w-4 text-primary" />{t("admin.analytics.redactionCopy")}</div>
          </div>
        </section>
        <section className="rounded-2xl border bg-background p-5 shadow-sm">
          <h2 className="font-semibold">{t("admin.analytics.expiryArchiveTitle")}</h2>
          <div className="mt-4 rounded-xl border p-3 text-sm leading-6"><FileArchive className="me-1 inline h-4 w-4 text-primary" />{t("admin.analytics.expiryArchiveCopy")}</div>
        </section>
      </div>
    </div>
  );
}
