import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
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
  Minimize2,
  Music,
  PlaySquare,
  HelpCircle,
  Sparkles,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/auth/useAuth";
import useRole from "@/hooks/useRole";
import { useEBookletViewer } from "@/hooks/useEBookletAccess";
import { normalizeHotspotGeometry } from "@/utils/eBookletHotspotGeometry";
import { DEFAULT_E_BOOKLET_HOTSPOT_COLOR, getHotspotGlowLayerStyle } from "@/utils/eBookletHotspotStyle";
import { getEBookletDisplayTitle } from "@/utils/eBookletTitleUtils";
import { useTranslation } from "react-i18next";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

pdfjsLib.GlobalWorkerOptions.workerSrc ||= pdfWorkerUrl;

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
const VIEWER_RING_CLASS_MAP = {
  red: "ring-red-600/30",
  blue: "ring-blue-600/30",
  green: "ring-green-600/30",
  amber: "ring-amber-600/30",
  violet: "ring-violet-600/30",
};
const DEFAULT_HOTSPOT_COLOR = DEFAULT_E_BOOKLET_HOTSPOT_COLOR;
const CONFETTI_PIECES = [
  { x: -130, y: -96, rotate: -95, color: "bg-rose-500", delay: 0.02, size: "h-2 w-5" },
  { x: -92, y: -128, rotate: 82, color: "bg-amber-400", delay: 0.08, size: "h-2 w-2" },
  { x: -58, y: -108, rotate: -140, color: "bg-emerald-400", delay: 0.01, size: "h-5 w-2" },
  { x: -22, y: -136, rotate: 124, color: "bg-sky-400", delay: 0.1, size: "h-2 w-5" },
  { x: 18, y: -118, rotate: -62, color: "bg-fuchsia-500", delay: 0.04, size: "h-2 w-2" },
  { x: 54, y: -142, rotate: 148, color: "bg-lime-400", delay: 0.12, size: "h-5 w-2" },
  { x: 92, y: -102, rotate: -112, color: "bg-orange-400", delay: 0.06, size: "h-2 w-5" },
  { x: 126, y: -130, rotate: 76, color: "bg-cyan-400", delay: 0.03, size: "h-2 w-2" },
];
const HOTSPOT_YOUTUBE_IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

const getHotspotColorClass = (hotspot) => {
  const color = hotspot?.display_behavior?.color;
  if (!color) return VIEWER_COLOR_CLASS_MAP[DEFAULT_HOTSPOT_COLOR];
  return VIEWER_COLOR_CLASS_MAP[color] || null;
};

const getHotspotRingClass = (hotspot) => {
  const color = hotspot?.display_behavior?.color;
  if (!color) return VIEWER_RING_CLASS_MAP[DEFAULT_HOTSPOT_COLOR];
  return VIEWER_RING_CLASS_MAP[color] || "";
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
const ARABIC_TEXT_PATTERN = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/g;
const HAS_ARABIC_TEXT_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const renderMixedFontText = (text, arabicFontFamily) => {
  if (!arabicFontFamily) return text;
  return String(text).split(ARABIC_TEXT_PATTERN).map((part, index) => {
    if (!part) return null;
    if (HAS_ARABIC_TEXT_PATTERN.test(part)) {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <span key={index} style={{ fontFamily: arabicFontFamily }}>
          {part}
        </span>
      );
    }
    return part;
  });
};

const getYouTubeVideoId = (value) => {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (/^[a-zA-Z0-9_-]{6,}$/.test(trimmed) && !trimmed.includes("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (!["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtube-nocookie.com"].includes(host)) return "";
    if (host === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] || "";
    const queryVideoId = parsed.searchParams.get("v");
    if (queryVideoId) return queryVideoId;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const videoPathIndex = parts.findIndex((part) => ["embed", "shorts", "live"].includes(part));
    return videoPathIndex >= 0 ? parts[videoPathIndex + 1] || "" : parts[parts.length - 1] || "";
  } catch {
    return "";
  }
};

const disableYouTubeIframeFullscreen = (iframe) => {
  if (!iframe || iframe.tagName !== "IFRAME" || !iframe.classList.contains("vds-youtube")) return;
  if (iframe.getAttribute("allow") !== HOTSPOT_YOUTUBE_IFRAME_ALLOW) {
    iframe.setAttribute("allow", HOTSPOT_YOUTUBE_IFRAME_ALLOW);
  }
  if (iframe.hasAttribute("allowfullscreen")) iframe.removeAttribute("allowfullscreen");
  if (iframe.allowFullscreen) iframe.allowFullscreen = false;
};

const isDocumentFullscreenActive = () =>
  Boolean(document.fullscreenElement || document.webkitFullscreenElement);

const requestDocumentFullscreen = async (element) => {
  if (!element) return false;
  if (typeof element.requestFullscreen === "function") {
    await element.requestFullscreen();
    return true;
  }
  if (typeof element.webkitRequestFullscreen === "function") {
    await element.webkitRequestFullscreen();
    return true;
  }
  return false;
};

const exitDocumentFullscreen = async () => {
  if (document.fullscreenElement && typeof document.exitFullscreen === "function") {
    await document.exitFullscreen();
    return true;
  }
  if (document.webkitFullscreenElement && typeof document.webkitExitFullscreen === "function") {
    await document.webkitExitFullscreen();
    return true;
  }
  return false;
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

function HotspotMarker({ hotspot, active, onOpen, t, pageDimensions }) {
  const typeMeta = HOTSPOT_TYPES[hotspot.type] || HOTSPOT_TYPES.text;
  const Icon = typeMeta.icon;
  const colorClass = getHotspotColorClass(hotspot) || typeMeta.className;
  const { shape, width, height, left, top } = normalizeHotspotGeometry(hotspot, {
    defaultSize: 5,
    minSize: 2,
    maxSize: 35,
    aspectRatio: pageDimensions.width / pageDimensions.height,
  });
  const opacity = clamp(hotspot.display_behavior?.opacity_percent, 100, 0, 100) / 100;
  const glowStyle = getHotspotGlowLayerStyle(hotspot);
  const baseStyle = {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
    transform: "translate(-50%, -50%)",
  };

  if (shape === "triangle") {
    const triangleStyle = { clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" };
    return (
      <button
        type="button"
        onClick={() => onOpen(hotspot)}
        className="pointer-events-none absolute flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        style={baseStyle}
        aria-label={getHotspotLabel(hotspot, t)}
      >
        <span
          className="pointer-events-none absolute inset-0"
          style={{ ...triangleStyle, ...glowStyle }}
        />
        <span
          className={`pointer-events-auto absolute inset-0 z-10 ${colorClass}`}
          style={{ ...triangleStyle, opacity }}
        />
        <span
          className="pointer-events-none relative z-20 flex h-7 min-w-7 items-center justify-center rounded-full border border-white bg-black/55 px-1 text-xs font-bold text-white shadow"
          style={{ opacity }}
        >
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
      className={`pointer-events-none absolute flex items-center justify-center text-white transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${roundedClass} ${getHotspotRingClass(hotspot)} ${active ? "scale-105 ring-offset-2" : ""}`}
      style={baseStyle}
      aria-label={getHotspotLabel(hotspot, t)}
    >
      <span
        className={`pointer-events-none absolute inset-0 ${roundedClass}`}
        style={glowStyle}
      />
      <span
        className={`pointer-events-auto absolute inset-0 z-10 border-2 border-white ${roundedClass} ${colorClass}`}
        style={{ opacity }}
      />
      <Icon className="pointer-events-none relative z-20 h-4 w-4 opacity-90" style={{ opacity }} />
      <span className="pointer-events-none relative z-20 ms-1 text-xs font-bold" style={{ opacity }}>{getReference(hotspot)}</span>
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
  const shouldAutoplayMedia = block.autoplay ?? (block.type === "audio" ? interaction.audio?.autoplay : false);
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
        className="block w-full cursor-zoom-in overflow-hidden rounded-md bg-black"
        onClick={() => canExpandOnClick && setExpanded((value) => !value)}
        disabled={!canExpandOnClick}
      >
        <img
          src={assetUrl}
          alt={block.alt || hotspot.title || t("admin.editor.hotspots.types.image")}
          className={`w-full select-none object-contain ${expanded ? "max-h-[84vh]" : "max-h-[78vh]"}`}
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
        autoPlay={Boolean(shouldAutoplayMedia)}
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
        autoPlay={Boolean(block.autoplay)}
        className="max-h-[84vh] w-full rounded-md bg-black"
      />
    );
  }

  const fileName = block.filename || hotspot.asset_file?.original_filename || t("common.file");

  return (
    <div className="space-y-3 rounded-md border bg-background p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileText className="h-4 w-4" />
        {fileName}
      </div>
      <div className="rounded-md border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
        {t("viewer.fileDownloadPrompt")}
      </div>
      <Button asChild className="w-full" data-testid="hotspot-file-download-button">
        <a href={assetUrl} download={fileName}>
          <Download className="h-4 w-4" />
          {t("viewer.downloadAttachment")}
        </a>
      </Button>
    </div>
  );
}

function YoutubeHotspotPlayer({ block, t }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [fallbackFullscreen, setFallbackFullscreen] = useState(false);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const videoId = getYouTubeVideoId(block.video_id || block.youtube_url);
  const isFullscreen = fallbackFullscreen || nativeFullscreen || isDocumentFullscreenActive();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !videoId) return undefined;

    const updateYouTubeIframe = () => {
      container
        .querySelectorAll("iframe.vds-youtube")
        .forEach((iframe) => disableYouTubeIframeFullscreen(iframe));
    };

    updateYouTubeIframe();
    const observer = new MutationObserver(updateYouTubeIframe);
    observer.observe(container, {
      attributes: true,
      attributeFilter: ["allow", "allowfullscreen", "src"],
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [videoId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setNativeFullscreen(isDocumentFullscreenActive());
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!fallbackFullscreen) return undefined;

    document.documentElement.classList.add("e-booklet-pseudo-fullscreen-root");
    document.body.classList.add("e-booklet-pseudo-fullscreen-root");

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setFallbackFullscreen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.documentElement.classList.remove("e-booklet-pseudo-fullscreen-root");
      document.body.classList.remove("e-booklet-pseudo-fullscreen-root");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [fallbackFullscreen]);

  const toggleFullscreen = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isFullscreen) {
      if (fallbackFullscreen) {
        setFallbackFullscreen(false);
        return;
      }
      await exitDocumentFullscreen();
      setNativeFullscreen(false);
      return;
    }

    try {
      if (typeof playerRef.current?.enterFullscreen === "function") {
        await playerRef.current.enterFullscreen("prefer-media", event.nativeEvent || event);
        setNativeFullscreen(true);
        return;
      }
    } catch {
      // Fall back to document fullscreen below.
    }

    try {
      const enteredDocumentFullscreen = await requestDocumentFullscreen(containerRef.current);
      if (enteredDocumentFullscreen) {
        setNativeFullscreen(true);
        return;
      }
    } catch {
      // Fall back to CSS fullscreen below.
    }

    setFallbackFullscreen(true);
  };

  if (!videoId) {
    return <p className="text-sm text-muted-foreground">{t("viewer.assetUnavailable")}</p>;
  }

  return (
    <div
      ref={containerRef}
      className={`e-booklet-youtube-hotspot-player relative overflow-hidden rounded-md border border-white/10 bg-black ${fallbackFullscreen ? "e-booklet-youtube-hotspot-player--fullscreen-fallback" : ""}`}
    >
      <div className="e-booklet-youtube-hotspot-frame">
        <MediaPlayer
          ref={playerRef}
          className="e-booklet-youtube-hotspot-media h-full w-full"
          title={block.title || t("admin.editor.hotspots.types.video")}
          src={`youtube/${videoId}`}
          playsInline
          autoPlay={Boolean(block.autoplay)}
          aspectRatio="16/9"
          fullscreenOrientation="landscape"
        >
          <MediaProvider
            iframeProps={{
              allow: HOTSPOT_YOUTUBE_IFRAME_ALLOW,
              allowFullScreen: false,
            }}
          />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
          <button
            type="button"
            className="e-booklet-youtube-hotspot-fullscreen-button"
            aria-label={isFullscreen ? t("common.exitFullscreen", { defaultValue: "Exit fullscreen" }) : t("common.fullscreen", { defaultValue: "Fullscreen" })}
            title={isFullscreen ? t("common.exitFullscreen", { defaultValue: "Exit fullscreen" }) : t("common.fullscreen", { defaultValue: "Fullscreen" })}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </MediaPlayer>
      </div>
    </div>
  );
}

function CorrectAnswerCelebration({ burstKey, t }) {
  return (
    <AnimatePresence>
      {burstKey > 0 && (
        <motion.div
          key={burstKey}
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, delay: 0.95 }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-lg"
            initial={{ scale: 0.76, y: 10, opacity: 0 }}
            animate={{ scale: [0.76, 1.08, 1], y: 0, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.05, times: [0, 0.22, 0.72, 1] }}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            {t("viewer.correctAnswerCelebration")}
          </motion.div>
          {CONFETTI_PIECES.map((piece, index) => (
            <motion.span
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={`absolute left-1/2 top-1/2 rounded-sm ${piece.color} ${piece.size}`}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.8 }}
              animate={{ x: piece.x, y: piece.y, rotate: piece.rotate, opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.65] }}
              transition={{ duration: 0.9, delay: piece.delay, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function QuestionAnswerBlock({ block, t }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const answers = Array.isArray(block.answers) ? block.answers : [];
  const selectedAnswer = selectedIndex !== null ? answers[selectedIndex] : null;
  const selectedIsCorrect = selectedAnswer?.isCorrect === true || selectedAnswer?.is_correct === true;

  const selectAnswer = (answer, index) => {
    const isCorrect = answer.isCorrect === true || answer.is_correct === true;
    setSelectedIndex(index);
    if (isCorrect) setCelebrationKey((value) => value + 1);
  };

  return (
    <div className="relative space-y-3 overflow-hidden rounded-lg">
      <CorrectAnswerCelebration burstKey={celebrationKey} t={t} />
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
              onClick={() => selectAnswer(answer, index)}
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
        <p className={`text-xs ${selectedIsCorrect ? "font-medium text-emerald-600" : "text-muted-foreground"}`}>
          {selectedIsCorrect ? t("viewer.correctAnswerFeedback") : t("viewer.answerFeedback")}
        </p>
      )}
    </div>
  );
}

function ContentBlock({ block, hotspot, viewer, t, instanceId }) {
  if (block.type === "text") {
    const text = block.text_content || block.text || hotspot.text_content || t("viewer.noText");
    return (
      <p className="whitespace-pre-wrap text-sm leading-6" style={{ fontFamily: block.font_family || undefined }}>
        {renderMixedFontText(text, block.arabic_font_family)}
      </p>
    );
  }
  if (["image", "audio", "video", "file"].includes(block.type) && block.source !== "youtube") {
    return <AssetBlock block={block} hotspot={hotspot} viewer={viewer} t={t} instanceId={instanceId} />;
  }
  if (block.type === "video" && block.source === "youtube") {
    return <YoutubeHotspotPlayer block={block} t={t} />;
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

export default function EBookletViewerPage({ previewMode = false }) {
  const { instanceId } = useParams();
  const location = useLocation();
  const adminMode = location.pathname.startsWith("/admin/");
  const { t, i18n } = useTranslation("eBooklets");
  const { user } = useAuth();
  const { isStudent } = useRole();
  const viewer = useEBookletViewer({ adminMode, previewMode });
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [zoom, setZoom] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [hotspotContent, setHotspotContent] = useState(null);
  const [hotspotLoading, setHotspotLoading] = useState(false);
  const [hotspotError, setHotspotError] = useState("");
  const [documentPageData, setDocumentPageData] = useState(null);
  const [documentPagePdfData, setDocumentPagePdfData] = useState(null);
  const [documentPageError, setDocumentPageError] = useState("");
  const [documentRenderStatus, setDocumentRenderStatus] = useState("idle");
  const [deviceStatus, setDeviceStatus] = useState("checking");
  const [deviceError, setDeviceError] = useState("");
  const hotspotRequestRef = useRef(0);
  const pdfCanvasRef = useRef(null);

  useEffect(() => {
    let active = true;
    setDeviceStatus("checking");
    setDeviceError("");
    const initializeViewer = async () => {
      try {
        if (previewMode || adminMode) {
          if (!active) return;
          setDeviceStatus("allowed");
          viewer.fetchMetadata(instanceId, t("viewer.metadataLoadFailed")).catch(() => {});
          return;
        }
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
  }, [adminMode, instanceId, previewMode, t, viewer.fetchMetadata]);

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
      setDocumentPagePdfData(null);
      setDocumentPageError("");
      setDocumentRenderStatus("idle");
      return undefined;
    }
    let active = true;
    const controller = new AbortController();
    setDocumentPageData(null);
    setDocumentPagePdfData(null);
    setDocumentPageError("");
    setDocumentRenderStatus("loading");
    viewer.fetchViewerDocumentPagePreviewBlobUrl(instanceId, pageNumber, viewer.page.pageAccessToken, controller.signal)
      .then((previewUrl) => {
        if (active) {
          setDocumentPageData(previewUrl);
          setDocumentPagePdfData(null);
        } else if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      })
      .catch(async (previewError) => {
        try {
          const pdfData = await viewer.fetchViewerDocumentPageData(instanceId, pageNumber, viewer.page.pageAccessToken, controller.signal);
          if (active) {
            setDocumentPagePdfData(pdfData);
            setDocumentPageError("");
          }
        } catch (error) {
          if (!active) return;
          setDocumentPageData(null);
          setDocumentPagePdfData(null);
          setDocumentRenderStatus("error");
          setDocumentPageError(error?.response?.data?.message || previewError?.response?.data?.message || error?.message || previewError?.message || t("viewer.documentUnavailable"));
        }
      });
    return () => {
      active = false;
      controller.abort();
      setDocumentPageData((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return null;
      });
    };
  }, [instanceId, pageNumber, t, viewer.fetchViewerDocumentPageData, viewer.fetchViewerDocumentPagePreviewBlobUrl, viewer.page?.documentAssetId, viewer.page?.pageAccessToken, viewer.page?.renderMode]);

  useEffect(() => {
    if (!documentPagePdfData || viewer.page?.renderMode !== "pdf-document") return undefined;
    let active = true;
    let loadedDocument = null;
    let loadedPage = null;
    let renderTask = null;

    const renderPdfPage = async () => {
      try {
        setDocumentRenderStatus("loading");
        const loadingTask = pdfjsLib.getDocument({ data: documentPagePdfData });
        loadedDocument = await loadingTask.promise;
        if (!active) return;
        loadedPage = await loadedDocument.getPage(1);
        if (!active) return;
        const canvas = pdfCanvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;
        const viewport = loadedPage.getViewport({ scale: 2 });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        renderTask = loadedPage.render({ canvasContext: context, viewport });
        await renderTask.promise;
        if (active) {
          setDocumentRenderStatus("ready");
        }
      } catch (error) {
        if (active && error?.name !== "RenderingCancelledException") {
          setDocumentRenderStatus("error");
          setDocumentPageError(error?.message || t("viewer.documentUnavailable"));
        }
      }
    };

    renderPdfPage();

    return () => {
      active = false;
      if (renderTask) renderTask.cancel();
      if (loadedPage) loadedPage.cleanup();
      if (loadedDocument) loadedDocument.destroy();
    };
  }, [documentPagePdfData, t, viewer.page?.renderMode]);

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
    user: previewMode ? t("viewer.previewUser") : user?.name || user?.email || t("common.user"),
    date: today,
  });
  const backHref = previewMode ? `/e-booklets/${instanceId}` : adminMode ? "/admin/e-booklets/access" : isStudent ? "/student/e-booklets" : "/teacher/e-booklets";

  const goToPage = useCallback((value) => {
    const nextPage = clamp(value, pageNumber, 1, pageCount);
    setPageNumber(nextPage);
    setPageInputValue(String(nextPage));
  }, [pageCount, pageNumber]);

  const handlePageInputChange = useCallback((event) => {
    setPageInputValue(event.target.value.replace(/[^0-9]/g, ""));
  }, []);

  const commitPageInput = useCallback(() => {
    goToPage(pageInputValue || pageNumber);
  }, [goToPage, pageInputValue, pageNumber]);

  const handlePageInputKeyDown = useCallback((event) => {
    if (event.key === "Enter") {
      commitPageInput();
      event.currentTarget.blur();
    }
  }, [commitPageInput]);

  useEffect(() => {
    setPageInputValue(String(pageNumber));
  }, [pageNumber]);

  useEffect(() => {
    if (pageNumber > pageCount) {
      setPageNumber(pageCount);
    }
  }, [pageCount, pageNumber]);

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
  }, [instanceId, previewMode, t, viewer]);

  const contentHotspot = hotspotContent || activeHotspot;
  const contentHotspotBlocks = contentHotspot ? getBlocks(contentHotspot) : [];
  const primaryHotspotBlockType = contentHotspotBlocks[0]?.type || contentHotspot?.type;
  const singleMediaHotspot = contentHotspotBlocks.length === 1 && ["image", "video"].includes(primaryHotspotBlockType);
  const hotspotPopupClassName = singleMediaHotspot
    ? "relative flex max-h-[92vh] w-fit max-w-[96vw] flex-col overflow-hidden rounded-lg border border-white/10 bg-black p-2 shadow-2xl"
    : "relative flex max-h-[90vh] w-full max-w-[min(92vw,42rem)] flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl";
  const hotspotBodyClassName = singleMediaHotspot ? "min-h-0 overflow-auto" : "min-h-0 overflow-y-auto p-4";
  const hotspotBlocksClassName = singleMediaHotspot ? "space-y-0" : "space-y-3";
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
  const canShowHotspots = !viewerError && !pdfDocumentFailed && (Boolean(documentPageData) || Boolean(documentPagePdfData) || Boolean(serverPage));
  const viewerErrorTitle = viewer.metadataError ? t("viewer.openErrorTitle") : t("viewer.pageErrorTitle", { page: pageNumber });
  const viewerErrorMessage = viewer.metadataError ? t("viewer.openErrorMessage") : t("viewer.pageErrorMessage");
  const viewerReportReference = t("viewer.reportReference", { id: instanceId, page: pageNumber });

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
              {getEBookletDisplayTitle(instance, t("viewer.titleFallback"))}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {adminMode && (
                <Badge variant="secondary" className="gap-1">
                  <Eye className="h-3 w-3" />
                  {t("admin.instances.adminView")}
                </Badge>
              )}
              {previewMode && (
                <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-900 hover:bg-amber-100">
                  <Eye className="h-3 w-3" />
                  {t("viewer.previewBadge", { count: pageCount })}
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
            <Button variant="outline" size="sm" onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1}>
              <ChevronLeft className="h-4 w-4" />
              {t("common.previous")}
            </Button>
            <div className="flex h-9 items-center gap-1 rounded-md border bg-background px-2 text-sm">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                max={pageCount}
                value={pageInputValue}
                onChange={handlePageInputChange}
                onBlur={commitPageInput}
                onKeyDown={handlePageInputKeyDown}
                className="h-7 w-14 border-0 px-1 text-center shadow-none focus-visible:ring-1"
                aria-label={t("admin.editor.hotspots.goToPage", { defaultValue: "Go to page" })}
              />
              <span className="whitespace-nowrap text-muted-foreground">/ {pageCount}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= pageCount}>
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
                    <h2 className="mt-3 font-semibold text-destructive">{viewerErrorTitle}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{viewerErrorMessage}</p>
                    <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{viewerReportReference}</p>
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
                    <h2 className="mt-3 font-semibold text-destructive">{t("viewer.pageErrorTitle", { page: pageNumber })}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{t("viewer.pageErrorMessage")}</p>
                    <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{viewerReportReference}</p>
                  </div>
                </div>
              ) : documentPageData ? (
                <>
                  <img
                    src={documentPageData}
                    alt={t("viewer.pagePreviewAlt", { page: pageNumber, defaultValue: `Page ${pageNumber} preview` })}
                    draggable={false}
                    className="absolute inset-0 h-full w-full"
                    onLoad={handleDocumentRenderSuccess}
                    onError={handleDocumentRenderError}
                  />
                  {documentRenderStatus !== "ready" && !documentPageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/75 text-sm text-muted-foreground">
                      {t("viewer.loadingPage", { defaultValue: "Loading page..." })}
                    </div>
                  )}
                </>
              ) : documentPagePdfData ? (
                <>
                  <canvas
                    ref={pdfCanvasRef}
                    data-testid="e-booklet-pdf-canvas"
                    className="absolute inset-0 h-full w-full bg-white"
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
                      {t("viewer.securePagePending")}
                    </p>
                    <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{viewerReportReference}</p>
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
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <span className="max-w-[72%] rotate-[-24deg] break-words text-center text-[clamp(1.75rem,4vw,3.5rem)] font-semibold uppercase leading-tight tracking-wide text-slate-400/70">
                  {watermark}
                </span>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_60%,rgba(255,255,255,0.02)_100%)]" />
              {canShowHotspots && viewer.hotspots.map((hotspot) => (
                <HotspotMarker
                  key={hotspot.id}
                  hotspot={hotspot}
                  active={String(activeHotspot?.id) === String(hotspot.id)}
                  onOpen={openHotspot}
                  t={t}
                  pageDimensions={dimensions}
                />
              ))}
              {canShowHotspots && contentHotspot && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/25 p-3 sm:p-6"
                  onPointerDown={(event) => {
                    if (event.target === event.currentTarget) closeHotspot();
                  }}
                >
                  <div
                    className={hotspotPopupClassName}
                    role="dialog"
                    aria-modal="true"
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute end-3 top-3 z-30 h-11 w-11 rounded-full bg-black/70 text-white shadow-sm touch-manipulation hover:bg-black/85 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                      onClick={closeHotspot}
                      aria-label={t("common.close", { defaultValue: "Close" })}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <div className={hotspotBodyClassName}>
                      {hotspotLoading ? (
                        <p className="text-sm text-muted-foreground">{t("viewer.loadingAsset")}</p>
                      ) : hotspotError ? (
                        <p className="text-sm text-destructive">{hotspotError}</p>
                      ) : (
                        <div className={hotspotBlocksClassName}>
                          {contentHotspotBlocks.map((block, index) => (
                            <div
                              className={contentHotspotBlocks.length > 1 ? "rounded-md border bg-background/80 p-3" : ""}
                              key={`${block.type}-${block.asset_file_id || index}`}
                            >
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
