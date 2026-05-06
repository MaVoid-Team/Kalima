import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenCheck,
  CircleDot,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  MousePointerClick,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminEBookletEditor } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";

const steps = [
  { id: "basic", labelKey: "admin.editor.steps.basic" },
  { id: "file", labelKey: "admin.editor.steps.file" },
  { id: "hotspots", labelKey: "admin.editor.steps.hotspots" },
  { id: "review", labelKey: "admin.editor.steps.review" },
];

const hotspotIcons = {
  text: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
};

const defaultTemplateForm = {
  title: "",
  description: "",
  price: "0",
  currency: "EGP",
  status: "draft",
  cover_file_id: "",
};

const defaultVersionForm = {
  id: null,
  page_count: "",
  page_dimensions: [],
  base_document_file_id: "",
  rendered_document_file_id: "",
  document_filename: "",
};

const defaultHotspotForm = {
  id: null,
  page_number: 1,
  x_percent: 50,
  y_percent: 50,
  radius_percent: 1.8,
  type: "text",
  title: "",
  text_content: "",
  asset_file_id: "",
  trigger_type: "click",
};

const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeAsset = (response) => response?.data || response || null;
const normalizeAssetId = (response) => normalizeAsset(response)?.id || "";
const normalizeMetadata = (response) => normalizeAsset(response)?.metadata || null;

const buildPageDimensions = (form) => {
  if (Array.isArray(form.page_dimensions) && form.page_dimensions.length > 0) {
    return form.page_dimensions;
  }
  return null;
};

const getVersionDimensions = (version, fallbackForm) => {
  if (Array.isArray(version?.page_dimensions_json) && version.page_dimensions_json.length > 0) {
    return version.page_dimensions_json;
  }
  return buildPageDimensions(fallbackForm) || [{ width: 612, height: 792 }];
};

export default function AdminEBookletEditorPage() {
  const { t } = useTranslation("eBooklets");
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const pageRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const editor = useAdminEBookletEditor();
  const [activeStep, setActiveStep] = useState("basic");
  const [templateId, setTemplateId] = useState(id ? Number(id) : null);
  const [templateForm, setTemplateForm] = useState(defaultTemplateForm);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionForm, setVersionForm] = useState(defaultVersionForm);
  const [selectedPage, setSelectedPage] = useState(1);
  const [hotspots, setHotspots] = useState([]);
  const [hotspotForm, setHotspotForm] = useState(defaultHotspotForm);
  const [recording, setRecording] = useState(false);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("");

  const activeStepIndex = steps.findIndex((step) => step.id === activeStep);
  const pageCount = Math.max(
    1,
    parseNumber(selectedVersion?.page_count ?? versionForm.page_count, 1),
  );
  const activeVersionId = selectedVersion?.id || versionForm.id;
  const currentDimensions = useMemo(() => {
    const dimensions = getVersionDimensions(selectedVersion, versionForm);
    return dimensions[selectedPage - 1] || dimensions[0] || { width: 612, height: 792 };
  }, [selectedPage, selectedVersion, versionForm]);
  const pageAspectRatio = `${currentDimensions.width} / ${currentDimensions.height}`;

  const pageHotspots = useMemo(
    () =>
      hotspots.filter(
        (hotspot) => Number(hotspot.page_number) === Number(selectedPage) && hotspot.is_active !== false,
      ),
    [hotspots, selectedPage],
  );

  const loadTemplate = useCallback(async () => {
    if (!id) return;
    const [templateResponse, versionResponse] = await Promise.all([
      editor.fetchTemplate(id),
      editor.fetchVersions(id),
    ]);
    const template = templateResponse?.data;
    if (template) {
      setTemplateId(template.id);
      setTemplateForm({
        title: template.title || "",
        description: template.description || "",
        price: String(template.price ?? "0"),
        currency: template.currency || "EGP",
        status: template.status || "draft",
        cover_file_id: template.cover_file_id ? String(template.cover_file_id) : "",
      });
    }

    const loadedVersions = Array.isArray(versionResponse?.data) ? versionResponse.data : [];
    setVersions(loadedVersions);
    if (loadedVersions.length > 0) {
      const latest = loadedVersions[0];
      setSelectedVersion(latest);
      setVersionForm({
        id: latest.id,
        page_count: String(latest.page_count || 1),
        page_dimensions: Array.isArray(latest.page_dimensions_json)
          ? latest.page_dimensions_json
          : [],
        base_document_file_id: latest.base_document_file_id
          ? String(latest.base_document_file_id)
          : "",
        rendered_document_file_id: latest.rendered_document_file_id
          ? String(latest.rendered_document_file_id)
          : "",
        document_filename: latest.base_document_file?.original_filename || "",
      });
    }
  }, [editor.fetchTemplate, editor.fetchVersions, id]);

  const loadHotspots = useCallback(
    async (versionId, pageNumber) => {
      if (!versionId) return;
      const response = await editor.fetchHotspots(versionId, pageNumber);
      setHotspots(Array.isArray(response?.data) ? response.data : []);
    },
    [editor.fetchHotspots],
  );

  useEffect(() => {
    loadTemplate().catch(() => {});
  }, [loadTemplate]);

  useEffect(() => {
    if (selectedVersion?.id) {
      loadHotspots(selectedVersion.id, selectedPage).catch(() => {});
    }
  }, [loadHotspots, selectedPage, selectedVersion?.id]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";
    const assetId = versionForm.base_document_file_id;

    if (!assetId) {
      setDocumentPreviewUrl("");
      return undefined;
    }

    setDocumentPreviewUrl("");
    editor
      .fetchAssetBlobUrl(assetId)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setDocumentPreviewUrl(url);
      })
      .catch(() => setDocumentPreviewUrl(""));

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [editor.fetchAssetBlobUrl, versionForm.base_document_file_id]);

  const updateTemplateField = (field, value) => {
    setTemplateForm((current) => ({ ...current, [field]: value }));
  };

  const updateHotspotField = (field, value) => {
    setHotspotForm((current) => ({ ...current, [field]: value }));
  };

  const saveBasicInfo = async () => {
    if (!templateForm.title.trim()) {
      toast.error(t("admin.editor.validation.titleRequired"));
      return null;
    }

    const payload = {
      title: templateForm.title.trim(),
      description: templateForm.description.trim(),
      price: parseNumber(templateForm.price, 0),
      currency: templateForm.currency || "EGP",
      status: templateForm.status,
      cover_file_id: templateForm.cover_file_id
        ? Number(templateForm.cover_file_id)
        : undefined,
    };

    const response = templateId
      ? await editor.updateTemplate(templateId, payload)
      : await editor.createTemplate(payload);
    const saved = response?.data;
    if (saved?.id) {
      setTemplateId(saved.id);
      if (!isEditing) {
        window.history.replaceState(null, "", `/admin/e-booklets/${saved.id}/edit`);
      }
    }
    return saved;
  };

  const saveVersion = async () => {
    const savedTemplate = templateId ? { id: templateId } : await saveBasicInfo();
    if (!savedTemplate?.id) return null;

    const dimensions = buildPageDimensions(versionForm);
    if (!versionForm.base_document_file_id || !dimensions?.length) {
      toast.error(t("admin.editor.file.saveRequired"));
      return null;
    }

    const payload = {
      base_document_file_id: versionForm.base_document_file_id
        ? Number(versionForm.base_document_file_id)
        : undefined,
      rendered_document_file_id: versionForm.rendered_document_file_id
        ? Number(versionForm.rendered_document_file_id)
        : undefined,
      page_count: dimensions.length,
      page_dimensions_json: dimensions,
    };

    const response = versionForm.id
      ? await editor.updateVersion(versionForm.id, payload)
      : await editor.createVersion(savedTemplate.id, payload);
    const version = response?.data;
    if (version?.id) {
      setSelectedVersion(version);
      setVersionForm((current) => ({
        ...current,
        id: version.id,
        page_count: String(version.page_count || current.page_count),
        page_dimensions: Array.isArray(version.page_dimensions_json)
          ? version.page_dimensions_json
          : current.page_dimensions,
      }));
      const versionResponse = await editor.fetchVersions(savedTemplate.id);
      setVersions(Array.isArray(versionResponse?.data) ? versionResponse.data : [version]);
    }
    return version;
  };

  const publishCurrentVersion = async () => {
    const version = selectedVersion?.id ? selectedVersion : await saveVersion();
    if (!version?.id) return;
    const response = await editor.publishVersion(version.id);
    const publishedVersion = response?.data;
    await loadTemplate();
    if (publishedVersion?.id) {
      setSelectedVersion(publishedVersion);
      setVersions((current) =>
        current.map((item) =>
          item.id === publishedVersion.id ? publishedVersion : item,
        ),
      );
    }
    navigate("/admin/e-booklets");
  };

  const goNext = async () => {
    if (activeStep === "basic") {
      const saved = await saveBasicInfo();
      if (!saved?.id && !templateId) return;
    }
    if (activeStep === "file") {
      const version = await saveVersion();
      if (!version?.id && !selectedVersion?.id) return;
    }
    const next = steps[Math.min(steps.length - 1, activeStepIndex + 1)];
    setActiveStep(next.id);
  };

  const goBack = () => {
    const previous = steps[Math.max(0, activeStepIndex - 1)];
    setActiveStep(previous.id);
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const response = await editor.uploadAsset("cover", file, {
      owner_type: "template",
      owner_id: templateId || "",
      file_type: "image",
    });
    const assetId = normalizeAssetId(response);
    if (assetId) {
      updateTemplateField("cover_file_id", String(assetId));
      toast.success(t("toasts.coverUploaded"));
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const response = await editor.uploadAsset("document", file, {
      owner_type: "template",
      owner_id: templateId || "",
    });
    const assetId = normalizeAssetId(response);
    const metadata = normalizeMetadata(response);
    if (assetId) {
      if (!metadata?.page_count || !metadata?.page_dimensions?.length) {
        toast.error(t("admin.editor.file.uploadRequired"));
        return;
      }
      setSelectedVersion(null);
      setSelectedPage(1);
      setVersionForm((current) => ({
        ...current,
        base_document_file_id: String(assetId),
        page_count: String(metadata.page_count),
        page_dimensions: metadata.page_dimensions,
        document_filename: file.name,
      }));
      toast.success(t("toasts.pdfDetected", { count: metadata.page_count }));
    }
  };

  const handleHotspotMediaUpload = async (file) => {
    if (!file) return;
    const response = await editor.uploadAsset("hotspot-media", file, {
      owner_type: "hotspot",
      file_type: hotspotForm.type,
    });
    const assetId = normalizeAssetId(response);
    if (assetId) updateHotspotField("asset_file_id", String(assetId));
  };

  const handlePageClick = (event) => {
    if (!pageRef.current || !activeVersionId) return;
    const rect = pageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setHotspotForm({
      ...defaultHotspotForm,
      page_number: selectedPage,
      x_percent: Number(x.toFixed(2)),
      y_percent: Number(y.toFixed(2)),
    });
  };

  const selectHotspot = (hotspot) => {
    setHotspotForm({
      id: hotspot.id,
      page_number: hotspot.page_number,
      x_percent: Number(hotspot.x_percent),
      y_percent: Number(hotspot.y_percent),
      radius_percent: Number(hotspot.radius_percent),
      type: hotspot.type || "text",
      title: hotspot.title || "",
      text_content: hotspot.text_content || "",
      asset_file_id: hotspot.asset_file_id ? String(hotspot.asset_file_id) : "",
      trigger_type: hotspot.trigger_type || "click",
    });
  };

  const saveHotspot = async () => {
    const version = activeVersionId ? { id: activeVersionId } : await saveVersion();
    if (!version?.id) return;

    const payload = {
      page_number: Number(hotspotForm.page_number),
      x_percent: parseNumber(hotspotForm.x_percent, 50),
      y_percent: parseNumber(hotspotForm.y_percent, 50),
      radius_percent: parseNumber(hotspotForm.radius_percent, 1.8),
      type: hotspotForm.type,
      title: hotspotForm.title.trim() || undefined,
      text_content:
        hotspotForm.type === "text" ? hotspotForm.text_content.trim() : undefined,
      asset_file_id:
        hotspotForm.asset_file_id && hotspotForm.type !== "text"
          ? Number(hotspotForm.asset_file_id)
          : undefined,
      trigger_type: hotspotForm.trigger_type,
      display_behavior: { opens: "popover" },
    };

    if (hotspotForm.id) {
      await editor.updateHotspot(hotspotForm.id, payload);
    } else {
      await editor.createHotspot(version.id, payload);
    }
    await loadHotspots(version.id, selectedPage);
    setHotspotForm({ ...defaultHotspotForm, page_number: selectedPage });
  };

  const deleteCurrentHotspot = async () => {
    if (!hotspotForm.id || !activeVersionId) return;
    await editor.deleteHotspot(hotspotForm.id);
    await loadHotspots(activeVersionId, selectedPage);
    setHotspotForm({ ...defaultHotspotForm, page_number: selectedPage });
  };

  const startAudioRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error(t("admin.editor.hotspots.recordingUnavailable"));
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    audioChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunksRef.current.push(event.data);
    };
    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const file = new File([blob], `hotspot-recording-${Date.now()}.webm`, {
        type: "audio/webm",
      });
      await handleHotspotMediaUpload(file);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopAudioRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const StepButton = ({ step, index }) => (
    <button
      type="button"
      onClick={() => setActiveStep(step.id)}
      className={`flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 text-sm ${
        activeStep === step.id
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground"
      }`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
        {index + 1}
      </span>
      <span className="truncate">{t(step.labelKey)}</span>
    </button>
  );

  const pageOptions = Array.from({ length: pageCount }, (_, index) => index + 1);
  const CurrentIcon = hotspotIcons[hotspotForm.type] || CircleDot;
  const statusLabel = (value) => t(`statuses.${value}`, { defaultValue: value });

  return (
    <div className="space-y-6" data-testid="admin-e-booklet-editor-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ms-2 mb-2">
            <Link to="/admin/e-booklets">
              <ArrowLeft className="h-4 w-4" />
              {t("common.backToEBooklets")}
            </Link>
          </Button>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <BookOpenCheck className="h-8 w-8 text-primary" />
            {isEditing ? t("admin.editor.titleEdit") : t("admin.editor.titleCreate")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("admin.editor.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedVersion?.status && (
            <Badge variant="outline">
              {t("admin.editor.versionBadge", {
                version: selectedVersion.version_number,
                status: statusLabel(selectedVersion.status),
              })}
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={() => navigate("/admin/e-booklets")}
          >
            {t("common.close")}
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => (
          <StepButton key={step.id} step={step} index={index} />
        ))}
      </div>

      {activeStep === "basic" && (
        <section className="space-y-5 rounded-lg border bg-background p-5">
          <div>
            <h2 className="text-lg font-semibold">{t("admin.editor.basic.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("admin.editor.basic.description")}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ebooklet-title">{t("admin.editor.basic.templateTitle")}</Label>
              <Input
                id="ebooklet-title"
                value={templateForm.title}
                onChange={(event) => updateTemplateField("title", event.target.value)}
                placeholder={t("admin.editor.basic.templateTitlePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebooklet-price">{t("admin.editor.basic.price")}</Label>
              <div className="grid grid-cols-[1fr_110px] gap-2">
                <Input
                  id="ebooklet-price"
                  type="number"
                  min="0"
                  value={templateForm.price}
                  onChange={(event) => updateTemplateField("price", event.target.value)}
                />
                <Input
                  value={templateForm.currency}
                  onChange={(event) => updateTemplateField("currency", event.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ebooklet-description">
                {t("admin.editor.basic.descriptionLabel")}
              </Label>
              <Textarea
                id="ebooklet-description"
                value={templateForm.description}
                onChange={(event) => updateTemplateField("description", event.target.value)}
                placeholder={t("admin.editor.basic.descriptionPlaceholder")}
                className="min-h-28"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.editor.basic.status")}</Label>
              <Select
                value={templateForm.status}
                onValueChange={(value) => updateTemplateField("status", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("statuses.draft")}</SelectItem>
                  <SelectItem value="published">{t("statuses.published")}</SelectItem>
                  <SelectItem value="archived">{t("statuses.archived")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebooklet-cover">{t("admin.editor.basic.coverImage")}</Label>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  id="ebooklet-cover"
                  className="min-h-9 flex-1 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                >
                  {templateForm.cover_file_id
                    ? t("admin.editor.basic.coverUploaded", {
                        id: templateForm.cover_file_id,
                      })
                    : t("admin.editor.basic.coverEmpty")}
                </div>
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  {templateForm.cover_file_id ? t("common.replace") : t("common.upload")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                    data-testid="ebooklet-cover-upload-input"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeStep === "file" && (
        <section className="space-y-5 rounded-lg border bg-background p-5">
          <div>
            <h2 className="text-lg font-semibold">{t("admin.editor.file.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("admin.editor.file.description")}
            </p>
          </div>

          {versions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {versions.map((version) => (
                <Button
                  key={version.id}
                  type="button"
                  variant={selectedVersion?.id === version.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedVersion(version);
                    setVersionForm({
                      id: version.id,
                      page_count: String(version.page_count || 1),
                      page_dimensions: Array.isArray(version.page_dimensions_json)
                        ? version.page_dimensions_json
                        : [],
                      base_document_file_id: version.base_document_file_id
                        ? String(version.base_document_file_id)
                        : "",
                      rendered_document_file_id: version.rendered_document_file_id
                        ? String(version.rendered_document_file_id)
                        : "",
                      document_filename: version.base_document_file?.original_filename || "",
                    });
                  }}
                >
                  v{version.version_number} {statusLabel(version.status)}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedVersion(null);
                  setVersionForm(defaultVersionForm);
                  setHotspots([]);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("admin.editor.file.newVersion")}
              </Button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-2">
              <Label htmlFor="ebooklet-document">{t("admin.editor.file.originalDocument")}</Label>
              <div className="flex flex-wrap items-center gap-2">
                <div
                  id="ebooklet-document"
                  className="min-h-9 flex-1 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                >
                  {versionForm.base_document_file_id
                    ? versionForm.document_filename ||
                      t("admin.editor.file.uploaded", {
                        id: versionForm.base_document_file_id,
                      })
                    : t("admin.editor.file.empty")}
                </div>
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  {versionForm.base_document_file_id ? t("common.replace") : t("common.upload")}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleDocumentUpload}
                    data-testid="ebooklet-document-upload-input"
                  />
                </label>
              </div>
            </div>
            <div className="rounded-md border bg-muted/20 p-3 text-sm">
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                {t("admin.editor.file.detectedPdf")}
              </div>
              <div className="mt-2 font-medium">
                {versionForm.page_count
                  ? t("common.pageCount", { count: Number(versionForm.page_count) })
                  : t("admin.editor.file.noPdf")}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {versionForm.page_dimensions?.[0]
                  ? t("admin.editor.file.dimensions", {
                      width: versionForm.page_dimensions[0].width,
                      height: versionForm.page_dimensions[0].height,
                    })
                  : t("admin.editor.file.dimensionsPending")}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeStep === "hotspots" && (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{t("admin.editor.hotspots.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("admin.editor.hotspots.description")}
                </p>
              </div>
              <Select
                value={String(selectedPage)}
                onValueChange={(value) => setSelectedPage(Number(value))}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageOptions.map((pageNumber) => (
                    <SelectItem key={pageNumber} value={String(pageNumber)}>
                      {t("common.page")} {pageNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mx-auto w-full max-w-[720px]">
              <div
                ref={pageRef}
                onClick={handlePageClick}
                className="relative overflow-hidden rounded-md border bg-white shadow-sm"
                style={{ aspectRatio: pageAspectRatio }}
                data-testid="admin-e-booklet-hotspot-page"
              >
                {documentPreviewUrl ? (
                  <iframe
                    key={`${documentPreviewUrl}-${selectedPage}`}
                    src={`${documentPreviewUrl}#page=${selectedPage}&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    title={`${t("common.eBooklet")} ${t("common.page")} ${selectedPage}`}
                    className="pointer-events-none absolute inset-0 h-full w-full border-0 bg-white"
                    data-testid="admin-e-booklet-pdf-preview"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                    {t("admin.editor.hotspots.renderPending")}
                  </div>
                )}
                <div className="absolute inset-0 bg-transparent" />
                {pageHotspots.map((hotspot) => {
                  const Icon = hotspotIcons[hotspot.type] || CircleDot;
                  const size = Math.max(16, Number(hotspot.radius_percent || 1.8) * 10);
                  return (
                    <button
                      type="button"
                      key={hotspot.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectHotspot(hotspot);
                      }}
                      className="absolute flex items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-md"
                      style={{
                        left: `${hotspot.x_percent}%`,
                        top: `${hotspot.y_percent}%`,
                        width: size,
                        height: size,
                        transform: "translate(-50%, -50%)",
                      }}
                      title={
                        hotspot.title ||
                        t(`admin.editor.hotspots.types.${hotspot.type}`, {
                          defaultValue: hotspot.type,
                        })
                      }
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
                {!activeVersionId && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/85 text-center text-sm text-muted-foreground">
                    {t("admin.editor.hotspots.saveBeforePlacing")}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{t("admin.editor.hotspots.contentTitle")}</h3>
                <p className="text-xs text-muted-foreground">
                  {t("admin.editor.hotspots.pageSummary", {
                    page: selectedPage,
                    count: pageHotspots.length,
                  })}
                </p>
              </div>
              <CurrentIcon className="h-5 w-5 text-primary" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("admin.editor.hotspots.xPercent")}</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={hotspotForm.x_percent}
                  onChange={(event) => updateHotspotField("x_percent", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.editor.hotspots.yPercent")}</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={hotspotForm.y_percent}
                  onChange={(event) => updateHotspotField("y_percent", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.editor.hotspots.radiusPercent")}</Label>
                <Input
                  type="number"
                  min="0.1"
                  max="20"
                  step="0.1"
                  value={hotspotForm.radius_percent}
                  onChange={(event) => updateHotspotField("radius_percent", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.editor.hotspots.trigger")}</Label>
                <Select
                  value={hotspotForm.trigger_type}
                  onValueChange={(value) => updateHotspotField("trigger_type", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="click">{t("admin.editor.hotspots.triggerClick")}</SelectItem>
                    <SelectItem value="hover">{t("admin.editor.hotspots.triggerHover")}</SelectItem>
                    <SelectItem value="both">{t("admin.editor.hotspots.triggerBoth")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("admin.editor.hotspots.type")}</Label>
              <Select
                value={hotspotForm.type}
                onValueChange={(value) => updateHotspotField("type", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">{t("admin.editor.hotspots.types.text")}</SelectItem>
                  <SelectItem value="image">{t("admin.editor.hotspots.types.image")}</SelectItem>
                  <SelectItem value="video">{t("admin.editor.hotspots.types.video")}</SelectItem>
                  <SelectItem value="audio">{t("admin.editor.hotspots.types.audio")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("admin.editor.hotspots.titleLabel")}</Label>
              <Input
                value={hotspotForm.title}
                onChange={(event) => updateHotspotField("title", event.target.value)}
                placeholder={t("admin.editor.hotspots.titlePlaceholder")}
              />
            </div>

            {hotspotForm.type === "text" ? (
              <div className="space-y-2">
                <Label>{t("admin.editor.hotspots.textBody")}</Label>
                <Textarea
                  value={hotspotForm.text_content}
                  onChange={(event) => updateHotspotField("text_content", event.target.value)}
                  className="min-h-32"
                  placeholder={t("admin.editor.hotspots.textPlaceholder")}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{t("admin.editor.hotspots.mediaAsset")}</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="min-h-9 flex-1 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    {hotspotForm.asset_file_id
                      ? t("admin.editor.hotspots.mediaUploaded", {
                          id: hotspotForm.asset_file_id,
                        })
                      : t("admin.editor.hotspots.mediaEmpty")}
                  </div>
                  <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    {hotspotForm.asset_file_id ? t("common.replace") : t("common.upload")}
                    <input
                      type="file"
                      accept={
                        hotspotForm.type === "image"
                          ? "image/*"
                          : hotspotForm.type === "video"
                            ? "video/*"
                            : "audio/*"
                      }
                      className="hidden"
                      onChange={(event) => handleHotspotMediaUpload(event.target.files?.[0])}
                      data-testid="ebooklet-hotspot-media-upload-input"
                    />
                  </label>
                </div>
                {hotspotForm.type === "audio" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={recording ? stopAudioRecording : startAudioRecording}
                    className="w-full"
                  >
                    {recording ? <Save className="h-4 w-4" /> : <MousePointerClick className="h-4 w-4" />}
                    {recording
                      ? t("admin.editor.hotspots.stopRecording")
                      : t("admin.editor.hotspots.recordAudio")}
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={saveHotspot} disabled={editor.loading || !activeVersionId}>
                <Save className="h-4 w-4" />
                {t("common.save")}
              </Button>
              <Button
                variant="outline"
                onClick={deleteCurrentHotspot}
                disabled={!hotspotForm.id || editor.loading}
              >
                <Trash2 className="h-4 w-4" />
                {t("common.delete")}
              </Button>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-md border">
              {pageHotspots.map((hotspot) => (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => selectHotspot(hotspot)}
                  className="flex w-full items-center justify-between border-b px-3 py-2 text-start text-sm last:border-b-0 hover:bg-muted/50"
                >
                  <span className="truncate">
                    {hotspot.title ||
                      t("admin.editor.hotspots.hotspotFallback", {
                        type: t(`admin.editor.hotspots.types.${hotspot.type}`, {
                          defaultValue: hotspot.type,
                        }),
                      })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Number(hotspot.x_percent).toFixed(1)}, {Number(hotspot.y_percent).toFixed(1)}
                  </span>
                </button>
              ))}
              {pageHotspots.length === 0 && (
                <div className="px-3 py-5 text-center text-sm text-muted-foreground">
                  {t("admin.editor.hotspots.emptyPage")}
                </div>
              )}
            </div>
          </aside>
        </section>
      )}

      {activeStep === "review" && (
        <section className="space-y-5 rounded-lg border bg-background p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t("admin.editor.review.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.editor.review.description")}
              </p>
            </div>
            <Button onClick={publishCurrentVersion} disabled={editor.loading || !selectedVersion?.id}>
              <ShieldCheck className="h-4 w-4" />
              {t("common.publishVersion")}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-md border p-4">
              <div className="text-xs uppercase text-muted-foreground">
                {t("admin.editor.review.template")}
              </div>
              <div className="mt-2 font-semibold">
                {templateForm.title || t("common.untitled")}
              </div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-xs uppercase text-muted-foreground">{t("common.price")}</div>
              <div className="mt-2 font-semibold">{templateForm.price} {templateForm.currency}</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-xs uppercase text-muted-foreground">{t("common.pages")}</div>
              <div className="mt-2 font-semibold">{pageCount}</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-xs uppercase text-muted-foreground">
                {t("admin.editor.review.currentPageHotspots")}
              </div>
              <div className="mt-2 font-semibold">{pageHotspots.length}</div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Play className="h-4 w-4 text-primary" />
              {t("admin.editor.review.previewChecks")}
            </div>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <div>
                {t("admin.editor.review.privateOriginal", {
                  value: versionForm.base_document_file_id || t("common.notUploaded"),
                })}
              </div>
              <div>
                {t("admin.editor.review.coverAsset", {
                  value: templateForm.cover_file_id || t("common.notUploaded"),
                })}
              </div>
              <div>
                {t("admin.editor.review.templateVersion", {
                  value: selectedVersion?.version_number || t("common.notSaved"),
                })}
              </div>
              <div>
                {t("admin.editor.review.status", {
                  value: selectedVersion?.status
                    ? statusLabel(selectedVersion.status)
                    : t("common.draft"),
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 border-t bg-background py-4 sm:flex-row sm:items-center sm:justify-start">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={activeStepIndex === 0 || editor.loading}
        >
          {t("common.previous")}
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={activeStep === "file" ? saveVersion : saveBasicInfo}
            disabled={editor.loading}
          >
            <Save className="h-4 w-4" />
            {t("common.saveDraft")}
          </Button>
          {activeStep === "review" ? (
            <Button onClick={publishCurrentVersion} disabled={editor.loading || !selectedVersion?.id}>
              <ShieldCheck className="h-4 w-4" />
              {t("common.publish")}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={editor.loading}>
              {t("common.continue")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
