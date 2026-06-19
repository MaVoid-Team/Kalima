import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, Copy, Eye, HardDrive, KeyRound, RefreshCcw, Save, ShieldOff, Sparkles, Users } from "lucide-react";
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

export default function AdminEBookletInstancesPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const { instances, pagination, status, loading, fetchInstances, setStatus, setPage, updateQuota, revokeTeacherAccess, listAccessCodes, generateAccessCodes } = useAdminEBookletInstances();
  const { terms, fetchTerms } = useAdminEBookletTermsMilestones();
  const [quotaDrafts, setQuotaDrafts] = useState({});
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
    acc.revoked += instance.status === "revoked" ? 1 : 0;
    acc.seats += numberValue(instance.used_invites_count, instance._count?.access_records || 0);
    acc.quota += numberValue(instance.invite_quota);
    const devices = optionalNumberValue(instance.used_devices_count ?? instance.active_devices_count ?? instance.devices_count);
    acc.devices += devices || 0;
    return acc;
  }, { total: 0, active: 0, revoked: 0, seats: 0, quota: 0, devices: 0 }), [instances]);

  const teacherGroups = useMemo(() => Object.entries(grouped), [grouped]);

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
    setExpandedAccessKey(nextKey);
    if (nextKey) await loadAccessCodes(instance);
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
    <div className="space-y-6" data-testid="admin-e-booklet-instances-page">
      <section className="overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-background shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[1.5fr_1fr] lg:p-6">
          <div className="flex min-w-0 flex-col justify-between gap-6">
            <div>
              <Badge className="mb-3 w-fit gap-1 rounded-full" variant="secondary">
                <Sparkles className="h-3.5 w-3.5" />
                {t("admin.instances.accessOperations", { defaultValue: "Access operations" })}
              </Badge>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                <span className="rounded-2xl bg-primary p-2 text-primary-foreground shadow-sm">
                  <BookOpenCheck className="h-7 w-7" />
                </span>
                {t("admin.instances.title")}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {t("admin.instances.description")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border bg-background/80 p-4 shadow-sm backdrop-blur">
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.instances.totalAccess", { defaultValue: "Total access" })}</div>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4 shadow-sm backdrop-blur">
                <div className="text-2xl font-bold text-emerald-600">{summary.active}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("statuses.active")}</div>
              </div>
              <div className="rounded-2xl border bg-background/80 p-4 shadow-sm backdrop-blur">
                <div className="text-2xl font-bold">{summary.seats}/{summary.quota || 0}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("admin.instances.usedStudentSeats", { defaultValue: "Used student seats" })}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-background/90 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{t("admin.instances.viewControls", { defaultValue: "View controls" })}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{t("admin.instances.viewControlsHint", { defaultValue: "Filter access records and refresh the latest quotas, students, and devices." })}</p>
              </div>
              <RefreshCcw className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("common.status")}
                <select className="h-10 rounded-xl border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="all">{t("statuses.all")}</option>
                  <option value="active">{t("statuses.active")}</option>
                  <option value="archived">{t("statuses.archived")}</option>
                  <option value="revoked">{t("statuses.revoked")}</option>
                </select>
              </label>
              <Button variant="outline" className="justify-center rounded-xl" onClick={() => fetchInstances()} disabled={loading}>
                <RefreshCcw className="h-4 w-4" />
                {t("common.refresh")}
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-muted/60 p-3">
                <div className="font-semibold">{summary.devices}</div>
                <div className="text-xs text-muted-foreground">{t("teacher.invites.usedDevices")}</div>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3">
                <div className="font-semibold">{summary.revoked}</div>
                <div className="text-xs text-muted-foreground">{t("statuses.revoked")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading && <div className="rounded-3xl border bg-background p-10 text-center text-sm text-muted-foreground shadow-sm">{t("admin.instances.loading")}</div>}
      {!loading && instances.length === 0 && <div className="rounded-3xl border bg-background p-10 text-center text-sm text-muted-foreground shadow-sm">{t("admin.instances.empty")}</div>}

      {!loading && teacherGroups.length > 0 && (
        <div className="space-y-5">
          {teacherGroups.map(([teacherId, group]) => {
            const groupSeats = group.rows.reduce((sum, instance) => sum + numberValue(instance.used_invites_count, instance._count?.access_records || 0), 0);
            const groupQuota = group.rows.reduce((sum, instance) => sum + numberValue(instance.invite_quota), 0);

            return (
              <section key={teacherId} className="overflow-hidden rounded-3xl border bg-background shadow-sm">
                <div className="border-b bg-muted/30 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold">{group.teacher?.name || t("common.teacher")}</h2>
                        <p className="truncate text-sm text-muted-foreground">{group.teacher?.email || t("admin.instances.teacherMissing")}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{t("admin.instances.instanceCount", { count: group.rows.length })}</Badge>
                      <Badge variant="secondary">{t("admin.instances.seatsSummary", { defaultValue: "{{used}}/{{quota}} seats", used: groupSeats, quota: groupQuota || 0 })}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-4 sm:p-5">
                  {group.rows.map((instance) => {
                    const usedSeats = numberValue(instance.used_invites_count, instance._count?.access_records || 0);
                    const usedDevices = optionalNumberValue(instance.used_devices_count ?? instance.active_devices_count ?? instance.devices_count);
                    const students = Array.isArray(instance.students) ? instance.students : [];
                    const quota = numberValue(quotaDrafts[instance.id]);
                    const quotaPercent = quota > 0 ? Math.min(100, Math.round((usedSeats / quota) * 100)) : 0;
                    const accessExpanded = expandedAccessKey === instance.id;

                    return (
                      <article key={instance.id} className="rounded-3xl border bg-card text-card-foreground shadow-sm">
                        <div className="grid gap-5 p-4 lg:grid-cols-[1.25fr_0.9fr] lg:p-5">
                          <div className="min-w-0 space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-semibold leading-tight">{instance.display_title || instance.template?.title || t("common.eBooklet")}</h3>
                                  <Badge variant={instance.status === "active" ? "default" : "outline"}>{t(`statuses.${instance.status}`, { defaultValue: instance.status })}</Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {instance.template_version?.version_label || instance.template_version?.version_number || t("common.version")}
                                </p>
                              </div>
                              <div className="rounded-2xl border bg-background px-3 py-2 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{t("admin.instances.expiry")}: </span>
                                {formatDate(instance.access_expires_at || instance.expires_at)}
                              </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                              <div className="rounded-2xl border bg-background p-3">
                                <div className="text-xl font-bold">{usedSeats}</div>
                                <div className="text-xs text-muted-foreground">{t("admin.instances.usedStudentSeats", { defaultValue: "Used student seats" })}</div>
                              </div>
                              <div className="rounded-2xl border bg-background p-3">
                                <div className="text-xl font-bold">{quota || 0}</div>
                                <div className="text-xs text-muted-foreground">{t("admin.instances.studentSeatQuota", { defaultValue: "Student seat quota" })}</div>
                              </div>
                              <div className="rounded-2xl border bg-background p-3">
                                <div className="text-xl font-bold">{usedDevices === null ? "-" : usedDevices}</div>
                                <div className="text-xs text-muted-foreground">{t("teacher.invites.usedDevices")}</div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{t("admin.instances.capacity", { defaultValue: "Seat capacity" })}</span>
                                <span>{quotaPercent}%</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${quotaPercent}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 rounded-3xl border bg-background p-4">
                            <div>
                              <div className="text-sm font-semibold">{t("admin.instances.quotaManagement", { defaultValue: "Quota management" })}</div>
                              <p className="mt-1 text-xs text-muted-foreground">{t("admin.instances.quotaManagementHint", { defaultValue: "Adjust the number of students this teacher can activate for this e-booklet." })}</p>
                            </div>
                            <div className="flex gap-2">
                              <Input
                                className="h-10 rounded-xl"
                                type="number"
                                min="0"
                                value={quotaDrafts[instance.id] ?? 0}
                                onChange={(event) => setQuotaDrafts((current) => ({ ...current, [instance.id]: event.target.value }))}
                              />
                              <Button className="rounded-xl" variant="outline" onClick={() => handleQuotaSave(instance.id)} title={t("common.save")}>
                                <Save className="h-4 w-4" />
                                {t("common.save")}
                              </Button>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                              <Button asChild size="sm" variant="outline" className="justify-start rounded-xl">
                                <Link to={`/admin/e-booklets/access/${instance.id}/students`}><Users className="h-4 w-4" />{t("admin.instances.showStudents")}</Link>
                              </Button>
                              <Button asChild size="sm" variant="outline" className="justify-start rounded-xl">
                                <Link to={`/admin/e-booklets/access/${instance.id}/view`}><Eye className="h-4 w-4" />{t("admin.instances.adminView")}</Link>
                              </Button>
                              <Button size="sm" variant={accessExpanded ? "default" : "outline"} className="justify-start rounded-xl" onClick={() => toggleAccessPanel(instance)}>
                                <KeyRound className="h-4 w-4" />
                                {t("admin.instances.accessCodes", { defaultValue: "Access codes" })}
                              </Button>
                              <Button size="sm" variant="outline" className="justify-start rounded-xl text-destructive hover:text-destructive" onClick={() => handleRevoke(instance.id)} disabled={instance.status !== "active"}>
                                <ShieldOff className="h-4 w-4" />
                                {t("admin.instances.revoke")}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="border-t bg-muted/20 p-4 lg:p-5">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Users className="h-4 w-4 text-primary" />
                              {t("admin.instances.nestedStudents", { defaultValue: "Students with access" })}
                              <Badge variant="outline">{students.length}</Badge>
                            </div>
                          </div>
                          {students.length === 0 ? (
                            <div className="rounded-2xl border border-dashed bg-background p-4 text-sm text-muted-foreground">{t("admin.instances.noStudents", { defaultValue: "No students have active access yet." })}</div>
                          ) : (
                            <div className="grid gap-3 lg:grid-cols-2">
                              {students.map((student) => {
                                const studentUserId = student.user_id || student.user?.id;
                                const devicePanelKey = `${instance.id}-${studentUserId}`;
                                const devicesExpanded = expandedDeviceKey === devicePanelKey;
                                return (
                                  <div key={student.id || devicePanelKey} className="rounded-2xl border bg-background p-3 text-xs shadow-sm">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-medium">{student.user?.name || student.user?.email || t("common.student", { defaultValue: "Student" })}</div>
                                        <div className="truncate text-muted-foreground">{student.user?.email || `ID ${studentUserId}`}</div>
                                      </div>
                                      <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setExpandedDeviceKey(devicesExpanded ? null : devicePanelKey)}>
                                        <HardDrive className="h-4 w-4" />
                                        {devicesExpanded ? t("admin.instances.hideDevicesInline") : t("admin.instances.manageDevicesInline")}
                                      </Button>
                                    </div>
                                    <div className="mt-3 grid gap-2 rounded-xl bg-muted/50 p-3 sm:grid-cols-3">
                                      <span>{t("admin.instances.devices", { defaultValue: "Devices" })}: {student.devices_summary?.active_count ?? 0}/{student.devices_summary?.allowed_devices ?? 1}</span>
                                      <span>{t("admin.instances.viewerOpens", { defaultValue: "Viewer opens" })}: {student.analytics_summary?.viewer_opened ?? 0}</span>
                                      <span>{t("admin.instances.source", { defaultValue: "Source" })}: {student.purchase_reference?.source || student.analytics_summary?.source || student.access_source || "-"}</span>
                                    </div>
                                    {devicesExpanded && (
                                      <AdminEBookletStudentDevicePanel
                                        instanceId={instance.id}
                                        userId={studentUserId}
                                        student={student}
                                        expanded={devicesExpanded}
                                        onSummaryRefresh={() => fetchInstances()}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {accessExpanded && (
                          <div className="border-t p-4 lg:p-5">
                            <div className="space-y-4 rounded-3xl border bg-background p-4" data-testid="admin-e-booklet-access-code-panel">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="flex items-center gap-2 text-sm font-semibold"><KeyRound className="h-4 w-4 text-primary" />{t("admin.instances.accessCodes", { defaultValue: "Access codes" })}</div>
                                  <p className="mt-1 text-xs text-muted-foreground">{t("admin.instances.accessCodesHint", { defaultValue: "Generate redeemable codes for the selected term and review recent code usage." })}</p>
                                </div>
                                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => loadAccessCodes(instance)}>{t("common.refresh")}</Button>
                              </div>
                              <div className="grid gap-3 md:grid-cols-5">
                                <select className="h-10 rounded-xl border bg-background px-3 text-sm" value={accessCodeDrafts[instance.id]?.termId || ""} onChange={(event) => updateAccessCodeDraft(instance.id, "termId", event.target.value)}>
                                  <option value="">{t("admin.instances.selectTerm", { defaultValue: "Select term" })}</option>
                                  {terms.map((term) => <option key={term.id} value={String(term.id)}>{term.name}</option>)}
                                </select>
                                <select className="h-10 rounded-xl border bg-background px-3 text-sm" value={accessCodeDrafts[instance.id]?.kind || "paid"} onChange={(event) => updateAccessCodeDraft(instance.id, "kind", event.target.value)}>
                                  <option value="paid">{t("admin.instances.paidCode", { defaultValue: "Paid" })}</option>
                                  <option value="free">{t("admin.instances.freeCode", { defaultValue: "Free" })}</option>
                                </select>
                                <Input className="h-10 rounded-xl" type="number" min="1" max="100" value={accessCodeDrafts[instance.id]?.count || "1"} onChange={(event) => updateAccessCodeDraft(instance.id, "count", event.target.value)} placeholder={t("admin.instances.codeCount", { defaultValue: "Count" })} />
                                <Input className="h-10 rounded-xl" type="number" min="1" value={accessCodeDrafts[instance.id]?.maxRedemptions || "1"} onChange={(event) => updateAccessCodeDraft(instance.id, "maxRedemptions", event.target.value)} placeholder={t("admin.instances.maxRedemptions", { defaultValue: "Max redemptions" })} />
                                <Input className="h-10 rounded-xl" type="date" value={accessCodeDrafts[instance.id]?.expiresAt || ""} onChange={(event) => updateAccessCodeDraft(instance.id, "expiresAt", event.target.value)} />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button size="sm" className="rounded-xl" onClick={() => handleGenerateAccessCodes(instance)} disabled={!accessCodeDrafts[instance.id]?.termId || !(instance.teacher?.id || instance.teacher_id)}>{t("admin.instances.generateCodes", { defaultValue: "Generate codes" })}</Button>
                                {(generatedCodes[instance.id] || []).length > 0 && <Button size="sm" variant="outline" className="rounded-xl" onClick={() => copyGeneratedCodes(instance.id)}><Copy className="h-4 w-4" />{t("admin.instances.copyGeneratedCodes", { defaultValue: "Copy generated codes" })}</Button>}
                              </div>
                              {(generatedCodes[instance.id] || []).length > 0 && (
                                <div className="rounded-2xl bg-muted p-3 text-xs">
                                  <div className="mb-2 font-semibold">{t("admin.instances.generatedNow", { defaultValue: "Generated now" })}</div>
                                  <div className="grid gap-2 md:grid-cols-2">{generatedCodes[instance.id].map((item) => <code key={item.record?.id || item.code} className="break-all rounded-xl bg-background p-2">{item.code}</code>)}</div>
                                </div>
                              )}
                              <div className="grid gap-2 md:grid-cols-2">
                                {(existingCodes[instance.id] || []).slice(0, 10).map((code) => (
                                  <div key={code.id} className="rounded-2xl border p-3 text-xs">
                                    <div className="font-medium">{code.kind} - {code.status} - ****{code.code_hint}</div>
                                    <div className="text-muted-foreground">{t("admin.instances.redemptions", { defaultValue: "Redemptions" })}: {code.redeemed_count}/{code.max_redemptions}</div>
                                  </div>
                                ))}
                                {(existingCodes[instance.id] || []).length === 0 && <div className="rounded-2xl border border-dashed p-3 text-xs text-muted-foreground">{t("admin.instances.noAccessCodes", { defaultValue: "No access codes generated yet." })}</div>}
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-3xl border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" className="rounded-xl" disabled={pagination.page <= 1 || loading} onClick={() => { setPage(pagination.page - 1); fetchInstances({ page: pagination.page - 1 }); }}>{t("common.previous")}</Button>
        <span className="text-center text-sm text-muted-foreground">{t("admin.instances.pagination", { page: pagination.page, total: pagination.total })}</span>
        <Button variant="outline" className="rounded-xl" disabled={pagination.page * pagination.limit >= pagination.total || loading} onClick={() => { setPage(pagination.page + 1); fetchInstances({ page: pagination.page + 1 }); }}>{t("common.next")}</Button>
      </div>
    </div>
  );
}
