import { useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminEBookletHotspotLibrary } from "@/hooks/admin/useAdminEBooklets";
import HotspotPresetCard, { hotspotPresetTypes } from "./HotspotPresetCard";

export default function HotspotLibraryPickerDialog({ open, onOpenChange, onSelectPreset, mode = "insert", title, description }) {
  const { t } = useTranslation("eBooklets");
  const library = useAdminEBookletHotspotLibrary();
  const { filters, pagination, presets, loading, fetchPresets, setSearch, setType, setTag, setPage } = library;
  const pageCount = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  const load = useCallback(() => {
    if (open) fetchPresets().catch(() => {});
  }, [fetchPresets, open]);

  useEffect(() => {
    load();
  }, [load, filters.search, filters.type, filters.tag, pagination.page]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title || t("admin.hotspotLibrary.title")}</DialogTitle>
          <DialogDescription>{description || t("admin.hotspotLibrary.pickerDescription")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={filters.search} onChange={(event) => setSearch(event.target.value)} placeholder={t("admin.hotspotLibrary.searchPresets")} className="ps-9" />
          </div>
          <Select value={filters.type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder={t("admin.hotspotLibrary.type")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.hotspotLibrary.allTypes")}</SelectItem>
              {hotspotPresetTypes.map((type) => <SelectItem key={type} value={type}>{t(`admin.editor.hotspots.types.${type}`)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input value={filters.tag} onChange={(event) => setTag(event.target.value)} placeholder={t("admin.hotspotLibrary.tag")} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {loading && <div className="col-span-full rounded-xl border p-8 text-center text-muted-foreground">{t("admin.hotspotLibrary.loading")}</div>}
          {!loading && presets.length === 0 && <div className="col-span-full rounded-xl border p-8 text-center text-muted-foreground">{t("admin.hotspotLibrary.empty")}</div>}
          {!loading && presets.map((preset) => (
            <HotspotPresetCard key={preset.id} preset={preset} onSelect={() => onSelectPreset?.(preset, mode)} />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{t("admin.hotspotLibrary.totalPresets", { count: pagination.total })}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPage(Math.max(1, pagination.page - 1))}>{t("common.previous")}</Button>
            <Button variant="outline" size="sm" disabled={pagination.page >= pageCount} onClick={() => setPage(Math.min(pageCount, pagination.page + 1))}>{t("common.next")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
