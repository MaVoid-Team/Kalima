import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Banknote, BookOpenCheck, CalendarClock, Coins, Link2, Play, BarChart3, Trophy, WalletCards } from "lucide-react";
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
  const walletBalance = numberOrFallback(wallet?.balance);
  const claimableRewardValue = claimableMilestone ? milestoneReward(claimableMilestone) : 0;
  const nextMilestoneTarget = nextMilestone ? milestoneTarget(nextMilestone) : paidCount;
  const milestoneProgressPercent = nextMilestoneTarget > 0 ? Math.min(100, Math.round((paidCount / nextMilestoneTarget) * 100)) : 100;

  const formatDate = (value) => value ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(value)) : t("teacher.invites.noExpiry");
  const formatMoney = (value) => new Intl.NumberFormat(i18n.language, { style: "currency", currency: "EGP", maximumFractionDigits: 2 }).format(numberOrFallback(value));

  return (
    <div className="mx-auto max-w-7xl space-y-8" data-testid="teacher-e-booklets-page">
      <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-card via-primary/10 to-background p-6 text-foreground shadow-xl shadow-primary/10 sm:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-10 hidden h-32 w-32 rounded-t-full border border-primary/10 bg-primary/5 backdrop-blur md:block" />
        <BookOpenCheck className="absolute bottom-8 right-16 hidden h-16 w-16 text-primary/20 md:block" />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-3xl">
            <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary hover:bg-primary/15">{t("teacher.milestones.completed", { count: completedCount, total: sortedMilestones.length })}</Badge>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {t("teacher.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("teacher.description")}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/teacher/e-booklet-analytics">
                  <BarChart3 className="h-4 w-4" />
                  {t("teacher.analytics.title")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-background/50">
                <Link to="/e-booklets">
                  {t("common.browse")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-primary/10 bg-background/60 p-3 backdrop-blur">
            <div className="rounded-xl bg-primary/5 p-3">
              <div className="text-xs text-muted-foreground">{t("teacher.milestones.paidProgress")}</div>
              <div className="mt-1 text-2xl font-black">{paidCount}</div>
            </div>
            <div className="rounded-xl bg-primary/5 p-3">
              <div className="text-xs text-muted-foreground">{t("teacher.milestones.nextRemaining")}</div>
              <div className="mt-1 text-2xl font-black">{nextMilestone ? remainingToNext : t("teacher.milestones.allDone")}</div>
            </div>
            <div className="rounded-xl bg-primary/5 p-3">
              <div className="text-xs text-muted-foreground">{t("teacher.wallet.title")}</div>
              <div className="mt-1 truncate text-lg font-black">{formatMoney(walletBalance)}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_420px]" data-testid="teacher-milestone-summary">
        <div className="rounded-[1.5rem] border bg-card/70 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10"><Trophy className="h-5 w-5 text-primary" /></span>
                {t("teacher.milestones.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("teacher.milestones.motivation")}</p>
            </div>
            <Badge variant="secondary">{t("teacher.milestones.completed", { count: completedCount, total: sortedMilestones.length })}</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border bg-background/70 p-3">
              <div className="text-xs text-muted-foreground">{t("teacher.milestones.activeTerm")}</div>
              <div className="text-sm font-semibold">{currentTerms?.name || t("teacher.milestones.noActiveTerm")}</div>
              <div className="mt-1 text-xs text-muted-foreground">{currentTerms?.starts_at || currentTerms?.ends_at ? t("teacher.milestones.termRange", { start: formatDate(currentTerms?.starts_at), end: formatDate(currentTerms?.ends_at) }) : t("teacher.milestones.termRangeMissing")}</div>
            </div>
            <div className="rounded-2xl border bg-background/70 p-3">
              <div className="text-xs text-muted-foreground">{t("teacher.milestones.paidProgress")}</div>
              <div className="text-2xl font-semibold">{paidCount}</div>
            </div>
            <div className="rounded-2xl border bg-background/70 p-3">
              <div className="text-xs text-muted-foreground">{t("teacher.milestones.nextRemaining")}</div>
              <div className="text-2xl font-semibold">{nextMilestone ? remainingToNext : t("teacher.milestones.allDone")}</div>
            </div>
            <div className="rounded-2xl border bg-background/70 p-3">
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
                <div key={milestone.id} className={`rounded-2xl border p-4 transition ${achieved ? "border-primary/30 bg-primary/5" : isNext ? "border-primary/40 bg-background shadow-sm shadow-primary/10" : "bg-background/70"}`}>
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
        <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary via-red-700 to-rose-950 p-5 text-primary-foreground shadow-xl shadow-primary/15" data-testid="teacher-wallet-balance">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-rose-300/20 blur-2xl" />
          <Banknote className="absolute bottom-5 right-5 h-24 w-24 rotate-[-12deg] text-white/10" />

          <div className="relative flex items-start justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold"><span className="rounded-full bg-white/15 p-2 shadow-inner shadow-white/10"><WalletCards className="h-5 w-5" /></span>{t("teacher.wallet.title")}</h2>
            <div className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{t("teacher.milestones.claimableReward")}: {formatMoney(claimableRewardValue)}</div>
          </div>

          <div className="relative mt-6 rounded-2xl border border-white/15 bg-white/15 p-4 shadow-inner shadow-white/10 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/70">{t("teacher.wallet.title")}</div>
                <div className="mt-1 text-3xl font-black tracking-tight">{formatMoney(walletBalance)}</div>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-primary shadow-lg shadow-red-950/20">
                <Coins className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${milestoneProgressPercent}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-white/80">
              <span>{t("teacher.milestones.paidProgress")}: {paidCount}</span>
              <span>{nextMilestone ? `${t("teacher.milestones.nextRemaining")}: ${remainingToNext}` : t("teacher.milestones.allDone")}</span>
            </div>
          </div>

          <p className="relative mt-4 rounded-xl border border-white/10 bg-red-950/25 p-3 text-sm text-white/85 backdrop-blur">{t("teacher.wallet.noStacking")}</p>
          {claimableMilestone && (
            <Button asChild className="relative mt-4 w-full bg-white text-primary hover:bg-white/90">
              <Link to={`/teacher/e-booklets/${items[0]?.booklet_instance?.id || ""}/invites`}>{t("teacher.milestones.claimCta")}</Link>
            </Button>
          )}
        </div>
      </section>

      {loading && (
        <div className="rounded-[1.5rem] border bg-card/70 p-10 text-center text-muted-foreground shadow-sm">
          {t("teacher.loading")}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="relative overflow-hidden rounded-[1.5rem] border bg-card/70 p-10 text-center shadow-sm">
          <div className="absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <BookOpenCheck className="h-7 w-7" />
          </div>
          <div className="relative mt-4 text-lg font-semibold">{t("teacher.emptyTitle")}</div>
          <p className="relative mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            {t("teacher.emptyDescription")}
          </p>
          <Button asChild className="relative mt-5">
            <Link to="/e-booklets">{t("common.browse")}</Link>
          </Button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">{t("teacher.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("teacher.analytics.instancesDescription")}</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((access) => {
          const instance = access.booklet_instance;
          const expiry = instance?.access_expires_at || instance?.expires_at;
          const expired = expiry && new Date(expiry).getTime() <= Date.now();
          return (
            <article key={access.id} className="group overflow-hidden rounded-[1.5rem] border bg-card/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/10">
              <div className="h-2 bg-gradient-to-r from-primary via-red-700 to-rose-950" />
              <div className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3 bg-background/70">
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
                <div className="rounded-2xl border bg-background/70 px-3 py-2 text-sm">
                  <div className="text-xs text-muted-foreground">{t("teacher.expiry")}</div>
                  <div className="text-sm font-semibold"><CalendarClock className="me-1 inline h-4 w-4" />{formatDate(expiry)}</div>
                </div>
              </div>
              {expired && <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{t("teacher.expiredBlocked")}</div>}
              {access.device_lock_status && <div className="mt-3 rounded-2xl border bg-background/70 p-3 text-sm text-muted-foreground">{t("teacher.deviceLocked", { value: access.device_lock_status })}</div>}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {expired ? <Button disabled><Play className="h-4 w-4" />{t("common.open")}</Button> : <Button asChild><Link to={`/teacher/e-booklets/${instance.id}`}><Play className="h-4 w-4" />{t("common.open")}</Link></Button>}
                {expired ? <Button variant="outline" disabled><Link2 className="h-4 w-4" />{t("teacher.manageAccessCodes")}</Button> : <Button asChild variant="outline"><Link to={`/teacher/e-booklets/${instance.id}/invites`}><Link2 className="h-4 w-4" />{t("teacher.manageAccessCodes")}</Link></Button>}
              </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
