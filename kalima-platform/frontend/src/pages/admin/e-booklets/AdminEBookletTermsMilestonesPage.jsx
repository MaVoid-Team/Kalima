import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarRange, CheckCircle2, FileText, GripVertical, ListChecks, Medal, RefreshCcw, Save, ShieldCheck, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminEBookletTermsMilestones } from "@/hooks/admin/useAdminEBooklets";
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
  sortOrder: "0",
  active: true,
  rewardEnabled: true,
  notificationRecipients: "admins",
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");
const money = (value, fallback = "—") => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return numeric.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

function SummaryMetric({ label, value, icon }) {
  const IconComponent = icon;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-background p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <IconComponent className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 truncate text-xl font-semibold tabular-nums">{value}</div>
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
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border bg-background p-3 text-start transition hover:border-primary/40",
        active && "border-primary/60 bg-primary/5",
      )}
    >
      <span className={cn("mt-0.5 rounded-md bg-muted p-2 text-muted-foreground", active && "bg-primary text-primary-foreground")}>
        <IconComponent className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">{detail}</span>
      </span>
    </button>
  );
}

export default function AdminEBookletTermsMilestonesPage() {
  const { t, i18n } = useTranslation("eBooklets");
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
    await fetchTerms();
    const termId = selectedTermId === "all" ? undefined : selectedTermId;
    await Promise.all([fetchMilestones(termId), fetchProgress(termId)]);
  }, [fetchMilestones, fetchProgress, fetchTerms, selectedTermId]);

  useEffect(() => {
    reload();
  }, [reload]);

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
      sortOrder: String(milestone.sort_order ?? 0),
      active: Boolean(milestone.active),
      rewardEnabled: Number(milestone.reward_amount_snapshot ?? 0) > 0,
      notificationRecipients: milestone.notification_recipients || "admins",
    });
  };

  const resetMilestoneForm = () => {
    setEditingMilestoneId(null);
    setMilestoneForm({ ...emptyMilestoneForm, termId: selectedTerm?.id ? String(selectedTerm.id) : "" });
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
    <div className="space-y-5" data-testid="admin-e-booklet-terms-milestones-page">
      <section className="rounded-lg border bg-background p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <CalendarRange className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">{t("admin.termsMilestones.title")}</h1>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t("admin.termsMilestones.description")}</p>
            </div>
          </div>
          <Button variant="outline" onClick={reload} disabled={loading}>
            <RefreshCcw className="me-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryMetric icon={CalendarRange} label={t("admin.termsMilestones.activeTerms")} value={activeTerms.length} />
        <SummaryMetric icon={ListChecks} label={t("admin.termsMilestones.milestoneCount")} value={scopedMilestones.length} />
        <SummaryMetric icon={Medal} label={t("admin.termsMilestones.paidRedemptions")} value={progress?.paidRedemptions ?? 0} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-3">
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

          <div className="rounded-lg border bg-background p-3">
            <Label>{t("admin.termsMilestones.termName")}</Label>
            <Select value={selectedTermId} onValueChange={setSelectedTermId}>
              <SelectTrigger className="mt-2 w-full min-w-0 max-w-full overflow-hidden [&_[data-slot=select-value]]:truncate">
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
        </aside>

        <div className="min-w-0 space-y-5">
          {activePanel === "terms" && (
            <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_440px]">
              <div className="min-w-0 overflow-hidden rounded-lg border bg-background" data-testid="admin-e-booklet-terms-table">
                <div className="border-b p-4">
                  <h2 className="font-semibold">{t("admin.termsMilestones.termsTitle")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t("admin.termsMilestones.termsHelp")}</p>
                </div>
                <div className="hidden md:block">
                  <Table className="min-w-[840px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.termsMilestones.termName")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead>{t("admin.termsMilestones.termWindow")}</TableHead>
                        <TableHead actions>{t("common.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {terms.map((term) => (
                        <TableRow key={term.id}>
                          <TableCell truncate className="max-w-[34rem] whitespace-normal" title={term.description ? `${term.name}: ${term.description}` : term.name}>
                            <div className="max-w-md break-words font-medium">{term.name}</div>
                            <div className="line-clamp-2 max-w-md text-xs text-muted-foreground">{term.description || "—"}</div>
                          </TableCell>
                          <TableCell status><Badge variant={term.status === "active" ? "default" : "outline"}>{term.status}</Badge></TableCell>
                          <TableCell date className="whitespace-normal">{formatDate(term.starts_at)} — {term.ends_at ? formatDate(term.ends_at) : t("admin.termsMilestones.openEnded")}</TableCell>
                          <TableCell actions>
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => editTerm(term)}>{t("common.edit", { defaultValue: "Edit" })}</Button>
                              {term.status !== "active" && (
                                <Button size="sm" onClick={() => activate(term.id)} disabled={actionLoading} data-testid="admin-e-booklet-set-active-term">
                                  <ShieldCheck className="h-4 w-4" />
                                  {t("admin.termsMilestones.setActive")}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {terms.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="h-20 text-center text-muted-foreground">{t("admin.termsMilestones.emptyTerms")}</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="divide-y md:hidden">
                  {terms.map((term) => (
                    <div key={term.id} className="space-y-3 p-4">
                      <div className="min-w-0">
                        <div className="break-words font-medium">{term.name}</div>
                        <div className="mt-1 break-words text-xs text-muted-foreground">{term.description || "—"}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge variant={term.status === "active" ? "default" : "outline"}>{term.status}</Badge>
                        <span className="break-words text-muted-foreground">{formatDate(term.starts_at)} — {term.ends_at ? formatDate(term.ends_at) : t("admin.termsMilestones.openEnded")}</span>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => editTerm(term)}>{t("common.edit", { defaultValue: "Edit" })}</Button>
                        {term.status !== "active" && (
                          <Button size="sm" onClick={() => activate(term.id)} disabled={actionLoading} data-testid="admin-e-booklet-set-active-term">
                            <ShieldCheck className="h-4 w-4" />
                            {t("admin.termsMilestones.setActive")}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {terms.length === 0 && (
                    <div className="p-5 text-center text-sm text-muted-foreground">{t("admin.termsMilestones.emptyTerms")}</div>
                  )}
                </div>
              </div>

              <form className="min-w-0 space-y-4 rounded-lg border bg-background p-4" onSubmit={submitTerm} data-testid="admin-e-booklet-term-form">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">{editingTermId ? t("admin.termsMilestones.editTerm") : t("admin.termsMilestones.createTerm")}</h2>
                  <Button size="sm" type="submit" disabled={actionLoading}>
                    <Save className="h-4 w-4" />
                    {t("common.save")}
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-1">
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.termName")}</Label><Input required value={termForm.name} onChange={(e) => updateTermField("name", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("common.status")}</Label><Select value={termForm.status} onValueChange={(value) => updateTermField("status", value)} disabled={editingTerm?.status === "active"}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">{t("statuses.draft")}</SelectItem><SelectItem value="active">{t("statuses.active")}</SelectItem><SelectItem value="archived">{t("statuses.archived")}</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.startsAt")}</Label><Input type="date" value={termForm.startsAt} onChange={(e) => updateTermField("startsAt", e.target.value)} disabled={editingTerm?.status === "active"} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.endsAt")}</Label><Input type="date" value={termForm.endsAt} onChange={(e) => updateTermField("endsAt", e.target.value)} disabled={editingTerm?.status === "active"} /></div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.checkoutTerms")}</Label><Textarea required className="min-h-28" value={termForm.description} onChange={(e) => updateTermField("description", e.target.value)} disabled={editingTerm?.status === "active"} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.codeGenerationTerms")}</Label><Textarea required className="min-h-28" value={termForm.codeGenerationTerms} onChange={(e) => updateTermField("codeGenerationTerms", e.target.value)} disabled={editingTerm?.status === "active"} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.rewardClaimTerms")}</Label><Textarea required className="min-h-28" value={termForm.rewardClaimTerms} onChange={(e) => updateTermField("rewardClaimTerms", e.target.value)} disabled={editingTerm?.status === "active"} /></div>
                </div>
                <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={resetTermForm}>{t("common.clear")}</Button></div>
              </form>
            </section>
          )}

          {activePanel === "milestones" && (
            <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="min-w-0 space-y-4 rounded-lg border bg-background p-4">
                <div>
                  <h2 className="font-semibold">{t("admin.termsMilestones.milestonesTitle")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t("admin.termsMilestones.milestonesHelp")}</p>
                </div>
                <div className="overflow-hidden rounded-lg border" data-testid="admin-e-booklet-milestones-table">
                  <div className="hidden md:block">
                    <Table className="min-w-[900px]">
                      <TableHeader><TableRow><TableHead>{t("admin.termsMilestones.milestone")}</TableHead><TableHead numeric>{t("admin.termsMilestones.target")}</TableHead><TableHead numeric>{t("admin.termsMilestones.pricing")}</TableHead><TableHead numeric>{t("admin.termsMilestones.reward")}</TableHead><TableHead>{t("common.status")}</TableHead><TableHead actions>{t("common.actions")}</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {scopedMilestones.map((milestone) => (
                          <TableRow key={milestone.id}>
                            <TableCell truncate className="w-[42%] max-w-[34rem] whitespace-normal" title={milestone.description ? `${milestone.title}: ${milestone.description}` : milestone.title}><div className="break-words font-medium">{milestone.title}</div><div className="line-clamp-2 break-words text-xs text-muted-foreground">#{milestone.sort_order ?? 0} · {milestone.description || "—"}</div></TableCell>
                            <TableCell numeric>{milestone.target_paid_redemptions}</TableCell>
                            <TableCell numeric className="whitespace-nowrap">{money(milestone.previous_price_snapshot)} → {money(milestone.milestone_price)}</TableCell>
                            <TableCell numeric>{money(milestone.reward_amount_snapshot)}</TableCell>
                            <TableCell status><Badge variant={milestone.active ? "default" : "outline"}>{milestone.active ? t("common.active") : t("statuses.disabled")}</Badge></TableCell>
                            <TableCell actions className="whitespace-nowrap"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => moveMilestone(milestone, -1)} data-testid="admin-e-booklet-reorder-milestones"><GripVertical className="h-4 w-4" />↑</Button><Button size="sm" variant="outline" onClick={() => moveMilestone(milestone, 1)}><GripVertical className="h-4 w-4" />↓</Button><Button size="sm" onClick={() => editMilestone(milestone)}>{t("common.edit", { defaultValue: "Edit" })}</Button><Button size="sm" variant="destructive" onClick={() => removeMilestone(milestone)} disabled={actionLoading} data-testid="admin-e-booklet-delete-milestone"><Trash2 className="h-4 w-4" />{t("common.delete", { defaultValue: "Delete" })}</Button></div></TableCell>
                          </TableRow>
                        ))}
                        {scopedMilestones.length === 0 && (<TableRow><TableCell colSpan={6} className="h-20 text-center text-muted-foreground">{t("admin.termsMilestones.emptyMilestones")}</TableCell></TableRow>)}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="divide-y md:hidden">
                    {scopedMilestones.map((milestone) => (
                      <div key={milestone.id} className="space-y-3 p-3">
                        <div>
                          <div className="break-words font-medium">{milestone.title}</div>
                          <div className="mt-1 break-words text-xs text-muted-foreground">#{milestone.sort_order ?? 0} · {milestone.description || "—"}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="block text-xs text-muted-foreground">{t("admin.termsMilestones.target")}</span>{milestone.target_paid_redemptions}</div>
                          <div><span className="block text-xs text-muted-foreground">{t("admin.termsMilestones.reward")}</span>{money(milestone.reward_amount_snapshot)}</div>
                          <div className="col-span-2"><span className="block text-xs text-muted-foreground">{t("admin.termsMilestones.pricing")}</span>{money(milestone.previous_price_snapshot)} → {money(milestone.milestone_price)}</div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Badge variant={milestone.active ? "default" : "outline"}>{milestone.active ? t("common.active") : t("statuses.disabled")}</Badge>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => moveMilestone(milestone, -1)} data-testid="admin-e-booklet-reorder-milestones"><GripVertical className="h-4 w-4" />↑</Button>
                            <Button size="sm" variant="outline" onClick={() => moveMilestone(milestone, 1)}><GripVertical className="h-4 w-4" />↓</Button>
                            <Button size="sm" onClick={() => editMilestone(milestone)}>{t("common.edit", { defaultValue: "Edit" })}</Button>
                            <Button size="sm" variant="destructive" onClick={() => removeMilestone(milestone)} disabled={actionLoading} data-testid="admin-e-booklet-delete-milestone-mobile"><Trash2 className="h-4 w-4" />{t("common.delete", { defaultValue: "Delete" })}</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {scopedMilestones.length === 0 && <div className="p-5 text-center text-sm text-muted-foreground">{t("admin.termsMilestones.emptyMilestones")}</div>}
                  </div>
                </div>
              </div>

              <form className="min-w-0 space-y-4 rounded-lg border bg-background p-4" onSubmit={submitMilestone} data-testid="admin-e-booklet-milestone-form">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">{editingMilestoneId ? t("admin.termsMilestones.editMilestone") : t("admin.termsMilestones.createMilestone")}</h2>
                  <Button size="sm" type="submit" disabled={actionLoading || !effectiveMilestoneTermId}>
                    <Save className="h-4 w-4" />
                    {t("common.save")}
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="min-w-0 space-y-2"><Label>{t("admin.termsMilestones.termName")}</Label><Select value={effectiveMilestoneTermId} onValueChange={(value) => updateMilestoneField("termId", value)}><SelectTrigger className="w-full min-w-0 max-w-full overflow-hidden [&_[data-slot=select-value]]:truncate"><SelectValue placeholder={t("admin.termsMilestones.selectTerm")} /></SelectTrigger><SelectContent>{terms.map((term) => <SelectItem key={term.id} value={String(term.id)}>{term.name}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.milestone")}</Label><Input required value={milestoneForm.title} onChange={(e) => updateMilestoneField("title", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.descriptionLabel")}</Label><Textarea className="min-h-24" value={milestoneForm.description} onChange={(e) => updateMilestoneField("description", e.target.value)} /></div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-1">
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.target")}</Label><Input name="targetPaidRedemptions" type="number" min="1" value={milestoneForm.targetPaidRedemptions} onChange={(e) => updateMilestoneField("targetPaidRedemptions", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.sortOrder")}</Label><Input type="number" value={milestoneForm.sortOrder} onChange={(e) => updateMilestoneField("sortOrder", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.previousPrice")}</Label><Input type="number" value={milestoneForm.previousPriceSnapshot} onChange={(e) => updateMilestoneField("previousPriceSnapshot", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.milestonePrice")}</Label><Input name="milestonePrice" type="number" value={milestoneForm.milestonePrice} onChange={(e) => updateMilestoneField("milestonePrice", e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.rewardAmount")}</Label><Input type="number" value={milestoneForm.rewardAmountSnapshot} onChange={(e) => updateMilestoneField("rewardAmountSnapshot", e.target.value)} disabled={!milestoneForm.rewardEnabled} /></div>
                  <div className="space-y-2"><Label>{t("admin.termsMilestones.notificationRecipients")}</Label><Select value={milestoneForm.notificationRecipients} onValueChange={(value) => updateMilestoneField("notificationRecipients", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admins">{t("admin.termsMilestones.recipientAdmins")}</SelectItem><SelectItem value="teacher_and_admins">{t("admin.termsMilestones.recipientTeacherAdmins")}</SelectItem></SelectContent></Select></div>
                </div>
                <div className="grid gap-2 rounded-lg border p-3">
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={milestoneForm.active} onCheckedChange={(value) => updateMilestoneField("active", Boolean(value))} />{t("common.active")}</label>
                  <label className="flex items-center gap-2 text-sm"><Checkbox data-testid="admin-e-booklet-reward-enabled" checked={milestoneForm.rewardEnabled} onCheckedChange={(value) => updateMilestoneField("rewardEnabled", Boolean(value))} />{t("admin.termsMilestones.rewardEnabled")}</label>
                </div>
                <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={resetMilestoneForm}>{t("common.clear")}</Button></div>
              </form>
            </section>
          )}

          {activePanel === "progress" && (
            <section className="rounded-lg border bg-background p-4" data-testid="admin-e-booklet-progress-view">
              <div className="mb-4 flex items-center gap-2"><Medal className="h-5 w-5 text-primary" /><h2 className="font-semibold">{t("admin.termsMilestones.progressTitle")}</h2></div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border p-3"><div className="text-sm text-muted-foreground">{t("admin.termsMilestones.paidRedemptions")}</div><div className="text-2xl font-semibold">{progress?.paidRedemptions ?? 0}</div></div>
                <div className="rounded-lg border p-3"><div className="text-sm text-muted-foreground">{t("admin.termsMilestones.achievementCount")}</div><div className="text-2xl font-semibold">{progress?.achievements?.length ?? 0}</div></div>
                <div className="rounded-lg border p-3"><div className="text-sm text-muted-foreground">{t("admin.termsMilestones.claimedCount")}</div><div className="text-2xl font-semibold">{(progress?.achievements || []).filter((item) => item.claimed_at).length}</div></div>
              </div>
              <div className="mt-4 space-y-2">
                {(progress?.teacherProgress || []).slice(0, 8).map((row) => (
                  <div key={row.teacherId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
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
