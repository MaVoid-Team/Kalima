import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/auth/useAuth";
import useRole from "@/hooks/useRole";
import { useEBookletViewer } from "@/hooks/useEBookletAccess";
import { normalizeHotspotGeometry } from "@/utils/eBookletHotspotGeometry";
import { useTranslation } from "react-i18next";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const HOTSPOT_TYPES = {
  text: { icon: FileText, className: "bg-sky-600" },
  image: { icon: ImageIcon, className: "bg-emerald-600" },
  audio: { icon: Music, className: "bg-violet-600" },
  video: { icon: PlaySquare, className: "bg-rose-600" },
  file: { icon: Download, className: "bg-amber-600" },
  link: { icon: LinkIcon, className: "bg-cyan-600" },
  question_answer: { icon: HelpCircle, className: "bg-fuchsia-600" },
};

const VIEWER_COLOR_CLASS_MAP = {
  red: "bg-red-600 ring-red-600/30",
  blue: "bg-blue-600 ring-blue-600/30",
  green: "bg-green-600 ring-green-600/30",
  amber: "bg-amber-600 ring-amber-600/30",
  violet: "bg-violet-600 ring-violet-600/30",
};
const VIEWER_COLOR_RGB_MAP = {
  red: "220 38 38",
  blue: "37 99 235",
  green: "22 163 74",
  amber: "217 119 6",
  violet: "124 58 237",
};
const DEFAULT_HOTSPOT_COLOR = "blue";

const getHotspotColorClass = (hotspot) => {
  const color = hotspot?.display_behavior?.color;
  if (!color) return VIEWER_COLOR_CLASS_MAP[DEFAULT_HOTSPOT_COLOR];
  return VIEWER_COLOR_CLASS_MAP[color] || null;
};

const getHotspotColorRgb = (hotspot) => {
  const color = hotspot?.display_behavior?.color;
  return VIEWER_COLOR_RGB_MAP[color] || VIEWER_COLOR_RGB_MAP[DEFAULT_HOTSPOT_COLOR];
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

const getHotspotGlowPercent = (hotspot) => clamp(hotspot.display_behavior?.glow_percent, 100, 0, 100);

const getHotspotGlowStyle = (hotspot) => {
  const glow = getHotspotGlowPercent(hotspot);
  if (glow <= 0) return {};
  const blur = 8 + Math.round((glow / 100) * 18);
  const spread = Math.round((glow / 100) * 4);
  const alpha = 0.18 + (glow / 100) * 0.22;
  return { boxShadow: `0 0 ${blur}px ${spread}px rgb(${getHotspotColorRgb(hotspot)} / ${alpha})` };
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

const copyPdfDataForRender = (fileData) => {
  if (!fileData) return null;
  if (fileData instanceof ArrayBuffer) return new Uint8Array(fileData.slice(0));
  if (ArrayBuffer.isView(fileData)) {
    return new Uint8Array(fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength));
  }
  return null;
};

function PdfDocumentPageCanvas({ fileData, className = "", onRenderStart, onRenderSuccess, onError }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!fileData || !canvasRef.current) return undefined;

    let cancelled = false;
    let renderTask = null;
    let documentTask = null;
    let loadedDocument = null;
    let loadedPage = null;

    const renderPage = async () => {
      try {
        const pdfData = copyPdfDataForRender(fileData);
        if (!pdfData?.byteLength) return;

        onRenderStart?.();
        documentTask = pdfjsLib.getDocument({ data: pdfData });
        loadedDocument = await documentTask.promise;
        if (cancelled) {
          await loadedDocument?.destroy?.();
          return;
        }

        loadedPage = await loadedDocument.getPage(1);
        if (cancelled) {
          loadedPage?.cleanup?.();
          await loadedDocument?.destroy?.();
          loadedDocument = null;
          return;
        }

        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) {
          loadedPage?.cleanup?.();
          loadedPage = null;
          await loadedDocument?.destroy?.();
          loadedDocument = null;
          documentTask = null;
          return;
        }

        const containerWidth = canvas.parentElement?.clientWidth || 820;
        const baseViewport = loadedPage.getViewport({ scale: 1 });
        const scale = containerWidth / baseViewport.width;
        const viewport = loadedPage.getViewport({ scale });
        const dpr = window.devicePixelRatio || 1;

        canvas.width = Math.max(1, Math.floor(viewport.width * dpr));
        canvas.height = Math.max(1, Math.floor(viewport.height * dpr));
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, viewport.width, viewport.height);

        renderTask = loadedPage.render({ canvasContext: context, viewport });
        await renderTask.promise;
        loadedPage.cleanup?.();
        loadedPage = null;
        await loadedDocument.destroy?.();
        loadedDocument = null;
        documentTask = null;
        if (!cancelled) onRenderSuccess?.();
      } catch (error) {
        loadedPage?.cleanup?.();
        loadedPage = null;
        await loadedDocument?.destroy?.();
        loadedDocument = null;
        documentTask = null;
        if (!cancelled && error?.name !== "RenderingCancelledException") {
          onError?.(error);
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      renderTask?.cancel?.();
      loadedPage?.cleanup?.();
      documentTask?.destroy?.();
      loadedDocument?.destroy?.();
    };
  }, [fileData, onError, onRenderStart, onRenderSuccess]);

  return <canvas ref={canvasRef} className={className} data-testid="e-booklet-pdf-canvas" />;
}

function HotspotMarker({ hotspot, active, onOpen, t }) {
  const typeMeta = HOTSPOT_TYPES[hotspot.type] || HOTSPOT_TYPES.text;
  const Icon = typeMeta.icon;
  const colorClass = getHotspotColorClass(hotspot) || typeMeta.className;
  const { shape, width, height, left, top } = normalizeHotspotGeometry(hotspot, {
    defaultSize: 8,
    minSize: 2,
    maxSize: 40,
  });
  const opacity = clamp(hotspot.display_behavior?.opacity_percent, 100, 0, 100) / 100;
  const glow = getHotspotGlowPercent(hotspot);
  const glowStyle = getHotspotGlowStyle(hotspot);
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
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", ...glowStyle }}
        >
          <span className={`block h-full w-full ${colorClass}`} />
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
      className={`absolute flex items-center justify-center border-2 border-white text-white transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${glow > 0 ? "shadow-lg ring-4" : "shadow-md"} ${roundedClass} ${colorClass} ${active ? "scale-105 ring-offset-2" : ""}`}
      style={{ ...baseStyle, ...glowStyle }}
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
      <p className="whitespace-pre-wrap text-sm font-medium">{block.question || block.prompt || block.text_content || t("viewer.questionFallback")}</p>
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
  const [hotspotLoading, setHotspotLoading] = useState(false);
  const [hotspotError, setHotspotError] = useState("");
  const [documentPageData, setDocumentPageData] = useState(null);
  const [documentPageError, setDocumentPageError] = useState("");
  const [documentRenderStatus, setDocumentRenderStatus] = useState("idle");
  const [deviceStatus, setDeviceStatus] = useState("checking");
  const [deviceError, setDeviceError] = useState("");
  const hotspotRequestRef = useRef(0);

  useEffect(() => {
    let active = true;
    setDeviceStatus("checking");
    setDeviceError("");
    const initializeViewer = async () => {
      try {
        if (adminMode) {
          if (!active) return;
          setDeviceStatus("allowed");
          viewer.fetchMetadata(instanceId, t("viewer.metadataLoadFailed")).catch(() => {});
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
        viewer.fetchMetadata(instanceId, t("viewer.metadataLoadFailed")).catch(() => {});
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
    viewer.fetchPage(instanceId, pageNumber, t("viewer.pageLoadFailed")).catch(() => {});
    setActiveHotspot(null);
    setHotspotContent(null);
    setHotspotLoading(false);
    setHotspotError("");
  }, [deviceStatus, instanceId, pageNumber, t, viewer.fetchPage]);

  useEffect(() => {
    if (viewer.page?.renderMode !== "pdf-document" || !viewer.page?.documentAssetId) {
      setDocumentPageData(null);
      setDocumentPageError("");
      setDocumentRenderStatus("idle");
      return undefined;
    }
    let active = true;
    const controller = new AbortController();
    setDocumentPageData(null);
    setDocumentPageError("");
    setDocumentRenderStatus("loading");
    viewer.fetchViewerDocumentPageData(instanceId, pageNumber, viewer.page.pageAccessToken, controller.signal)
      .then((data) => {
        if (active) {
          setDocumentPageData(data);
        }
      })
      .catch((error) => {
        if (active) {
          setDocumentPageData(null);
          setDocumentRenderStatus("error");
          setDocumentPageError(error?.response?.data?.message || error?.message || t("viewer.documentUnavailable"));
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [instanceId, pageNumber, t, viewer.fetchViewerDocumentPageData, viewer.page?.documentAssetId, viewer.page?.pageAccessToken, viewer.page?.renderMode]);

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
  const backHref = adminMode ? "/admin/e-booklets/access" : isStudent ? "/student/e-booklets" : "/teacher/e-booklets";

  const pageStyle = useMemo(
    () => ({
      aspectRatio: `${dimensions.width} / ${dimensions.height}`,
      width: `${zoom * 100}%`,
      maxWidth: `${820 * zoom}px`,
    }),
    [dimensions.height, dimensions.width, zoom],
  );

  const closeHotspot = useCallback(() => {
    hotspotRequestRef.current += 1;
    setActiveHotspot(null);
    setHotspotContent(null);
    setHotspotLoading(false);
    setHotspotError("");
  }, []);

  useEffect(() => {
    if (!activeHotspot) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeHotspot();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeHotspot, closeHotspot]);

  const openHotspot = useCallback(async (hotspot) => {
    const requestId = hotspotRequestRef.current + 1;
    hotspotRequestRef.current = requestId;
    setActiveHotspot(hotspot);
    setHotspotContent(null);
    setHotspotError("");
    setHotspotLoading(true);
    try {
      const response = await viewer.fetchHotspotContent(hotspot.id, instanceId);
      if (hotspotRequestRef.current === requestId) {
        setHotspotContent({ ...hotspot, ...(response?.data || {}) });
      }
    } catch (error) {
      if (hotspotRequestRef.current === requestId) {
        setHotspotError(error?.response?.data?.message || error?.message || t("viewer.assetUnavailable"));
      }
    } finally {
      if (hotspotRequestRef.current === requestId) {
        setHotspotLoading(false);
      }
    }
  }, [instanceId, t, viewer]);

  const contentHotspot = hotspotContent || activeHotspot;
  const handleDocumentRenderStart = useCallback(() => {
    setDocumentRenderStatus("rendering");
  }, []);

  const handleDocumentRenderSuccess = useCallback(() => {
    setDocumentRenderStatus("ready");
  }, []);

  const handleDocumentRenderError = useCallback((error) => {
    setDocumentRenderStatus("error");
    setDocumentPageError(error?.message || t("viewer.documentUnavailable"));
  }, [t]);

  const serverPage = viewer.page?.renderMode === "server-page" ? viewer.page : null;
  const pdfDocumentFailed = viewer.page?.renderMode === "pdf-document" && viewer.page?.documentAssetId && documentPageError;
  const viewerError = viewer.metadataError || viewer.pageError;

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

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="select-none overflow-auto rounded-lg border bg-slate-200 p-4" onContextMenu={(event) => event.preventDefault()}>
          <div className="mx-auto w-full max-w-[820px] pb-10">
            <div className="relative overflow-hidden rounded-md border bg-white shadow-sm" style={pageStyle} draggable={false}>
              {viewerError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-8 text-center">
                  <div className="max-w-md rounded-lg border border-destructive/30 bg-background/90 p-5 shadow-sm">
                    <FileText className="mx-auto h-8 w-8 text-destructive" />
                    <h2 className="mt-3 font-semibold text-destructive">{t("viewer.documentUnavailable")}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{viewerError}</p>
                    <Button
                      type="button"
                      className="mt-4"
                      variant="outline"
                      onClick={() => {
                        viewer.fetchMetadata(instanceId, t("viewer.metadataLoadFailed")).catch(() => {});
                        if (deviceStatus === "allowed") viewer.fetchPage(instanceId, pageNumber, t("viewer.pageLoadFailed")).catch(() => {});
                      }}
                    >
                      {t("common.retry", { defaultValue: "Retry" })}
                    </Button>
                  </div>
                </div>
              ) : pdfDocumentFailed ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-8 text-center">
                  <div className="max-w-md rounded-lg border border-destructive/30 bg-background/90 p-5 shadow-sm">
                    <FileText className="mx-auto h-8 w-8 text-destructive" />
                    <h2 className="mt-3 font-semibold text-destructive">{t("viewer.documentUnavailable")}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{documentPageError}</p>
                  </div>
                </div>
              ) : documentPageData ? (
                <>
                  <PdfDocumentPageCanvas
                    fileData={documentPageData}
                    className="absolute inset-0 h-full w-full"
                    onRenderStart={handleDocumentRenderStart}
                    onRenderSuccess={handleDocumentRenderSuccess}
                    onError={handleDocumentRenderError}
                  />
                  {documentRenderStatus !== "ready" && !documentPageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/75 text-sm text-muted-foreground">
                      {t("viewer.loadingPage", { defaultValue: "Loading page..." })}
                    </div>
                  )}
                </>
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
              {contentHotspot && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/25 p-3 sm:p-6">
                  <div className="flex max-h-[90%] w-full max-w-[min(92%,34rem)] flex-col overflow-hidden rounded-xl border bg-background text-foreground shadow-2xl">
                    <div className="flex items-start justify-between gap-3 border-b p-3 sm:p-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold sm:text-base">#{getReference(contentHotspot)} {contentHotspot.title || t("viewer.hotspotFallback")}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t(`admin.editor.hotspots.types.${contentHotspot.type}`, { defaultValue: contentHotspot.type })}
                        </p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={closeHotspot} aria-label={t("common.close", { defaultValue: "Close" })}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="min-h-0 overflow-y-auto p-3 sm:p-4">
                      {hotspotLoading ? (
                        <p className="text-sm text-muted-foreground">{t("viewer.loadingAsset")}</p>
                      ) : hotspotError ? (
                        <p className="text-sm text-destructive">{hotspotError}</p>
                      ) : (
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
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
