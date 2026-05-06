import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, Link2, Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTeacherEBooklets } from "@/hooks/useEBookletAccess";

const remainingInvites = (instance) => {
  const quota = Number(instance?.invite_quota || 0);
  const used = Number(instance?.used_invites_count || 0);
  return Math.max(0, quota - used);
};

export default function TeacherEBookletsPage() {
  const { items, loading, fetchTeacherEBooklets } = useTeacherEBooklets();

  useEffect(() => {
    fetchTeacherEBooklets().catch(() => {});
  }, [fetchTeacherEBooklets]);

  return (
    <div className="space-y-6" data-testid="teacher-e-booklets-page">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <BookOpenCheck className="h-8 w-8 text-primary" />
          My E-Booklets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open delivered booklets, manage invite quota, and track student access.
        </p>
      </div>

      {loading && (
        <div className="rounded-lg border bg-background p-8 text-center text-muted-foreground">
          Loading e-booklets...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-lg border bg-background p-8 text-center">
          <div className="font-semibold">No delivered e-booklets yet</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Ready purchases appear here after admin customization and delivery.
          </p>
          <Button asChild className="mt-4">
            <Link to="/e-booklets">Browse E-Booklet Store</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((access) => {
          const instance = access.booklet_instance;
          return (
            <article key={access.id} className="rounded-lg border bg-background p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3">
                    {instance?.status || "active"}
                  </Badge>
                  <h2 className="text-xl font-semibold">
                    {instance?.display_title || instance?.template?.title || "E-Booklet"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Template: {instance?.template?.title || "Template"}
                  </p>
                </div>
                <div className="rounded-md border px-3 py-2 text-sm">
                  <div className="text-xs text-muted-foreground">Invites left</div>
                  <div className="text-lg font-semibold">{remainingInvites(instance)}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Quota</div>
                  <div className="font-semibold">{instance?.invite_quota || 0}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Used</div>
                  <div className="font-semibold">{instance?.used_invites_count || 0}</div>
                </div>
                <div className="rounded-md border p-3">
                  <div className="text-xs text-muted-foreground">Pages</div>
                  <div className="font-semibold">{instance?.template_version?.page_count || 0}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button asChild>
                  <Link to={`/teacher/e-booklets/${instance.id}`}>
                    <Play className="h-4 w-4" />
                    Open
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={`/teacher/e-booklets/${instance.id}/invites`}>
                    <Link2 className="h-4 w-4" />
                    Manage Invites
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={`/teacher/e-booklets/${instance.id}/invites`}>
                    <Users className="h-4 w-4" />
                    Students
                  </Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
