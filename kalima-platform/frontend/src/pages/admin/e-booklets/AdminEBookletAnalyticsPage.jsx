import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, FileArchive, HardDrive, HeartPulse, Percent, ShieldCheck, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <BarChart3 className="h-8 w-8 text-primary" />
            {t("admin.analytics.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.analytics.description")}</p>
        </div>
        <Button onClick={() => exportCsv(apiFilters())} disabled={loading}>
          <Download className="h-4 w-4" />
          {t("admin.analytics.exportCsv")}
        </Button>
      </div>

      <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-3 xl:grid-cols-5">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">{t("analytics.filters.dateRange")}</span>
          <select className="w-full rounded-md border bg-background px-3 py-2" value={filters.range} onChange={(event) => updateFilter("range", event.target.value)}>
            {DATE_RANGES.map((value) => <option key={value} value={value}>{t(`analytics.dateRanges.${value}`)}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">{t("analytics.filters.teacher")}</span>
          <input className="w-full rounded-md border bg-background px-3 py-2" value={teacherSearch} onChange={(event) => setTeacherSearch(event.target.value)} placeholder={t("analytics.filters.teacherSearchPlaceholder")} />
          <select className="w-full rounded-md border bg-background px-3 py-2" value={filters.teacherId} onChange={(event) => updateTeacherFilter(event.target.value)} disabled={teachersLoading && teacherOptions.length === 0}>
            <option value="">{teachersLoading ? t("analytics.filters.loadingTeachers") : t("analytics.filters.allTeachers")}</option>
            {teacherOptions.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacherLabel(teacher)}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">{t("analytics.filters.template")}</span>
          <input className="w-full rounded-md border bg-background px-3 py-2" value={filters.templateId} onChange={(event) => updateFilter("templateId", event.target.value)} placeholder={t("analytics.filters.templatePlaceholder")} disabled />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">{t("analytics.filters.instance")}</span>
          <input className="w-full rounded-md border bg-background px-3 py-2" value={filters.instanceId} onChange={(event) => updateFilter("instanceId", event.target.value)} placeholder={t("analytics.filters.instancePlaceholder")} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">{t("analytics.filters.source")}</span>
          <select className="w-full rounded-md border bg-background px-3 py-2" value={filters.source} onChange={(event) => updateFilter("source", event.target.value)}>
            {SOURCES.map((value) => <option key={value} value={value}>{t(`analytics.sources.${value}`)}</option>)}
          </select>
        </label>
      </div>

      {loading && <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">{t("analytics.loading")}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Wallet} label={t("analytics.metrics.approvedOnlineRevenue")} value={numberValue(marketing)} helper={t("analytics.metrics.estimatedOfflineRevenue", { value: numberValue(eventCount(analytics, "access_created")) })} />
        <MetricCard icon={Percent} label={t("analytics.metrics.internalCostMargin")} value={numberValue(margin)} helper={t("analytics.metrics.internalCost", { value: numberValue(internal) })} />
        <MetricCard icon={ShieldCheck} label={t("analytics.metrics.deviceSecurity")} value={numberValue(eventCount(analytics, "device_bound"))} helper={t("analytics.metrics.failedPasscodeSafe", { value: numberValue(eventCount(analytics, "passcode_failed")) })} />
        <MetricCard icon={HeartPulse} label={t("analytics.metrics.operationalHealth")} value={numberValue(eventCount(analytics, "viewer_opened") + eventCount(analytics, "page_viewed"))} helper={t("analytics.metrics.expiryArchive") } />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border bg-background p-4">
          <h2 className="font-semibold">{t("admin.analytics.sourceBreakdown")}</h2>
          <div className="mt-4 space-y-2 text-sm">
            {SOURCES.filter((source) => source !== "all").map((source) => (
              <div key={source} className="flex items-center justify-between rounded-md border p-3">
                <span>{t(`analytics.sources.${source}`)}</span>
                <Badge variant="outline">{filters.source === source ? t("analytics.filtered") : t("analytics.available")}</Badge>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border bg-background p-4">
          <h2 className="font-semibold">{t("admin.analytics.deviceSecurityTitle")}</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="rounded-md border p-3"><HardDrive className="me-1 inline h-4 w-4" />{t("admin.analytics.deviceSecurityCopy")}</div>
            <div className="rounded-md border p-3"><ShieldCheck className="me-1 inline h-4 w-4" />{t("admin.analytics.redactionCopy")}</div>
          </div>
        </section>
        <section className="rounded-lg border bg-background p-4">
          <h2 className="font-semibold">{t("admin.analytics.expiryArchiveTitle")}</h2>
          <div className="mt-4 rounded-md border p-3 text-sm"><FileArchive className="me-1 inline h-4 w-4" />{t("admin.analytics.expiryArchiveCopy")}</div>
        </section>
      </div>
    </div>
  );
}
