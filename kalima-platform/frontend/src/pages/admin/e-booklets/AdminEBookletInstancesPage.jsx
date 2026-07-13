import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, BookOpenCheck, ChevronRight, Copy, Download, Eye, FileText, HardDrive, HelpCircle, KeyRound, Loader2, Maximize2, Minimize2, Plus, Printer, RefreshCcw, Save, ShieldOff, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminEBookletInstances, useAdminEBookletTermsMilestones } from "@/hooks/admin/useAdminEBooklets";
import useExport from "@/hooks/useExport";
import { useTranslation } from "react-i18next";
import AdminEBookletStudentDevicePanel from "./AdminEBookletStudentDevicePanel";
import PrintTemplateLayoutEditor, { DEFAULT_PRINT_TEMPLATE_LAYOUT } from "./PrintTemplateLayoutEditor";

const numberValue = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const optionalNumberValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isGeneratedEBookletTitle = (value) => /^Teacher e-booklet #\d+$/i.test(String(value || "").trim());

const getEBookletTitle = (instance, fallback) => {
  const templateTitle = instance.template?.title?.trim?.();
  if (templateTitle) return templateTitle;
  const displayTitle = instance.display_title?.trim?.();
  if (displayTitle && !isGeneratedEBookletTitle(displayTitle)) return displayTitle;
  return fallback;
};

const pageMotion = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.2, 0, 0, 1] } },
};

const listMotion = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025 } },
};

const rowMotion = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: [0.2, 0, 0, 1] } },
};

const panelMotion = {
  hidden: { height: 0, opacity: 0 },
  show: { height: "auto", opacity: 1, transition: { duration: 0.22, ease: [0.2, 0, 0, 1] } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } },
};

function AccessCodeFieldLabel({ children, tooltip }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{children}</span>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="button"
              tabIndex={0}
              aria-label={tooltip}
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="max-w-[240px] text-center leading-5">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}

function PrintFormField({ label, tooltip, children, className = "" }) {
  return (
    <label className={`grid min-w-0 content-start gap-1 text-xs font-medium text-muted-foreground ${className}`}>
      {tooltip ? <AccessCodeFieldLabel tooltip={tooltip}>{label}</AccessCodeFieldLabel> : <span>{label}</span>}
      {children}
    </label>
  );
}

export default function AdminEBookletInstancesPage({ teacherId = null }) {
  const { t, i18n } = useTranslation("eBooklets");
  const {
    instances,
    pagination,
    status,
    loading,
    fetchInstances,
    setStatus,
    setPage,
    updateQuota,
    revokeTeacherAccess,
    listAccessCodes,
    generateAccessCodes,
    listAccessCodePrintTemplates,
    createAccessCodePrintTemplate,
    updateAccessCodePrintTemplate,
    archiveAccessCodePrintTemplate,
    activateAccessCodePrintTemplate,
    deleteAccessCodePrintTemplate,
    listAccessCodePrintPresets,
    createAccessCodePrintPreset,
    listAccessCodePrintBatches,
    generateAccessCodePrintBatch,
    uploadAccessCodePrintImage,
    fetchAccessCodePrintImageBlobUrl,
    previewAccessCodePrintCard,
    downloadAccessCodePrintBatchPdf,
  } = useAdminEBookletInstances();
  const { terms, fetchTerms } = useAdminEBookletTermsMilestones();
  const { exportData, loading: exportLoading, exportProgress } = useExport();
  const [quotaDrafts, setQuotaDrafts] = useState({});
  const [expandedInstanceKey, setExpandedInstanceKey] = useState(null);
  const [expandedDeviceKey, setExpandedDeviceKey] = useState(null);
  const [expandedAccessKey, setExpandedAccessKey] = useState(null);
  const [accessCodeDrafts, setAccessCodeDrafts] = useState({});
  const [printDrafts, setPrintDrafts] = useState({});
  const [printTemplates, setPrintTemplates] = useState([]);
  const [printPresets, setPrintPresets] = useState([]);
  const [presetDraft, setPresetDraft] = useState({ presetType: "registration_method", label: "", displayText: "" });
  const [templateDraft, setTemplateDraft] = useState({ name: "", backgroundFileAssetId: "", layout: DEFAULT_PRINT_TEMPLATE_LAYOUT });
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [printUploadState, setPrintUploadState] = useState({});
  const [printUploadedAssets, setPrintUploadedAssets] = useState({});
  const [printBatches, setPrintBatches] = useState({});
  const [printBatchHistory, setPrintBatchHistory] = useState({});
  const [printWarnings, setPrintWarnings] = useState({});
  const [printPreviewUrls, setPrintPreviewUrls] = useState({});
  const [printPreviewLoading, setPrintPreviewLoading] = useState({});
  const [printPreviewErrors, setPrintPreviewErrors] = useState({});
  const [templateBackgroundPreviewUrl, setTemplateBackgroundPreviewUrl] = useState("");
  const [printTemplateCreationCollapsed, setPrintTemplateCreationCollapsed] = useState(false);
  const [collapsedPrintSections, setCollapsedPrintSections] = useState({});
  const [generatedCodes, setGeneratedCodes] = useState({});
  const [existingCodes, setExistingCodes] = useState({});

  const selectedTeacherId = teacherId ? String(teacherId) : null;

  useEffect(() => {
    fetchInstances({ limit: 100, ...(selectedTeacherId ? { teacher_id: selectedTeacherId } : {}) }).catch(() => {});
  }, [fetchInstances, selectedTeacherId]);
  useEffect(() => { fetchTerms({ status: "active" }).catch(() => {}); }, [fetchTerms]);
  useEffect(() => {
    listAccessCodePrintTemplates()
      .then((response) => setPrintTemplates(Array.isArray(response?.data) ? response.data : []))
      .catch(() => {});
  }, [listAccessCodePrintTemplates]);
  useEffect(() => {
    listAccessCodePrintPresets({ active: true })
      .then((response) => setPrintPresets(Array.isArray(response?.data) ? response.data : []))
      .catch(() => {});
  }, [listAccessCodePrintPresets]);
  useEffect(() => {
    setQuotaDrafts(Object.fromEntries(instances.map((instance) => [instance.id, instance.invite_quota ?? 0])));
  }, [instances]);

  useEffect(() => {
    const activeTerm = terms.find((term) => term.status === "active") || terms[0];
    if (!activeTerm) return;
    setAccessCodeDrafts((current) => {
      const next = { ...current };
      instances.forEach((instance) => {
        if (!next[instance.id]) {
          next[instance.id] = { termId: String(activeTerm.id), kind: "paid", count: "1", maxRedemptions: "1", expiresAt: "" };
        }
      });
      return next;
    });
    setPrintDrafts((current) => {
      const next = { ...current };
      instances.forEach((instance) => {
        if (!next[instance.id]) {
          next[instance.id] = {
            templateId: "",
            batchName: "",
            teacherImageFileAssetId: "",
            gradeClassText: instance.template?.grade_level || instance.grade_level || "",
            registrationMethodText: t("admin.instances.defaultRegistrationMethod", { defaultValue: "كود أو منصة" }),
            priceText: "",
            redCustomText: "",
            requiredFields: {},
          };
        }
      });
      return next;
    });
  }, [instances, terms, t]);

  useEffect(() => {
    const assetId = Number(templateDraft.backgroundFileAssetId);
    if (!assetId) {
      setTemplateBackgroundPreviewUrl("");
      return undefined;
    }
    let cancelled = false;
    let objectUrl = "";
    setTemplateBackgroundPreviewUrl("");
    fetchAccessCodePrintImageBlobUrl(assetId)
      .then((url) => {
        objectUrl = url;
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        setTemplateBackgroundPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setTemplateBackgroundPreviewUrl("");
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fetchAccessCodePrintImageBlobUrl, templateDraft.backgroundFileAssetId]);

  const grouped = useMemo(() => instances.reduce((acc, instance) => {
    const key = instance.teacher?.id || "unknown";
    if (!acc[key]) acc[key] = { teacher: instance.teacher, rows: [] };
    acc[key].rows.push(instance);
    return acc;
  }, {}), [instances]);

  const summary = useMemo(() => instances.reduce((acc, instance) => {
    acc.total += 1;
    acc.active += instance.status === "active" ? 1 : 0;
    acc.suspended += instance.status === "suspended" ? 1 : 0;
    acc.seats += numberValue(instance.used_invites_count, instance._count?.access_records || 0);
    acc.quota += numberValue(instance.invite_quota);
    const devices = optionalNumberValue(instance.used_devices_count ?? instance.active_devices_count ?? instance.devices_count);
    acc.devices += devices || 0;
    return acc;
  }, { total: 0, active: 0, suspended: 0, seats: 0, quota: 0, devices: 0 }), [instances]);

  const teacherGroups = useMemo(() => Object.entries(grouped), [grouped]);
  const selectedTeacherGroup = useMemo(
    () => teacherGroups.find(([teacherId]) => String(teacherId) === selectedTeacherId) || null,
    [selectedTeacherId, teacherGroups],
  );
  const initialLoading = loading && instances.length === 0;

  const formatDate = (value, withTime = false) => {
    if (!value) return t("admin.instances.noExpiry");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.instances.noExpiry");
    return new Intl.DateTimeFormat(i18n.language, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
  };

  const handleQuotaSave = async (instanceId) => {
    await updateQuota(instanceId, Number(quotaDrafts[instanceId] || 0));
    fetchInstances({ limit: 100 });
  };

  const handleRevoke = async (instanceId) => {
    if (!window.confirm(t("admin.instances.revokeConfirm"))) return;
    await revokeTeacherAccess(instanceId);
    fetchInstances({ limit: 100 });
  };

  const updateAccessCodeDraft = (instanceId, field, value) => {
    setAccessCodeDrafts((current) => ({
      ...current,
      [instanceId]: { ...(current[instanceId] || {}), [field]: value },
    }));
  };

  const updatePrintDraft = (instanceId, field, value) => {
    setPrintDrafts((current) => ({
      ...current,
      [instanceId]: { ...(current[instanceId] || {}), [field]: value },
    }));
  };

  const updatePrintRequiredField = (instanceId, field, checked) => {
    setPrintDrafts((current) => ({
      ...current,
      [instanceId]: {
        ...(current[instanceId] || {}),
        requiredFields: {
          ...((current[instanceId] || {}).requiredFields || {}),
          [field]: checked,
        },
      },
    }));
  };

  const togglePrintSection = (instanceId) => {
    setCollapsedPrintSections((current) => ({ ...current, [instanceId]: !current[instanceId] }));
  };

  const refreshPrintTemplates = async () => {
    const response = await listAccessCodePrintTemplates();
    const templates = Array.isArray(response?.data) ? response.data : [];
    setPrintTemplates(templates);
    return templates;
  };

  const templatePayload = () => ({
      name: templateDraft.name || t("admin.instances.defaultPrintTemplateName", { defaultValue: "E-booklet access-code card" }),
      backgroundFileAssetId: Number(templateDraft.backgroundFileAssetId),
      widthPx: 827,
      heightPx: 438,
      ppi: 300,
      layout: templateDraft.layout || DEFAULT_PRINT_TEMPLATE_LAYOUT,
      defaultRequiredFields: { qr: true, codeNumber: true },
    });

  const handleSavePrintTemplate = async () => {
    const response = editingTemplateId
      ? await updateAccessCodePrintTemplate(editingTemplateId, templatePayload())
      : await createAccessCodePrintTemplate(templatePayload());
    const created = response?.data;
    const templates = await refreshPrintTemplates();
    if (created?.id) {
      setPrintDrafts((current) => {
        const next = { ...current };
        instances.forEach((instance) => {
          next[instance.id] = { ...(next[instance.id] || {}), templateId: String(created.id) };
        });
        return next;
      });
      if (!templates.some((template) => Number(template.id) === Number(created.id))) {
        setPrintTemplates((current) => [created, ...current]);
      }
    }
    setEditingTemplateId(null);
    setTemplateDraft({ name: "", backgroundFileAssetId: "", layout: templateDraft.layout || DEFAULT_PRINT_TEMPLATE_LAYOUT });
  };

  const handleEditPrintTemplate = (template) => {
    setEditingTemplateId(template.id);
    setTemplateDraft({
      name: template.name || "",
      backgroundFileAssetId: String(template.background_file_asset_id || template.backgroundFileAssetId || ""),
      layout: template.layout_json || template.layout || DEFAULT_PRINT_TEMPLATE_LAYOUT,
    });
  };

  const handleDeletePrintTemplate = async (templateId) => {
    if (!window.confirm(t("admin.instances.deletePrintTemplateConfirm", { defaultValue: "Delete this unused print template?" }))) return;
    await deleteAccessCodePrintTemplate(templateId);
    await refreshPrintTemplates();
  };

  const handleArchivePrintTemplate = async (template) => {
    if (template.status === "archived") await activateAccessCodePrintTemplate(template.id);
    else await archiveAccessCodePrintTemplate(template.id);
    await refreshPrintTemplates();
  };

  const refreshPrintPresets = async () => {
    const response = await listAccessCodePrintPresets({ active: true });
    const presets = Array.isArray(response?.data) ? response.data : [];
    setPrintPresets(presets);
    return presets;
  };

  const handleCreatePrintPreset = async () => {
    await createAccessCodePrintPreset({
      presetType: presetDraft.presetType,
      label: presetDraft.label || presetDraft.displayText,
      displayText: presetDraft.displayText,
    });
    await refreshPrintPresets();
    setPresetDraft((current) => ({ ...current, label: "", displayText: "" }));
  };

  const presetsByType = (type) => printPresets.filter((preset) => preset.preset_type === type || preset.presetType === type);

  const uploadPrintImage = async (file, target) => {
    if (!file) return null;
    const uploadedName = file.name || "";
    setPrintUploadState((current) => ({ ...current, [target]: "uploading" }));
    try {
      const response = await uploadAccessCodePrintImage(file, {
        owner_type: "e_booklet_access_code_print",
        file_type: "image",
      });
      const assetId = Number(response?.data?.id ?? response?.data?.data?.id ?? response?.id);
      if (!Number.isInteger(assetId) || assetId <= 0) {
        throw new Error("Upload completed without a saved file asset ID.");
      }
      setPrintUploadState((current) => ({ ...current, [target]: "done" }));
      setPrintUploadedAssets((current) => ({
        ...current,
        [target]: { assetId, name: uploadedName },
      }));
      return assetId;
    } catch (error) {
      setPrintUploadState((current) => ({ ...current, [target]: "error" }));
      setPrintUploadedAssets((current) => {
        const next = { ...current };
        delete next[target];
        return next;
      });
      throw error;
    }
  };

  const handleBackgroundUpload = async (event) => {
    const assetId = await uploadPrintImage(event.target.files?.[0], "background");
    if (assetId) {
      setTemplateDraft((current) => ({ ...current, backgroundFileAssetId: String(assetId) }));
    }
    event.target.value = "";
  };

  const handleTeacherImageUpload = async (instanceId, event) => {
    const assetId = await uploadPrintImage(event.target.files?.[0], `teacher-${instanceId}`);
    if (assetId) {
      updatePrintDraft(instanceId, "teacherImageFileAssetId", String(assetId));
    }
    event.target.value = "";
  };

  const loadAccessCodes = async (instance) => {
    const teacherId = instance.teacher?.id || instance.teacher_id;
    if (!teacherId) return;
    const response = await listAccessCodes({ bookletInstanceId: instance.id, teacherId });
    setExistingCodes((current) => ({ ...current, [instance.id]: Array.isArray(response?.data) ? response.data : [] }));
  };

  const loadPrintBatches = async (instance) => {
    const teacherId = instance.teacher?.id || instance.teacher_id;
    const response = await listAccessCodePrintBatches({ bookletInstanceId: instance.id, teacherId });
    setPrintBatchHistory((current) => ({ ...current, [instance.id]: Array.isArray(response?.data) ? response.data : [] }));
  };

  const toggleAccessPanel = async (instance) => {
    const nextKey = expandedAccessKey === instance.id ? null : instance.id;
    setExpandedInstanceKey(instance.id);
    setExpandedAccessKey(nextKey);
    if (nextKey) {
      await loadAccessCodes(instance);
      await loadPrintBatches(instance);
    }
  };

  const toggleInstance = (instanceId) => {
    const nextKey = expandedInstanceKey === instanceId ? null : instanceId;
    setExpandedInstanceKey(nextKey);
    if (!nextKey) {
      setExpandedAccessKey(null);
      setExpandedDeviceKey(null);
    }
  };

  const handleGenerateAccessCodes = async (instance) => {
    const draft = accessCodeDrafts[instance.id] || {};
    const payload = {
      bookletInstanceId: Number(instance.id),
      teacherId: Number(instance.teacher?.id || instance.teacher_id),
      termId: Number(draft.termId),
      kind: draft.kind || "paid",
      count: Number(draft.count || 1),
      maxRedemptions: Number(draft.maxRedemptions || 1),
      expiresAt: draft.expiresAt || null,
    };
    const response = await generateAccessCodes(payload);
    const codes = Array.isArray(response?.data?.codes) ? response.data.codes : [];
    setGeneratedCodes((current) => ({ ...current, [instance.id]: codes }));
    await loadAccessCodes(instance);
  };

  const handleGeneratePrintableBatch = async (instance) => {
    const accessDraft = accessCodeDrafts[instance.id] || {};
    const printDraft = printDrafts[instance.id] || {};
    const eBookletTitle = getEBookletTitle(instance, t("common.eBooklet"));
    const payload = {
      bookletInstanceId: Number(instance.id),
      teacherId: Number(instance.teacher?.id || instance.teacher_id),
      termId: Number(accessDraft.termId),
      templateId: Number(printDraft.templateId),
      kind: accessDraft.kind || "paid",
      count: Number(accessDraft.count || 1),
      maxRedemptions: 1,
      expiresAt: accessDraft.expiresAt || null,
      label: printDraft.batchName || `${eBookletTitle} - ${formatDate(new Date().toISOString(), true)}`,
      batchValues: {
        gradeClassText: printDraft.gradeClassText || eBookletTitle,
        registrationMethodText: printDraft.registrationMethodText || t("admin.instances.defaultRegistrationMethod", { defaultValue: "كود أو منصة" }),
        priceText: printDraft.priceText || null,
        redCustomText: printDraft.redCustomText || null,
      },
      requiredFields: printDraft.requiredFields || {},
      teacherImageFileAssetId: printDraft.teacherImageFileAssetId ? Number(printDraft.teacherImageFileAssetId) : null,
    };
    const response = await generateAccessCodePrintBatch(payload);
    const batch = response?.data?.batch || response?.data;
    const warning = response?.data?.warning;
    setPrintWarnings((current) => ({ ...current, [instance.id]: warning || null }));
    if (batch?.id) {
      setPrintBatches((current) => ({ ...current, [instance.id]: batch }));
      await downloadAccessCodePrintBatchPdf(batch.id, `e-booklet-access-codes-${batch.id}.pdf`);
    }
    await loadAccessCodes(instance);
    await loadPrintBatches(instance);
  };

  const handlePreviewPrintableCard = async (instance) => {
    const printDraft = printDrafts[instance.id] || {};
    const eBookletTitle = getEBookletTitle(instance, t("common.eBooklet"));
    setPrintPreviewLoading((current) => ({ ...current, [instance.id]: true }));
    setPrintPreviewErrors((current) => ({ ...current, [instance.id]: "" }));
    try {
      const url = await previewAccessCodePrintCard({
        templateId: Number(printDraft.templateId),
        code: "KLM PREV IEW 001",
        teacherImageFileAssetId: printDraft.teacherImageFileAssetId ? Number(printDraft.teacherImageFileAssetId) : null,
        batchValues: {
          gradeClassText: printDraft.gradeClassText || eBookletTitle,
          registrationMethodText: printDraft.registrationMethodText || t("admin.instances.defaultRegistrationMethod", { defaultValue: "كود أو منصة" }),
          priceText: printDraft.priceText || null,
          redCustomText: printDraft.redCustomText || null,
        },
      });
      setPrintPreviewUrls((current) => {
        if (current[instance.id]) URL.revokeObjectURL(current[instance.id]);
        return { ...current, [instance.id]: url };
      });
    } catch (error) {
      setPrintPreviewErrors((current) => ({
        ...current,
        [instance.id]: error?.response?.data?.message || error?.message || t("admin.instances.printPreviewFailed", { defaultValue: "Preview failed. Check the template and try again." }),
      }));
    } finally {
      setPrintPreviewLoading((current) => ({ ...current, [instance.id]: false }));
    }
  };

  const copyGeneratedCodes = async (instanceId) => {
    const codes = generatedCodes[instanceId] || [];
    const text = codes.map((item) => item.whatsappMessage || `${item.code} ${item.redeemUrl || ""}`.trim()).join("\n\n");
    if (!text) return;
    await navigator.clipboard?.writeText(text);
  };

  const handleExport = (lang = "ar") => {
    exportData({
      resource: "admin/e-booklet-instances",
      format: "xlsx",
      filters: status && status !== "all" ? { status } : {},
      lang,
      rtl: lang === "ar",
    });
  };


  return (
    <TooltipProvider delayDuration={150}>
    <motion.div className="space-y-4" data-testid="admin-e-booklet-instances-page" variants={pageMotion} initial="hidden" animate="show">
      <motion.section className="rounded-2xl border bg-background p-4 shadow-sm" layout>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <BookOpenCheck className="h-6 w-6 text-primary" />
              {t("admin.instances.title")}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t("admin.instances.description")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select className="h-10 rounded-xl border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">{t("statuses.all")}</option>
              <option value="active">{t("statuses.active")}</option>
              <option value="archived">{t("statuses.archived")}</option>
              <option value="suspended">{t("statuses.suspended")}</option>
            </select>
            <DropdownMenu dir={i18n.dir()}>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="rounded-xl" disabled={exportLoading} data-testid="admin-e-booklet-access-export-button">
                  <Download className="h-4 w-4" />
                  {t("admin.instances.exportExcel", { defaultValue: "Export Excel" })}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("ar")} disabled={exportLoading} data-testid="admin-e-booklet-access-export-ar">
                  {t("admin.instances.exportArabicRtl", { defaultValue: "Arabic RTL Excel" })}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("en")} disabled={exportLoading} data-testid="admin-e-booklet-access-export-en">
                  {t("admin.instances.exportEnglish", { defaultValue: "English Excel" })}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => fetchInstances({ limit: 100 })} disabled={loading}>
              <RefreshCcw className="h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </div>
        </div>
        {exportLoading && exportProgress > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm text-muted-foreground">
              <span>{t("export.exporting", { defaultValue: "Exporting..." })}</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} />
          </div>
        )}
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm"><span className="font-semibold">{summary.total}</span> {t("admin.instances.totalAccess", { defaultValue: "total access" })}</div>
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm"><span className="font-semibold text-emerald-600">{summary.active}</span> {t("statuses.active")}</div>
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm"><span className="font-semibold">{summary.seats}/{summary.quota || 0}</span> {t("admin.instances.seats", { defaultValue: "seats" })}</div>
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm"><span className="font-semibold">{summary.devices}</span> {t("teacher.invites.usedDevices")}</div>
        </div>
        <div className="mt-4 rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold"><Printer className="h-4 w-4 text-primary" />{t("admin.instances.printTemplates", { defaultValue: "Print templates" })}</div>
                {printTemplates.length > 0 && <Badge variant="secondary" className="rounded-full">{printTemplates.length} {t("admin.instances.savedPrintTemplates", { defaultValue: "saved" })}</Badge>}
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-muted-foreground">{t("admin.instances.printTemplatesDescription", { defaultValue: "Templates use a fixed 827 x 438 px card at 300 PPI. Create from a background file asset, then choose it per batch." })}</p>
            </div>
            <Button type="button" size="sm" variant="outline" className="shrink-0 rounded-xl" onClick={() => setPrintTemplateCreationCollapsed((current) => !current)} aria-expanded={!printTemplateCreationCollapsed}>
              {printTemplateCreationCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              {printTemplateCreationCollapsed
                ? t("admin.instances.showTemplateCreation", { defaultValue: "Show template creation" })
                : t("admin.instances.minimizeTemplateCreation", { defaultValue: "Minimize" })}
            </Button>
          </div>
          <AnimatePresence initial={false}>
          {!printTemplateCreationCollapsed && (
          <motion.div className="overflow-hidden" variants={panelMotion} initial="hidden" animate="show" exit="exit">
          <div className="mt-4 border-t pt-4">
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="min-w-0">
                <div className="mb-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-primary">{t("admin.instances.printTemplateSetupStep", { defaultValue: "Step 1" })}</div>
                  <div className="text-sm font-semibold text-foreground">{t("admin.instances.printTemplateSetupTitle", { defaultValue: "Create the card base" })}</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("admin.instances.printTemplateSetupDescription", { defaultValue: "Name the template, attach the finished background artwork, then save the reusable card base." })}</p>
                </div>
                <div className="grid w-full min-w-0 items-end gap-3 md:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(210px,1fr)_150px_auto]">
                  <PrintFormField label={t("admin.instances.printTemplateName", { defaultValue: "Template name" })}>
                    <Input className="h-10 rounded-xl text-foreground" value={templateDraft.name} placeholder={t("admin.instances.defaultPrintTemplateName", { defaultValue: "E-booklet access-code card" })} onChange={(event) => setTemplateDraft((current) => ({ ...current, name: event.target.value }))} />
                  </PrintFormField>
                  <PrintFormField label={t("admin.instances.backgroundImage", { defaultValue: "Background image" })} tooltip={t("admin.instances.backgroundImageTooltip", { defaultValue: "Upload the final 827 x 438 px card artwork before positioning QR, code, and text fields." })}>
                    <Input className="h-10 rounded-xl text-foreground" type="file" accept="image/*" onChange={handleBackgroundUpload} disabled={printUploadState.background === "uploading"} />
                  </PrintFormField>
                  <PrintFormField label={t("admin.instances.backgroundAssetId", { defaultValue: "Background asset ID" })}>
                    <Input className="h-10 rounded-xl text-foreground" type="number" min="1" value={templateDraft.backgroundFileAssetId} onChange={(event) => setTemplateDraft((current) => ({ ...current, backgroundFileAssetId: event.target.value }))} />
                  </PrintFormField>
                  <Button type="button" className="h-10 w-full rounded-xl xl:w-auto" onClick={handleSavePrintTemplate} disabled={!templateDraft.backgroundFileAssetId}>
                    <Plus className="h-4 w-4" />
                    {editingTemplateId ? t("common.save", { defaultValue: "Save" }) : t("common.create", { defaultValue: "Create" })}
                  </Button>
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                <div className="mb-2 font-semibold text-foreground">{t("admin.instances.printTemplateChecklist", { defaultValue: "Production checklist" })}</div>
                <ul className="space-y-2">
                  <li>{t("admin.instances.printTemplateTipSize", { defaultValue: "Tip: start from a 827 x 438 px image so the PDF output matches the card exactly." })}</li>
                  <li>{t("admin.instances.printTemplateTipLayers", { defaultValue: "Tip: keep variable content out of the background. QR, code number, teacher image, grade, price, and red text are positioned below." })}</li>
                  <li>{t("admin.instances.printTemplateTipSave", { defaultValue: "Tip: save the template, then use Preview card inside a batch to verify the backend-rendered result." })}</li>
                </ul>
              </div>
            </div>
          </div>
          {editingTemplateId && (
            <div className="mt-3 flex items-center justify-between rounded-xl border bg-background px-3 py-2 text-xs">
              <span>{t("admin.instances.editingPrintTemplate", { defaultValue: "Editing template" })} #{editingTemplateId}</span>
              <Button type="button" size="sm" variant="ghost" className="h-8 rounded-xl" onClick={() => { setEditingTemplateId(null); setTemplateDraft({ name: "", backgroundFileAssetId: "", layout: DEFAULT_PRINT_TEMPLATE_LAYOUT }); }}>{t("common.cancel", { defaultValue: "Cancel" })}</Button>
            </div>
          )}
          <div className="mt-5 border-t pt-4">
            <div className="mb-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">{t("admin.instances.printTemplateLayoutStep", { defaultValue: "Step 2" })}</div>
              <div className="text-sm font-semibold text-foreground">{t("admin.instances.printTemplateLayoutTitle", { defaultValue: "Position the variable layers" })}</div>
            </div>
            <PrintTemplateLayoutEditor
              value={templateDraft.layout}
              backgroundImageUrl={templateBackgroundPreviewUrl}
              onChange={(layout) => setTemplateDraft((current) => ({ ...current, layout }))}
            />
          </div>
          {printTemplates.length > 0 && (
            <div className="mt-5 border-t pt-4">
              <div className="mb-2 text-sm font-semibold text-foreground">{t("admin.instances.savedPrintTemplateList", { defaultValue: "Saved templates" })}</div>
              <div className="flex flex-wrap gap-2">
              {printTemplates.slice(0, 6).map((template) => (
                <Badge key={template.id} variant="outline" className="gap-2 rounded-xl px-3 py-1.5">
                  <button type="button" className="max-w-[220px] truncate font-medium hover:text-primary" onClick={() => handleEditPrintTemplate(template)}>#{template.id} {template.name}</button>
                  <span className={template.status === "archived" ? "text-amber-600" : "text-emerald-600"}>{template.status || "active"}</span>
                  <button type="button" className="text-muted-foreground hover:text-primary" onClick={() => handleArchivePrintTemplate(template)}>
                    {template.status === "archived" ? t("common.activate", { defaultValue: "Activate" }) : t("common.archive", { defaultValue: "Archive" })}
                  </button>
                  <button type="button" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeletePrintTemplate(template.id)} aria-label={t("admin.instances.deletePrintTemplate", { defaultValue: "Delete print template" })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
              </div>
            </div>
          )}
          <div className="mt-5 border-t pt-4">
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" />{t("admin.instances.printPresets", { defaultValue: "Print text presets" })}</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("admin.instances.printPresetsDescription", { defaultValue: "Reusable text snippets for batch grade and registration labels." })}</p>
            </div>
            <div className="grid items-end gap-3 md:grid-cols-[170px_minmax(140px,1fr)_minmax(180px,1fr)_auto]">
              <PrintFormField label={t("admin.instances.presetType", { defaultValue: "Preset type" })}>
                <select className="h-10 rounded-xl border bg-background px-3 text-sm text-foreground" value={presetDraft.presetType} onChange={(event) => setPresetDraft((current) => ({ ...current, presetType: event.target.value }))}>
                  <option value="registration_method">{t("admin.instances.registrationMethodText", { defaultValue: "Registration method" })}</option>
                  <option value="grade_class">{t("admin.instances.gradeClassText", { defaultValue: "Grade/class text" })}</option>
                </select>
              </PrintFormField>
              <PrintFormField label={t("admin.instances.presetLabel", { defaultValue: "Preset label" })}>
                <Input className="h-10 rounded-xl text-foreground" value={presetDraft.label} onChange={(event) => setPresetDraft((current) => ({ ...current, label: event.target.value }))} />
              </PrintFormField>
              <PrintFormField label={t("admin.instances.presetDisplayText", { defaultValue: "Printed text" })}>
                <Input className="h-10 rounded-xl text-foreground" value={presetDraft.displayText} onChange={(event) => setPresetDraft((current) => ({ ...current, displayText: event.target.value }))} />
              </PrintFormField>
              <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={handleCreatePrintPreset} disabled={!presetDraft.displayText.trim()}>
                <Plus className="h-4 w-4" />
                {t("common.add", { defaultValue: "Add" })}
              </Button>
            </div>
            {printPresets.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {printPresets.slice(0, 8).map((preset) => <Badge key={preset.id} variant="secondary" className="rounded-xl">{preset.label || preset.display_text}</Badge>)}
              </div>
            )}
          </div>
          </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.section>

      {initialLoading && <div className="rounded-2xl border bg-background p-8 text-center text-sm text-muted-foreground shadow-sm">{t("admin.instances.loading")}</div>}
      {!initialLoading && !selectedTeacherId && instances.length === 0 && <div className="rounded-2xl border bg-background p-8 text-center text-sm text-muted-foreground shadow-sm">{t("admin.instances.empty")}</div>}

      {!initialLoading && !selectedTeacherId && teacherGroups.length > 0 && (
        <motion.section className="overflow-hidden rounded-2xl border bg-background shadow-sm" variants={listMotion} initial="hidden" animate="show">
          <div className="grid gap-2 border-b bg-muted/25 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground md:grid-cols-[minmax(280px,1fr)_180px_230px_150px] md:items-center">
            <span>{t("common.teacher", { defaultValue: "Teacher" })}</span>
            <span>{t("admin.instances.eBooklets", { defaultValue: "E-booklets" })}</span>
            <span>{t("admin.instances.seats", { defaultValue: "Seats" })}</span>
            <span className="text-end">{t("common.actions", { defaultValue: "Actions" })}</span>
          </div>
          <div className="divide-y">
            {teacherGroups.map(([teacherId, group]) => {
              const groupSeats = group.rows.reduce((sum, instance) => sum + numberValue(instance.used_invites_count, instance._count?.access_records || 0), 0);
              const groupQuota = group.rows.reduce((sum, instance) => sum + numberValue(instance.invite_quota), 0);
              const activeCount = group.rows.filter((instance) => instance.status === "active").length;

              return (
                <motion.article key={teacherId} className="bg-card" variants={rowMotion}>
                  <div className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(280px,1fr)_180px_230px_150px] md:items-center">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{group.teacher?.name || t("common.teacher")}</div>
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">{group.teacher?.email || t("admin.instances.teacherMissing")}</div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-foreground">{group.rows.length}</span>
                      <span className="text-muted-foreground">{t("admin.instances.eBooklets", { defaultValue: "e-booklets" })}</span>
                      <Badge variant={activeCount === group.rows.length ? "secondary" : "outline"} className="rounded-full text-[11px]">
                        {activeCount} {t("statuses.active")}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{groupSeats}/{groupQuota || 0}</span> {t("admin.instances.seats", { defaultValue: "seats" })}
                    </div>
                    <div className="flex md:justify-end">
                      <Button asChild variant="outline" size="sm" className="rounded-xl">
                        <Link to={`/admin/e-booklets/access/teachers/${teacherId}`}>
                          {t("admin.instances.viewTeacherDetails", { defaultValue: "View details" })}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.section>
      )}

      {!initialLoading && selectedTeacherId && !selectedTeacherGroup && (
        <div className="rounded-2xl border bg-background p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">{t("admin.instances.teacherNotFound", { defaultValue: "This teacher is not available in the current access list." })}</p>
          <Button asChild variant="outline" className="mt-4 rounded-xl">
            <Link to="/admin/e-booklets/access"><ArrowLeft className="h-4 w-4" />{t("admin.instances.backToTeachers", { defaultValue: "All teachers" })}</Link>
          </Button>
        </div>
      )}

      {!initialLoading && selectedTeacherGroup && (
        <motion.div className="space-y-3" variants={listMotion} initial="hidden" animate="show">
          {[selectedTeacherGroup].map(([teacherId, group]) => {
            const groupSeats = group.rows.reduce((sum, instance) => sum + numberValue(instance.used_invites_count, instance._count?.access_records || 0), 0);
            const groupQuota = group.rows.reduce((sum, instance) => sum + numberValue(instance.invite_quota), 0);

            return (
              <motion.section key={teacherId} className="overflow-hidden rounded-2xl border bg-background shadow-sm" variants={rowMotion} layout>
                <div className="flex flex-col gap-3 border-b bg-muted/25 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <Button asChild variant="ghost" size="sm" className="-ms-2 mb-2 rounded-xl">
                      <Link to="/admin/e-booklets/access"><ArrowLeft className="h-4 w-4" />{t("admin.instances.backToTeachers", { defaultValue: "All teachers" })}</Link>
                    </Button>
                    <h2 className="truncate text-base font-semibold">{group.teacher?.name || t("common.teacher")}</h2>
                    <p className="truncate text-xs text-muted-foreground">{group.teacher?.email || t("admin.instances.teacherMissing")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{group.rows.length} {t("admin.instances.eBooklets", { defaultValue: "e-booklets" })}</Badge>
                    <Badge variant="secondary">{t("admin.instances.seatsSummary", { defaultValue: "{{used}}/{{quota}} seats", used: groupSeats, quota: groupQuota || 0 })}</Badge>
                  </div>
                </div>

                <div className="divide-y">
                  {group.rows.map((instance) => {
                    const usedSeats = numberValue(instance.used_invites_count, instance._count?.access_records || 0);
                    const usedDevices = optionalNumberValue(instance.used_devices_count ?? instance.active_devices_count ?? instance.devices_count);
                    const students = Array.isArray(instance.students) ? instance.students : [];
                    const quota = numberValue(quotaDrafts[instance.id]);
                    const quotaPercent = quota > 0 ? Math.min(100, Math.round((usedSeats / quota) * 100)) : 0;
                    const accessExpanded = expandedAccessKey === instance.id;
                    const instanceExpanded = expandedInstanceKey === instance.id;
                    const eBookletTitle = getEBookletTitle(instance, t("common.eBooklet"));
                    const unusedActivePaidCodes = (existingCodes[instance.id] || []).filter((code) => code.kind === "paid" && code.status === "active" && Number(code.redeemed_count || 0) === 0).length;
                    const remainingSeats = Math.max(0, quota - usedSeats);
                    const showSeatWarning = unusedActivePaidCodes > remainingSeats;
                    const printSectionCollapsed = Boolean(collapsedPrintSections[instance.id]);
                    const printDraft = printDrafts[instance.id] || {};
                    const teacherUploadTarget = `teacher-${instance.id}`;
                    const teacherUploadStatus = printUploadState[teacherUploadTarget];
                    const teacherUploadedAsset = printUploadedAssets[teacherUploadTarget];
                    const teacherImageUploading = teacherUploadStatus === "uploading";
                    const teacherImageRequired = Boolean(printDraft.requiredFields?.teacherImage);
                    const teacherImageMissing = teacherImageRequired && !printDraft.teacherImageFileAssetId;
                    const canGeneratePrintableBatch = Boolean(
                      accessCodeDrafts[instance.id]?.termId
                      && printDraft.templateId
                      && (instance.teacher?.id || instance.teacher_id)
                      && !teacherImageUploading
                      && !teacherImageMissing,
                    );

                    return (
                      <motion.article key={instance.id} className="bg-card" variants={rowMotion} layout="position">
                        <motion.button type="button" className="grid w-full gap-3 px-4 py-3 text-left transition hover:bg-muted/30 lg:grid-cols-[minmax(260px,1fr)_110px_120px_120px_150px_120px] lg:items-center" onClick={() => toggleInstance(instance.id)} aria-expanded={instanceExpanded} whileHover={{ backgroundColor: "var(--muted)" }} whileTap={{ scale: 0.995 }} transition={{ duration: 0.12 }}>
                          <div className="flex min-w-0 items-center gap-2">
                            <motion.span animate={{ rotate: instanceExpanded ? 90 : 0 }} transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}>
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </motion.span>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold" title={eBookletTitle}>{eBookletTitle}</div>
                              <div className="truncate text-xs text-muted-foreground">{instance.template_version?.version_label || instance.template_version?.version_number || t("common.version")}</div>
                            </div>
                          </div>
                          <Badge className="w-fit" variant={instance.status === "active" ? "default" : "outline"}>{t(`statuses.${instance.status}`, { defaultValue: instance.status })}</Badge>
                          <div className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{usedSeats}/{quota || 0}</span> {t("admin.instances.seats", { defaultValue: "seats" })}</div>
                          <div className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{students.length}</span> {t("common.student", { defaultValue: "students" })}</div>
                          <div className="text-xs text-muted-foreground"><span className="font-medium text-foreground">{usedDevices === null ? "-" : usedDevices}</span> {t("teacher.invites.usedDevices")}</div>
                          <div className="text-xs text-muted-foreground lg:text-right">{formatDate(instance.access_expires_at || instance.expires_at)}</div>
                        </motion.button>

                        <AnimatePresence initial={false}>
                          {instanceExpanded && (
                          <motion.div className="overflow-hidden border-t bg-muted/10" variants={panelMotion} initial="hidden" animate="show" exit="exit">
                          <div className="space-y-4 p-4">
                            <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                              <div className="space-y-3 rounded-2xl border bg-background p-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{t("admin.instances.capacity", { defaultValue: "Seat capacity" })}</span>
                                  <span>{quotaPercent}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                  <div className="h-full rounded-full bg-primary" style={{ width: `${quotaPercent}%` }} />
                                </div>
                                <div className="grid gap-2 sm:grid-cols-3">
                                  <div className="rounded-xl bg-muted/50 p-3 text-sm"><div className="font-semibold">{usedSeats}</div><div className="text-xs text-muted-foreground">{t("admin.instances.usedStudentSeats", { defaultValue: "Used student seats" })}</div></div>
                                  <div className="rounded-xl bg-muted/50 p-3 text-sm"><div className="font-semibold">{quota || 0}</div><div className="text-xs text-muted-foreground">{t("admin.instances.studentSeatQuota", { defaultValue: "Student seat quota" })}</div></div>
                                  <div className="rounded-xl bg-muted/50 p-3 text-sm"><div className="font-semibold">{usedDevices === null ? "-" : usedDevices}</div><div className="text-xs text-muted-foreground">{t("teacher.invites.usedDevices")}</div></div>
                                </div>
                              </div>

                              <div className="space-y-3 rounded-2xl border bg-background p-4">
                                <div className="flex gap-2">
                                  <Input className="h-10 rounded-xl" type="number" min="0" value={quotaDrafts[instance.id] ?? 0} onChange={(event) => setQuotaDrafts((current) => ({ ...current, [instance.id]: event.target.value }))} />
                                  <Button type="button" className="rounded-xl" variant="outline" onClick={() => handleQuotaSave(instance.id)} title={t("common.save")}><Save className="h-4 w-4" />{t("common.save")}</Button>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  <Button asChild size="sm" variant="outline" className="justify-start rounded-xl"><Link to={`/admin/e-booklets/access/${instance.id}/students`}><Users className="h-4 w-4" />{t("admin.instances.showStudents")}</Link></Button>
                                  <Button asChild size="sm" variant="outline" className="justify-start rounded-xl"><Link to={`/admin/e-booklets/access/${instance.id}/view`}><Eye className="h-4 w-4" />{t("admin.instances.adminView")}</Link></Button>
                                  <Button type="button" size="sm" variant={accessExpanded ? "default" : "outline"} className="justify-start rounded-xl" onClick={() => toggleAccessPanel(instance)}><KeyRound className="h-4 w-4" />{t("admin.instances.accessCodes", { defaultValue: "Access codes" })}</Button>
                                  <Button type="button" size="sm" variant="outline" className="justify-start rounded-xl text-destructive hover:text-destructive" onClick={() => handleRevoke(instance.id)} disabled={instance.status !== "active"}><ShieldOff className="h-4 w-4" />{t("admin.instances.revoke")}</Button>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-2xl border bg-background p-4">
                              <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary" />{t("admin.instances.nestedStudents", { defaultValue: "Students with access" })}<Badge variant="outline">{students.length}</Badge></div>
                              {students.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">{t("admin.instances.noStudents", { defaultValue: "No students have active access yet." })}</div>
                              ) : (
                                <div className="grid gap-2 lg:grid-cols-2">
                                  {students.map((student) => {
                                    const studentUserId = student.user_id || student.user?.id;
                                    const devicePanelKey = `${instance.id}-${studentUserId}`;
                                    const devicesExpanded = expandedDeviceKey === devicePanelKey;
                                    return (
                                      <div key={student.id || devicePanelKey} className="rounded-xl border p-3 text-xs">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                          <div className="min-w-0"><div className="truncate text-sm font-medium">{student.user?.name || student.user?.email || t("common.student", { defaultValue: "Student" })}</div><div className="truncate text-muted-foreground">{student.user?.email || `ID ${studentUserId}`}</div></div>
                                          <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => setExpandedDeviceKey(devicesExpanded ? null : devicePanelKey)}><HardDrive className="h-4 w-4" />{devicesExpanded ? t("admin.instances.hideDevicesInline") : t("admin.instances.manageDevicesInline")}</Button>
                                        </div>
                                        <div className="mt-2 grid gap-2 rounded-lg bg-muted/50 p-2 sm:grid-cols-3"><span>{t("admin.instances.devices", { defaultValue: "Devices" })}: {student.devices_summary?.active_count ?? 0}/{student.devices_summary?.allowed_devices ?? 1}</span><span>{t("admin.instances.viewerOpens", { defaultValue: "Viewer opens" })}: {student.analytics_summary?.viewer_opened ?? 0}</span><span>{t("admin.instances.source", { defaultValue: "Source" })}: {student.purchase_reference?.source || student.analytics_summary?.source || student.access_source || "-"}</span></div>
                                        {devicesExpanded && <AdminEBookletStudentDevicePanel instanceId={instance.id} userId={studentUserId} student={student} expanded={devicesExpanded} onSummaryRefresh={() => fetchInstances({ limit: 100 })} />}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            <AnimatePresence initial={false}>
                              {accessExpanded && (
                              <motion.div className="overflow-hidden rounded-2xl border bg-background" data-testid="admin-e-booklet-access-code-panel" variants={panelMotion} initial="hidden" animate="show" exit="exit">
                              <div className="space-y-4 p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-sm font-semibold"><KeyRound className="h-4 w-4 text-primary" />{t("admin.instances.accessCodes", { defaultValue: "Access codes" })}</div><Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => loadAccessCodes(instance)}>{t("common.refresh")}</Button></div>
                                <TooltipProvider delayDuration={150}>
                                <div className="grid gap-3 md:grid-cols-5">
                                  <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                                    <AccessCodeFieldLabel tooltip={t("admin.instances.selectTermTooltip", { defaultValue: "Choose the active term or policy these codes belong to. Milestones and rewards are calculated under that term." })}>{t("admin.instances.selectTerm", { defaultValue: "Select term" })}</AccessCodeFieldLabel>
                                    <select className="h-10 rounded-xl border bg-background px-3 text-sm text-foreground" value={accessCodeDrafts[instance.id]?.termId || ""} onChange={(event) => updateAccessCodeDraft(instance.id, "termId", event.target.value)}><option value="">{t("admin.instances.selectTerm", { defaultValue: "Select term" })}</option>{terms.map((term) => <option key={term.id} value={String(term.id)}>{term.name}</option>)}</select>
                                  </label>
                                  <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                                    <AccessCodeFieldLabel tooltip={t("admin.instances.codeTypeTooltip", { defaultValue: "Paid codes count toward paid redemptions and milestones. Free codes grant access without counting as paid." })}>{t("admin.instances.codeType", { defaultValue: "Code type" })}</AccessCodeFieldLabel>
                                    <select className="h-10 rounded-xl border bg-background px-3 text-sm text-foreground" value={accessCodeDrafts[instance.id]?.kind || "paid"} onChange={(event) => updateAccessCodeDraft(instance.id, "kind", event.target.value)}><option value="paid">{t("admin.instances.paidCode", { defaultValue: "Paid" })}</option><option value="free">{t("admin.instances.freeCode", { defaultValue: "Free" })}</option></select>
                                  </label>
                                  <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                                    <AccessCodeFieldLabel tooltip={t("admin.instances.codeCountTooltip", { defaultValue: "How many unique access codes to create in this batch." })}>{t("admin.instances.codeCount", { defaultValue: "Code count" })}</AccessCodeFieldLabel>
                                    <Input className="h-10 rounded-xl text-foreground" type="number" min="1" max="100" value={accessCodeDrafts[instance.id]?.count || "1"} onChange={(event) => updateAccessCodeDraft(instance.id, "count", event.target.value)} />
                                  </label>
                                  <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                                    <AccessCodeFieldLabel tooltip={t("admin.instances.maxRedemptionsTooltip", { defaultValue: "How many students can use each individual code. Use 1 when every student should receive a private code." })}>{t("admin.instances.maxRedemptions", { defaultValue: "Max redemptions" })}</AccessCodeFieldLabel>
                                    <Input className="h-10 rounded-xl text-foreground" type="number" min="1" value={accessCodeDrafts[instance.id]?.maxRedemptions || "1"} onChange={(event) => updateAccessCodeDraft(instance.id, "maxRedemptions", event.target.value)} />
                                  </label>
                                  <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                                    <span>{t("admin.instances.expiresAt", { defaultValue: "Expiry date" })}</span>
                                    <Input className="h-10 rounded-xl text-foreground" type="date" value={accessCodeDrafts[instance.id]?.expiresAt || ""} onChange={(event) => updateAccessCodeDraft(instance.id, "expiresAt", event.target.value)} />
                                  </label>
                                </div>
                                </TooltipProvider>
                                <div className="flex flex-wrap gap-2"><Button type="button" size="sm" className="rounded-xl" onClick={() => handleGenerateAccessCodes(instance)} disabled={!accessCodeDrafts[instance.id]?.termId || !(instance.teacher?.id || instance.teacher_id)}>{t("admin.instances.generateCodes", { defaultValue: "Generate codes" })}</Button>{(generatedCodes[instance.id] || []).length > 0 && <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => copyGeneratedCodes(instance.id)}><Copy className="h-4 w-4" />{t("admin.instances.copyGeneratedCodes", { defaultValue: "Copy generated codes" })}</Button>}</div>
                                <div className="space-y-3 rounded-2xl border bg-muted/20 p-3">
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 text-sm font-semibold"><Printer className="h-4 w-4 text-primary" />{t("admin.instances.printableBatch", { defaultValue: "Printable PDF batch" })}</div>
                                      <p className="mt-1 text-xs text-muted-foreground">{t("admin.instances.printableBatchDescription", { defaultValue: "Creates one printed access-code card per student with QR login prefill." })}</p>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap gap-2">
                                      {printBatches[instance.id]?.id && (
                                        <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => downloadAccessCodePrintBatchPdf(printBatches[instance.id].id, `e-booklet-access-codes-${printBatches[instance.id].id}.pdf`)}>
                                          <FileText className="h-4 w-4" />
                                          {t("admin.instances.downloadLastPdf", { defaultValue: "Download last PDF" })}
                                        </Button>
                                      )}
                                      <Button type="button" size="sm" variant="ghost" className="rounded-xl" onClick={() => togglePrintSection(instance.id)} aria-expanded={!printSectionCollapsed}>
                                        {printSectionCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                                        {printSectionCollapsed
                                          ? t("admin.instances.expandPrintSection", { defaultValue: "Show print section" })
                                          : t("admin.instances.minimizePrintSection", { defaultValue: "Minimize" })}
                                      </Button>
                                    </div>
                                  </div>
                                  <AnimatePresence initial={false}>
                                  {!printSectionCollapsed && (
                                  <motion.div className="space-y-3" variants={panelMotion} initial="hidden" animate="show" exit="exit">
                                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                                      <HelpCircle className="h-4 w-4 text-primary" />
                                      {t("admin.instances.printSystemGuideTitle", { defaultValue: "طريقة استخدام نظام طباعة أكواد الكتيبات" })}
                                    </div>
                                    <ol className="grid list-decimal gap-1 pl-5 text-xs leading-6 text-muted-foreground sm:grid-cols-2">
                                      <li>{t("admin.instances.printSystemGuideStep1", { defaultValue: "اختر قالب الطباعة المناسب للكارت الثابت 827 x 438 بكسل." })}</li>
                                      <li>{t("admin.instances.printSystemGuideStep2", { defaultValue: "ارفع صورة المدرس من هنا إذا كان الكارت يحتاجها. لا يتم سحبها من ملف المدرس." })}</li>
                                      <li>{t("admin.instances.printSystemGuideStep3", { defaultValue: "املأ الصف أو المجموعة وطريقة التسجيل والسعر الاختياري، واترك النص الأحمر حسب الحاجة." })}</li>
                                      <li>{t("admin.instances.printSystemGuideStep4", { defaultValue: "حدد عدد الأكواد ونوعها وتاريخ الانتهاء من حقول أكواد الوصول بالأعلى." })}</li>
                                      <li>{t("admin.instances.printSystemGuideStep5", { defaultValue: "استخدم المعاينة للتأكد من مكان QR والبيانات قبل إنشاء الملف." })}</li>
                                      <li>{t("admin.instances.printSystemGuideStep6", { defaultValue: "اضغط إنشاء PDF. كل كارت مطبوع يساوي طالب واحد، والطالب يسجل الدخول قبل التفعيل." })}</li>
                                    </ol>
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-3">
                                    <PrintFormField label={t("admin.instances.printTemplateId", { defaultValue: "Template ID" })} tooltip={t("admin.instances.printTemplateIdTooltip", { defaultValue: "Template ID controls the fixed 827 x 438 px card layout and background." })}>
                                      <select className="h-10 rounded-xl border bg-background px-3 text-sm text-foreground" value={printDrafts[instance.id]?.templateId || ""} onChange={(event) => updatePrintDraft(instance.id, "templateId", event.target.value)}>
                                        <option value="">{t("admin.instances.selectPrintTemplate", { defaultValue: "Select template" })}</option>
                                        {printTemplates.filter((template) => template.status !== "archived").map((template) => <option key={template.id} value={String(template.id)}>#{template.id} {template.name}</option>)}
                                      </select>
                                    </PrintFormField>
                                    <PrintFormField label={t("admin.instances.printBatchName", { defaultValue: "Batch name" })}>
                                      <Input className="h-10 rounded-xl text-foreground" value={printDrafts[instance.id]?.batchName || ""} onChange={(event) => updatePrintDraft(instance.id, "batchName", event.target.value)} />
                                    </PrintFormField>
                                    <PrintFormField label={t("admin.instances.teacherImageAssetId", { defaultValue: "Teacher image asset ID" })} tooltip={t("admin.instances.teacherImageAssetTooltip", { defaultValue: "Optional uploaded teacher image file asset ID. This is supplied by the generator, not the teacher profile." })}>
                                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_110px]">
                                        <div className="grid gap-1">
                                          <span className="text-[11px] font-medium text-muted-foreground">{t("admin.instances.teacherImageUpload", { defaultValue: "Upload image" })}</span>
                                          <Input className="h-10 rounded-xl text-foreground" type="file" accept="image/*" onChange={(event) => handleTeacherImageUpload(instance.id, event)} disabled={teacherImageUploading} />
                                        </div>
                                        <div className="grid gap-1">
                                          <span className="text-[11px] font-medium text-muted-foreground">{t("admin.instances.assetId", { defaultValue: "Asset ID" })}</span>
                                          <Input className="h-10 rounded-xl text-foreground" type="number" min="1" value={printDraft.teacherImageFileAssetId || ""} onChange={(event) => updatePrintDraft(instance.id, "teacherImageFileAssetId", event.target.value)} />
                                        </div>
                                      </div>
                                      {teacherImageUploading && (
                                        <div className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-medium text-sky-800">
                                          {t("admin.instances.teacherImageUploading", { defaultValue: "Uploading teacher image..." })}
                                        </div>
                                      )}
                                      {teacherUploadStatus === "done" && printDraft.teacherImageFileAssetId && (
                                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800">
                                          {t("admin.instances.teacherImageUploaded", {
                                            defaultValue: "Teacher image saved: {{name}} (asset #{{id}})",
                                            name: teacherUploadedAsset?.name || t("admin.instances.uploadedImage", { defaultValue: "uploaded image" }),
                                            id: printDraft.teacherImageFileAssetId,
                                          })}
                                        </div>
                                      )}
                                      {teacherUploadStatus === "error" && (
                                        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
                                          {t("admin.instances.teacherImageUploadFailed", { defaultValue: "Teacher image upload failed. Try again before generating the PDF." })}
                                        </div>
                                      )}
                                      {teacherImageMissing && (
                                        <div className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-900">
                                          {t("admin.instances.teacherImageRequiredMissing", { defaultValue: "Teacher image is required for this batch. Upload an image or enter its asset ID." })}
                                        </div>
                                      )}
                                    </PrintFormField>
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-4">
                                    <PrintFormField label={t("admin.instances.gradeClassText", { defaultValue: "Grade/class text" })}>
                                      <select className="h-10 rounded-xl border bg-background px-3 text-sm text-foreground" value="" onChange={(event) => updatePrintDraft(instance.id, "gradeClassText", event.target.value)}>
                                        <option value="">{t("admin.instances.choosePresetOptional", { defaultValue: "Choose preset" })}</option>
                                        {presetsByType("grade_class").map((preset) => <option key={preset.id} value={preset.display_text || preset.displayText}>{preset.label || preset.display_text}</option>)}
                                      </select>
                                      <Input className="h-10 rounded-xl text-foreground" value={printDrafts[instance.id]?.gradeClassText || ""} onChange={(event) => updatePrintDraft(instance.id, "gradeClassText", event.target.value)} />
                                    </PrintFormField>
                                    <PrintFormField label={t("admin.instances.registrationMethodText", { defaultValue: "Registration method" })}>
                                      <select className="h-10 rounded-xl border bg-background px-3 text-sm text-foreground" value="" onChange={(event) => updatePrintDraft(instance.id, "registrationMethodText", event.target.value)}>
                                        <option value="">{t("admin.instances.choosePresetOptional", { defaultValue: "Choose preset" })}</option>
                                        {presetsByType("registration_method").map((preset) => <option key={preset.id} value={preset.display_text || preset.displayText}>{preset.label || preset.display_text}</option>)}
                                      </select>
                                      <Input className="h-10 rounded-xl text-foreground" value={printDrafts[instance.id]?.registrationMethodText || ""} onChange={(event) => updatePrintDraft(instance.id, "registrationMethodText", event.target.value)} />
                                    </PrintFormField>
                                    <PrintFormField label={t("admin.instances.priceText", { defaultValue: "Price text" })}>
                                      <Input className="h-10 rounded-xl text-foreground" value={printDrafts[instance.id]?.priceText || ""} onChange={(event) => updatePrintDraft(instance.id, "priceText", event.target.value)} />
                                    </PrintFormField>
                                    <PrintFormField label={t("admin.instances.redCustomText", { defaultValue: "Red custom text" })} tooltip={t("admin.instances.redCustomTextTooltip", { defaultValue: "The only blank card text field from the brief. It remains free optional text." })}>
                                      <Input className="h-10 rounded-xl text-foreground" value={printDrafts[instance.id]?.redCustomText || ""} onChange={(event) => updatePrintDraft(instance.id, "redCustomText", event.target.value)} />
                                    </PrintFormField>
                                  </div>
                                  <div className="rounded-xl border bg-background p-3">
                                    <div className="mb-2 text-xs font-semibold text-muted-foreground">{t("admin.instances.requiredPrintFields", { defaultValue: "Batch required fields" })}</div>
                                    <div className="grid gap-2 sm:grid-cols-5">
                                      {[
                                        ["gradeClass", t("admin.instances.gradeClassText", { defaultValue: "Grade/class text" })],
                                        ["registrationMethod", t("admin.instances.registrationMethodText", { defaultValue: "Registration method" })],
                                        ["price", t("admin.instances.priceText", { defaultValue: "Price text" })],
                                        ["redCustomText", t("admin.instances.redCustomText", { defaultValue: "Red custom text" })],
                                        ["teacherImage", t("admin.instances.teacherImageAssetId", { defaultValue: "Teacher image" })],
                                      ].map(([field, label]) => (
                                        <label key={field} className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <input type="checkbox" checked={Boolean(printDrafts[instance.id]?.requiredFields?.[field])} onChange={(event) => updatePrintRequiredField(instance.id, field, event.target.checked)} />
                                          <span>{label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => handlePreviewPrintableCard(instance)} disabled={!printDrafts[instance.id]?.templateId || Boolean(printPreviewLoading[instance.id])}>
                                      {printPreviewLoading[instance.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                      {printPreviewLoading[instance.id]
                                        ? t("admin.instances.previewLoading", { defaultValue: "Previewing..." })
                                        : t("admin.instances.previewPrintableCard", { defaultValue: "Preview card" })}
                                    </Button>
                                    <Button type="button" size="sm" className="rounded-xl" onClick={() => handleGeneratePrintableBatch(instance)} disabled={!canGeneratePrintableBatch}>
                                      <Printer className="h-4 w-4" />
                                      {t("admin.instances.generatePrintablePdf", { defaultValue: "Generate printable PDF" })}
                                    </Button>
                                    <span className="text-xs text-muted-foreground">{t("admin.instances.printOneCodePerStudent", { defaultValue: "Print batches force one code per student." })}</span>
                                  </div>
                                  {printWarnings[instance.id] && (
                                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                                      {printWarnings[instance.id].message || t("admin.instances.printSeatWarning", { defaultValue: "Remaining student seats are below unused active paid codes. Codes do not reserve seats." })}
                                    </div>
                                  )}
                                  {showSeatWarning && (
                                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                                      {t("admin.instances.unusedCodeSeatWarning", { defaultValue: "Remaining student seats are below unused active paid codes. Codes do not reserve seats; redemption will re-check capacity." })}
                                    </div>
                                  )}
                                  {printPreviewErrors[instance.id] && (
                                    <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                      <span>{printPreviewErrors[instance.id]}</span>
                                    </div>
                                  )}
                                  {printPreviewUrls[instance.id] && (
                                    <div className="rounded-xl border bg-background p-3">
                                      <div className="mb-2 text-xs font-semibold text-muted-foreground">{t("admin.instances.backendPreview", { defaultValue: "Backend-rendered preview" })}</div>
                                      <img src={printPreviewUrls[instance.id]} alt={t("admin.instances.backendPreview", { defaultValue: "Backend-rendered preview" })} className="h-auto w-full max-w-[827px] rounded-lg border" />
                                    </div>
                                  )}
                                  {(printBatchHistory[instance.id] || []).length > 0 && (
                                    <div className="rounded-xl border bg-background p-3">
                                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><FileText className="h-3.5 w-3.5" />{t("admin.instances.printBatchHistory", { defaultValue: "Generated PDF batches" })}</div>
                                      <div className="grid gap-2">
                                        {(printBatchHistory[instance.id] || []).slice(0, 5).map((batch) => {
                                          const snapshotValues = batch.snapshot_json?.batchValues || batch.snapshotJson?.batchValues || {};
                                          return (
                                            <div key={batch.id} className="grid gap-2 rounded-lg border p-2 text-xs md:grid-cols-[1fr_110px_110px_auto] md:items-center">
                                              <div className="min-w-0">
                                                <div className="truncate font-medium">#{batch.id} {batch.label}</div>
                                                <div className="truncate text-muted-foreground">{snapshotValues.gradeClassText || "-"} / {snapshotValues.registrationMethodText || "-"}</div>
                                              </div>
                                              <div>{batch.kind}</div>
                                              <div>{batch._count?.codes || batch.count} {t("admin.instances.cards", { defaultValue: "cards" })}</div>
                                              <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => downloadAccessCodePrintBatchPdf(batch.id, `e-booklet-access-codes-${batch.id}.pdf`)}>
                                                <Download className="h-4 w-4" />
                                                PDF
                                              </Button>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  </motion.div>
                                  )}
                                  </AnimatePresence>
                                </div>
                                {(generatedCodes[instance.id] || []).length > 0 && <div className="rounded-xl bg-muted p-3 text-xs"><div className="mb-2 font-semibold">{t("admin.instances.generatedNow", { defaultValue: "Generated now" })}</div><div className="grid gap-2 md:grid-cols-2">{generatedCodes[instance.id].map((item) => <code key={item.record?.id || item.code} className="break-all rounded-lg bg-background p-2">{item.code}</code>)}</div></div>}
                                <div className="grid gap-2 md:grid-cols-2">{(existingCodes[instance.id] || []).slice(0, 10).map((code) => <div key={code.id} className="rounded-xl border p-3 text-xs"><div className="font-medium">{code.kind} - {code.status} - ****{code.code_hint}</div><div className="text-muted-foreground">{t("admin.instances.redemptions", { defaultValue: "Redemptions" })}: {code.redeemed_count}/{code.max_redemptions}</div></div>)}{(existingCodes[instance.id] || []).length === 0 && <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">{t("admin.instances.noAccessCodes", { defaultValue: "No access codes generated yet." })}</div>}</div>
                              </div>
                              </motion.div>
                            )}
                            </AnimatePresence>
                          </div>
                          </motion.div>
                        )}
                        </AnimatePresence>
                      </motion.article>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </motion.div>
      )}

      {!selectedTeacherId && <div className="flex flex-col gap-3 rounded-3xl border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" className="rounded-xl" disabled={pagination.page <= 1 || loading} onClick={() => { setPage(pagination.page - 1); fetchInstances({ page: pagination.page - 1 }); }}>{t("common.previous")}</Button>
        <span className="text-center text-sm text-muted-foreground">{t("admin.instances.pagination", { page: pagination.page, total: pagination.total })}</span>
        <Button type="button" variant="outline" className="rounded-xl" disabled={pagination.page * pagination.limit >= pagination.total || loading} onClick={() => { setPage(pagination.page + 1); fetchInstances({ page: pagination.page + 1 }); }}>{t("common.next")}</Button>
      </div>}
    </motion.div>
    </TooltipProvider>
  );
}
