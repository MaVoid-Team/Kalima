import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenCheck, ChevronDown, ChevronRight, Copy, Eye, HardDrive, KeyRound, RefreshCcw, Save, ShieldOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAdminEBookletInstances, useAdminEBookletTermsMilestones } from "@/hooks/admin/useAdminEBooklets";
import { useTranslation } from "react-i18next";
import AdminEBookletStudentDevicePanel from "./AdminEBookletStudentDevicePanel";

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

const getInstanceDisplayTitle = (instance, fallback) => {
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

export default function AdminEBookletInstancesPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const { instances, pagination, status, loading, fetchInstances, setStatus, setPage, updateQuota, revokeTeacherAccess, listAccessCodes, generateAccessCodes } = useAdminEBookletInstances();
  const { terms, fetchTerms } = useAdminEBookletTermsMilestones();
  const [quotaDrafts, setQuotaDrafts] = useState({});
  const [expandedInstanceKey, setExpandedInstanceKey] = useState(null);
  const [expandedDeviceKey, setExpandedDeviceKey] = useState(null);
  const [expandedAccessKey, setExpandedAccessKey] = useState(null);
  const [accessCodeDrafts, setAccessCodeDrafts] = useState({});
  const [generatedCodes, setGeneratedCodes] = useState({});
  const [existingCodes, setExistingCodes] = useState({});

  useEffect(() => { fetchInstances().catch(() => {}); }, [fetchInstances]);
  useEffect(() => { fetchTerms({ status: "active" }).catch(() => {}); }, [fetchTerms]);
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
  }, [instances, terms]);

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
  const initialLoading = loading && instances.length === 0;

  const formatDate = (value, withTime = false) => {
    if (!value) return t("admin.instances.noExpiry");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.instances.noExpiry");
    return new Intl.DateTimeFormat(i18n.language, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
  };

  const handleQuotaSave = async (instanceId) => {
    await updateQuota(instanceId, Number(quotaDrafts[instanceId] || 0));
    fetchInstances();
  };

  const handleRevoke = async (instanceId) => {
    if (!window.confirm(t("admin.instances.revokeConfirm"))) return;
    await revokeTeacherAccess(instanceId);
    fetchInstances();
  };

  const updateAccessCodeDraft = (instanceId, field, value) => {
    setAccessCodeDrafts((current) => ({
      ...current,
      [instanceId]: { ...(current[instanceId] || {}), [field]: value },
    }));
  };

  const loadAccessCodes = async (instance) => {
    const teacherId = instance.teacher?.id || instance.teacher_id;
    if (!teacherId) return;
    const response = await listAccessCodes({ bookletInstanceId: instance.id, teacherId });
    setExistingCodes((current) => ({ ...current, [instance.id]: Array.isArray(response?.data) ? response.data : [] }));
  };

  const toggleAccessPanel = async (instance) => {
    const nextKey = expandedAccessKey === instance.id ? null : instance.id;
    setExpandedInstanceKey(instance.id);
    setExpandedAccessKey(nextKey);
    if (nextKey) await loadAccessCodes(instance);
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

  const copyGeneratedCodes = async (instanceId) => {
    const codes = generatedCodes[instanceId] || [];
    const text = codes.map((item) => item.whatsappMessage || `${item.code} ${item.redeemUrl || ""}`.trim()).join("\n\n");
    if (!text) return;
    await navigator.clipboard?.writeText(text);
  };


  return (
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
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => fetchInstances()} disabled={loading}>
              <RefreshCcw className="h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm"><span className="font-semibold">{summary.total}</span> {t("admin.instances.totalAccess", { defaultValue: "total access" })}</div>
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm"><span className="font-semibold text-emerald-600">{summary.active}</span> {t("statuses.active")}</div>
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm"><span className="font-semibold">{summary.seats}/{summary.quota || 0}</span> {t("admin.instances.seats", { defaultValue: "seats" })}</div>
          <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm"><span className="font-semibold">{summary.devices}</span> {t("teacher.invites.usedDevices")}</div>
        </div>
      </motion.section>

      {initialLoading && <div className="rounded-2xl border bg-background p-8 text-center text-sm text-muted-foreground shadow-sm">{t("admin.instances.loading")}</div>}
      {!initialLoading && instances.length === 0 && <div className="rounded-2xl border bg-background p-8 text-center text-sm text-muted-foreground shadow-sm">{t("admin.instances.empty")}</div>}

      {!initialLoading && teacherGroups.length > 0 && (
        <motion.div className="space-y-3" variants={listMotion} initial="hidden" animate="show">
          {teacherGroups.map(([teacherId, group]) => {
            const groupSeats = group.rows.reduce((sum, instance) => sum + numberValue(instance.used_invites_count, instance._count?.access_records || 0), 0);
            const groupQuota = group.rows.reduce((sum, instance) => sum + numberValue(instance.invite_quota), 0);

            return (
              <motion.section key={teacherId} className="overflow-hidden rounded-2xl border bg-background shadow-sm" variants={rowMotion} layout>
                <div className="flex flex-col gap-2 border-b bg-muted/25 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">{group.teacher?.name || t("common.teacher")}</h2>
                    <p className="truncate text-xs text-muted-foreground">{group.teacher?.email || t("admin.instances.teacherMissing")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{t("admin.instances.instanceCount", { count: group.rows.length })}</Badge>
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

                    return (
                      <motion.article key={instance.id} className="bg-card" variants={rowMotion} layout="position">
                        <motion.button type="button" className="grid w-full gap-3 px-4 py-3 text-left transition hover:bg-muted/30 lg:grid-cols-[minmax(260px,1fr)_110px_120px_120px_150px_120px] lg:items-center" onClick={() => toggleInstance(instance.id)} aria-expanded={instanceExpanded} whileHover={{ backgroundColor: "var(--muted)" }} whileTap={{ scale: 0.995 }} transition={{ duration: 0.12 }}>
                          <div className="flex min-w-0 items-center gap-2">
                            <motion.span animate={{ rotate: instanceExpanded ? 90 : 0 }} transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}>
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            </motion.span>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">{getInstanceDisplayTitle(instance, t("common.eBooklet"))}</div>
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
                                        {devicesExpanded && <AdminEBookletStudentDevicePanel instanceId={instance.id} userId={studentUserId} student={student} expanded={devicesExpanded} onSummaryRefresh={() => fetchInstances()} />}
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
                                <div className="grid gap-3 md:grid-cols-5"><select className="h-10 rounded-xl border bg-background px-3 text-sm" value={accessCodeDrafts[instance.id]?.termId || ""} onChange={(event) => updateAccessCodeDraft(instance.id, "termId", event.target.value)}><option value="">{t("admin.instances.selectTerm", { defaultValue: "Select term" })}</option>{terms.map((term) => <option key={term.id} value={String(term.id)}>{term.name}</option>)}</select><select className="h-10 rounded-xl border bg-background px-3 text-sm" value={accessCodeDrafts[instance.id]?.kind || "paid"} onChange={(event) => updateAccessCodeDraft(instance.id, "kind", event.target.value)}><option value="paid">{t("admin.instances.paidCode", { defaultValue: "Paid" })}</option><option value="free">{t("admin.instances.freeCode", { defaultValue: "Free" })}</option></select><Input className="h-10 rounded-xl" type="number" min="1" max="100" value={accessCodeDrafts[instance.id]?.count || "1"} onChange={(event) => updateAccessCodeDraft(instance.id, "count", event.target.value)} placeholder={t("admin.instances.codeCount", { defaultValue: "Count" })} /><Input className="h-10 rounded-xl" type="number" min="1" value={accessCodeDrafts[instance.id]?.maxRedemptions || "1"} onChange={(event) => updateAccessCodeDraft(instance.id, "maxRedemptions", event.target.value)} placeholder={t("admin.instances.maxRedemptions", { defaultValue: "Max redemptions" })} /><Input className="h-10 rounded-xl" type="date" value={accessCodeDrafts[instance.id]?.expiresAt || ""} onChange={(event) => updateAccessCodeDraft(instance.id, "expiresAt", event.target.value)} /></div>
                                <div className="flex flex-wrap gap-2"><Button type="button" size="sm" className="rounded-xl" onClick={() => handleGenerateAccessCodes(instance)} disabled={!accessCodeDrafts[instance.id]?.termId || !(instance.teacher?.id || instance.teacher_id)}>{t("admin.instances.generateCodes", { defaultValue: "Generate codes" })}</Button>{(generatedCodes[instance.id] || []).length > 0 && <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => copyGeneratedCodes(instance.id)}><Copy className="h-4 w-4" />{t("admin.instances.copyGeneratedCodes", { defaultValue: "Copy generated codes" })}</Button>}</div>
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

      <div className="flex flex-col gap-3 rounded-3xl border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" className="rounded-xl" disabled={pagination.page <= 1 || loading} onClick={() => { setPage(pagination.page - 1); fetchInstances({ page: pagination.page - 1 }); }}>{t("common.previous")}</Button>
        <span className="text-center text-sm text-muted-foreground">{t("admin.instances.pagination", { page: pagination.page, total: pagination.total })}</span>
        <Button type="button" variant="outline" className="rounded-xl" disabled={pagination.page * pagination.limit >= pagination.total || loading} onClick={() => { setPage(pagination.page + 1); fetchInstances({ page: pagination.page + 1 }); }}>{t("common.next")}</Button>
      </div>
    </motion.div>
  );
}
