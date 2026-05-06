import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStudentEBooklets } from "@/hooks/useEBookletAccess";

export default function StudentEBookletsPage() {
  const { items, loading, fetchStudentEBooklets } = useStudentEBooklets();

  useEffect(() => {
    fetchStudentEBooklets().catch(() => {});
  }, [fetchStudentEBooklets]);

  return (
    <div className="space-y-6" data-testid="student-e-booklets-page">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <BookOpenCheck className="h-8 w-8 text-primary" />
          My E-Booklets
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Booklets assigned by teachers appear here after invite acceptance.
        </p>
      </div>

      {loading && (
        <div className="rounded-lg border bg-background p-8 text-center text-muted-foreground">
          Loading assigned e-booklets...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-lg border bg-background p-8 text-center">
          <div className="font-semibold">No assigned e-booklets yet</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask your teacher for an e-booklet invite link.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((access) => {
          const instance = access.booklet_instance;
          return (
            <article key={access.id} className="rounded-lg border bg-background p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge variant="outline" className="mb-3">
                    {access.status || "active"}
                  </Badge>
                  <h2 className="text-xl font-semibold">
                    {instance?.display_title || instance?.template?.title || "E-Booklet"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Teacher: {instance?.teacher?.name || "Teacher"}
                  </p>
                </div>
                <div className="rounded-md border px-3 py-2 text-sm">
                  <div className="text-xs text-muted-foreground">Pages</div>
                  <div className="text-lg font-semibold">{instance?.template_version?.page_count || 0}</div>
                </div>
              </div>
              <Button asChild className="mt-5">
                <Link to={`/student/e-booklets/${instance.id}`}>
                  <Play className="h-4 w-4" />
                  Open
                </Link>
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
