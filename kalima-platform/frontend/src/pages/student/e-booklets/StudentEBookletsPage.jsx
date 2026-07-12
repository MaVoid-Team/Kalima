import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, CalendarClock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudentEBooklets } from "@/hooks/useEBookletAccess";
import { useTranslation } from "react-i18next";

export default function StudentEBookletsPage() {
  const { t, i18n } = useTranslation("eBooklets");
  const { items, loading, fetchStudentEBooklets } = useStudentEBooklets();

  useEffect(() => {
    fetchStudentEBooklets().catch(() => {});
  }, [fetchStudentEBooklets]);

  return (
    <div className="space-y-6" data-testid="student-e-booklets-page">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <BookOpenCheck className="h-8 w-8 text-primary" />
          {t("student.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("student.description")}
        </p>
      </div>

      {loading && (
        <div className="rounded-lg border bg-background p-8 text-center text-muted-foreground">
          {t("student.loading")}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-lg border bg-background p-8 text-center">
          <div className="font-semibold">{t("student.emptyTitle")}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("student.emptyDescription")}
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/e-booklet-code">{t("student.redeemCodeCta")}</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((access) => {
          const instance = access.booklet_instance;
          const expiry = access.access_expires_at || instance?.access_expires_at || instance?.expires_at;
          const expired = expiry && new Date(expiry).getTime() <= Date.now();
          const formatDate = (value) => {
            if (!value) return t("teacher.invites.noExpiry");
            const date = new Date(value);
            if (i18n.language.startsWith("ar")) {
              return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
            }
            return new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(date);
          };
          return (
            <article key={access.id} className="rounded-lg border bg-background p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3">
                    {t(`statuses.${access.status || "active"}`, {
                      defaultValue: access.status || t("common.active"),
                    })}
                  </Badge>
                  <h2 className="text-xl font-semibold">
                    {instance?.display_title || instance?.template?.title || t("common.eBooklet")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("student.teacherLabel", {
                      value: instance?.teacher?.name || t("common.teacher"),
                    })}
                  </p>
                </div>
                <div className="rounded-md border px-3 py-2 text-sm">
                  <div className="text-xs text-muted-foreground">{t("student.expiry")}</div>
                  <div className="text-sm font-semibold"><CalendarClock className="me-1 inline h-4 w-4" /><span dir="ltr">{formatDate(expiry)}</span></div>
                </div>
              </div>
              {expired && <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{t("student.expiredBlocked")}</div>}
              {access.device_lock_status && <div className="mt-3 rounded-md border p-3 text-sm text-muted-foreground">{t("student.deviceLocked", { value: access.device_lock_status })}</div>}
              <Button asChild className="mt-5" disabled={expired}>
                <Link to={`/student/e-booklets/${instance.id}`}>
                  <Play className="h-4 w-4" />
                  {t("common.open")}
                </Link>
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
