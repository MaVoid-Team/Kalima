import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/auth/useAuth";
import useRole from "@/hooks/useRole";
import { useEBookletViewer } from "@/hooks/useEBookletAccess";
import { useTranslation } from "react-i18next";

const getDimensions = (metadata, pageNumber) => {
  const dimensions =
    metadata?.booklet_instance?.template_version?.page_dimensions_json || [];
  return dimensions[pageNumber - 1] || dimensions[0] || { width: 612, height: 792 };
};

export default function EBookletViewerPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const { instanceId } = useParams();
  const { user } = useAuth();
  const { isStudent } = useRole();
  const viewer = useEBookletViewer();
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [hotspotContent, setHotspotContent] = useState(null);

  useEffect(() => {
    viewer.fetchMetadata(instanceId).catch(() => {});
  }, [instanceId, viewer.fetchMetadata]);

  useEffect(() => {
    viewer.fetchPage(instanceId, pageNumber).catch(() => {});
    setActiveHotspot(null);
    setHotspotContent(null);
  }, [instanceId, pageNumber, viewer.fetchPage]);

  useEffect(() => {
    const preventContextMenu = (event) => event.preventDefault();
    const preventPrintShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventPrintShortcut);
    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventPrintShortcut);
    };
  }, []);

  const metadata = viewer.metadata;
  const instance = metadata?.booklet_instance;
  const templateVersion = instance?.template_version;
  const pageCount = Math.max(1, Number(templateVersion?.page_count || 1));
  const dimensions = getDimensions(metadata, pageNumber);
  const today = new Intl.DateTimeFormat(i18n.language?.startsWith("ar") ? "ar-EG" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date());
  const watermark = t("viewer.watermark", {
    teacher: instance?.teacher?.name || t("common.teacher"),
    user: user?.name || t("common.user"),
    date: today,
  });
  const backHref = isStudent ? "/student/e-booklets" : "/teacher/e-booklets";

  const pageStyle = useMemo(
    () => ({
      aspectRatio: `${dimensions.width} / ${dimensions.height}`,
      transform: `scale(${zoom})`,
      transformOrigin: "top center",
    }),
    [dimensions.height, dimensions.width, zoom],
  );

  const openHotspot = async (hotspot) => {
    setActiveHotspot(hotspot);
    const response = await viewer.fetchHotspotContent(hotspot.id);
    setHotspotContent(response?.data || hotspot);
  };

  return (
    <div className="min-h-screen bg-slate-100" data-testid="e-booklet-viewer-page">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <Button asChild variant="ghost" size="sm" className="-ms-2">
              <Link to={backHref}>
                <ArrowLeft className="h-4 w-4" />
                {t("common.back")}
              </Link>
            </Button>
            <h1 className="truncate text-xl font-semibold">
              {instance?.display_title || instance?.template?.title || t("viewer.titleFallback")}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                {t("common.noDownload")}
              </Badge>
              <span>{t("common.pageOf", { page: pageNumber, total: pageCount })}</span>
              <span>{watermark}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber((page) => Math.min(pageCount, page + 1))}
              disabled={pageNumber >= pageCount}
            >
              {t("common.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom((value) => Math.max(0.75, value - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => document.documentElement.requestFullscreen?.()}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section
          className="select-none overflow-auto rounded-lg border bg-slate-200 p-4"
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="mx-auto w-full max-w-[820px] pb-10">
            <div
              className="relative overflow-hidden rounded-md border bg-white shadow-sm"
              style={pageStyle}
              draggable={false}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:10%_10%]" />
              <div className="absolute inset-x-10 top-10 h-7 rounded bg-slate-100" />
              <div className="absolute inset-x-10 top-24 space-y-3">
                <div className="h-3 rounded bg-slate-100" />
                <div className="h-3 w-5/6 rounded bg-slate-100" />
                <div className="h-3 w-3/4 rounded bg-slate-100" />
              </div>
              <div className="absolute inset-x-10 bottom-14 h-24 rounded border border-dashed border-slate-200 bg-slate-50" />
              <div className="pointer-events-none absolute inset-0 flex rotate-[-24deg] items-center justify-center text-center text-sm font-semibold uppercase tracking-wide text-slate-300/60">
                {watermark}
              </div>
              {viewer.hotspots.map((hotspot) => (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => openHotspot(hotspot)}
                  className="absolute rounded-full border-2 border-white bg-primary shadow-md"
                  style={{
                    left: `${hotspot.x_percent}%`,
                    top: `${hotspot.y_percent}%`,
                    width: Math.max(18, Number(hotspot.radius_percent || 1.8) * 12),
                    height: Math.max(18, Number(hotspot.radius_percent || 1.8) * 12),
                    transform: "translate(-50%, -50%)",
                  }}
                  aria-label={
                    hotspot.title ||
                    t("admin.editor.hotspots.hotspotFallback", {
                      type: t(`admin.editor.hotspots.types.${hotspot.type}`, {
                        defaultValue: hotspot.type,
                      }),
                    })
                  }
                />
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-lg border bg-background p-4">
          <h2 className="font-semibold">{t("viewer.hotspotsTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("viewer.hotspotsDescription")}
          </p>
          <div className="mt-4 space-y-3">
            {viewer.hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                type="button"
                onClick={() => openHotspot(hotspot)}
                className="w-full rounded-md border p-3 text-start hover:bg-muted/50"
              >
                <div className="font-medium">
                  {hotspot.title ||
                    t("admin.editor.hotspots.hotspotFallback", {
                      type: t(`admin.editor.hotspots.types.${hotspot.type}`, {
                        defaultValue: hotspot.type,
                      }),
                    })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t(`admin.editor.hotspots.types.${hotspot.type}`, {
                    defaultValue: hotspot.type,
                  })}
                </div>
              </button>
            ))}
            {viewer.hotspots.length === 0 && (
              <div className="rounded-md border p-5 text-center text-sm text-muted-foreground">
                {t("viewer.emptyHotspots")}
              </div>
            )}
          </div>

          {activeHotspot && (
            <div className="mt-5 rounded-md border bg-muted/30 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-semibold">
                  {activeHotspot.title || t("viewer.hotspotFallback")}
                </h3>
                <Badge variant="outline">
                  {t(`admin.editor.hotspots.types.${activeHotspot.type}`, {
                    defaultValue: activeHotspot.type,
                  })}
                </Badge>
              </div>
              {activeHotspot.type === "text" ? (
                <p className="whitespace-pre-wrap text-sm">
                  {hotspotContent?.text_content || activeHotspot.text_content || t("viewer.noText")}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("viewer.privateMedia", {
                    id: hotspotContent?.asset_file_id || activeHotspot.asset_file_id,
                  })}
                </p>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
