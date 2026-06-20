import { FileAudio, FileImage, FileText, FileVideo, HelpCircle, Link as LinkIcon, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const hotspotIcons = {
  text: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  file: Upload,
  link: LinkIcon,
  question_answer: HelpCircle,
};

export const hotspotPresetTypes = ["text", "image", "video", "audio", "file", "link", "question_answer"];

export function getHotspotPresetSnippet(preset, fallback = "No text preview") {
  if (preset?.title) return preset.title;
  if (preset?.text_content) return preset.text_content;
  const blocks = Array.isArray(preset?.content_json?.blocks) ? preset.content_json.blocks : [];
  const block = blocks.find((item) => item?.text_content || item?.supplementary_text || item?.url || item?.youtube_url);
  return block?.text_content || block?.supplementary_text || block?.url || block?.youtube_url || fallback;
}

export default function HotspotPresetCard({ preset, onSelect, actions, selected = false }) {
  const { t } = useTranslation("eBooklets");
  const Icon = hotspotIcons[preset?.type] || FileText;
  const tags = Array.isArray(preset?.tags) ? preset.tags : Array.isArray(preset?.tags_json) ? preset.tags_json : [];
  const color = preset?.display_behavior?.color || "blue";
  const placement = preset?.default_page_number
    ? t("admin.hotspotLibrary.defaultPlacement", {
        page: preset.default_page_number,
        x: Number(preset.default_x_percent || 0).toFixed(1),
        y: Number(preset.default_y_percent || 0).toFixed(1),
      })
    : t("admin.hotspotLibrary.noDefaultPlacement");

  return (
    <div className={`rounded-2xl border bg-background p-4 shadow-sm transition ${selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`} data-testid={`hotspot-preset-card-${preset?.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="rounded-xl border bg-muted p-2 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold text-foreground">{preset?.name}</h3>
              {preset?.is_active === false && <Badge variant="outline">{t("statuses.archived")}</Badge>}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {getHotspotPresetSnippet(preset, t("admin.hotspotLibrary.noTextPreview"))}
            </p>
          </div>
        </div>
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: `var(--${color}-600, currentColor)` }} aria-label={color} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        <Badge variant="secondary">{t(`admin.editor.hotspots.types.${preset?.type || "text"}`, { defaultValue: preset?.type || "text" })}</Badge>
        <Badge variant="outline">{t(`admin.editor.hotspots.shapes.${preset?.shape || "circle"}`, { defaultValue: preset?.shape || "circle" })}</Badge>
        {tags.slice(0, 4).map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{placement}</p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {actions}
        {onSelect && <Button size="sm" onClick={() => onSelect(preset)}>{t("admin.hotspotLibrary.selectPreset")}</Button>}
      </div>
    </div>
  );
}
