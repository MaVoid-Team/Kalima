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

const steps = [
  { id: "basic", label: "Basic Info" },
  { id: "file", label: "Original File" },
  { id: "hotspots", label: "Hotspots" },
  { id: "review", label: "Review" },
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
  page_count: "1",
  page_width: "612",
  page_height: "792",
  page_dimensions_json: "",
  base_document_file_id: "",
  rendered_document_file_id: "",
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

const normalizeAssetId = (response) => response?.data?.id || response?.id || "";

const buildPageDimensions = (form) => {
  if (form.page_dimensions_json.trim()) {
    try {
      const parsed = JSON.parse(form.page_dimensions_json);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      toast.error("Page dimensions JSON is invalid.");
      return null;
    }
  }

  const pageCount = Math.max(1, parseNumber(form.page_count, 1));
  const width = Math.max(1, parseNumber(form.page_width, 612));
  const height = Math.max(1, parseNumber(form.page_height, 792));
  return Array.from({ length: pageCount }, () => ({ width, height }));
};

const getVersionDimensions = (version, fallbackForm) => {
  if (Array.isArray(version?.page_dimensions_json) && version.page_dimensions_json.length > 0) {
    return version.page_dimensions_json;
  }
  return buildPageDimensions(fallbackForm) || [{ width: 612, height: 792 }];
};

export default function AdminEBookletEditorPage() {
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
        page_width: String(latest.page_dimensions_json?.[0]?.width || 612),
        page_height: String(latest.page_dimensions_json?.[0]?.height || 792),
        page_dimensions_json: latest.page_dimensions_json
          ? JSON.stringify(latest.page_dimensions_json, null, 2)
          : "",
        base_document_file_id: latest.base_document_file_id
          ? String(latest.base_document_file_id)
          : "",
        rendered_document_file_id: latest.rendered_document_file_id
          ? String(latest.rendered_document_file_id)
          : "",
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

  const updateTemplateField = (field, value) => {
    setTemplateForm((current) => ({ ...current, [field]: value }));
  };

  const updateVersionField = (field, value) => {
    setVersionForm((current) => ({ ...current, [field]: value }));
  };

  const updateHotspotField = (field, value) => {
    setHotspotForm((current) => ({ ...current, [field]: value }));
  };

  const saveBasicInfo = async () => {
    if (!templateForm.title.trim()) {
      toast.error("Template title is required.");
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
    if (!dimensions) return null;

    const payload = {
      base_document_file_id: versionForm.base_document_file_id
        ? Number(versionForm.base_document_file_id)
        : undefined,
      rendered_document_file_id: versionForm.rendered_document_file_id
        ? Number(versionForm.rendered_document_file_id)
        : undefined,
      page_count: Math.max(1, parseNumber(versionForm.page_count, dimensions.length)),
      page_dimensions_json: dimensions,
    };

    const response = versionForm.id
      ? await editor.updateVersion(versionForm.id, payload)
      : await editor.createVersion(savedTemplate.id, payload);
    const version = response?.data;
    if (version?.id) {
      setSelectedVersion(version);
      setVersionForm((current) => ({ ...current, id: version.id }));
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
    setActiveStep("review");
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
    if (assetId) updateTemplateField("cover_file_id", String(assetId));
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const response = await editor.uploadAsset("document", file, {
      owner_type: "template",
      owner_id: templateId || "",
    });
    const assetId = normalizeAssetId(response);
    if (assetId) updateVersionField("base_document_file_id", String(assetId));
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
      toast.error("Audio recording is not available in this browser.");
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
      <span className="truncate">{step.label}</span>
    </button>
  );

  const pageOptions = Array.from({ length: pageCount }, (_, index) => index + 1);
  const CurrentIcon = hotspotIcons[hotspotForm.type] || CircleDot;

  return (
    <div className="space-y-6" data-testid="admin-e-booklet-editor-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ms-2 mb-2">
            <Link to="/admin/e-booklets">
              <ArrowLeft className="h-4 w-4" />
              Back to E-Booklets
            </Link>
          </Button>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <BookOpenCheck className="h-8 w-8 text-primary" />
            {isEditing ? "Edit E-Booklet Template" : "Create E-Booklet Template"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hotspots are versioned on the template; teacher PDFs stay separate at delivery.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedVersion?.status && (
            <Badge variant="outline">Version {selectedVersion.version_number}: {selectedVersion.status}</Badge>
          )}
          <Button
            variant="outline"
            onClick={() => navigate("/admin/e-booklets")}
          >
            Close
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
            <h2 className="text-lg font-semibold">Store Listing</h2>
            <p className="text-sm text-muted-foreground">
              This creates the reusable product template shown in the e-booklet store.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ebooklet-title">Template title</Label>
              <Input
                id="ebooklet-title"
                value={templateForm.title}
                onChange={(event) => updateTemplateField("title", event.target.value)}
                placeholder="Grade 5 Arabic Reading Booklet Template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebooklet-price">Price</Label>
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
              <Label htmlFor="ebooklet-description">Description</Label>
              <Textarea
                id="ebooklet-description"
                value={templateForm.description}
                onChange={(event) => updateTemplateField("description", event.target.value)}
                placeholder="Describe the booklet, target grade, and included interactive content."
                className="min-h-28"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={templateForm.status}
                onValueChange={(value) => updateTemplateField("status", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebooklet-cover">Cover image</Label>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  id="ebooklet-cover"
                  value={templateForm.cover_file_id}
                  onChange={(event) => updateTemplateField("cover_file_id", event.target.value)}
                  placeholder="Private file asset ID"
                />
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
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
            <h2 className="text-lg font-semibold">Original Sample File</h2>
            <p className="text-sm text-muted-foreground">
              Upload the admin sample PDF, DOC, or DOCX. The viewer uses PDF page previews and normalized coordinates.
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
                      page_width: String(version.page_dimensions_json?.[0]?.width || 612),
                      page_height: String(version.page_dimensions_json?.[0]?.height || 792),
                      page_dimensions_json: version.page_dimensions_json
                        ? JSON.stringify(version.page_dimensions_json, null, 2)
                        : "",
                      base_document_file_id: version.base_document_file_id
                        ? String(version.base_document_file_id)
                        : "",
                      rendered_document_file_id: version.rendered_document_file_id
                        ? String(version.rendered_document_file_id)
                        : "",
                    });
                  }}
                >
                  v{version.version_number} {version.status}
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
                New version
              </Button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ebooklet-document">Original document</Label>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  id="ebooklet-document"
                  value={versionForm.base_document_file_id}
                  onChange={(event) => updateVersionField("base_document_file_id", event.target.value)}
                  placeholder="Private file asset ID"
                />
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={handleDocumentUpload}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebooklet-pages">Page count</Label>
              <Input
                id="ebooklet-pages"
                type="number"
                min="1"
                value={versionForm.page_count}
                onChange={(event) => updateVersionField("page_count", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebooklet-width">Page width</Label>
              <Input
                id="ebooklet-width"
                type="number"
                min="1"
                value={versionForm.page_width}
                onChange={(event) => updateVersionField("page_width", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ebooklet-height">Page height</Label>
              <Input
                id="ebooklet-height"
                type="number"
                min="1"
                value={versionForm.page_height}
                onChange={(event) => updateVersionField("page_height", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ebooklet-dimensions">Per-page dimensions JSON, optional</Label>
              <Textarea
                id="ebooklet-dimensions"
                value={versionForm.page_dimensions_json}
                onChange={(event) => updateVersionField("page_dimensions_json", event.target.value)}
                placeholder='[{"width":612,"height":792}]'
                className="min-h-28 font-mono text-xs"
              />
            </div>
          </div>
        </section>
      )}

      {activeStep === "hotspots" && (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Hotspot Editor</h2>
                <p className="text-sm text-muted-foreground">
                  Click a page position, then save the hotspot content in the panel.
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
                      Page {pageNumber}
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
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:10%_10%]" />
                <div className="absolute inset-x-8 top-8 h-6 rounded bg-slate-100" />
                <div className="absolute inset-x-8 top-20 space-y-3">
                  <div className="h-3 rounded bg-slate-100" />
                  <div className="h-3 w-5/6 rounded bg-slate-100" />
                  <div className="h-3 w-2/3 rounded bg-slate-100" />
                </div>
                <div className="absolute inset-x-8 bottom-10 h-24 rounded border border-dashed border-slate-200 bg-slate-50" />
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
                      title={hotspot.title || hotspot.type}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
                {!activeVersionId && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/85 text-center text-sm text-muted-foreground">
                    Save the original file step before placing hotspots.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Hotspot Content</h3>
                <p className="text-xs text-muted-foreground">
                  Page {selectedPage} has {pageHotspots.length} hotspots.
                </p>
              </div>
              <CurrentIcon className="h-5 w-5 text-primary" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>X %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={hotspotForm.x_percent}
                  onChange={(event) => updateHotspotField("x_percent", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Y %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={hotspotForm.y_percent}
                  onChange={(event) => updateHotspotField("y_percent", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Radius %</Label>
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
                <Label>Trigger</Label>
                <Select
                  value={hotspotForm.trigger_type}
                  onValueChange={(value) => updateHotspotField("trigger_type", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="click">Click</SelectItem>
                    <SelectItem value="hover">Hover</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={hotspotForm.type}
                onValueChange={(value) => updateHotspotField("type", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text note</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={hotspotForm.title}
                onChange={(event) => updateHotspotField("title", event.target.value)}
                placeholder="Optional label"
              />
            </div>

            {hotspotForm.type === "text" ? (
              <div className="space-y-2">
                <Label>Text body</Label>
                <Textarea
                  value={hotspotForm.text_content}
                  onChange={(event) => updateHotspotField("text_content", event.target.value)}
                  className="min-h-32"
                  placeholder="Student-facing text note"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Media asset</Label>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    value={hotspotForm.asset_file_id}
                    onChange={(event) => updateHotspotField("asset_file_id", event.target.value)}
                    placeholder="Private media asset ID"
                  />
                  <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    Upload
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
                    {recording ? "Stop recording" : "Record audio"}
                  </Button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={saveHotspot} disabled={editor.loading || !activeVersionId}>
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={deleteCurrentHotspot}
                disabled={!hotspotForm.id || editor.loading}
              >
                <Trash2 className="h-4 w-4" />
                Delete
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
                  <span className="truncate">{hotspot.title || `${hotspot.type} hotspot`}</span>
                  <span className="text-xs text-muted-foreground">
                    {Number(hotspot.x_percent).toFixed(1)}, {Number(hotspot.y_percent).toFixed(1)}
                  </span>
                </button>
              ))}
              {pageHotspots.length === 0 && (
                <div className="px-3 py-5 text-center text-sm text-muted-foreground">
                  No hotspots on this page.
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
              <h2 className="text-lg font-semibold">Review and Publish</h2>
              <p className="text-sm text-muted-foreground">
                Publishing locks this version for new teacher purchases. Existing delivered instances keep their original version.
              </p>
            </div>
            <Button onClick={publishCurrentVersion} disabled={editor.loading || !selectedVersion?.id}>
              <ShieldCheck className="h-4 w-4" />
              Publish Version
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-md border p-4">
              <div className="text-xs uppercase text-muted-foreground">Template</div>
              <div className="mt-2 font-semibold">{templateForm.title || "Untitled"}</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-xs uppercase text-muted-foreground">Price</div>
              <div className="mt-2 font-semibold">{templateForm.price} {templateForm.currency}</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-xs uppercase text-muted-foreground">Pages</div>
              <div className="mt-2 font-semibold">{pageCount}</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-xs uppercase text-muted-foreground">Current Page Hotspots</div>
              <div className="mt-2 font-semibold">{pageHotspots.length}</div>
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Play className="h-4 w-4 text-primary" />
              Admin preview checks
            </div>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <div>Private original document asset: {versionForm.base_document_file_id || "Not uploaded"}</div>
              <div>Cover asset: {templateForm.cover_file_id || "Not uploaded"}</div>
              <div>Template version: {selectedVersion?.version_number || "Draft not saved"}</div>
              <div>Status: {selectedVersion?.status || "draft"}</div>
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
          Previous
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={activeStep === "file" ? saveVersion : saveBasicInfo}
            disabled={editor.loading}
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          {activeStep === "review" ? (
            <Button onClick={publishCurrentVersion} disabled={editor.loading || !selectedVersion?.id}>
              <ShieldCheck className="h-4 w-4" />
              Publish
            </Button>
          ) : (
            <Button onClick={goNext} disabled={editor.loading}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
