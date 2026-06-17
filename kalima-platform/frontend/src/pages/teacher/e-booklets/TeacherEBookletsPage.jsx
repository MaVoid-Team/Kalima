import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, CalendarClock, Link2, Play, BarChart3, Trophy, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTeacherEBooklets } from "@/hooks/useEBookletAccess";
import { useTranslation } from "react-i18next";

const numberOrFallback = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const milestoneTarget = (milestone) => numberOrFallback(milestone?.target_paid_redemptions ?? milestone?.required_paid_access_count);
const milestoneReward = (milestone) => numberOrFallback(milestone?.reward_amount_snapshot ?? milestone?.rewardAmount ?? milestone?.reward_amount);
const milestoneAchievementId = (milestone) => milestone?.achievement?.id ?? milestone?.achievement_id ?? milestone?.milestone_achievement_id;
const milestonePaidCount = (milestones) => Math.max(0, ...milestones.map((milestone) => numberOrFallback(milestone?.paid_redemptions_snapshot ?? milestone?.paidRedemptions ?? milestone?.progress_count)));

export default function TeacherEBookletsPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const {
    items,
    milestones,
    wallet,
    currentTerms,
    loading,
    fetchTeacherEBooklets,
    fetchTeacherMilestones,
    fetchTeacherWallet,
    fetchCurrentTerms,
  } = useTeacherEBooklets();

  useEffect(() => {
    fetchTeacherEBooklets().catch(() => {});
    fetchTeacherMilestones().catch(() => {});
    fetchTeacherWallet().catch(() => {});
    fetchCurrentTerms().catch(() => {});
  }, [fetchCurrentTerms, fetchTeacherEBooklets, fetchTeacherMilestones, fetchTeacherWallet]);

  const paidCount = milestonePaidCount(milestones);
  const sortedMilestones = [...milestones].sort((a, b) => milestoneTarget(a) - milestoneTarget(b));
  const completedCount = sortedMilestones.filter((milestone) => milestoneTarget(milestone) <= paidCount || milestoneAchievementId(milestone)).length;
  const nextMilestone = sortedMilestones.find((milestone) => milestoneTarget(milestone) > paidCount && !milestoneAchievementId(milestone));
  const remainingToNext = nextMilestone ? Math.max(0, milestoneTarget(nextMilestone) - paidCount) : 0;
  const claimableMilestone = sortedMilestones.find((milestone) => milestoneAchievementId(milestone) && !milestone?.claimed_at && !milestone?.achievement?.claimed_at);

  const formatDate = (value) => value ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(value)) : t("teacher.invites.noExpiry");
  const formatMoney = (value) => new Intl.NumberFormat(i18n.language, { style: "currency", currency: "EGP", maximumFractionDigits: 2 }).format(numberOrFallback(value));

  return (
    <div className="space-y-6" data-testid="teacher-e-booklets-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <BookOpenCheck className="h-8 w-8 text-primary" />
            {t("teacher.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("teacher.description")}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/teacher/e-booklet-analytics">
            <BarChart3 className="h-4 w-4" />
            {t("teacher.analytics.title")}
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]" data-testid="teacher-milestone-summary">
        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Trophy className="h-5 w-5 text-primary" />
                {t("teacher.milestones.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("teacher.milestones.motivation")}</p>
            </div>
            <Badge variant="secondary">{t("teacher.milestones.completed", { count: completedCount, total: sortedMilestones.length })}</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">{t("teacher.milestones.activeTerm")}</div>
              <div className="text-sm font-semibold">{currentTerms?.name || t("teacher.milestones.noActiveTerm")}</div>
              <div className="mt-1 text-xs text-muted-foreground">{currentTerms?.starts_at || currentTerms?.ends_at ? t("teacher.milestones.termRange", { start: formatDate(currentTerms?.starts_at), end: formatDate(currentTerms?.ends_at) }) : t("teacher.milestones.termRangeMissing")}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">{t("teacher.milestones.paidProgress")}</div>
              <div className="text-2xl font-semibold">{paidCount}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">{t("teacher.milestones.nextRemaining")}</div>
              <div className="text-2xl font-semibold">{nextMilestone ? remainingToNext : t("teacher.milestones.allDone")}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">{t("teacher.milestones.claimableReward")}</div>
              <div className="text-2xl font-semibold">{claimableMilestone ? formatMoney(milestoneReward(claimableMilestone)) : formatMoney(0)}</div>
            </div>
          </div>
          <div className="mt-5 space-y-3" data-testid="teacher-milestone-timeline">
            {sortedMilestones.map((milestone) => {
              const target = milestoneTarget(milestone);
              const achieved = target <= paidCount || milestoneAchievementId(milestone);
              const isNext = nextMilestone?.id === milestone.id;
              return (
                <div key={milestone.id} className={`rounded-md border p-3 ${achieved ? "border-emerald-500/40 bg-emerald-500/5" : isNext ? "border-primary/40 bg-primary/5" : ""}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{milestone.title || milestone.name || t("teacher.milestones.untitled")}</div>
                    <Badge variant={achieved ? "default" : "outline"}>{achieved ? t("teacher.milestones.achieved") : t("teacher.milestones.target", { count: target })}</Badge>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {achieved ? t("teacher.milestones.achievedCopy") : t("teacher.milestones.remainingCopy", { count: Math.max(0, target - paidCount) })}
                  </div>
                  {milestoneReward(milestone) > 0 && <div className="mt-2 text-sm font-medium">{t("teacher.milestones.reward", { value: formatMoney(milestoneReward(milestone)) })}</div>}
                </div>
              );
            })}
            {sortedMilestones.length === 0 && <div className="rounded-md border p-4 text-sm text-muted-foreground">{t("teacher.milestones.empty")}</div>}
          </div>
        </div>
        <div className="rounded-lg border bg-background p-5" data-testid="teacher-wallet-balance">
          <h2 className="flex items-center gap-2 font-semibold"><WalletCards className="h-5 w-5 text-primary" />{t("teacher.wallet.title")}</h2>
          <div className="mt-3 text-3xl font-bold">{formatMoney(wallet?.balance)}</div>
          <p className="mt-2 text-sm text-muted-foreground">{t("teacher.wallet.noStacking")}</p>
          {claimableMilestone && (
            <Button asChild className="mt-4 w-full">
              <Link to={`/teacher/e-booklets/${items[0]?.booklet_instance?.id || ""}/invites`}>{t("teacher.milestones.claimCta")}</Link>
            </Button>
          )}
        </div>
      </section>

      {loading && (
        <div className="rounded-lg border bg-background p-8 text-center text-muted-foreground">
          {t("teacher.loading")}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-lg border bg-background p-8 text-center">
          <div className="font-semibold">{t("teacher.emptyTitle")}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("teacher.emptyDescription")}
          </p>
          <Button asChild className="mt-4">
            <Link to="/e-booklets">{t("common.browse")}</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((access) => {
          const instance = access.booklet_instance;
          const expiry = instance?.access_expires_at || instance?.expires_at;
          const expired = expiry && new Date(expiry).getTime() <= Date.now();
          return (
            <article key={access.id} className="rounded-lg border bg-background p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3">
                    {t(`statuses.${instance?.status || "active"}`, {
                      defaultValue: instance?.status || t("common.active"),
                    })}
                  </Badge>
                  <h2 className="text-xl font-semibold">
                    {instance?.display_title || instance?.template?.title || t("common.eBooklet")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("teacher.templateLabel", {
                      value: instance?.template?.title || t("common.template"),
                    })}
                  </p>
                </div>
                <div className="rounded-md border px-3 py-2 text-sm">
                  <div className="text-xs text-muted-foreground">{t("teacher.expiry")}</div>
                  <div className="text-sm font-semibold"><CalendarClock className="me-1 inline h-4 w-4" />{formatDate(expiry)}</div>
                </div>
              </div>
              {expired && <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{t("teacher.expiredBlocked")}</div>}
              {access.device_lock_status && <div className="mt-3 rounded-md border p-3 text-sm text-muted-foreground">{t("teacher.deviceLocked", { value: access.device_lock_status })}</div>}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {expired ? <Button disabled><Play className="h-4 w-4" />{t("common.open")}</Button> : <Button asChild><Link to={`/teacher/e-booklets/${instance.id}`}><Play className="h-4 w-4" />{t("common.open")}</Link></Button>}
                {expired ? <Button variant="outline" disabled><Link2 className="h-4 w-4" />{t("teacher.manageAccessCodes")}</Button> : <Button asChild variant="outline"><Link to={`/teacher/e-booklets/${instance.id}/invites`}><Link2 className="h-4 w-4" />{t("teacher.manageAccessCodes")}</Link></Button>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
