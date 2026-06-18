import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenCheck,
  CircleDot,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  HelpCircle,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
  MousePointerClick,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Square,
  Triangle,
  Trash2,
  Type,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminEBookletEditor } from "@/hooks/admin/useAdminEBooklets";
import { useAdminPaymentMethods } from "@/hooks/admin/useAdminPaymentMethods";
import useAdminRequiredFields from "@/hooks/admin/useAdminRequiredFields";
import { useTranslation } from "react-i18next";

const steps = [
  { id: "basic", labelKey: "admin.editor.steps.basic" },
  { id: "file", labelKey: "admin.editor.steps.file" },
  { id: "hotspots", labelKey: "admin.editor.steps.hotspots" },
  { id: "review", labelKey: "admin.editor.steps.review" },
];

const teacherTemplateSteps = steps.filter((step) => step.id !== "basic");

const hotspotIcons = {
  text: FileText,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  file: Upload,
  link: LinkIcon,
  question_answer: HelpCircle,
};

const shapeIcons = {
  circle: CircleDot,
  rectangle: Square,
  square: Square,
  triangle: Triangle,
  oval: CircleDot,
};

const hotspotShapes = ["circle", "rectangle", "square", "triangle", "oval"];
const contentBlockTypes = ["text", "image", "video", "audio", "file", "link", "question_answer"];
const textFontOptions = ["Inter", "Arial", "Georgia", "Times New Roman", "Courier New"];

const createDefaultBlock = (type = "text") => ({
  id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  text_content: "",
  asset_file_id: "",
  url: "",
  source: type === "video" ? "uploaded" : undefined,
  youtube_url: "",
  font_family: textFontOptions[0],
  answers: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
});

const createBlockForTypeChange = (type, previousBlock = {}) => {
  const nextBlock = createDefaultBlock(type);
  return {
    ...nextBlock,
    id: previousBlock.id || nextBlock.id,
  };
};

const defaultInteractionJson = {
  audio: { autoplay: false },
  image: { autoExpand: false, expandOnClick: true },
};

const defaultDisplayBehavior = { opens: "popover", opacity_percent: 100 };
const resizeHandles = ["nw", "ne", "sw", "se"];
const MIN_HOTSPOT_SIZE_PERCENT = 0.5;
const MAX_HOTSPOT_SIZE_PERCENT = 100;

const defaultTemplateForm = {
  title: "",
  description: "",
  price: "0",
  currency: "EGP",
  status: "draft",
  cover_file_id: "",
  payment_method_ids: [],
  required_fields: [],
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
  reference_number: "",
  page_number: 1,
  x_percent: 50,
  y_percent: 50,
  radius_percent: 1.8,
  shape: "circle",
  width_percent: 5,
  height_percent: 5,
  type: "text",
  title: "",
  text_content: "",
  asset_file_id: "",
  trigger_type: "click",
  display_behavior: defaultDisplayBehavior,
  content_json: { version: 2, blocks: [createDefaultBlock("text")] },
  interaction_json: defaultInteractionJson,
};

const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeAsset = (response) => response?.data || response || null;
const normalizeAssetId = (response) => normalizeAsset(response)?.id || "";
const normalizeMetadata = (response) => normalizeAsset(response)?.metadata || null;

const coerceBlockForForm = (block, fallbackType = "text") => ({
  ...createDefaultBlock(block?.type || fallbackType),
  ...(block || {}),
  asset_file_id: block?.asset_file_id ? String(block.asset_file_id) : "",
  answers: Array.isArray(block?.answers) && block.answers.length > 0
    ? block.answers.map((answer) => ({
        text: answer.text || answer.label || "",
        isCorrect: answer.isCorrect === true || answer.is_correct === true,
      }))
    : createDefaultBlock("question_answer").answers,
});

const normalizeContentForForm = (hotspot) => {
  const blocks = Array.isArray(hotspot?.content_json?.blocks)
    ? hotspot.content_json.blocks
    : [
        {
          type: hotspot?.type || "text",
          text_content: hotspot?.text_content || "",
          asset_file_id: hotspot?.asset_file_id || "",
        },
      ];
  return {
    version: 2,
    blocks: blocks.map((block, index) => coerceBlockForForm(block, index === 0 ? hotspot?.type : "text")),
  };
};

const normalizeInteractionForForm = (hotspot) => ({
  audio: {
    autoplay: Boolean(hotspot?.interaction_json?.audio?.autoplay),
  },
  image: {
    autoExpand: Boolean(hotspot?.interaction_json?.image?.autoExpand),
    expandOnClick: hotspot?.interaction_json?.image?.expandOnClick !== false,
  },
});

const normalizeDisplayBehaviorForForm = (hotspot) => ({
  ...defaultDisplayBehavior,
  ...(hotspot?.display_behavior || {}),
  opacity_percent: Math.min(100, Math.max(0, parseNumber(hotspot?.display_behavior?.opacity_percent, 100))),
});

const clampHotspotSize = (value) => Math.min(
  MAX_HOTSPOT_SIZE_PERCENT,
  Math.max(MIN_HOTSPOT_SIZE_PERCENT, parseNumber(value, MIN_HOTSPOT_SIZE_PERCENT)),
);

const buildContentJsonPayload = (form) => ({
  version: 2,
  blocks: (form.content_json?.blocks || []).map((block) => {
    const payload = { type: block.type };
    if (["text", "question_answer"].includes(block.type) && block.text_content?.trim()) {
      payload.text_content = block.text_content.trim();
    }
    if (block.type === "text") payload.font_family = block.font_family || textFontOptions[0];
    if (["image", "audio", "file"].includes(block.type) && block.asset_file_id) {
      payload.asset_file_id = Number(block.asset_file_id);
    }
    if (block.type === "video") {
      payload.source = block.source || "uploaded";
      if (payload.source === "youtube") payload.youtube_url = block.youtube_url?.trim() || "";
      if (payload.source === "uploaded" && block.asset_file_id) payload.asset_file_id = Number(block.asset_file_id);
    }
    if (block.type === "link") payload.url = block.url?.trim() || "";
    if (block.type === "question_answer") {
      payload.answers = (block.answers || []).map((answer) => ({
        text: answer.text || "",
        isCorrect: Boolean(answer.isCorrect),
      }));
    }
    return payload;
  }),
});

const getPrimaryBlock = (form) => form.content_json?.blocks?.[0] || createDefaultBlock(form.type);

const getHotspotShapeStyle = (shape) => {
  if (shape === "rectangle") return { borderRadius: "0.375rem" };
  if (shape === "square") return { borderRadius: "0.25rem" };
  if (shape === "triangle") return { clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)", borderRadius: 0 };
  return { borderRadius: "9999px" };
};

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
  const [searchParams] = useSearchParams();
  const isTeacherTemplateMode = searchParams.get("teacherTemplate") === "1";
  const teacherTemplateVersionId = Number(searchParams.get("versionId") || 0);
  const editorSteps = isTeacherTemplateMode ? teacherTemplateSteps : steps;
  const isEditing = Boolean(id);
  const pageRef = useRef(null);
  const dragRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const editor = useAdminEBookletEditor();
  const paymentMethodsManager = useAdminPaymentMethods();
  const requiredFieldsManager = useAdminRequiredFields();
  const [activeStep, setActiveStep] = useState(isTeacherTemplateMode ? "file" : "basic");
  const [templateId, setTemplateId] = useState(id ? Number(id) : null);
  const [templateForm, setTemplateForm] = useState(defaultTemplateForm);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versionForm, setVersionForm] = useState(defaultVersionForm);
  const [selectedPage, setSelectedPage] = useState(1);
  const [hotspots, setHotspots] = useState([]);
  const [hotspotForm, setHotspotForm] = useState(defaultHotspotForm);
  const [hasDraftHotspotPreview, setHasDraftHotspotPreview] = useState(false);
  const [recording, setRecording] = useState(false);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("");
  const [canvasExpanded, setCanvasExpanded] = useState(false);
  const [controlsMinimized, setControlsMinimized] = useState(false);

  const activeStepIndex = editorSteps.findIndex((step) => step.id === activeStep);
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

  const sortedHotspots = useMemo(
    () => [...hotspots]
      .filter((hotspot) => hotspot.is_active !== false)
      .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)),
    [hotspots],
  );

  const primaryBlock = getPrimaryBlock(hotspotForm);
  const activePaymentMethods = useMemo(
    () => (paymentMethodsManager.paymentMethods || []).filter((method) => method?.status !== false && method?.is_deleted !== true),
    [paymentMethodsManager.paymentMethods],
  );
  const fieldDefinitions = requiredFieldsManager.fields || [];

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
        payment_method_ids: Array.isArray(template.payment_methods)
          ? template.payment_methods.map((item) => Number(item.payment_method_id)).filter(Boolean)
          : [],
        required_fields: Array.isArray(template.required_fields)
          ? template.required_fields.map((item) => ({
              field_definition_id: Number(item.field_definition_id),
              is_required: item.is_required !== false,
            })).filter((item) => item.field_definition_id)
          : [],
      });
    }

    const loadedVersions = Array.isArray(versionResponse?.data) ? versionResponse.data : [];
    setVersions(loadedVersions);
    if (loadedVersions.length > 0) {
      const latest = loadedVersions.find((version) => Number(version.id) === teacherTemplateVersionId) || loadedVersions[0];
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
  }, [editor.fetchTemplate, editor.fetchVersions, id, teacherTemplateVersionId]);

  const loadHotspots = useCallback(
    async (versionId) => {
      if (!versionId) return;
      const response = await editor.fetchHotspots(versionId);
      setHotspots(Array.isArray(response?.data) ? response.data : []);
    },
    [editor.fetchHotspots],
  );

  useEffect(() => {
    loadTemplate().catch(() => {});
  }, [loadTemplate]);

  useEffect(() => {
    if (isTeacherTemplateMode) return;
    paymentMethodsManager.fetchPaymentMethods().catch(() => {});
    requiredFieldsManager.fetchAllFields({ active: true }).catch(() => {});
  }, [isTeacherTemplateMode]);

  useEffect(() => {
    if (selectedVersion?.id) {
      setHasDraftHotspotPreview(false);
      loadHotspots(selectedVersion.id).catch(() => {});
    }
  }, [loadHotspots, selectedVersion?.id]);

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

  const toggleTemplatePaymentMethod = (methodId, checked) => {
    const idNumber = Number(methodId);
    setTemplateForm((current) => {
      const ids = new Set(current.payment_method_ids || []);
      if (checked) ids.add(idNumber);
      else ids.delete(idNumber);
      return { ...current, payment_method_ids: Array.from(ids) };
    });
  };

  const toggleTemplateRequiredField = (fieldId, checked) => {
    const idNumber = Number(fieldId);
    setTemplateForm((current) => {
      const fields = current.required_fields || [];
      if (!checked) {
        return { ...current, required_fields: fields.filter((field) => Number(field.field_definition_id) !== idNumber) };
      }
      if (fields.some((field) => Number(field.field_definition_id) === idNumber)) return current;
      return {
        ...current,
        required_fields: [...fields, { field_definition_id: idNumber, is_required: true }],
      };
    });
  };

  const updateTemplateRequiredFieldFlag = (fieldId, checked) => {
    const idNumber = Number(fieldId);
    setTemplateForm((current) => ({
      ...current,
      required_fields: (current.required_fields || []).map((field) =>
        Number(field.field_definition_id) === idNumber
          ? { ...field, is_required: Boolean(checked) }
          : field,
      ),
    }));
  };

  const updateHotspotField = (field, value) => {
    setHotspotForm((current) => ({ ...current, [field]: value }));
  };

  const updateHotspotDisplayField = (field, value) => {
    const nextDisplayBehavior = {
      ...defaultDisplayBehavior,
      ...(hotspotForm.display_behavior || {}),
      [field]: value,
    };
    setHotspotForm((current) => ({
      ...current,
      display_behavior: nextDisplayBehavior,
    }));
    if (hotspotForm.id) {
      setHotspots((hotspotItems) =>
        hotspotItems.map((hotspot) =>
          hotspot.id === hotspotForm.id
            ? { ...hotspot, display_behavior: nextDisplayBehavior }
            : hotspot,
        ),
      );
    }
  };

  const updatePrimaryBlock = (field, value) => {
    setHotspotForm((current) => {
      const blocks = current.content_json?.blocks?.length
        ? current.content_json.blocks
        : [createDefaultBlock(current.type)];
      const nextBlocks = blocks.map((block, index) =>
        index === 0 ? { ...block, [field]: value } : block,
      );
      return { ...current, content_json: { version: 2, blocks: nextBlocks } };
    });
  };

  const changePrimaryBlockType = (type) => {
    setHotspotForm((current) => {
      const blocks = current.content_json?.blocks?.length
        ? current.content_json.blocks
        : [createDefaultBlock(type)];
      const nextBlock = createBlockForTypeChange(type, blocks[0]);
      return {
        ...current,
        type,
        asset_file_id: "",
        content_json: { version: 2, blocks: [nextBlock, ...blocks.slice(1)] },
      };
    });
  };

  const updateContentBlock = (index, field, value) => {
    setHotspotForm((current) => ({
      ...current,
      content_json: {
        version: 2,
        blocks: (current.content_json?.blocks || []).map((block, blockIndex) => {
          if (blockIndex !== index) return block;
          if (field === "type") return createBlockForTypeChange(value, block);
          return { ...block, [field]: value };
        }),
      },
    }));
  };

  const addContentBlock = (type = "text") => {
    setHotspotForm((current) => ({
      ...current,
      content_json: {
        version: 2,
        blocks: [...(current.content_json?.blocks || []), createDefaultBlock(type)],
      },
    }));
  };

  const removeContentBlock = (index) => {
    setHotspotForm((current) => {
      const blocks = (current.content_json?.blocks || []).filter((_, blockIndex) => blockIndex !== index);
      const nextBlocks = blocks.length ? blocks : [createDefaultBlock(current.type)];
      return { ...current, type: nextBlocks[0].type, content_json: { version: 2, blocks: nextBlocks } };
    });
  };

  const updateAnswer = (blockIndex, answerIndex, field, value) => {
    setHotspotForm((current) => {
      const blocks = current.content_json?.blocks?.length ? current.content_json.blocks : [createDefaultBlock("question_answer")];
      const targetBlock = blocks[blockIndex] || createDefaultBlock("question_answer");
      const answers = Array.isArray(targetBlock.answers) ? targetBlock.answers : [];
      return {
        ...current,
        content_json: {
          version: 2,
          blocks: blocks.map((block, index) => index === blockIndex
            ? {
                ...block,
                answers: answers.map((answer, itemIndex) =>
                  itemIndex === answerIndex
                    ? { ...answer, [field]: value }
                    : field === "isCorrect" && value
                      ? { ...answer, isCorrect: false }
                      : answer,
                ),
              }
            : block),
        },
      };
    });
  };

  const updateInteractionField = (group, field, value) => {
    setHotspotForm((current) => ({
      ...current,
      interaction_json: {
        ...current.interaction_json,
        [group]: {
          ...(current.interaction_json?.[group] || {}),
          [field]: value,
        },
      },
    }));
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
      payment_method_ids: templateForm.payment_method_ids.map(Number).filter(Boolean),
      required_fields: templateForm.required_fields.map((field) => ({
        field_definition_id: Number(field.field_definition_id),
        is_required: field.is_required !== false,
      })).filter((field) => field.field_definition_id),
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
    if (isTeacherTemplateMode) return;
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
    const next = editorSteps[Math.min(editorSteps.length - 1, activeStepIndex + 1)];
    setActiveStep(next.id);
  };

  const goBack = () => {
    const previous = editorSteps[Math.max(0, activeStepIndex - 1)];
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

  const handleHotspotMediaUpload = async (file, blockIndex = 0) => {
    if (!file) return;
    const blockType = hotspotForm.content_json?.blocks?.[blockIndex]?.type || hotspotForm.type;
    const response = await editor.uploadAsset("hotspot-media", file, {
      owner_type: "hotspot",
      file_type: blockType,
    });
    const assetId = normalizeAssetId(response);
    if (assetId) {
      updateContentBlock(blockIndex, "asset_file_id", String(assetId));
      if (blockIndex === 0) updateHotspotField("asset_file_id", String(assetId));
    }
  };

  const handlePageClick = (event) => {
    if (!pageRef.current || !activeVersionId) return;
    const rect = pageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setHasDraftHotspotPreview(true);
    setHotspotForm({
      ...defaultHotspotForm,
      page_number: selectedPage,
      x_percent: Number(x.toFixed(2)),
      y_percent: Number(y.toFixed(2)),
      content_json: { version: 2, blocks: [createDefaultBlock("text")] },
      interaction_json: defaultInteractionJson,
    });
  };

  const selectHotspot = (hotspot) => {
    setHasDraftHotspotPreview(false);
    const contentJson = normalizeContentForForm(hotspot);
    const firstBlock = contentJson.blocks[0] || createDefaultBlock(hotspot.type || "text");
    setHotspotForm({
      id: hotspot.id,
      reference_number: hotspot.reference_number ? String(hotspot.reference_number) : "",
      page_number: hotspot.page_number,
      x_percent: Number(hotspot.x_percent),
      y_percent: Number(hotspot.y_percent),
      radius_percent: Number(hotspot.radius_percent),
      shape: hotspot.shape || "circle",
      width_percent: Number(hotspot.width_percent || 5),
      height_percent: Number(hotspot.height_percent || 5),
      type: firstBlock.type || hotspot.type || "text",
      title: hotspot.title || "",
      text_content: hotspot.text_content || firstBlock.text_content || "",
      asset_file_id: hotspot.asset_file_id ? String(hotspot.asset_file_id) : firstBlock.asset_file_id || "",
      trigger_type: hotspot.trigger_type || "click",
      display_behavior: normalizeDisplayBehaviorForForm(hotspot),
      content_json: contentJson,
      interaction_json: normalizeInteractionForForm(hotspot),
    });
  };

  const saveHotspot = async () => {
    const version = activeVersionId ? { id: activeVersionId } : await saveVersion();
    if (!version?.id) return;

    const contentJson = buildContentJsonPayload(hotspotForm);
    const primaryPayloadBlock = contentJson.blocks[0] || { type: hotspotForm.type };
    const payload = {
      page_number: Number(hotspotForm.page_number),
      x_percent: parseNumber(hotspotForm.x_percent, 50),
      y_percent: parseNumber(hotspotForm.y_percent, 50),
      radius_percent: parseNumber(hotspotForm.radius_percent, 1.8),
      reference_number: hotspotForm.reference_number === ""
        ? null
        : Number(hotspotForm.reference_number),
      shape: hotspotForm.shape || "circle",
      width_percent: parseNumber(hotspotForm.width_percent, 5),
      height_percent: parseNumber(hotspotForm.height_percent, 5),
      type: primaryPayloadBlock.type || hotspotForm.type,
      title: hotspotForm.title.trim() || undefined,
      text_content: primaryPayloadBlock.text_content || undefined,
      asset_file_id: primaryPayloadBlock.asset_file_id || undefined,
      trigger_type: hotspotForm.trigger_type,
      display_behavior: {
        ...defaultDisplayBehavior,
        ...(hotspotForm.display_behavior || {}),
        opacity_percent: Math.min(100, Math.max(0, parseNumber(hotspotForm.display_behavior?.opacity_percent, 100))),
      },
      content_json: contentJson,
      interaction_json: hotspotForm.interaction_json || defaultInteractionJson,
    };

    if (hotspotForm.id) {
      await editor.updateHotspot(hotspotForm.id, payload);
    } else {
      await editor.createHotspot(version.id, payload);
    }
    await loadHotspots(version.id);
    setHasDraftHotspotPreview(false);
    setHotspotForm({
      ...defaultHotspotForm,
      page_number: selectedPage,
      content_json: { version: 2, blocks: [createDefaultBlock("text")] },
      interaction_json: defaultInteractionJson,
    });
  };

  const deleteCurrentHotspot = async () => {
    if (!hotspotForm.id || !activeVersionId) return;
    await editor.deleteHotspot(hotspotForm.id);
    await loadHotspots(activeVersionId);
    setHasDraftHotspotPreview(false);
    setHotspotForm({
      ...defaultHotspotForm,
      page_number: selectedPage,
      content_json: { version: 2, blocks: [createDefaultBlock("text")] },
      interaction_json: defaultInteractionJson,
    });
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

  const startHotspotDrag = (event, hotspot) => {
    if (!pageRef.current || !activeVersionId) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    selectHotspot(hotspot);
    dragRef.current = {
      mode: "move",
      hotspotId: hotspot.id,
      x_percent: hotspot.x_percent,
      y_percent: hotspot.y_percent,
    };
  };

  const startHotspotResize = (event, hotspot, handle) => {
    if (!pageRef.current || !activeVersionId) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    selectHotspot(hotspot);

    const centerX = parseNumber(hotspot.x_percent, 50);
    const centerY = parseNumber(hotspot.y_percent, 50);
    const width = clampHotspotSize(hotspot.width_percent || hotspot.radius_percent || 5);
    const height = clampHotspotSize(hotspot.height_percent || hotspot.radius_percent || 5);
    const isLeft = handle.includes("w");
    const isTop = handle.includes("n");
    const fixedX = centerX + (isLeft ? width / 2 : -width / 2);
    const fixedY = centerY + (isTop ? height / 2 : -height / 2);

    dragRef.current = {
      mode: "resize",
      hotspotId: hotspot.id,
      handle,
      shape: hotspot.shape || "circle",
      fixedX,
      fixedY,
      width_percent: width,
      height_percent: height,
      x_percent: centerX,
      y_percent: centerY,
    };
  };

  const handleHotspotDragMove = (event) => {
    if (!dragRef.current || !pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));

    if (dragRef.current.mode === "resize") {
      const isFixedLeft = dragRef.current.handle.includes("e");
      const isFixedTop = dragRef.current.handle.includes("s");
      let width = clampHotspotSize(Math.abs(x - dragRef.current.fixedX));
      let height = clampHotspotSize(Math.abs(y - dragRef.current.fixedY));

      if (!["rectangle", "oval"].includes(dragRef.current.shape)) {
        const size = Math.max(width, height);
        width = size;
        height = size;
      }

      const nextX = Math.min(100, Math.max(0, dragRef.current.fixedX + (isFixedLeft ? width / 2 : -width / 2)));
      const nextY = Math.min(100, Math.max(0, dragRef.current.fixedY + (isFixedTop ? height / 2 : -height / 2)));
      const nextState = {
        ...dragRef.current,
        x_percent: Number(nextX.toFixed(2)),
        y_percent: Number(nextY.toFixed(2)),
        width_percent: Number(width.toFixed(2)),
        height_percent: Number(height.toFixed(2)),
      };
      dragRef.current = nextState;
      setHotspots((current) =>
        current.map((hotspot) =>
          hotspot.id === nextState.hotspotId
            ? {
                ...hotspot,
                x_percent: nextState.x_percent,
                y_percent: nextState.y_percent,
                width_percent: nextState.width_percent,
                height_percent: nextState.height_percent,
              }
            : hotspot,
        ),
      );
      setHotspotForm((current) =>
        current.id === nextState.hotspotId
          ? {
              ...current,
              x_percent: nextState.x_percent,
              y_percent: nextState.y_percent,
              width_percent: nextState.width_percent,
              height_percent: nextState.height_percent,
            }
          : current,
      );
      return;
    }

    const nextX = Number(x.toFixed(2));
    const nextY = Number(y.toFixed(2));
    dragRef.current = { ...dragRef.current, x_percent: nextX, y_percent: nextY };
    setHotspots((current) =>
      current.map((hotspot) =>
        hotspot.id === dragRef.current.hotspotId
          ? { ...hotspot, x_percent: nextX, y_percent: nextY }
          : hotspot,
      ),
    );
    setHotspotForm((current) =>
      current.id === dragRef.current.hotspotId
        ? { ...current, x_percent: nextX, y_percent: nextY }
        : current,
    );
  };

  const stopHotspotDrag = async () => {
    const dragState = dragRef.current;
    if (!dragState) return;
    dragRef.current = null;
    if (dragState.hotspotId) {
      const payload = {
        x_percent: parseNumber(dragState.x_percent, 50),
        y_percent: parseNumber(dragState.y_percent, 50),
      };
      if (dragState.mode === "resize") {
        payload.width_percent = parseNumber(dragState.width_percent, 5);
        payload.height_percent = parseNumber(dragState.height_percent, 5);
      }
      await editor.updateHotspot(dragState.hotspotId, payload);
    }
  };

  const ContentBlockFields = ({ block, index }) => {
    const isPrimary = index === 0;
    const blockAssetLabel = block.asset_file_id
      ? t("admin.editor.hotspots.mediaUploaded", { id: block.asset_file_id })
      : t("admin.editor.hotspots.mediaEmpty");
    return (
      <div className="space-y-3 rounded-md border bg-muted/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            {t("admin.editor.hotspots.blockNumber", { number: index + 1 })}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeContentBlock(index)}
            aria-label={t("admin.editor.hotspots.removeBlock", { number: index + 1 })}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Select
          value={block.type}
          onValueChange={(value) => (isPrimary ? changePrimaryBlockType(value) : updateContentBlock(index, "type", value))}
        >
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {contentBlockTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`admin.editor.hotspots.types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {block.type === "text" && (
          <>
            <div className="space-y-2">
              <Label>{t("admin.editor.hotspots.fontFamily")}</Label>
              <Select value={block.font_family || textFontOptions[0]} onValueChange={(value) => updateContentBlock(index, "font_family", value)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {textFontOptions.map((font) => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={block.text_content || ""}
              onChange={(event) => {
                updateContentBlock(index, "text_content", event.target.value);
                if (isPrimary) updateHotspotField("text_content", event.target.value);
              }}
              className="min-h-28"
              placeholder={t("admin.editor.hotspots.textPlaceholder")}
            />
          </>
        )}

        {["image", "audio", "file"].includes(block.type) && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-h-9 flex-1 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                {blockAssetLabel}
              </div>
              <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                <Upload className="h-4 w-4" />
                {block.asset_file_id ? t("common.replace") : t("common.upload")}
                <input
                  type="file"
                  accept={block.type === "image" ? "image/*" : block.type === "audio" ? "audio/*" : undefined}
                  className="hidden"
                  onChange={(event) => handleHotspotMediaUpload(event.target.files?.[0], index)}
                />
              </label>
            </div>
            {block.type === "audio" && isPrimary && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(hotspotForm.interaction_json?.audio?.autoplay)}
                  onChange={(event) => updateInteractionField("audio", "autoplay", event.target.checked)}
                />
                {t("admin.editor.hotspots.audioAutoplay")}
              </label>
            )}
            {block.type === "image" && isPrimary && (
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(hotspotForm.interaction_json?.image?.autoExpand)}
                    onChange={(event) => updateInteractionField("image", "autoExpand", event.target.checked)}
                  />
                  {t("admin.editor.hotspots.imageAutoExpand")}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hotspotForm.interaction_json?.image?.expandOnClick !== false}
                    onChange={(event) => updateInteractionField("image", "expandOnClick", event.target.checked)}
                  />
                  {t("admin.editor.hotspots.imageExpandOnClick")}
                </label>
              </div>
            )}
          </div>
        )}

        {block.type === "video" && (
          <div className="space-y-3">
            <Select value={block.source || "uploaded"} onValueChange={(value) => updateContentBlock(index, "source", value)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="uploaded">{t("admin.editor.hotspots.videoUploaded")}</SelectItem>
                <SelectItem value="youtube">{t("admin.editor.hotspots.videoYoutube")}</SelectItem>
              </SelectContent>
            </Select>
            {(block.source || "uploaded") === "youtube" ? (
              <Input
                value={block.youtube_url || ""}
                onChange={(event) => updateContentBlock(index, "youtube_url", event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <div className="min-h-9 flex-1 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">{blockAssetLabel}</div>
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  {block.asset_file_id ? t("common.replace") : t("common.upload")}
                  <input type="file" accept="video/*" className="hidden" onChange={(event) => handleHotspotMediaUpload(event.target.files?.[0], index)} />
                </label>
              </div>
            )}
          </div>
        )}

        {block.type === "link" && (
          <Input
            value={block.url || ""}
            onChange={(event) => updateContentBlock(index, "url", event.target.value)}
            placeholder="https://example.com"
          />
        )}

        {block.type === "question_answer" && (
          <div className="space-y-2">
            <Textarea
              value={block.text_content || ""}
              onChange={(event) => updateContentBlock(index, "text_content", event.target.value)}
              placeholder={t("admin.editor.hotspots.questionPlaceholder")}
            />
            {(block.answers || []).map((answer, answerIndex) => (
              <div key={answerIndex} className="grid grid-cols-[1fr_auto] gap-2">
                <Input
                  value={answer.text || ""}
                  onChange={(event) => updateAnswer(index, answerIndex, "text", event.target.value)}
                  placeholder={t("admin.editor.hotspots.answerPlaceholder", { number: answerIndex + 1 })}
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="radio"
                    name={`qa-correct-${hotspotForm.id || "new"}-${index}`}
                    checked={Boolean(answer.isCorrect)}
                    onChange={() => updateAnswer(index, answerIndex, "isCorrect", true)}
                  />
                  {t("admin.editor.hotspots.correctAnswer")}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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
            onClick={() => navigate(isTeacherTemplateMode ? "/admin/e-booklet-purchases" : "/admin/e-booklets")}
          >
            {t("common.close")}
          </Button>
        </div>
      </div>

      {isTeacherTemplateMode && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("admin.editor.teacherTemplateNotice", {
            defaultValue:
              "Teacher-specific editing mode: changes apply only to this purchase's eBooklet version, not the global template.",
          })}
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-4">
        {editorSteps.map((step, index) => (
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">Payment methods</h3>
                <p className="text-sm text-muted-foreground">Select the payment methods available on e-booklet checkout.</p>
              </div>
              <div className="space-y-2">
                {activePaymentMethods.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active payment methods found.</p>
                ) : activePaymentMethods.map((method) => {
                  const checked = (templateForm.payment_method_ids || []).map(Number).includes(Number(method.id));
                  return (
                    <label key={method.id} className="flex items-center gap-3 rounded-md border p-3 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => toggleTemplatePaymentMethod(method.id, value === true)}
                      />
                      <span className="font-medium">{method.name}</span>
                      {method.phone_number && <span className="text-muted-foreground">{method.phone_number}</span>}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">Required checkout fields</h3>
                <p className="text-sm text-muted-foreground">Attach global required fields to this e-booklet product.</p>
              </div>
              <div className="space-y-2">
                {fieldDefinitions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active required fields found.</p>
                ) : fieldDefinitions.map((field) => {
                  const attached = (templateForm.required_fields || []).find((item) => Number(item.field_definition_id) === Number(field.id));
                  return (
                    <div key={field.id} className="rounded-md border p-3 text-sm">
                      <label className="flex items-center gap-3">
                        <Checkbox
                          checked={Boolean(attached)}
                          onCheckedChange={(value) => toggleTemplateRequiredField(field.id, value === true)}
                        />
                        <span className="font-medium">{field.label}</span>
                        <span className="text-xs uppercase text-muted-foreground">{field.field_type}</span>
                      </label>
                      {attached && (
                        <label className="mt-2 flex items-center gap-2 ps-7 text-xs text-muted-foreground">
                          <Checkbox
                            checked={attached.is_required !== false}
                            onCheckedChange={(value) => updateTemplateRequiredFieldFlag(field.id, value === true)}
                          />
                          Require a value during checkout
                        </label>
                      )}
                    </div>
                  );
                })}
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
              {!isTeacherTemplateMode && (
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
              )}
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
        <section className={`grid gap-5 ${canvasExpanded ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "lg:grid-cols-[minmax(0,1fr)_360px_320px]"}`}>
          <div className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{t("admin.editor.hotspots.title")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("admin.editor.hotspots.description")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCanvasExpanded((current) => !current)}
                  aria-label={canvasExpanded ? t("admin.editor.hotspots.minimizeCanvas") : t("admin.editor.hotspots.expandCanvas")}
                >
                  {canvasExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  {canvasExpanded ? t("admin.editor.hotspots.minimizeCanvas") : t("admin.editor.hotspots.expandCanvas")}
                </Button>
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
            </div>

            <div className="mx-auto w-full max-w-[720px]">
              <div
                ref={pageRef}
                onClick={handlePageClick}
                onPointerMove={handleHotspotDragMove}
                onPointerUp={stopHotspotDrag}
                onPointerLeave={stopHotspotDrag}
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
                  const shape = hotspot.shape || "circle";
                  const width = clampHotspotSize(hotspot.width_percent || hotspot.radius_percent || 5);
                  const height = clampHotspotSize(hotspot.height_percent || hotspot.radius_percent || 5);
                  const renderedWidth = shape === "circle" || shape === "square" ? Math.max(width, height) : width;
                  const renderedHeight = shape === "circle" || shape === "square" ? Math.max(width, height) : height;
                  const opacity = Math.min(1, Math.max(0, parseNumber(hotspot.display_behavior?.opacity_percent, 100) / 100));
                  const isSelected = hotspotForm.id === hotspot.id;
                  return (
                    <button
                      type="button"
                      key={hotspot.id}
                      onPointerDown={(event) => startHotspotDrag(event, hotspot)}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectHotspot(hotspot);
                      }}
                      className="absolute flex cursor-grab items-center justify-center border-2 border-white bg-primary text-primary-foreground shadow-md active:cursor-grabbing"
                      style={{
                        left: `${hotspot.x_percent}%`,
                        top: `${hotspot.y_percent}%`,
                        width: `${renderedWidth}%`,
                        height: `${renderedHeight}%`,
                        minWidth: 16,
                        minHeight: 16,
                        opacity,
                        transform: "translate(-50%, -50%)",
                        ...getHotspotShapeStyle(shape),
                      }}
                      title={
                        hotspot.title ||
                        t(`admin.editor.hotspots.types.${hotspot.type}`, {
                          defaultValue: hotspot.type,
                        })
                      }
                      aria-label={t("admin.editor.hotspots.hotspotButton", {
                        reference: hotspot.reference_number || hotspot.id,
                        type: t(`admin.editor.hotspots.types.${hotspot.type}`, { defaultValue: hotspot.type }),
                      })}
                    >
                      <span className="absolute -right-2 -top-2 rounded-full bg-background px-1 text-[10px] font-bold text-foreground shadow">
                        {hotspot.reference_number || hotspot.id}
                      </span>
                      <Icon className="h-3.5 w-3.5" />
                      {isSelected && resizeHandles.map((handle) => {
                        const positionClass = {
                          nw: "-left-1.5 -top-1.5 cursor-nwse-resize",
                          ne: "-right-1.5 -top-1.5 cursor-nesw-resize",
                          sw: "-bottom-1.5 -left-1.5 cursor-nesw-resize",
                          se: "-bottom-1.5 -right-1.5 cursor-nwse-resize",
                        }[handle];
                        return (
                          <span
                            key={handle}
                            role="presentation"
                            className={`absolute h-3 w-3 rounded-sm border border-primary bg-background shadow ${positionClass}`}
                            onPointerDown={(event) => startHotspotResize(event, hotspot, handle)}
                          />
                        );
                      })}
                    </button>
                  );
                })}
                {hasDraftHotspotPreview && !hotspotForm.id && Number(hotspotForm.page_number) === Number(selectedPage) && (() => {
                  const DraftIcon = hotspotIcons[hotspotForm.type] || CircleDot;
                  const shape = hotspotForm.shape || "circle";
                  const width = clampHotspotSize(hotspotForm.width_percent || hotspotForm.radius_percent || 5);
                  const height = clampHotspotSize(hotspotForm.height_percent || hotspotForm.radius_percent || 5);
                  const renderedWidth = shape === "circle" || shape === "square" ? Math.max(width, height) : width;
                  const renderedHeight = shape === "circle" || shape === "square" ? Math.max(width, height) : height;
                  const opacity = Math.min(1, Math.max(0, parseNumber(hotspotForm.display_behavior?.opacity_percent, 100) / 100));
                  return (
                    <div
                      className="pointer-events-none absolute flex animate-pulse items-center justify-center border-2 border-dashed border-primary bg-primary/35 text-primary-foreground shadow-lg ring-4 ring-primary/20"
                      data-testid="admin-e-booklet-draft-hotspot-preview"
                      style={{
                        left: `${hotspotForm.x_percent}%`,
                        top: `${hotspotForm.y_percent}%`,
                        width: `${renderedWidth}%`,
                        height: `${renderedHeight}%`,
                        minWidth: 16,
                        minHeight: 16,
                        opacity,
                        transform: "translate(-50%, -50%)",
                        ...getHotspotShapeStyle(shape),
                      }}
                      title={t("admin.editor.hotspots.draftPreview")}
                      aria-label={t("admin.editor.hotspots.draftPreview")}
                    >
                      <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shadow">
                        {t("admin.editor.hotspots.draftPreviewShort")}
                      </span>
                      <DraftIcon className="h-3.5 w-3.5" />
                    </div>
                  );
                })()}
                {!activeVersionId && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/85 text-center text-sm text-muted-foreground">
                    {t("admin.editor.hotspots.saveBeforePlacing")}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4 rounded-lg border bg-background p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{t("admin.editor.hotspots.contentTitle")}</h3>
                <p className="text-xs text-muted-foreground">
                  {t("admin.editor.hotspots.pageSummary", { page: selectedPage, count: pageHotspots.length })}
                </p>
                <p className="mt-1 text-xs font-medium text-primary">
                  {t("admin.editor.hotspots.referenceNumber", {
                    value: hotspotForm.reference_number || t("admin.editor.hotspots.referenceAuto"),
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CurrentIcon className="h-5 w-5 text-primary" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setControlsMinimized((current) => !current)}
                  aria-label={controlsMinimized ? t("admin.editor.hotspots.restoreControls") : t("admin.editor.hotspots.minimizeControls")}
                >
                  {controlsMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {!controlsMinimized && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t("admin.editor.hotspots.xPercent")}</Label>
                    <Input type="number" min="0" max="100" value={hotspotForm.x_percent} onChange={(event) => updateHotspotField("x_percent", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.editor.hotspots.yPercent")}</Label>
                    <Input type="number" min="0" max="100" value={hotspotForm.y_percent} onChange={(event) => updateHotspotField("y_percent", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.editor.hotspots.widthPercent")}</Label>
                    <Input type="number" min="0.1" max="100" step="0.1" value={hotspotForm.width_percent} onChange={(event) => updateHotspotField("width_percent", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.editor.hotspots.heightPercent")}</Label>
                    <Input type="number" min="0.1" max="100" step="0.1" value={hotspotForm.height_percent} onChange={(event) => updateHotspotField("height_percent", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.editor.hotspots.radiusPercent")}</Label>
                    <Input type="number" min="0.1" max="20" step="0.1" value={hotspotForm.radius_percent} onChange={(event) => updateHotspotField("radius_percent", event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.editor.hotspots.referenceInput")}</Label>
                    <Input type="number" min="1" value={hotspotForm.reference_number} onChange={(event) => updateHotspotField("reference_number", event.target.value)} placeholder={t("admin.editor.hotspots.referenceAuto")} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label>{t("admin.editor.hotspots.opacityPercent")}</Label>
                      <span className="text-xs text-muted-foreground">{parseNumber(hotspotForm.display_behavior?.opacity_percent, 100)}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={hotspotForm.display_behavior?.opacity_percent ?? 100}
                      onChange={(event) => updateHotspotDisplayField("opacity_percent", Number(event.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.editor.hotspots.shape")}</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {hotspotShapes.map((shape) => {
                      const ShapeIcon = shapeIcons[shape] || CircleDot;
                      return (
                        <Button
                          key={shape}
                          type="button"
                          variant={hotspotForm.shape === shape ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateHotspotField("shape", shape)}
                          title={t(`admin.editor.hotspots.shapes.${shape}`)}
                          aria-label={t(`admin.editor.hotspots.shapes.${shape}`)}
                        >
                          <ShapeIcon className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.editor.hotspots.trigger")}</Label>
                  <Select value={hotspotForm.trigger_type} onValueChange={(value) => updateHotspotField("trigger_type", value)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="click">{t("admin.editor.hotspots.triggerClick")}</SelectItem>
                      <SelectItem value="hover">{t("admin.editor.hotspots.triggerHover")}</SelectItem>
                      <SelectItem value="both">{t("admin.editor.hotspots.triggerBoth")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("admin.editor.hotspots.titleLabel")}</Label>
                  <Input value={hotspotForm.title} onChange={(event) => updateHotspotField("title", event.target.value)} placeholder={t("admin.editor.hotspots.titlePlaceholder")} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="flex items-center gap-2"><Type className="h-4 w-4" />{t("admin.editor.hotspots.contentBlocks")}</Label>
                    <Select onValueChange={addContentBlock} value="">
                      <SelectTrigger className="h-9 w-36"><SelectValue placeholder={t("admin.editor.hotspots.addBlock")} /></SelectTrigger>
                      <SelectContent>
                        {contentBlockTypes.map((type) => <SelectItem key={type} value={type}>{t(`admin.editor.hotspots.types.${type}`)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {(hotspotForm.content_json?.blocks || [primaryBlock]).map((block, index) => (
                    <ContentBlockFields key={block.id || index} block={block} index={index} />
                  ))}
                </div>

                {primaryBlock.type === "audio" && (
                  <Button type="button" variant="outline" onClick={recording ? stopAudioRecording : startAudioRecording} className="w-full">
                    {recording ? <Save className="h-4 w-4" /> : <MousePointerClick className="h-4 w-4" />}
                    {recording ? t("admin.editor.hotspots.stopRecording") : t("admin.editor.hotspots.recordAudio")}
                  </Button>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={saveHotspot} disabled={editor.loading || !activeVersionId}>
                <Save className="h-4 w-4" />
                {t("common.save")}
              </Button>
              <Button variant="outline" onClick={deleteCurrentHotspot} disabled={!hotspotForm.id || editor.loading}>
                <Trash2 className="h-4 w-4" />
                {t("common.delete")}
              </Button>
            </div>
          </aside>

          {!canvasExpanded && (
            <aside className="space-y-3 rounded-lg border bg-background p-4">
              <div>
                <h3 className="font-semibold">{t("admin.editor.hotspots.allHotspots")}</h3>
                <p className="text-xs text-muted-foreground">{t("admin.editor.hotspots.sortedByCreated")}</p>
              </div>
              <div className="max-h-[680px] overflow-y-auto rounded-md border">
                {sortedHotspots.map((hotspot) => (
                  <button key={hotspot.id} type="button" onClick={() => { setSelectedPage(Number(hotspot.page_number)); selectHotspot(hotspot); }} className="flex w-full items-start justify-between gap-3 border-b px-3 py-3 text-start text-sm last:border-b-0 hover:bg-muted/50">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">#{hotspot.reference_number || hotspot.id} {hotspot.title || t("common.untitled")}</span>
                      <span className="block text-xs text-muted-foreground">{t("common.page")} {hotspot.page_number} · {t(`admin.editor.hotspots.types.${hotspot.type}`, { defaultValue: hotspot.type })}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{Number(hotspot.x_percent).toFixed(1)}, {Number(hotspot.y_percent).toFixed(1)}</span>
                  </button>
                ))}
                {sortedHotspots.length === 0 && <div className="px-3 py-5 text-center text-sm text-muted-foreground">{t("admin.editor.hotspots.emptyPage")}</div>}
              </div>
            </aside>
          )}
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
            {!isTeacherTemplateMode && (
              <Button onClick={publishCurrentVersion} disabled={editor.loading || !selectedVersion?.id}>
                <ShieldCheck className="h-4 w-4" />
                {t("common.publishVersion")}
              </Button>
            )}
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
            onClick={activeStep === "file" || isTeacherTemplateMode ? saveVersion : saveBasicInfo}
            disabled={editor.loading}
          >
            <Save className="h-4 w-4" />
            {t("common.saveDraft")}
          </Button>
          {activeStep === "review" ? (
            isTeacherTemplateMode ? (
              <Button onClick={() => navigate("/admin/e-booklet-purchases")} disabled={editor.loading}>
                {t("common.done", { defaultValue: "Done" })}
              </Button>
            ) : (
              <Button onClick={publishCurrentVersion} disabled={editor.loading || !selectedVersion?.id}>
                <ShieldCheck className="h-4 w-4" />
                {t("common.publish")}
              </Button>
            )
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
