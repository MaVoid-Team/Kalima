import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarClock, Copy, HardDrive, KeyRound, MessageCircle, ShieldCheck, UserMinus, Users, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTeacherEBooklets } from "@/hooks/useEBookletAccess";
import { useTranslation } from "react-i18next";

const numberOrFallback = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getCode = (response) => response?.data?.code || response?.code || "";
const getMessage = (response) => response?.data?.whatsappMessage || response?.whatsappMessage || "";
const getRecord = (response) => response?.data?.record || response?.record || {};

export default function TeacherInviteManagementPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const { instanceId } = useParams();
  const {
    items,
    accessCodes,
    students,
    milestones,
    wallet,
    currentTerms,
    loading,
    fetchTeacherEBooklets,
    fetchStudents,
    revokeStudent,
    fetchCurrentTerms,
    acceptCodeGenerationTerms,
    createAccessCode,
    createAccessCodes,
    fetchAccessCodes,
    fetchTeacherMilestones,
    fetchTeacherWallet,
    claimMilestoneReward,
  } = useTeacherEBooklets();
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [bulkCount, setBulkCount] = useState(5);
  const [pendingAction, setPendingAction] = useState(null);
  const [rewardTermsAchievement, setRewardTermsAchievement] = useState(null);

  useEffect(() => {
    fetchTeacherEBooklets().catch(() => {});
    fetchStudents(instanceId).catch(() => {});
    fetchTeacherWallet().catch(() => {});
    fetchAccessCodes(instanceId).catch(() => {});
  }, [fetchAccessCodes, fetchStudents, fetchTeacherEBooklets, fetchTeacherWallet, instanceId]);

  const instance = useMemo(() => {
    return items
      .map((item) => item.booklet_instance)
      .find((booklet) => String(booklet?.id) === String(instanceId));
  }, [instanceId, items]);

  const title = instance?.display_title || instance?.template?.title || t("common.eBooklet");
  const templateId = instance?.template_id || instance?.template?.id;
  const termId = currentTerms?.id;

  useEffect(() => {
    if (templateId) fetchCurrentTerms(templateId).catch(() => {});
  }, [fetchCurrentTerms, templateId]);

  useEffect(() => {
    if (termId) fetchTeacherMilestones(termId).catch(() => {});
  }, [fetchTeacherMilestones, termId]);

  const activeStudents = students.filter((student) => student.status === "active");
  const visibleAccessRows = useMemo(() => {
    const rowsById = new Map();
    generatedCodes.forEach((entry) => {
      rowsById.set(`generated-${entry.id}`, {
        id: `generated-${entry.id}`,
        kind: entry.kind,
        status: t("teacher.invites.sessionOnly", { defaultValue: "New" }),
        createdAt: entry.createdAt,
        code: entry.code,
        codeHint: entry.codeHint,
        whatsappMessage: entry.whatsappMessage,
        isGenerated: true,
      });
    });
    accessCodes.forEach((entry) => {
      const existingGenerated = generatedCodes.find((code) => String(code.codeHint || "") === String(entry.code_hint || ""));
      const key = existingGenerated ? `generated-${existingGenerated.id}` : `stored-${entry.id}`;
      rowsById.set(key, {
        ...(rowsById.get(key) || {}),
        id: key,
        kind: entry.kind,
        status: entry.status,
        createdAt: entry.created_at,
        codeHint: entry.code_hint,
        redeemedCount: entry.redeemed_count,
        maxRedemptions: entry.max_redemptions,
        expiresAt: entry.expires_at,
      });
    });
    return Array.from(rowsById.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [accessCodes, generatedCodes, t]);
  const claimableMilestone = milestones.find((milestone) => {
    const achievementId = milestone?.achievement?.id ?? milestone?.achievement_id ?? milestone?.milestone_achievement_id;
    return achievementId && !milestone?.claimed_at && !milestone?.achievement?.claimed_at;
  });
  const claimableAchievementId = claimableMilestone?.achievement?.id ?? claimableMilestone?.achievement_id ?? claimableMilestone?.milestone_achievement_id;

  const instanceExpiry = instance?.access_expires_at || instance?.expires_at || instance?.valid_until || null;
  const currency = instance?.currency || instance?.template?.currency || "EGP";

  const formatDate = (value) => {
    if (!value) return t("teacher.invites.noExpiry");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("teacher.invites.noExpiry");
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(date);
  };

  const formatMoney = (value) => new Intl.NumberFormat(i18n.language, { style: "currency", currency, maximumFractionDigits: 2 }).format(numberOrFallback(value));

  const copyText = async (text, toastKey = "toasts.accessCodeCopied") => {
    await navigator.clipboard.writeText(text);
    toast.success(t(toastKey));
  };

  const runCodeGeneration = async (mode, acceptedTermId = termId) => {
    if (!acceptedTermId) {
      toast.error(t("teacher.invites.noActiveTerms"));
      return;
    }
    const response = await createAccessCode(instanceId, { kind: "paid", termId: acceptedTermId, maxRedemptions: 1 });
    const code = getCode(response);
    const whatsappMessage = getMessage(response);
    const record = getRecord(response);
    const created = {
      id: record.id || `paid-${Date.now()}`,
      kind: "paid",
      mode,
      code,
      whatsappMessage,
      codeHint: record.code_hint,
      createdAt: record.created_at || new Date().toISOString(),
    };
    setGeneratedCodes((current) => [created, ...current]);
    fetchAccessCodes(instanceId).catch(() => {});
    if (mode === "message" && whatsappMessage) await copyText(whatsappMessage, "toasts.accessMessageCopied");
    if (mode === "code" && code) await copyText(code, "toasts.accessCodeCopied");
  };

  const requireTermsFor = (action) => {
    setPendingAction(() => action);
  };

  const confirmTermsAndRun = async () => {
    const response = await acceptCodeGenerationTerms(templateId);
    const acceptedTermId = response?.data?.term_id || response?.data?.terms?.id || termId;
    setPendingAction(null);
    if (pendingAction) await pendingAction(acceptedTermId);
  };

  const generatePaidMessageCode = () => requireTermsFor((acceptedTermId) => runCodeGeneration("message", acceptedTermId));
  const generatePaidCodeOnly = () => requireTermsFor((acceptedTermId) => runCodeGeneration("code", acceptedTermId));
  const generateBulkPaidCodes = () => requireTermsFor(async (acceptedTermId) => {
    const count = Math.max(1, Number(bulkCount) || 1);
    const response = await createAccessCodes(instanceId, { kind: "paid", termId: acceptedTermId, count, maxRedemptions: 1 });
    const createdCodes = Array.isArray(response?.data?.codes) ? response.data.codes : [];
    setGeneratedCodes((current) => [
      ...createdCodes.map((entry, index) => {
        const record = getRecord(entry);
        return {
          id: record.id || `bulk-paid-${Date.now()}-${index}`,
          kind: "paid",
          mode: "bulk",
          code: getCode(entry),
          whatsappMessage: getMessage(entry),
          codeHint: record.code_hint,
          createdAt: record.created_at || new Date().toISOString(),
        };
      }),
      ...current,
    ]);
    fetchAccessCodes(instanceId).catch(() => {});
  });

  const claimRewardAfterTerms = async () => {
    if (!rewardTermsAchievement) return;
    const response = await claimMilestoneReward(rewardTermsAchievement);
    setRewardTermsAchievement(null);
    await fetchTeacherWallet();
    await fetchTeacherMilestones(termId);
    toast.success(t("toasts.rewardClaimed"));
    return response;
  };

  const handleRevokeStudent = async (studentId) => {
    await revokeStudent(instanceId, studentId);
    fetchStudents(instanceId);
  };

  return (
    <div className="space-y-6" data-testid="teacher-invite-management-page">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ms-2 mb-2">
          <Link to="/teacher/e-booklets">{t("common.backToMyEBooklets")}</Link>
        </Button>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <KeyRound className="h-8 w-8 text-primary" />
          {t("teacher.invites.accessCodeTitle")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("teacher.invites.accessCodeDescription")}
        </p>
        <div className="mt-3 flex min-w-0 flex-wrap gap-2 text-sm">
          <Badge variant="secondary" className="max-w-full justify-start whitespace-normal break-words text-start leading-snug">
            {title}
          </Badge>
          <Badge variant="outline" className="max-w-full whitespace-normal break-words text-start leading-snug"><CalendarClock className="h-3.5 w-3.5 shrink-0" />{t("teacher.invites.instanceExpiry", { value: formatDate(instanceExpiry) })}</Badge>
          <Badge variant="outline" className="max-w-full whitespace-normal break-words text-start leading-snug"><WalletCards className="h-3.5 w-3.5 shrink-0" />{t("teacher.wallet.balance", { value: formatMoney(wallet?.balance) })}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-background p-4" data-testid="teacher-milestone-summary">
          <div className="text-xs uppercase text-muted-foreground">{t("teacher.milestones.paidProgress")}</div>
          <div className="mt-2 text-2xl font-semibold">{Math.max(0, ...milestones.map((milestone) => numberOrFallback(milestone?.paid_redemptions_snapshot ?? milestone?.progress_count)))}</div>
        </div>
        <div className="rounded-lg border bg-background p-4" data-testid="teacher-wallet-balance">
          <div className="text-xs uppercase text-muted-foreground">{t("teacher.wallet.title")}</div>
          <div className="mt-2 text-2xl font-semibold">{formatMoney(wallet?.balance)}</div>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="text-xs uppercase text-muted-foreground">{t("teacher.invites.activeStudents")}</div>
          <div className="mt-2 text-2xl font-semibold">{activeStudents.length}</div>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
        <section className="min-w-0 space-y-4 rounded-lg border bg-background p-4 shadow-sm">
          <div>
            <h2 className="font-semibold">{t("teacher.invites.createAccessCode")}</h2>
            <p className="text-sm text-muted-foreground">{t("teacher.invites.createAccessCodeDescription")}</p>
          </div>
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <ShieldCheck className="me-1 inline h-4 w-4 text-primary" />
            {t("teacher.invites.termsRequiredCopy")}
          </div>
          <div className="grid gap-2">
            <Button onClick={generatePaidMessageCode} disabled={loading} className="h-auto min-h-10 w-full whitespace-normal break-words text-center leading-snug">
              <MessageCircle className="h-4 w-4" />
              {t("teacher.invites.generatePaidMessageCode")}
            </Button>
            <Button onClick={generatePaidCodeOnly} disabled={loading} variant="outline" className="h-auto min-h-10 w-full whitespace-normal break-words text-center leading-snug">
              <Copy className="h-4 w-4" />
              {t("teacher.invites.generatePaidCodeOnly")}
            </Button>
            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]" data-testid="bulk-access-code-controls">
              <input
                type="number"
                min="1"
                max="100"
                value={bulkCount}
                onChange={(event) => setBulkCount(event.target.value)}
                className="min-w-0 rounded-md border bg-background px-3 py-2 text-sm"
                aria-label={t("teacher.invites.bulkCount", { defaultValue: "Bulk code count" })}
              />
              <Button onClick={generateBulkPaidCodes} disabled={loading} variant="outline" className="h-auto min-h-10 whitespace-normal break-words text-center leading-snug">
                <Copy className="h-4 w-4" />
                {t("teacher.invites.generateBulkPaidCodes", { defaultValue: "Bulk generate" })}
              </Button>
            </div>
          </div>
          {claimableAchievementId && (
            <div className="rounded-md border p-3">
              <div className="font-medium">{t("teacher.milestones.claimableReward")}</div>
              <p className="mt-1 text-sm text-muted-foreground">{t("teacher.wallet.noStacking")}</p>
              <Button className="mt-3 w-full" onClick={() => setRewardTermsAchievement(claimableAchievementId)}>{t("teacher.milestones.claimCta")}</Button>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-lg border bg-background shadow-sm" data-testid="access-code-status-list">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
            <div>
              <h2 className="font-semibold">{t("teacher.invites.accessLedgerTitle", { defaultValue: "Access code ledger" })}</h2>
              <p className="text-sm text-muted-foreground">{t("teacher.invites.accessLedgerDescription", { defaultValue: "Rows stay compact so bulk generations remain visible and easy to share." })}</p>
            </div>
            <Badge variant="secondary" className="shrink-0">{t("teacher.invites.codeCount", { defaultValue: "{{count}} codes", count: visibleAccessRows.length })}</Badge>
          </div>
          {visibleAccessRows.length > 0 ? (
            <div className="max-h-[560px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead>{t("teacher.invites.codeColumn", { defaultValue: "Code / hint" })}</TableHead>
                    <TableHead>{t("teacher.invites.typeColumn", { defaultValue: "Type" })}</TableHead>
                    <TableHead>{t("teacher.invites.usageColumn", { defaultValue: "Used" })}</TableHead>
                    <TableHead>{t("teacher.invites.createdColumn", { defaultValue: "Created" })}</TableHead>
                    <TableHead className="text-end">{t("teacher.invites.actionsColumn", { defaultValue: "Actions" })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleAccessRows.map((entry) => (
                    <TableRow key={entry.id} className="group">
                      <TableCell className="min-w-[220px] whitespace-normal">
                        <div className="flex min-w-0 flex-col gap-1">
                          <span className="break-all font-mono text-sm font-semibold leading-snug">{entry.code || (entry.codeHint ? t("teacher.invites.codeHintShort", { defaultValue: "**** {{value}}", value: entry.codeHint }) : entry.id)}</span>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant={entry.isGenerated ? "default" : "outline"} className="w-fit">{entry.status}</Badge>
                            {entry.codeHint && entry.code && <span className="text-xs text-muted-foreground">{t("teacher.invites.codeHint", { value: entry.codeHint })}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={entry.kind === "paid" ? "default" : "outline"}>{entry.kind === "paid" ? t("teacher.invites.paidUnique") : t("teacher.invites.freeShared")}</Badge></TableCell>
                      <TableCell>{entry.redeemedCount ?? 0}{entry.maxRedemptions ? ` / ${entry.maxRedemptions}` : ""}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(entry.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {entry.code && <Button variant="outline" size="sm" onClick={() => copyText(entry.code)}><Copy className="h-4 w-4" />{t("teacher.invites.copyCode")}</Button>}
                          {entry.whatsappMessage && <Button variant="outline" size="sm" onClick={() => copyText(entry.whatsappMessage, "toasts.accessMessageCopied")}><MessageCircle className="h-4 w-4" />{t("teacher.invites.copyWhatsAppMessage")}</Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">{t("teacher.invites.emptyCodeStatuses", { defaultValue: "No generated code statuses yet." })}</div>
          )}
        </section>
      </div>

      <section className="min-w-0 rounded-lg border bg-background p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4 text-primary" />{t("teacher.invites.studentsTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("teacher.invites.studentsDescription", { defaultValue: "Manage accepted students and keep device issues separate from access-code sharing." })}</p>
          </div>
          <Badge variant="outline"><HardDrive className="h-3.5 w-3.5" />{t("teacher.invites.deviceManagement", { defaultValue: "Device management" })}</Badge>
        </div>
        <div className="mt-4 grid gap-2 lg:grid-cols-2">
          {students.map((studentAccess) => (
            <div key={studentAccess.id} className="flex items-center justify-between gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40">
              <div className="min-w-0">
                <div className="truncate font-medium">{studentAccess.user?.name || t("common.student")}</div>
                <div className="truncate text-xs text-muted-foreground">{studentAccess.user?.email}</div>
                <Badge variant="outline" className="mt-2">{t(`statuses.${studentAccess.status}`, { defaultValue: studentAccess.status })}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleRevokeStudent(studentAccess.user_id)} disabled={studentAccess.status !== "active"}>
                <UserMinus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {students.length === 0 && <div className="rounded-md border p-5 text-center text-sm text-muted-foreground lg:col-span-2">{t("teacher.invites.emptyStudents")}</div>}
        </div>
      </section>

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" data-testid="code-generation-terms-modal">
          <div className="max-w-lg rounded-lg border bg-background p-5 shadow-lg">
            <h2 className="text-lg font-semibold">{t("teacher.invites.termsModal.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{currentTerms?.code_generation_terms || currentTerms?.description || t("teacher.invites.termsModal.description")}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPendingAction(null)}>{t("common.close")}</Button>
              <Button onClick={confirmTermsAndRun}>{t("teacher.invites.termsModal.accept")}</Button>
            </div>
          </div>
        </div>
      )}

      {rewardTermsAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" data-testid="reward-claim-terms-modal">
          <div className="max-w-lg rounded-lg border bg-background p-5 shadow-lg">
            <h2 className="text-lg font-semibold">{t("teacher.milestones.rewardTermsTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{currentTerms?.reward_claim_terms || t("teacher.milestones.rewardTermsDescription")}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRewardTermsAchievement(null)}>{t("common.close")}</Button>
              <Button onClick={claimRewardAfterTerms}>{t("teacher.milestones.claimCta")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
