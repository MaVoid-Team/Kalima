import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  FilePenLine,
  Plus,
  Search,
  ShieldCheck,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminEBookletTemplates } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";

const statusStyles = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

const formatDate = (value, language, fallback) => {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(language?.startsWith("ar") ? "ar-EG" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

const getLatestVersion = (template) => {
  if (Array.isArray(template?.versions) && template.versions.length > 0) {
    return template.versions[0];
  }
  return null;
};

export default function AdminEBookletTemplatesPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const {
    templates,
    pagination,
    filters,
    loading,
    actionLoading,
    fetchTemplates,
    setSearch,
    setStatus,
    setPage,
    updateTemplate,
    publishVersion,
  } = useAdminEBookletTemplates();

  const loadTemplates = useCallback(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates, filters.search, filters.status, pagination.page]);

  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  const handlePublish = async (template) => {
    const latestVersion = getLatestVersion(template);
    if (!latestVersion?.id) return;
    await publishVersion(latestVersion.id);
    fetchTemplates();
  };

  const handleArchive = async (template) => {
    await updateTemplate(template.id, { status: "archived" });
    fetchTemplates();
  };

  return (
    <div className="@container space-y-6" data-testid="admin-e-booklet-templates-page">
      <div className="flex flex-col gap-4 @md:flex-row @md:items-center @md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <BookOpenCheck className="h-8 w-8 text-primary" />
            {t("admin.templates.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("admin.templates.description")}
          </p>
        </div>
        <Button asChild data-testid="admin-create-e-booklet-link">
          <Link to="/admin/e-booklets/create">
            <Plus className="me-2 h-4 w-4" />
            {t("admin.templates.create")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 rounded-lg border bg-background p-4 @md:grid-cols-[1fr_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("admin.templates.searchPlaceholder")}
            className="ps-9"
            data-testid="admin-e-booklet-search"
          />
        </div>
        <Select value={filters.status} onValueChange={setStatus}>
          <SelectTrigger className="w-full" data-testid="admin-e-booklet-status-filter">
            <SelectValue placeholder={t("common.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.allStatuses")}</SelectItem>
            <SelectItem value="draft">{t("statuses.draft")}</SelectItem>
            <SelectItem value="published">{t("statuses.published")}</SelectItem>
            <SelectItem value="archived">{t("statuses.archived")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchTemplates} disabled={loading}>
          {t("common.refresh")}
        </Button>
      </div>

      {/* Desktop / Wide Container Table View */}
      <div className="hidden @4xl:block overflow-hidden rounded-2xl border bg-background shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.templates.table.template")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead>{t("admin.templates.table.version")}</TableHead>
              <TableHead numeric>{t("common.pages")}</TableHead>
              <TableHead numeric>{t("admin.templates.table.purchases")}</TableHead>
              <TableHead>{t("admin.templates.table.lastEdited")}</TableHead>
              <TableHead actions>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {t("admin.templates.loading")}
                </TableCell>
              </TableRow>
            )}
            {!loading && templates.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {t("admin.templates.empty")}
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              templates.map((template) => {
                const latestVersion = getLatestVersion(template);
                const status = template.status || "draft";
                const isReleased = template.is_released !== false;
                return (
                  <TableRow key={template.id}>
                    <TableCell truncate className="min-w-[240px]" title={template.description ? `${template.title}: ${template.description}` : template.title}>
                      <div className="font-semibold text-foreground">{template.title}</div>
                      <div className="mt-1 line-clamp-2 max-w-[420px] whitespace-normal text-xs text-muted-foreground">
                        {template.description || t("admin.templates.noDescription")}
                      </div>
                      <div className="mt-2 text-xs font-medium text-muted-foreground">
                        {Number(template.price || 0).toLocaleString()} {template.currency || "EGP"}
                      </div>
                      {template.release_at && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {!isReleased && (
                            <Badge className="rounded-md bg-amber-100 text-amber-900 hover:bg-amber-100">
                              {t("common.comingSoon")}
                            </Badge>
                          )}
                          <span>
                            {t("admin.templates.releaseAt", {
                              value: formatDate(template.release_at, i18n.language, ""),
                            })}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell status>
                      <Badge
                        variant="outline"
                        className={statusStyles[status] || statusStyles.draft}
                      >
                        {t(`statuses.${status}`, { defaultValue: status })}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {latestVersion ? (
                        <div className="text-sm">
                          <span className="font-semibold">v{latestVersion.version_number}</span>
                          <div className="text-xs text-muted-foreground">
                            {t(`statuses.${latestVersion.status}`, {
                              defaultValue: latestVersion.status,
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("admin.templates.noVersion")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell numeric>{latestVersion?.page_count || 0}</TableCell>
                    <TableCell numeric>{template._count?.purchases || 0}</TableCell>
                    <TableCell date>
                      {formatDate(
                        template.updated_at || template.created_at,
                        i18n.language,
                        t("common.notEditedYet"),
                      )}
                    </TableCell>
                    <TableCell actions>
                      <div className="flex justify-end gap-1.5">
                        {latestVersion?.id && status !== "published" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePublish(template)}
                            disabled={actionLoading}
                            data-testid={`admin-publish-e-booklet-${template.id}`}
                            title={t("common.publishVersion", { defaultValue: "Publish" })}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button asChild size="sm" variant="outline" title={t("common.edit", { defaultValue: "Edit" })}>
                          <Link to={`/admin/e-booklets/${template.id}/edit`}>
                            <FilePenLine className="h-4 w-4" />
                          </Link>
                        </Button>
                        {template.id && status === "published" && latestVersion?.id && (
                          <Button asChild size="sm" variant="outline" title={t("common.browse", { defaultValue: "Preview" })}>
                            <Link to={`/e-booklets/${template.id}/preview`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {status !== "archived" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleArchive(template)}
                            disabled={actionLoading}
                            title={t("common.archive", { defaultValue: "Archive" })}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {/* Adaptive Container Cards View (< @4xl) */}
      <div className="@4xl:hidden">
        {loading && (
          <div className="rounded-2xl border bg-background p-8 text-center text-sm text-muted-foreground shadow-xs">
            {t("admin.templates.loading")}
          </div>
        )}
        {!loading && templates.length === 0 && (
          <div className="rounded-2xl border bg-background p-8 text-center text-sm text-muted-foreground shadow-xs">
            {t("admin.templates.empty")}
          </div>
        )}
        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 gap-3.5 @md:grid-cols-2">
            {templates.map((template) => {
              const latestVersion = getLatestVersion(template);
              const status = template.status || "draft";
              const isReleased = template.is_released !== false;
              return (
                <div
                  key={template.id}
                  className="flex flex-col justify-between rounded-2xl border bg-card p-4 shadow-xs transition hover:shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground leading-snug">
                          {template.title}
                        </div>
                        {template.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 ${statusStyles[status] || statusStyles.draft}`}
                      >
                        {t(`statuses.${status}`, { defaultValue: status })}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="secondary" className="rounded-lg font-medium">
                        {Number(template.price || 0).toLocaleString()} {template.currency || "EGP"}
                      </Badge>
                      {template.release_at && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {!isReleased && (
                            <Badge className="rounded-md bg-amber-100 text-amber-900 hover:bg-amber-100">
                              {t("common.comingSoon")}
                            </Badge>
                          )}
                          <span>
                            {t("admin.templates.releaseAt", {
                              value: formatDate(template.release_at, i18n.language, ""),
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-2.5 text-xs text-muted-foreground @sm:grid-cols-4">
                      <div>
                        <span className="block text-[11px] text-muted-foreground/80">
                          {t("admin.templates.table.version")}
                        </span>
                        <span className="font-medium text-foreground">
                          {latestVersion ? `v${latestVersion.version_number}` : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-muted-foreground/80">
                          {t("common.pages")}
                        </span>
                        <span className="font-medium text-foreground">
                          {latestVersion?.page_count || 0}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-muted-foreground/80">
                          {t("admin.templates.table.purchases")}
                        </span>
                        <span className="font-medium text-foreground">
                          {template._count?.purchases || 0}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-muted-foreground/80">
                          {t("admin.templates.table.lastEdited")}
                        </span>
                        <span className="font-medium text-foreground truncate block">
                          {formatDate(
                            template.updated_at || template.created_at,
                            i18n.language,
                            "-",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
                    {latestVersion?.id && status !== "published" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePublish(template)}
                        disabled={actionLoading}
                        data-testid={`admin-publish-e-booklet-${template.id}`}
                        className="rounded-xl text-xs"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 me-1" />
                        {t("common.publish", { defaultValue: "Publish" })}
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
                      <Link to={`/admin/e-booklets/${template.id}/edit`}>
                        <FilePenLine className="h-3.5 w-3.5 me-1" />
                        {t("common.edit", { defaultValue: "Edit" })}
                      </Link>
                    </Button>
                    {template.id && status === "published" && latestVersion?.id && (
                      <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
                        <Link to={`/e-booklets/${template.id}/preview`}>
                          <Eye className="h-3.5 w-3.5 me-1" />
                          {t("common.browse", { defaultValue: "Preview" })}
                        </Link>
                      </Button>
                    )}
                    {status !== "archived" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArchive(template)}
                        disabled={actionLoading}
                        className="rounded-xl text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Archive className="h-3.5 w-3.5 me-1" />
                        {t("common.archive", { defaultValue: "Archive" })}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t("admin.templates.totalTemplates", { count: pagination.total })}
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            {t("common.previous")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("common.pageOf", { page: pagination.page, total: pageCount })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(pageCount, pagination.page + 1))}
            disabled={pagination.page >= pageCount}
          >
            {t("common.next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
