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

const statusStyles = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-zinc-200 bg-zinc-100 text-zinc-600",
};

const formatDate = (value) => {
  if (!value) return "Not edited yet";
  return new Intl.DateTimeFormat("en", {
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
    <div className="space-y-6" data-testid="admin-e-booklet-templates-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <BookOpenCheck className="h-8 w-8 text-primary" />
            E-Booklet Templates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage reusable e-booklet templates, versions, purchases, and hotspot structure.
          </p>
        </div>
        <Button asChild data-testid="admin-create-e-booklet-link">
          <Link to="/admin/e-booklets/create">
            <Plus className="me-2 h-4 w-4" />
            Create E-Booklet
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[1fr_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates"
            className="ps-9"
            data-testid="admin-e-booklet-search"
          />
        </div>
        <Select value={filters.status} onValueChange={setStatus}>
          <SelectTrigger className="w-full" data-testid="admin-e-booklet-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchTemplates} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Purchases</TableHead>
              <TableHead>Last Edited</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Loading e-booklet templates...
                </TableCell>
              </TableRow>
            )}
            {!loading && templates.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No e-booklet templates match the current filters.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              templates.map((template) => {
                const latestVersion = getLatestVersion(template);
                const status = template.status || "draft";
                return (
                  <TableRow key={template.id}>
                    <TableCell className="min-w-[260px]">
                      <div className="font-semibold text-foreground">{template.title}</div>
                      <div className="mt-1 line-clamp-2 max-w-[420px] whitespace-normal text-xs text-muted-foreground">
                        {template.description || "No description yet"}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {Number(template.price || 0).toLocaleString()} {template.currency || "EGP"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[status] || statusStyles.draft}
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {latestVersion ? (
                        <div className="text-sm">
                          v{latestVersion.version_number}
                          <div className="text-xs text-muted-foreground">{latestVersion.status}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No version</span>
                      )}
                    </TableCell>
                    <TableCell>{latestVersion?.page_count || 0}</TableCell>
                    <TableCell>{template._count?.purchases || 0}</TableCell>
                    <TableCell>{formatDate(template.updated_at || template.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {latestVersion?.id && status !== "published" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePublish(template)}
                            disabled={actionLoading}
                            data-testid={`admin-publish-e-booklet-${template.id}`}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/admin/e-booklets/${template.id}/edit`}>
                            <FilePenLine className="h-4 w-4" />
                          </Link>
                        </Button>
                        {template.slug && (
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/e-booklets/${template.slug}`}>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {pagination.total} templates total
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(pageCount, pagination.page + 1))}
            disabled={pagination.page >= pageCount}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
