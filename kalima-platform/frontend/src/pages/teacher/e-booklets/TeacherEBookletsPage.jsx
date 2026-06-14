import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, CalendarClock, Link2, Play, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTeacherEBooklets } from "@/hooks/useEBookletAccess";
import { useTranslation } from "react-i18next";

const remainingInvites = (instance) => {
  const quota = Number(instance?.invite_quota || 0);
  const used = Number(instance?.used_invites_count || 0);
  return Math.max(0, quota - used);
};

export default function TeacherEBookletsPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const { items, loading, fetchTeacherEBooklets } = useTeacherEBooklets();

  useEffect(() => {
    fetchTeacherEBooklets().catch(() => {});
  }, [fetchTeacherEBooklets]);

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
          const formatDate = (value) => value ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(value)) : t("teacher.invites.noExpiry");
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
                  <div className="text-xs text-muted-foreground">{t("teacher.invitesLeft")}</div>
                  <div className="text-lg font-semibold">{remainingInvites(instance)}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{t("teacher.quota")}</div>
                  <div className="font-semibold">{instance?.invite_quota || 0}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{t("teacher.used")}</div>
                  <div className="font-semibold">{instance?.used_invites_count || 0}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">{t("teacher.expiry")}</div>
                  <div className="font-semibold"><CalendarClock className="me-1 inline h-4 w-4" />{formatDate(expiry)}</div>
                </div>
              </div>
              {expired && <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{t("teacher.expiredBlocked")}</div>}
              {access.device_lock_status && <div className="mt-3 rounded-md border p-3 text-sm text-muted-foreground">{t("teacher.deviceLocked", { value: access.device_lock_status })}</div>}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {expired ? <Button disabled><Play className="h-4 w-4" />{t("common.open")}</Button> : <Button asChild><Link to={`/teacher/e-booklets/${instance.id}`}><Play className="h-4 w-4" />{t("common.open")}</Link></Button>}
                {expired ? <Button variant="outline" disabled><Link2 className="h-4 w-4" />{t("teacher.manageInvites")}</Button> : <Button asChild variant="outline"><Link to={`/teacher/e-booklets/${instance.id}/invites`}><Link2 className="h-4 w-4" />{t("teacher.manageInvites")}</Link></Button>}
                {expired ? <Button variant="outline" disabled><Users className="h-4 w-4" />{t("teacher.students")}</Button> : <Button asChild variant="outline"><Link to={`/teacher/e-booklets/${instance.id}/invites`}><Users className="h-4 w-4" />{t("teacher.students")}</Link></Button>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
