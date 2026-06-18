import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Lock,
  Maximize2,
  Music,
  PlaySquare,
  HelpCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/auth/useAuth";
import useRole from "@/hooks/useRole";
import { useEBookletViewer } from "@/hooks/useEBookletAccess";
import { useTranslation } from "react-i18next";

const HOTSPOT_TYPES = {
  text: { icon: FileText, className: "bg-sky-600" },
  image: { icon: ImageIcon, className: "bg-emerald-600" },
  audio: { icon: Music, className: "bg-violet-600" },
  video: { icon: PlaySquare, className: "bg-rose-600" },
  file: { icon: Download, className: "bg-amber-600" },
  link: { icon: LinkIcon, className: "bg-cyan-600" },
  question_answer: { icon: HelpCircle, className: "bg-fuchsia-600" },
};

const getDimensions = (metadata, pageNumber) => {
  const dimensions =
    metadata?.booklet_instance?.template_version?.page_dimensions_json || [];
  return dimensions[pageNumber - 1] || dimensions[0] || { width: 612, height: 792 };
};

const clamp = (value, fallback, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const getBlocks = (hotspot) => {
  const blocks = hotspot?.content_json?.blocks;
  if (Array.isArray(blocks) && blocks.length > 0) return blocks;

  const legacyBlock = { type: hotspot?.type || "text" };
  if (hotspot?.asset_file_id) legacyBlock.asset_file_id = hotspot.asset_file_id;
  if (hotspot?.text_content) legacyBlock.text_content = hotspot.text_content;
  return [legacyBlock];
};

const getHotspotLabel = (hotspot, t) =>
  hotspot?.title ||
  t("admin.editor.hotspots.hotspotFallback", {
    type: t(`admin.editor.hotspots.types.${hotspot?.type}`, {
      defaultValue: hotspot?.type || "hotspot",
    }),
  });

const getReference = (hotspot) => hotspot?.reference_number || hotspot?.sort_order || hotspot?.id;

const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const videoId = parsed.hostname.includes("youtu.be")
      ? parsed.pathname.replace("/", "")
      : parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : "";
  } catch {
    return "";
  }
};

const getSafeExternalUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  try {
    const parsed = new URL(url.trim());
    return ["https:", "http:", "mailto:", "tel:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
};

const buildDeviceFingerprint = async () => {
  const storageKey = "kalima:e-booklet-device-fingerprint:v1";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;

  const randomPart = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const raw = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    randomPart,
  ].join("|");

  let fingerprint = raw;
  if (window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(raw),
    );
    fingerprint = Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }
  window.localStorage.setItem(storageKey, fingerprint);
  return fingerprint;
};

function HotspotMarker({ hotspot, active, onOpen, t }) {
  const typeMeta = HOTSPOT_TYPES[hotspot.type] || HOTSPOT_TYPES.text;
  const Icon = typeMeta.icon;
  const shape = hotspot.shape || "circle";
  const width = shape === "circle" || shape === "oval"
    ? clamp(hotspot.width_percent || hotspot.radius_percent * 2, 4, 2, 35)
    : clamp(hotspot.width_percent, 8, 2, 40);
  const height = shape === "circle" || shape === "square"
    ? width
    : clamp(hotspot.height_percent || hotspot.radius_percent * 2, 4, 2, 35);
  const left = clamp(hotspot.x_percent, 50, 0, 100);
  const top = clamp(hotspot.y_percent, 50, 0, 100);
  const opacity = clamp(hotspot.display_behavior?.opacity_percent, 100, 0, 100) / 100;
  const baseStyle = {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
    opacity,
    transform: "translate(-50%, -50%)",
  };

  if (shape === "triangle") {
    return (
      <button
        type="button"
        onClick={() => onOpen(hotspot)}
        className="absolute flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        style={baseStyle}
        aria-label={getHotspotLabel(hotspot, t)}
      >
        <span
          className={`absolute inset-0 ${active ? "opacity-95" : "opacity-80"}`}
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        >
          <span className={`block h-full w-full ${typeMeta.className}`} />
        </span>
        <span className="relative z-10 flex h-7 min-w-7 items-center justify-center rounded-full border border-white bg-black/55 px-1 text-xs font-bold text-white shadow">
          {getReference(hotspot)}
        </span>
      </button>
    );
  }

  const roundedClass = shape === "rectangle" || shape === "square" ? "rounded-md" : "rounded-full";
  return (
    <button
      type="button"
      onClick={() => onOpen(hotspot)}
      className={`absolute flex items-center justify-center border-2 border-white text-white shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${roundedClass} ${typeMeta.className} ${active ? "ring-4 ring-primary/30" : ""}`}
      style={baseStyle}
      aria-label={getHotspotLabel(hotspot, t)}
    >
      <Icon className="h-4 w-4 opacity-90" />
      <span className="ms-1 text-xs font-bold">{getReference(hotspot)}</span>
    </button>
  );
}

function AssetBlock({ block, hotspot, viewer, t, instanceId }) {
  const [assetUrl, setAssetUrl] = useState(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const assetId = block.asset_file_id || hotspot.asset_file_id;
  const interaction = hotspot.interaction_json || {};
  const imageInteraction = interaction.image || {};
  const shouldAutoExpand = block.type === "image" && imageInteraction.autoExpand;
  const canExpandOnClick = block.type === "image" && imageInteraction.expandOnClick !== false;

  useEffect(() => {
    if (!assetId) return undefined;
    let active = true;
    let createdUrl = null;
    setAssetLoading(true);
    viewer
      .fetchHotspotAssetBlobUrl(hotspot.id, assetId, instanceId)
      .then((url) => {
        createdUrl = url;
        if (active) {
          setAssetUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch(() => {
        if (active) setAssetUrl(null);
      })
      .finally(() => {
        if (active) setAssetLoading(false);
      });
    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [assetId, hotspot.id, instanceId, viewer.fetchHotspotAssetBlobUrl]);

  useEffect(() => {
    setExpanded(Boolean(shouldAutoExpand));
  }, [shouldAutoExpand, assetUrl]);

  if (!assetId) {
    return <p className="text-sm text-muted-foreground">{t("viewer.noAsset")}</p>;
  }
  if (assetLoading) {
    return <p className="text-sm text-muted-foreground">{t("viewer.loadingAsset")}</p>;
  }
  if (!assetUrl) {
    return <p className="text-sm text-muted-foreground">{t("viewer.assetUnavailable")}</p>;
  }

  if (block.type === "image") {
    return (
      <button
        type="button"
        className="block w-full cursor-zoom-in overflow-hidden rounded-md border bg-background"
        onClick={() => canExpandOnClick && setExpanded((value) => !value)}
        disabled={!canExpandOnClick}
      >
        <img
          src={assetUrl}
          alt={block.alt || hotspot.title || t("admin.editor.hotspots.types.image")}
          className={`w-full select-none object-contain ${expanded ? "max-h-[70vh]" : "max-h-72"}`}
          draggable={false}
        />
      </button>
    );
  }

  if (block.type === "audio") {
    return (
      <audio
        src={assetUrl}
        controls
        controlsList="nodownload noplaybackrate"
        autoPlay={Boolean(interaction.audio?.autoplay)}
        className="w-full"
      />
    );
  }

  if (block.type === "video") {
    return (
      <video
        src={assetUrl}
        controls
        controlsList="nodownload noplaybackrate"
        className="max-h-80 w-full rounded-md bg-black"
      />
    );
  }

  return (
    <div className="space-y-3 rounded-md border bg-background p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileText className="h-4 w-4" />
        {block.filename || hotspot.asset_file?.original_filename || t("common.file")}
      </div>
      <div className="overflow-hidden rounded-md border bg-muted/30">
        <iframe
          src={assetUrl}
          title={block.filename || hotspot.asset_file?.original_filename || t("common.file")}
          className="h-72 w-full border-0"
          sandbox=""
        />
      </div>
      <p className="text-xs text-muted-foreground">{t("viewer.fileProtected")}</p>
    </div>
  );
}

function QuestionAnswerBlock({ block, t }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const answers = Array.isArray(block.answers) ? block.answers : [];
  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap text-sm font-medium">{block.question || block.prompt || t("viewer.questionFallback")}</p>
      <div className="space-y-2">
        {answers.map((answer, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = answer.isCorrect === true || answer.is_correct === true;
          return (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`w-full rounded-md border p-2 text-start text-sm ${
                isSelected
                  ? isCorrect
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-red-500 bg-red-50 text-red-900"
                  : "bg-background hover:bg-muted/50"
              }`}
            >
              {answer.text || answer.label || t("admin.editor.hotspots.answerPlaceholder", { number: index + 1 })}
            </button>
          );
        })}
      </div>
      {selectedIndex !== null && (
        <p className="text-xs text-muted-foreground">{t("viewer.answerFeedback")}</p>
      )}
    </div>
  );
}

function ContentBlock({ block, hotspot, viewer, t, instanceId }) {
  if (block.type === "text") {
    return (
      <p className="whitespace-pre-wrap text-sm leading-6" style={{ fontFamily: block.font_family || undefined }}>
        {block.text_content || block.text || hotspot.text_content || t("viewer.noText")}
      </p>
    );
  }
  if (["image", "audio", "video", "file"].includes(block.type) && block.source !== "youtube") {
    return <AssetBlock block={block} hotspot={hotspot} viewer={viewer} t={t} instanceId={instanceId} />;
  }
  if (block.type === "video" && block.source === "youtube") {
    const embedUrl = getYouTubeEmbedUrl(block.youtube_url);
    if (!embedUrl) {
      return <p className="text-sm text-muted-foreground">{t("viewer.assetUnavailable")}</p>;
    }
    return (
      <div className="overflow-hidden rounded-md border bg-black">
        <iframe
          src={embedUrl}
          title={block.title || t("admin.editor.hotspots.types.video")}
          className="aspect-video w-full border-0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }
  if (block.type === "link") {
    const safeUrl = getSafeExternalUrl(block.url);
    if (!safeUrl) {
      return <p className="text-sm text-muted-foreground">{block.label || t("viewer.assetUnavailable")}</p>;
    }
    return (
      <a className="inline-flex items-center gap-2 text-sm text-primary underline" href={safeUrl} target="_blank" rel="noreferrer">
        <ExternalLink className="h-4 w-4" />
        {block.label || safeUrl}
      </a>
    );
  }
  if (block.type === "question_answer") {
    return <QuestionAnswerBlock block={block} t={t} />;
  }
  return <p className="text-sm text-muted-foreground">{t("viewer.unsupportedBlock", { type: block.type })}</p>;
}

export default function EBookletViewerPage() {
  const { instanceId } = useParams();
  const location = useLocation();
  const adminMode = location.pathname.startsWith("/admin/");
  const { t, i18n } = useTranslation("eBooklets");
  const { user } = useAuth();
  const { isStudent } = useRole();
  const viewer = useEBookletViewer({ adminMode });
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [hotspotContent, setHotspotContent] = useState(null);
  const [documentPageUrl, setDocumentPageUrl] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState("checking");
  const [deviceError, setDeviceError] = useState("");

  useEffect(() => {
    let active = true;
    setDeviceStatus("checking");
    setDeviceError("");
    const initializeViewer = async () => {
      try {
        if (adminMode) {
          if (!active) return;
          setDeviceStatus("allowed");
          viewer.fetchMetadata(instanceId).catch(() => {});
          return;
        }
        const fingerprint = await buildDeviceFingerprint();
        if (!active) return;
        await viewer.bindDevice(instanceId, {
          deviceFingerprint: fingerprint,
          deviceLabel: navigator.platform || navigator.userAgent?.slice(0, 80) || "Browser",
        });
        if (!active) return;
        setDeviceStatus("allowed");
        viewer.fetchMetadata(instanceId).catch(() => {});
      } catch (error) {
        if (!active) return;
        setDeviceStatus("blocked");
        setDeviceError(error?.response?.data?.message || error?.message || t("viewer.deviceBlocked"));
      }
    };
    initializeViewer();
    return () => {
      active = false;
    };
  }, [adminMode, instanceId, t, viewer.bindDevice, viewer.fetchMetadata]);

  useEffect(() => {
    if (deviceStatus !== "allowed") return;
    viewer.fetchPage(instanceId, pageNumber).catch(() => {});
    setActiveHotspot(null);
    setHotspotContent(null);
  }, [deviceStatus, instanceId, pageNumber, viewer.fetchPage]);

  useEffect(() => {
    if (viewer.page?.renderMode !== "pdf-document" || !viewer.page?.documentAssetId) {
      setDocumentPageUrl(null);
      return undefined;
    }
    let active = true;
    let createdUrl = null;
    setDocumentPageUrl(null);
    viewer.fetchViewerDocumentBlobUrl(instanceId)
      .then((url) => {
        createdUrl = url;
        if (active) {
          setDocumentPageUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      })
      .catch(() => {
        if (active) setDocumentPageUrl(null);
      });
    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [instanceId, viewer.fetchViewerDocumentBlobUrl, viewer.page?.documentAssetId, viewer.page?.renderMode]);

  useEffect(() => {
    const preventContextMenu = (event) => event.preventDefault();
    const preventPrintShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && ["p", "s"].includes(event.key.toLowerCase())) {
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
    user: user?.name || user?.email || t("common.user"),
    date: today,
  });
  const backHref = adminMode ? "/admin/e-booklet-instances" : isStudent ? "/student/e-booklets" : "/teacher/e-booklets";

  const pageStyle = useMemo(
    () => ({
      aspectRatio: `${dimensions.width} / ${dimensions.height}`,
      transform: `scale(${zoom})`,
      transformOrigin: "top center",
    }),
    [dimensions.height, dimensions.width, zoom],
  );

  const openHotspot = useCallback(async (hotspot) => {
    setActiveHotspot(hotspot);
    const response = await viewer.fetchHotspotContent(hotspot.id, instanceId);
    setHotspotContent({ ...hotspot, ...(response?.data || {}) });
  }, [instanceId, viewer]);

  const contentHotspot = hotspotContent || activeHotspot;
  const pageUrl = documentPageUrl || viewer.page?.url || viewer.page?.pageUrl || viewer.page?.assetUrl || null;
  const serverPage = viewer.page?.renderMode === "server-page" ? viewer.page : null;

  if (deviceStatus === "blocked") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="max-w-md rounded-lg border bg-background p-6 text-center shadow-sm">
          <Lock className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-xl font-semibold">{t("viewer.deviceBlocked")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{deviceError}</p>
          <Button asChild className="mt-5" variant="outline">
            <Link to={backHref}>{t("common.back")}</Link>
          </Button>
        </div>
      </div>
    );
  }

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
              {adminMode && (
                <Badge variant="secondary" className="gap-1">
                  <Eye className="h-3 w-3" />
                  {t("admin.instances.adminView")}
                </Badge>
              )}
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                {t("common.noDownload")}
              </Badge>
              <span>{t("common.pageOf", { page: pageNumber, total: pageCount })}</span>
              <span>{watermark}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPageNumber((page) => Math.max(1, page - 1))} disabled={pageNumber <= 1}>
              <ChevronLeft className="h-4 w-4" />
              {t("common.previous")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPageNumber((page) => Math.min(pageCount, page + 1))} disabled={pageNumber >= pageCount}>
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

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="select-none overflow-auto rounded-lg border bg-slate-200 p-4" onContextMenu={(event) => event.preventDefault()}>
          <div className="mx-auto w-full max-w-[820px] pb-10">
            <div className="relative overflow-hidden rounded-md border bg-white shadow-sm" style={pageStyle} draggable={false}>
              {pageUrl ? (
                <iframe
                  title={t("viewer.pageFrameTitle", { page: pageNumber })}
                  src={`${pageUrl}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0`}
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : serverPage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-8 text-center">
                  <div className="max-w-md rounded-lg border bg-background/90 p-5 shadow-sm">
                    <Lock className="mx-auto h-8 w-8 text-primary" />
                    <h2 className="mt-3 font-semibold">{t("viewer.securePageReady")}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {serverPage.message || t("viewer.securePagePending")}
                    </p>
                    <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                      <span>{t("viewer.renderMode", { mode: serverPage.renderMode })}</span>
                      {serverPage.expiresAt && <span>{t("viewer.pageTokenExpires", { value: serverPage.expiresAt })}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:10%_10%]" />
                  <div className="absolute inset-x-10 top-10 h-7 rounded bg-slate-100" />
                  <div className="absolute inset-x-10 top-24 space-y-3">
                    <div className="h-3 rounded bg-slate-100" />
                    <div className="h-3 w-5/6 rounded bg-slate-100" />
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                  </div>
                  <div className="absolute inset-x-10 bottom-14 h-24 rounded border border-dashed border-slate-200 bg-slate-50" />
                </>
              )}
              <div className="pointer-events-none absolute inset-0 flex rotate-[-24deg] items-center justify-center text-center text-sm font-semibold uppercase tracking-wide text-slate-400/70">
                {watermark}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_60%,rgba(255,255,255,0.02)_100%)]" />
              {viewer.hotspots.map((hotspot) => (
                <HotspotMarker
                  key={hotspot.id}
                  hotspot={hotspot}
                  active={String(activeHotspot?.id) === String(hotspot.id)}
                  onOpen={openHotspot}
                  t={t}
                />
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-lg border bg-background p-4">
          <h2 className="font-semibold">{t("viewer.hotspotsTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("viewer.hotspotsDescription")}</p>
          <div className="mt-4 space-y-3">
            {viewer.hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                type="button"
                onClick={() => openHotspot(hotspot)}
                className={`w-full rounded-md border p-3 text-start hover:bg-muted/50 ${String(activeHotspot?.id) === String(hotspot.id) ? "border-primary bg-primary/5" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">#{getReference(hotspot)} {getHotspotLabel(hotspot, t)}</div>
                  <Badge variant="outline">
                    {t(`admin.editor.hotspots.shapes.${hotspot.shape || "circle"}`, {
                      defaultValue: hotspot.shape || t("admin.editor.hotspots.shapes.circle"),
                    })}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t(`admin.editor.hotspots.types.${hotspot.type}`, { defaultValue: hotspot.type })}
                </div>
              </button>
            ))}
            {viewer.hotspots.length === 0 && (
              <div className="rounded-md border p-5 text-center text-sm text-muted-foreground">{t("viewer.emptyHotspots")}</div>
            )}
          </div>

          {contentHotspot && (
            <div className="mt-5 rounded-md border bg-muted/30 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-semibold">#{getReference(contentHotspot)} {contentHotspot.title || t("viewer.hotspotFallback")}</h3>
                <Badge variant="outline">
                  {t(`admin.editor.hotspots.types.${contentHotspot.type}`, { defaultValue: contentHotspot.type })}
                </Badge>
              </div>
              <div className="space-y-4">
                {getBlocks(contentHotspot).map((block, index) => (
                  <div className="rounded-md border bg-background/80 p-3" key={`${block.type}-${block.asset_file_id || index}`}>
                    {getBlocks(contentHotspot).length > 1 && (
                      <div className="mb-2 text-xs font-medium text-muted-foreground">
                        {t("admin.editor.hotspots.blockNumber", { number: index + 1 })}
                      </div>
                    )}
                    <ContentBlock block={block} hotspot={contentHotspot} viewer={viewer} t={t} instanceId={instanceId} />
                    {block.supplementary_text && (
                      <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{block.supplementary_text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
