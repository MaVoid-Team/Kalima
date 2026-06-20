import { useCallback, useEffect, useState } from "react";
import { Archive, RotateCcw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminEBookletHotspotLibrary } from "@/hooks/admin/useAdminEBooklets";
import HotspotPresetCard, { hotspotPresetTypes } from "@/components/admin/e-booklets/HotspotPresetCard";

const tagsToInput = (tags) => (Array.isArray(tags) ? tags.join(", ") : "");
const inputToTags = (value) => String(value || "").split(",").map((tag) => tag.trim()).filter(Boolean);

export default function AdminEBookletHotspotLibraryPage() {
  const { t } = useTranslation("eBooklets");
  const library = useAdminEBookletHotspotLibrary();
  const { presets, pagination, filters, loading, actionLoading, fetchPresets, setSearch, setType, setTag, setPage, setIncludeInactive, updatePresetMetadata, deletePreset, restorePreset } = library;
  const [editingPreset, setEditingPreset] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", tags: "" });
  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  const load = useCallback(() => {
    fetchPresets().catch(() => {});
  }, [fetchPresets]);

  useEffect(() => {
    load();
  }, [load, filters.search, filters.type, filters.tag, filters.includeInactive, pagination.page]);

  const openEdit = (preset) => {
    setEditingPreset(preset);
    setEditForm({ name: preset.name || "", description: preset.description || "", tags: tagsToInput(preset.tags || preset.tags_json) });
  };

  const saveEdit = async () => {
    if (!editingPreset) return;
    await updatePresetMetadata(editingPreset.id, { ...editForm, tags: inputToTags(editForm.tags) });
    setEditingPreset(null);
    fetchPresets();
  };

  const archiveOrDelete = async (preset) => {
    const confirmed = window.confirm(t("admin.hotspotLibrary.archiveDeleteConfirm"));
    if (!confirmed) return;
    const response = await deletePreset(preset.id);
    const action = response?.data?.action;
    toast.success(t(action === "deleted" ? "admin.hotspotLibrary.deleted" : "admin.hotspotLibrary.archived"));
    fetchPresets();
  };

  const restore = async (preset) => {
    await restorePreset(preset.id);
    fetchPresets();
  };

  return (
    <div className="space-y-6" data-testid="admin-e-booklet-hotspot-library-page">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("admin.hotspotLibrary.title")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("admin.hotspotLibrary.description")}
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[1fr_180px_180px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={filters.search} onChange={(event) => setSearch(event.target.value)} placeholder={t("admin.hotspotLibrary.searchHotspotPresets")} className="ps-9" />
        </div>
        <Select value={filters.type} onValueChange={setType}>
          <SelectTrigger><SelectValue placeholder={t("admin.hotspotLibrary.type")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.hotspotLibrary.allTypes")}</SelectItem>
            {hotspotPresetTypes.map((type) => <SelectItem key={type} value={type}>{t(`admin.editor.hotspots.types.${type}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input value={filters.tag} onChange={(event) => setTag(event.target.value)} placeholder={t("admin.hotspotLibrary.tag")} />
        <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <Checkbox checked={filters.includeInactive} onCheckedChange={(checked) => setIncludeInactive(Boolean(checked))} />
          {t("admin.hotspotLibrary.showArchived")}
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {loading && <div className="col-span-full rounded-xl border p-8 text-center text-muted-foreground">{t("admin.hotspotLibrary.loading")}</div>}
        {!loading && presets.length === 0 && <div className="col-span-full rounded-xl border p-8 text-center text-muted-foreground">{t("admin.hotspotLibrary.emptyWithEditorHint")}</div>}
        {!loading && presets.map((preset) => (
          <HotspotPresetCard
            key={preset.id}
            preset={preset}
            actions={(
              <>
                <Button size="sm" variant="outline" onClick={() => openEdit(preset)}>{t("admin.hotspotLibrary.editDetails")}</Button>
                {preset.is_active === false ? (
                  <Button size="sm" variant="outline" onClick={() => restore(preset)} disabled={actionLoading} aria-label={t("admin.hotspotLibrary.restorePreset")}><RotateCcw className="h-4 w-4" /></Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => archiveOrDelete(preset)} disabled={actionLoading} aria-label={t("admin.hotspotLibrary.archiveOrDeletePreset")}><Archive className="h-4 w-4" /></Button>
                )}
              </>
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t("admin.hotspotLibrary.totalPresets", { count: pagination.total })}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPage(Math.max(1, pagination.page - 1))}>{t("common.previous")}</Button>
          <span className="self-center text-sm text-muted-foreground">{t("common.pageOf", { page: pagination.page, total: pageCount })}</span>
          <Button variant="outline" size="sm" disabled={pagination.page >= pageCount} onClick={() => setPage(Math.min(pageCount, pagination.page + 1))}>{t("common.next")}</Button>
        </div>
      </div>

      <Dialog open={Boolean(editingPreset)} onOpenChange={(open) => !open && setEditingPreset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.hotspotLibrary.editDialogTitle")}</DialogTitle>
            <DialogDescription>{t("admin.hotspotLibrary.editDialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="hotspot-library-edit-name">{t("admin.hotspotLibrary.name")}</Label>
              <Input id="hotspot-library-edit-name" value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hotspot-library-edit-description">{t("admin.hotspotLibrary.descriptionLabel")}</Label>
              <Textarea id="hotspot-library-edit-description" value={editForm.description} onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hotspot-library-edit-tags">{t("admin.hotspotLibrary.tags")}</Label>
              <Input id="hotspot-library-edit-tags" value={editForm.tags} onChange={(event) => setEditForm((current) => ({ ...current, tags: event.target.value }))} placeholder={t("admin.hotspotLibrary.tagsPlaceholder")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPreset(null)}>{t("common.close")}</Button>
            <Button onClick={saveEdit} disabled={actionLoading || !editForm.name.trim()}>{t("admin.hotspotLibrary.saveDetails")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
