import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Copy, Link2, ShieldOff, UserMinus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTeacherEBooklets } from "@/hooks/useEBookletAccess";

export default function TeacherInviteManagementPage() {
  const { instanceId } = useParams();
  const {
    items,
    invites,
    students,
    loading,
    fetchTeacherEBooklets,
    fetchInvites,
    createInvite,
    disableInvite,
    fetchStudents,
    revokeStudent,
  } = useTeacherEBooklets();
  const [form, setForm] = useState({ max_uses: "", expires_at: "" });
  const [lastInviteLink, setLastInviteLink] = useState("");

  useEffect(() => {
    fetchTeacherEBooklets().catch(() => {});
    fetchInvites(instanceId).catch(() => {});
    fetchStudents(instanceId).catch(() => {});
  }, [fetchInvites, fetchStudents, fetchTeacherEBooklets, instanceId]);

  const instance = useMemo(() => {
    return items
      .map((item) => item.booklet_instance)
      .find((booklet) => String(booklet?.id) === String(instanceId));
  }, [instanceId, items]);

  const activeStudents = students.filter((student) => student.status === "active");
  const remaining = Math.max(
    0,
    Number(instance?.invite_quota || 0) - activeStudents.length,
  );

  const handleCreateInvite = async () => {
    const payload = {};
    if (form.max_uses) payload.max_uses = Number(form.max_uses);
    if (form.expires_at) payload.expires_at = new Date(form.expires_at).toISOString();
    const response = await createInvite(instanceId, payload);
    const token = response?.data?.token;
    if (token) {
      setLastInviteLink(`${window.location.origin}/e-booklet-invite/${token}`);
    }
    fetchInvites(instanceId);
  };

  const copyLink = async (link) => {
    await navigator.clipboard.writeText(link);
    toast.success("Invite link copied");
  };

  const handleDisableInvite = async (inviteId) => {
    await disableInvite(inviteId);
    fetchInvites(instanceId);
  };

  const handleRevokeStudent = async (studentId) => {
    await revokeStudent(instanceId, studentId);
    fetchStudents(instanceId);
  };

  return (
    <div className="space-y-6" data-testid="teacher-invite-management-page">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ms-2 mb-2">
          <Link to="/teacher/e-booklets">Back to My E-Booklets</Link>
        </Button>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Users className="h-8 w-8 text-primary" />
          Invite Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Multi-use invite links stop working when quota is exhausted or disabled.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-background p-4">
          <div className="text-xs uppercase text-muted-foreground">Total quota</div>
          <div className="mt-2 text-2xl font-semibold">{instance?.invite_quota || 0}</div>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="text-xs uppercase text-muted-foreground">Active students</div>
          <div className="mt-2 text-2xl font-semibold">{activeStudents.length}</div>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="text-xs uppercase text-muted-foreground">Remaining</div>
          <div className="mt-2 text-2xl font-semibold">{remaining}</div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-4 rounded-lg border bg-background p-4">
          <div>
            <h2 className="font-semibold">Create Invite Link</h2>
            <p className="text-sm text-muted-foreground">
              Leave per-link uses empty to use only the booklet quota.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Max uses, optional</Label>
            <Input
              type="number"
              min="1"
              value={form.max_uses}
              onChange={(event) =>
                setForm((current) => ({ ...current, max_uses: event.target.value }))
              }
              placeholder="Example: 50"
            />
          </div>
          <div className="space-y-2">
            <Label>Expiry date, optional</Label>
            <Input
              type="datetime-local"
              value={form.expires_at}
              onChange={(event) =>
                setForm((current) => ({ ...current, expires_at: event.target.value }))
              }
            />
          </div>
          <Button onClick={handleCreateInvite} disabled={loading || remaining <= 0} className="w-full">
            <Link2 className="h-4 w-4" />
            Generate Invite Link
          </Button>
          {lastInviteLink && (
            <div className="rounded-md border p-3">
              <div className="mb-2 text-xs text-muted-foreground">Latest invite link</div>
              <div className="break-all text-sm">{lastInviteLink}</div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => copyLink(lastInviteLink)}
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          )}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border bg-background p-4">
            <h2 className="font-semibold">Invite Links</h2>
            <div className="mt-4 space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{invite.status}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisableInvite(invite.id)}
                      disabled={invite.status !== "active"}
                    >
                      <ShieldOff className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Uses: {invite.used_count || 0}
                    {invite.max_uses ? ` / ${invite.max_uses}` : ""}
                  </div>
                </div>
              ))}
              {invites.length === 0 && (
                <div className="rounded-md border p-5 text-center text-sm text-muted-foreground">
                  No invite links created yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <h2 className="font-semibold">Students</h2>
            <div className="mt-4 space-y-3">
              {students.map((studentAccess) => (
                <div key={studentAccess.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {studentAccess.user?.name || "Student"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {studentAccess.user?.email}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {studentAccess.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeStudent(studentAccess.user_id)}
                    disabled={studentAccess.status !== "active"}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {students.length === 0 && (
                <div className="rounded-md border p-5 text-center text-sm text-muted-foreground">
                  No students accepted this invite yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
