import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarRange, CheckCircle2, FileText, GripVertical, ListChecks, Medal, RefreshCcw, Save, ShieldCheck, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminEBookletSettings, useAdminEBookletTermsMilestones } from "@/hooks/admin/useAdminEBooklets";
import { cn } from "@/lib/utils";

const emptyTermForm = {
  name: "",
  description: "",
  startsAt: "",
  endsAt: "",
  status: "draft",
  codeGenerationTerms: "",
  rewardClaimTerms: "",
};

const emptyMilestoneForm = {
  termId: "",
  title: "",
  description: "",
  targetPaidRedemptions: "",
  milestonePrice: "",
  previousPriceSnapshot: "",
  rewardAmountSnapshot: "",
  rewardExpiryDays: "120",
  sortOrder: "0",
  active: true,
  rewardEnabled: true,
  notificationRecipients: "admins",
};

const rewardExpiryDaysFromSettings = (settings) => String(settings?.default_reward_expiry_days ?? 120);

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");
const money = (value, fallback = "—") => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return numeric.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

function SummaryMetric({ label, value, icon }) {
  const IconComponent = icon;

  return (
    <div className="group flex min-w-0 items-center gap-4 rounded-2xl border border-border/70 bg-background p-4 shadow-xs transition hover:border-primary/30 hover:shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <IconComponent className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 truncate text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function WorkspaceButton({ active, icon, title, detail, onClick }) {
  const IconComponent = icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-2xl border border-border/70 bg-background p-3 text-start transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm",
        active && "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/15",
      )}
    >
      <span className={cn("mt-0.5 rounded-md bg-muted p-2 text-muted-foreground", active && "bg-primary text-primary-foreground")}>
        <IconComponent className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="mt-0.5 line-clamp-1 block text-xs leading-5 text-muted-foreground">{detail}</span>
      </span>
    </button>
  );
}

export default function AdminEBookletTermsMilestonesPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const {
    settings,
    fetchSettings,
  } = useAdminEBookletSettings();
  const {
    terms,
    milestones,
    progress,
    loading,
    actionLoading,
    fetchTerms,
    fetchMilestones,
    fetchProgress,
    createTerm,
    updateTerm,
    activateTerm,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    reorderMilestones,
  } = useAdminEBookletTermsMilestones();
  const [selectedTermId, setSelectedTermId] = useState("all");
  const [editingTermId, setEditingTermId] = useState(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [termForm, setTermForm] = useState(emptyTermForm);
  const [milestoneForm, setMilestoneForm] = useState(emptyMilestoneForm);
  const [activePanel, setActivePanel] = useState("milestones");
  const [loadError, setLoadError] = useState(null);
  const defaultRewardExpiryDays = rewardExpiryDaysFromSettings(settings);

  const activeTerms = useMemo(() => terms.filter((term) => term.status === "active"), [terms]);
  const selectedTerm = useMemo(
    () => terms.find((term) => String(term.id) === String(selectedTermId)) || activeTerms[0] || terms[0],
    [activeTerms, selectedTermId, terms],
  );
  const editingTerm = useMemo(() => terms.find((term) => Number(term.id) === Number(editingTermId)) || null, [editingTermId, terms]);
  const scopedMilestones = useMemo(() => {
    if (!selectedTerm || selectedTermId === "all") return milestones;
    return milestones.filter((milestone) => Number(milestone.term_id) === Number(selectedTerm.id));
  }, [milestones, selectedTerm, selectedTermId]);

  const reload = useCallback(async () => {
    const silentLoadOptions = { suppressErrorToast: true };
    try {
      setLoadError(null);
      await Promise.all([fetchTerms({}, silentLoadOptions), fetchSettings(silentLoadOptions)]);
      const termId = selectedTermId === "all" ? undefined : selectedTermId;
      await Promise.all([fetchMilestones(termId, silentLoadOptions), fetchProgress(termId, silentLoadOptions)]);
    } catch (error) {
      const status = error?.response?.status;
      const server = error?.response?.headers?.server;
      const message = t("admin.termsMilestones.loadError", {
        defaultValue: "Could not load e-booklet terms and milestones. Check that the backend API is running and reachable.",
      });
      const detail = status
        ? t("admin.termsMilestones.loadErrorStatus", {
          status,
          server: server || t("admin.termsMilestones.unknownServer", { defaultValue: "unknown server" }),
          defaultValue: "Request failed with HTTP {{status}} from {{server}}.",
        })
        : t("admin.termsMilestones.loadErrorNetwork", {
          defaultValue: "The request did not receive a response from the backend.",
        });
      setLoadError({ message, detail });
      toast.error(message, { description: detail });
    }
  }, [fetchMilestones, fetchProgress, fetchSettings, fetchTerms, selectedTermId, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (editingMilestoneId || !settings?.default_reward_expiry_days) return;
    setMilestoneForm((current) => {
      if (current.rewardExpiryDays && current.rewardExpiryDays !== emptyMilestoneForm.rewardExpiryDays) return current;
      return { ...current, rewardExpiryDays: defaultRewardExpiryDays };
    });
  }, [defaultRewardExpiryDays, editingMilestoneId, settings?.default_reward_expiry_days]);

  const effectiveMilestoneTermId = milestoneForm.termId || (selectedTerm?.id ? String(selectedTerm.id) : "");

  const updateTermField = (field, value) => setTermForm((current) => ({ ...current, [field]: value }));
  const updateMilestoneField = (field, value) => setMilestoneForm((current) => ({ ...current, [field]: value }));

  const editTerm = (term) => {
    setActivePanel("terms");
    setEditingTermId(term.id);
    setTermForm({
      name: term.name || "",
      description: term.description || "",
      startsAt: toDateInput(term.starts_at),
      endsAt: toDateInput(term.ends_at),
      status: term.status || "draft",
      codeGenerationTerms: term.code_generation_terms || "",
      rewardClaimTerms: term.reward_claim_terms || "",
    });
  };

  const resetTermForm = () => {
    setEditingTermId(null);
    setTermForm(emptyTermForm);
  };

  const submitTerm = async (event) => {
    event.preventDefault();
    const payload = {
      ...termForm,
      startsAt: termForm.startsAt || new Date().toISOString(),
      endsAt: termForm.endsAt || null,
      templateId: null,
    };
    if (editingTermId && editingTerm?.status === "active") {
      delete payload.status;
      delete payload.startsAt;
      delete payload.endsAt;
      delete payload.description;
      delete payload.codeGenerationTerms;
      delete payload.rewardClaimTerms;
    }
    if (editingTermId) await updateTerm(editingTermId, payload);
    else await createTerm(payload);
    resetTermForm();
    await reload();
  };

  const editMilestone = (milestone) => {
    setActivePanel("milestones");
    setEditingMilestoneId(milestone.id);
    setMilestoneForm({
      termId: String(milestone.term_id || selectedTerm?.id || ""),
      title: milestone.title || "",
      description: milestone.description || "",
      targetPaidRedemptions: String(milestone.target_paid_redemptions ?? ""),
      milestonePrice: String(milestone.milestone_price ?? ""),
      previousPriceSnapshot: String(milestone.previous_price_snapshot ?? ""),
      rewardAmountSnapshot: String(milestone.reward_amount_snapshot ?? ""),
      rewardExpiryDays: String(milestone.reward_expiry_days ?? 120),
      sortOrder: String(milestone.sort_order ?? 0),
      active: Boolean(milestone.active),
      rewardEnabled: Number(milestone.reward_amount_snapshot ?? 0) > 0,
      notificationRecipients: milestone.notification_recipients || "admins",
    });
  };

  const resetMilestoneForm = () => {
    setEditingMilestoneId(null);
    setMilestoneForm({ ...emptyMilestoneForm, rewardExpiryDays: defaultRewardExpiryDays, termId: selectedTerm?.id ? String(selectedTerm.id) : "" });
  };

  const submitMilestone = async (event) => {
    event.preventDefault();
    const payload = {
      termId: Number(milestoneForm.termId || selectedTerm?.id),
      title: milestoneForm.title,
      description: milestoneForm.description || null,
      targetPaidRedemptions: Number(milestoneForm.targetPaidRedemptions || 0),
      milestonePrice: Number(milestoneForm.milestonePrice || 0),
      previousPriceSnapshot: milestoneForm.previousPriceSnapshot === "" ? null : Number(milestoneForm.previousPriceSnapshot),
      rewardAmountSnapshot: milestoneForm.rewardEnabled ? Number(milestoneForm.rewardAmountSnapshot || 0) : 0,
      rewardExpiryDays: Number(milestoneForm.rewardExpiryDays || defaultRewardExpiryDays),
      sortOrder: Number(milestoneForm.sortOrder || 0),
      active: milestoneForm.active,
      notificationRecipients: milestoneForm.notificationRecipients,
    };
    if (editingMilestoneId) await updateMilestone(editingMilestoneId, payload);
    else await createMilestone(payload);
    resetMilestoneForm();
    await reload();
  };

  const moveMilestone = async (milestone, direction) => {
    const sorted = [...scopedMilestones].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    const index = sorted.findIndex((item) => item.id === milestone.id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    await reorderMilestones(Number(milestone.term_id), next.map((item, idx) => ({ id: item.id, sortOrder: idx + 1 })));
    await reload();
  };

  const removeMilestone = async (milestone) => {
    const confirmed = window.confirm(t("admin.termsMilestones.deleteMilestoneConfirm", { defaultValue: "Delete this milestone? This cannot be undone." }));
    if (!confirmed) return;
    await deleteMilestone(milestone.id);
    if (Number(editingMilestoneId) === Number(milestone.id)) resetMilestoneForm();
    await reload();
  };

  const activate = async (termId) => {
    await activateTerm(termId);
    await reload();
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Intl.DateTimeFormat(i18n.language?.startsWith("ar") ? "ar-EG" : "en", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  };

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden" data-testid="admin-e-booklet-terms-milestones-page">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-amber-50/50 p-5 shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -end-12 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <CalendarRange className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("admin.termsMilestones.title")}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t("admin.termsMilestones.description")}</p>
            </div>
          </div>
          <Button variant="outline" className="shrink-0 rounded-xl bg-background/80" onClick={reload} disabled={loading}>
            <RefreshCcw className="me-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
        </div>
      </section>

      {loadError && (
        <Alert variant="destructive" data-testid="admin-e-booklet-terms-milestones-load-error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{loadError.message}</AlertTitle>
          <AlertDescription>{loadError.detail}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryMetric icon={CalendarRange} label={t("admin.termsMilestones.activeTerms")} value={activeTerms.length} />
        <SummaryMetric icon={ListChecks} label={t("admin.termsMilestones.milestoneCount")} value={scopedMilestones.length} />
        <SummaryMetric icon={Medal} label={t("admin.termsMilestones.paidRedemptions")} value={progress?.paidRedemptions ?? 0} />
      </div>

      <section className="rounded-[1.5rem] border border-border/70 bg-muted/20 p-2 shadow-xs">
        <div className="grid gap-2 md:grid-cols-3">
          <WorkspaceButton
            active={activePanel === "milestones"}
            icon={ListChecks}
            title={t("admin.termsMilestones.milestonesTitle")}
            detail={t("admin.termsMilestones.milestonesHelp")}
            onClick={() => setActivePanel("milestones")}
          />
          <WorkspaceButton
            active={activePanel === "terms"}
            icon={FileText}
            title={t("admin.termsMilestones.termsTitle")}
            detail={t("admin.termsMilestones.termsHelp")}
            onClick={() => setActivePanel("terms")}
          />
          <WorkspaceButton
            active={activePanel === "progress"}
            icon={Medal}
            title={t("admin.termsMilestones.progressTitle")}
            detail={`${t("admin.termsMilestones.achievementCount")}: ${progress?.achievements?.length ?? 0}`}
            onClick={() => setActivePanel("progress")}
          />
        </div>
        <div className="mt-2 flex flex-col gap-2 rounded-xl bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className="text-xs text-muted-foreground">{t("admin.termsMilestones.termName")}</Label>
            <p className="mt-0.5 text-sm font-medium">{t("admin.termsMilestones.selectTerm", { defaultValue: "حدد نطاق الشروط لإدارة المراحل" })}</p>
          </div>
          <Select value={selectedTermId} onValueChange={setSelectedTermId}>
            <SelectTrigger className="w-full min-w-0 sm:w-[18rem] [&_[data-slot=select-value]]:truncate">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.termsMilestones.allTerms")}</SelectItem>
              {terms.map((term) => (
                <SelectItem key={term.id} value={String(term.id)}>{term.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="min-w-0">
        <div className="min-w-0 space-y-5">
          {activePanel === "terms" && (
            <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-4 rounded-[1.5rem] border border-border/70 bg-background p-4 shadow-xs sm:p-5" data-testid="admin-e-booklet-terms-table">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t("admin.termsMilestones.termsTitle")}</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight">{t("admin.termsMilestones.termsTitle")}</h2>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{t("admin.termsMilestones.termsHelp")}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full px-3 py-1">{terms.length}</Badge>
                </div>
                <div className="grid gap-3">
                  {terms.map((term) => (
                    <div key={term.id} className="rounded-2xl border border-border/70 bg-muted/15 p-4 transition hover:border-primary/25 hover:bg-primary/[0.03]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="break-words font-semibold">{term.name}</div>
                          <div className="mt-1 break-words text-sm leading-6 text-muted-foreground">{term.description || "—"}</div>
                        </div>
                        <Badge variant={term.status === "active" ? "default" : "outline"} className="shrink-0 rounded-full">{term.status}</Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3 text-sm">
                        <span className="text-muted-foreground">{formatDate(term.starts_at)} — {term.ends_at ? formatDate(term.ends_at) : t("admin.termsMilestones.openEnded")}</span>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => editTerm(term)}>{t("common.edit", { defaultValue: "Edit" })}</Button>
                          {term.status !== "active" && (
                            <Button size="sm" className="rounded-lg" onClick={() => activate(term.id)} disabled={actionLoading} data-testid="admin-e-booklet-set-active-term">
                              <ShieldCheck className="h-4 w-4" />
                              {t("admin.termsMilestones.setActive")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {terms.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">{t("admin.termsMilestones.emptyTerms")}</div>}
                </div>
              </div>

              <form className="min-w-0 space-y-5 rounded-[1.5rem] border border-primary/15 bg-primary/[0.03] p-4 shadow-xs sm:p-5" onSubmit={submitTerm} data-testid="admin-e-booklet-term-form">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{editingTermId ? t("admin.termsMilestones.editTerm") : t("admin.termsMilestones.createTerm")}</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight">{editingTermId ? t("admin.termsMilestones.editTerm") : t("admin.termsMilestones.createTerm")}</h2>
                  </div>
                  <Button size="sm" type="submit" className="rounded-lg" disabled={actionLoading}>
                    <Save className="h-4 w-4" />
                    {t("common.save")}
                  </Button>
                </div>
                <div className="grid gap-3">
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.termName")}</Label><Input required value={termForm.name} onChange={(e) => updateTermField("name", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("common.status")}</Label><Select value={termForm.status} onValueChange={(value) => updateTermField("status", value)} disabled={editingTerm?.status === "active"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">{t("statuses.draft")}</SelectItem><SelectItem value="active">{t("statuses.active")}</SelectItem><SelectItem value="archived">{t("statuses.archived")}</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label>{t("admin.termsMilestones.startsAt")}</Label><Input type="date" value={termForm.startsAt} onChange={(e) => updateTermField("startsAt", e.target.value)} disabled={editingTerm?.status === "active"} /></div><div className="space-y-2"><Label>{t("admin.termsMilestones.endsAt")}</Label><Input type="date" value={termForm.endsAt} onChange={(e) => updateTermField("endsAt", e.target.value)} disabled={editingTerm?.status === "active"} /></div></div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.checkoutTerms")}</Label><Textarea required className="min-h-24" value={termForm.description} onChange={(e) => updateTermField("description", e.target.value)} disabled={editingTerm?.status === "active"} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.codeGenerationTerms")}</Label><Textarea required className="min-h-24" value={termForm.codeGenerationTerms} onChange={(e) => updateTermField("codeGenerationTerms", e.target.value)} disabled={editingTerm?.status === "active"} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.rewardClaimTerms")}</Label><Textarea required className="min-h-24" value={termForm.rewardClaimTerms} onChange={(e) => updateTermField("rewardClaimTerms", e.target.value)} disabled={editingTerm?.status === "active"} /></div>
                </div>
                <div className="flex justify-end gap-2 border-t border-border/60 pt-4"><Button type="button" variant="outline" className="rounded-lg" onClick={resetTermForm}>{t("common.clear")}</Button></div>
              </form>
            </section>
          )}

          {activePanel === "milestones" && (
            <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-4 rounded-[1.5rem] border border-border/70 bg-background p-4 shadow-xs sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t("admin.termsMilestones.milestonesTitle")}</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight">{t("admin.termsMilestones.milestonesTitle")}</h2>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{t("admin.termsMilestones.milestonesHelp")}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full px-3 py-1">{scopedMilestones.length}</Badge>
                </div>
                <div className="grid gap-3" data-testid="admin-e-booklet-milestones-table">
                  {scopedMilestones.map((milestone) => (
                    <div key={milestone.id} className="rounded-2xl border border-border/70 bg-muted/15 p-4 transition hover:border-primary/25 hover:bg-primary/[0.03]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2"><span className="break-words font-semibold">{milestone.title}</span><span className="text-xs text-muted-foreground">#{milestone.sort_order ?? 0}</span></div>
                          <div className="mt-1 break-words text-sm leading-6 text-muted-foreground">{milestone.description || "—"}</div>
                        </div>
                        <Badge variant={milestone.active ? "default" : "outline"} className="shrink-0 rounded-full">{milestone.active ? t("common.active") : t("statuses.disabled")}</Badge>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl bg-background px-3 py-2"><span className="block text-xs text-muted-foreground">{t("admin.termsMilestones.target")}</span><span className="mt-1 block font-semibold tabular-nums">{milestone.target_paid_redemptions}</span></div>
                        <div className="rounded-xl bg-background px-3 py-2"><span className="block text-xs text-muted-foreground">{t("admin.termsMilestones.pricing")}</span><span className="mt-1 block font-semibold tabular-nums">{money(milestone.previous_price_snapshot)} → {money(milestone.milestone_price)}</span></div>
                        <div className="rounded-xl bg-background px-3 py-2"><span className="block text-xs text-muted-foreground">{t("admin.termsMilestones.reward")}</span><span className="mt-1 block font-semibold tabular-nums">{money(milestone.reward_amount_snapshot)}</span></div>
                        <div className="rounded-xl bg-background px-3 py-2"><span className="block text-xs text-muted-foreground">{t("admin.termsMilestones.rewardExpiryDays")}</span><span className="mt-1 block font-semibold tabular-nums">{milestone.reward_expiry_days ?? 120}</span></div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                        <span className="text-xs text-muted-foreground">{t("admin.termsMilestones.sortOrder")}: {milestone.sort_order ?? 0}</span>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => moveMilestone(milestone, -1)} data-testid="admin-e-booklet-reorder-milestones"><GripVertical className="h-4 w-4" />↑</Button>
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => moveMilestone(milestone, 1)}><GripVertical className="h-4 w-4" />↓</Button>
                          <Button size="sm" className="rounded-lg" onClick={() => editMilestone(milestone)}>{t("common.edit", { defaultValue: "Edit" })}</Button>
                          <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => removeMilestone(milestone)} disabled={actionLoading} data-testid="admin-e-booklet-delete-milestone"><Trash2 className="h-4 w-4" />{t("common.delete", { defaultValue: "Delete" })}</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {scopedMilestones.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ListChecks className="h-6 w-6" /></div><p className="mt-3 text-sm font-medium">{t("admin.termsMilestones.emptyMilestones")}</p><p className="mt-1 text-xs text-muted-foreground">{t("admin.termsMilestones.milestonesHelp")}</p></div>}
                </div>
              </div>

              <form className="min-w-0 space-y-5 rounded-[1.5rem] border border-primary/15 bg-primary/[0.03] p-4 shadow-xs sm:p-5" onSubmit={submitMilestone} data-testid="admin-e-booklet-milestone-form">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{editingMilestoneId ? t("admin.termsMilestones.editMilestone") : t("admin.termsMilestones.createMilestone")}</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight">{editingMilestoneId ? t("admin.termsMilestones.editMilestone") : t("admin.termsMilestones.createMilestone")}</h2>
                  </div>
                  <Button size="sm" type="submit" className="rounded-lg" disabled={actionLoading || !effectiveMilestoneTermId}>
                    <Save className="h-4 w-4" />
                    {t("common.save")}
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="min-w-0 space-y-2"><Label>{t("admin.termsMilestones.termName")}</Label><Select value={effectiveMilestoneTermId} onValueChange={(value) => updateMilestoneField("termId", value)}><SelectTrigger className="w-full min-w-0 max-w-full overflow-hidden [&_[data-slot=select-value]]:truncate"><SelectValue placeholder={t("admin.termsMilestones.selectTerm")} /></SelectTrigger><SelectContent>{terms.map((term) => <SelectItem key={term.id} value={String(term.id)}>{term.name}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.milestone")}</Label><Input required value={milestoneForm.title} onChange={(e) => updateMilestoneField("title", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.descriptionLabel")}</Label><Textarea className="min-h-24" value={milestoneForm.description} onChange={(e) => updateMilestoneField("description", e.target.value)} /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.target")}</Label><Input name="targetPaidRedemptions" type="number" min="1" value={milestoneForm.targetPaidRedemptions} onChange={(e) => updateMilestoneField("targetPaidRedemptions", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.sortOrder")}</Label><Input type="number" value={milestoneForm.sortOrder} onChange={(e) => updateMilestoneField("sortOrder", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.previousPrice")}</Label><Input type="number" value={milestoneForm.previousPriceSnapshot} onChange={(e) => updateMilestoneField("previousPriceSnapshot", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.milestonePrice")}</Label><Input name="milestonePrice" type="number" value={milestoneForm.milestonePrice} onChange={(e) => updateMilestoneField("milestonePrice", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.rewardAmount")}</Label><Input type="number" value={milestoneForm.rewardAmountSnapshot} onChange={(e) => updateMilestoneField("rewardAmountSnapshot", e.target.value)} disabled={!milestoneForm.rewardEnabled} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.rewardExpiryDays")}</Label><Input type="number" min="1" value={milestoneForm.rewardExpiryDays} onChange={(e) => updateMilestoneField("rewardExpiryDays", e.target.value)} disabled={!milestoneForm.rewardEnabled} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.notificationRecipients")}</Label><Select value={milestoneForm.notificationRecipients} onValueChange={(value) => updateMilestoneField("notificationRecipients", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admins">{t("admin.termsMilestones.recipientAdmins")}</SelectItem><SelectItem value="teacher_and_admins">{t("admin.termsMilestones.recipientTeacherAdmins")}</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={milestoneForm.active} onCheckedChange={(value) => updateMilestoneField("active", Boolean(value))} />{t("common.active")}</label>
                  <label className="flex items-center gap-2 text-sm"><Checkbox data-testid="admin-e-booklet-reward-enabled" checked={milestoneForm.rewardEnabled} onCheckedChange={(value) => updateMilestoneField("rewardEnabled", Boolean(value))} />{t("admin.termsMilestones.rewardEnabled")}</label>
                </div>
                <div className="flex justify-end gap-2 border-t border-border/60 pt-4"><Button type="button" variant="outline" className="rounded-lg" onClick={resetMilestoneForm}>{t("common.clear")}</Button></div>
              </form>
            </section>
          )}

          {activePanel === "progress" && (
            <section className="rounded-[1.5rem] border border-border/70 bg-background p-4 shadow-xs sm:p-5" data-testid="admin-e-booklet-progress-view">
              <div className="mb-5 flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t("admin.termsMilestones.progressTitle")}</p><h2 className="mt-1 text-xl font-bold tracking-tight">{t("admin.termsMilestones.progressTitle")}</h2></div><Medal className="h-6 w-6 text-primary" /></div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4"><div className="text-sm text-muted-foreground">{t("admin.termsMilestones.paidRedemptions")}</div><div className="mt-1 text-3xl font-semibold tracking-tight">{progress?.paidRedemptions ?? 0}</div></div>
                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4"><div className="text-sm text-muted-foreground">{t("admin.termsMilestones.achievementCount")}</div><div className="mt-1 text-3xl font-semibold tracking-tight">{progress?.achievements?.length ?? 0}</div></div>
                <div className="rounded-2xl border border-border/70 bg-muted/15 p-4"><div className="text-sm text-muted-foreground">{t("admin.termsMilestones.claimedCount")}</div><div className="mt-1 text-3xl font-semibold tracking-tight">{(progress?.achievements || []).filter((item) => item.claimed_at).length}</div></div>
              </div>
              <div className="mt-4 space-y-2">
                {(progress?.teacherProgress || []).slice(0, 8).map((row) => (
                  <div key={row.teacherId} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-muted/15 p-4 text-sm">
                    <span>{t("admin.termsMilestones.teacherId", { id: row.teacherId })} · {t("admin.termsMilestones.paidRedemptions")}: {row.paidRedemptions}</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{t("admin.termsMilestones.achievementCount")}: {(row.achievements || []).length}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
