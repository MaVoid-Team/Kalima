import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CalendarClock,
  Copy,
  ExternalLink,
  KeyRound,
  Link2,
  MessageCircle,
  ShieldOff,
  UserMinus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTeacherEBooklets } from "@/hooks/useEBookletAccess";
import { useTranslation } from "react-i18next";

const getInviteLink = (invite) => {
  const value =
    invite?.invite_link ||
    invite?.inviteLink ||
    invite?.link ||
    invite?.url;
  if (!value && invite?.token) {
    return `${window.location.origin}/e-booklet-invite/${encodeURIComponent(invite.token)}`;
  }
  if (!value) return "";
  const stringValue = String(value).trim();
  if (!stringValue) return "";
  try {
    const parsed = new URL(stringValue, window.location.origin);
    if (parsed.origin !== window.location.origin) return "";
    if (!parsed.pathname.startsWith("/e-booklet-invite/")) return "";
    return parsed.href;
  } catch {
    return "";
  }
};

const numberOrFallback = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function TeacherInviteManagementPage() {
  const { t, i18n } = useTranslation("eBooklets");
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
  const [form, setForm] = useState({
    max_uses: "",
    expires_at: "",
    require_passcode: false,
    passcode: "",
    passcode_hint: "",
  });
  const [lastInvite, setLastInvite] = useState({ link: "", passcode: "" });

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

  const title =
    instance?.display_title || instance?.template?.title || t("common.eBooklet");
  const activeStudents = students.filter((student) => student.status === "active");
  const quota = numberOrFallback(instance?.invite_quota);
  const usedSeats = numberOrFallback(instance?.used_invites_count, activeStudents.length);
  const rawUsedDevices =
    instance?.used_devices_count ?? instance?.active_devices_count ?? instance?.devices_count;
  const usedDevices =
    rawUsedDevices === null || rawUsedDevices === undefined || rawUsedDevices === ""
      ? null
      : numberOrFallback(rawUsedDevices);
  const remaining = Math.max(0, quota - usedSeats);
  const instanceExpiry =
    instance?.access_expires_at || instance?.expires_at || instance?.valid_until || null;
  const publicPrice =
    instance?.student_marketing_price ??
    instance?.public_price ??
    instance?.price ??
    instance?.template?.price ??
    null;
  const isFreeAccess =
    publicPrice !== null &&
    publicPrice !== undefined &&
    publicPrice !== "" &&
    numberOrFallback(publicPrice) <= 0;
  const currency = instance?.currency || instance?.template?.currency || "EGP";

  const formatDate = (value) => {
    if (!value) return t("teacher.invites.noExpiry");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("teacher.invites.noExpiry");
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") {
      return t("teacher.invites.priceNotSet");
    }
    const amount = numberOrFallback(value);
    if (amount <= 0) return t("teacher.invites.freeAccess");
    return new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const buildShareMessage = (link, passcode) =>
    t("teacher.invites.shareMessage", {
      title,
      link,
      passcode: passcode || t("teacher.invites.noPasscodeNeeded"),
      expiry: formatDate(instanceExpiry),
      price: formatPrice(publicPrice),
    });

  const getInvitePasscodeLabel = (invite) => {
    if (isFreeAccess) return t("teacher.invites.noPasscodeNeeded");
    if (invite?.passcode) return invite.passcode;
    if (invite?.has_passcode) return t("teacher.invites.passcodeRequired");
    return t("teacher.invites.noPasscodeNeeded");
  };

  const handleCreateInvite = async () => {
    const payload = {};
    if (form.max_uses) payload.max_uses = Number(form.max_uses);
    if (form.expires_at) payload.expires_at = new Date(form.expires_at).toISOString();
    if (!isFreeAccess && form.require_passcode) {
      payload.require_passcode = true;
      if (form.passcode) payload.passcode = form.passcode;
      if (form.passcode_hint) payload.passcode_hint = form.passcode_hint;
    }
    const response = await createInvite(instanceId, payload);
    const token = response?.data?.token;
    const passcode = response?.data?.passcode || (form.require_passcode ? form.passcode : "");
    if (token) {
      setLastInvite({
        link: `${window.location.origin}/e-booklet-invite/${token}`,
        passcode,
      });
    }
    fetchInvites(instanceId);
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success(t("toasts.inviteCopied"));
  };

  const handleDisableInvite = async (inviteId) => {
    await disableInvite(inviteId);
    fetchInvites(instanceId);
  };

  const handleRevokeStudent = async (studentId) => {
    await revokeStudent(instanceId, studentId);
    fetchStudents(instanceId);
  };

  const latestDisplayPasscode = isFreeAccess ? "" : lastInvite.passcode;
  const latestShareMessage = lastInvite.link
    ? buildShareMessage(lastInvite.link, latestDisplayPasscode)
    : "";

  return (
    <div className="space-y-6" data-testid="teacher-invite-management-page">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ms-2 mb-2">
          <Link to="/teacher/e-booklets">{t("common.backToMyEBooklets")}</Link>
        </Button>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Users className="h-8 w-8 text-primary" />
          {t("teacher.invites.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("teacher.invites.description")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">{title}</Badge>
          <Badge variant="outline">
            <CalendarClock className="h-3.5 w-3.5" />
            {t("teacher.invites.instanceExpiry", { value: formatDate(instanceExpiry) })}
          </Badge>
          <Badge variant="outline">{formatPrice(publicPrice)}</Badge>
        </div>
        {isFreeAccess && (
          <p className="mt-2 text-sm text-emerald-600">
            {t("teacher.invites.zeroPriceCopy")}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-background p-4">
          <div className="text-xs uppercase text-muted-foreground">
            {t("teacher.invites.totalQuota")}
          </div>
          <div className="mt-2 text-2xl font-semibold">{quota}</div>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="text-xs uppercase text-muted-foreground">
            {t("teacher.invites.usedSeats")}
          </div>
          <div className="mt-2 text-2xl font-semibold">{usedSeats}</div>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="text-xs uppercase text-muted-foreground">
            {t("teacher.invites.remaining")}
          </div>
          <div className="mt-2 text-2xl font-semibold">{remaining}</div>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="text-xs uppercase text-muted-foreground">
            {t("teacher.invites.usedDevices")}
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {usedDevices === null ? t("teacher.invites.notAvailable") : usedDevices}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-4 rounded-lg border bg-background p-4">
          <div>
            <h2 className="font-semibold">{t("teacher.invites.createTitle")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("teacher.invites.createDescription")}
            </p>
          </div>
          <div className="space-y-2">
            <Label>{t("teacher.invites.maxUses")}</Label>
            <Input
              type="number"
              min="1"
              value={form.max_uses}
              onChange={(event) =>
                setForm((current) => ({ ...current, max_uses: event.target.value }))
              }
              placeholder={t("teacher.invites.maxUsesPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("teacher.invites.expiry")}</Label>
            <Input
              type="datetime-local"
              value={form.expires_at}
              onChange={(event) =>
                setForm((current) => ({ ...current, expires_at: event.target.value }))
              }
            />
          </div>
          {!isFreeAccess && <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
            <input
              type="checkbox"
              checked={form.require_passcode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  require_passcode: event.target.checked,
                }))
              }
            />
            <span>{t("teacher.invites.requirePasscode")}</span>
          </label>}
          {!isFreeAccess && form.require_passcode && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("teacher.invites.passcode")}</Label>
                <Input
                  value={form.passcode}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, passcode: event.target.value }))
                  }
                  placeholder={t("teacher.invites.passcodePlaceholder")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("teacher.invites.passcodeGenerateHint")}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{t("teacher.invites.passcodeHint")}</Label>
                <Input
                  value={form.passcode_hint}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, passcode_hint: event.target.value }))
                  }
                  placeholder={t("teacher.invites.passcodeHintPlaceholder")}
                />
              </div>
            </div>
          )}
          <Button onClick={handleCreateInvite} disabled={loading || remaining <= 0} className="w-full">
            <Link2 className="h-4 w-4" />
            {t("teacher.invites.generate")}
          </Button>
          {lastInvite.link && (
            <div className="space-y-3 rounded-md border p-3">
              <div className="text-xs text-muted-foreground">
                {t("teacher.invites.latest")}
              </div>
              <div className="break-all text-sm">{lastInvite.link}</div>
              {latestDisplayPasscode && (
                <div className="rounded-md bg-muted p-2 text-sm">
                  <KeyRound className="me-1 inline h-4 w-4" />
                  {t("teacher.invites.latestPasscode", { value: latestDisplayPasscode })}
                </div>
              )}
              <div className="rounded-md bg-muted p-2 text-xs whitespace-pre-line">
                {latestShareMessage}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => copyText(lastInvite.link)}>
                  <Copy className="h-4 w-4" />
                  {t("teacher.invites.copyLink")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyText(latestShareMessage)}>
                  <Copy className="h-4 w-4" />
                  {t("teacher.invites.copyMessage")}
                </Button>
                {latestDisplayPasscode && (
                  <Button variant="outline" size="sm" onClick={() => copyText(latestDisplayPasscode)}>
                    <KeyRound className="h-4 w-4" />
                    {t("teacher.invites.copyPasscode")}
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(latestShareMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("teacher.invites.whatsapp")}
                  </a>
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border bg-background p-4">
            <h2 className="font-semibold">{t("teacher.invites.linksTitle")}</h2>
            <div className="mt-4 space-y-3">
              {invites.map((invite) => {
                const inviteLink = getInviteLink(invite);
                const invitePasscode = getInvitePasscodeLabel(invite);
                const shareMessage = inviteLink
                  ? buildShareMessage(inviteLink, invitePasscode)
                  : "";
                const inviteRemaining = invite.max_uses
                  ? Math.max(0, numberOrFallback(invite.max_uses) - numberOrFallback(invite.used_count))
                  : null;
                return (
                  <div key={invite.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">
                        {t(`statuses.${invite.status}`, { defaultValue: invite.status })}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisableInvite(invite.id)}
                        disabled={invite.status !== "active"}
                        title={t("teacher.invites.disableInvite")}
                      >
                        <ShieldOff className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div>
                        {invite.max_uses
                          ? t("teacher.invites.usesWithMax", {
                              used: invite.used_count || 0,
                              max: invite.max_uses,
                            })
                          : t("teacher.invites.uses", {
                              used: invite.used_count || 0,
                            })}
                      </div>
                      {inviteRemaining !== null && (
                        <div>{t("teacher.invites.inviteRemaining", { value: inviteRemaining })}</div>
                      )}
                      <div>
                        {t("teacher.invites.inviteExpiry", {
                          value: formatDate(invite.expires_at),
                        })}
                      </div>
                      {invite.passcode_hint && (
                        <div>
                          {t("teacher.invites.passcodeHintDisplay", {
                            value: invite.passcode_hint,
                          })}
                        </div>
                      )}
                    </div>
                    {inviteLink ? (
                      <div className="mt-3 space-y-2">
                        <div className="break-all rounded-md bg-muted p-2 text-xs">{inviteLink}</div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => copyText(inviteLink)}>
                            <Copy className="h-4 w-4" />
                            {t("teacher.invites.copyLink")}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => copyText(shareMessage)}>
                            <Copy className="h-4 w-4" />
                            {t("teacher.invites.copyMessage")}
                          </Button>
                          {invite.passcode && !isFreeAccess && (
                            <Button variant="outline" size="sm" onClick={() => copyText(invite.passcode)}>
                              <KeyRound className="h-4 w-4" />
                              {t("teacher.invites.copyPasscode")}
                            </Button>
                          )}
                          <Button asChild variant="outline" size="sm">
                            <a href={inviteLink} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              {t("common.open")}
                            </a>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <MessageCircle className="h-4 w-4" />
                              {t("teacher.invites.whatsapp")}
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-md bg-muted p-2 text-xs text-muted-foreground">
                        {t("teacher.invites.linkUnavailable")}
                      </div>
                    )}
                  </div>
                );
              })}
              {invites.length === 0 && (
                <div className="rounded-md border p-5 text-center text-sm text-muted-foreground">
                  {t("teacher.invites.emptyLinks")}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <h2 className="font-semibold">{t("teacher.invites.studentsTitle")}</h2>
            <div className="mt-4 space-y-3">
              {students.map((studentAccess) => (
                <div key={studentAccess.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {studentAccess.user?.name || t("common.student")}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {studentAccess.user?.email}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      {t(`statuses.${studentAccess.status}`, {
                        defaultValue: studentAccess.status,
                      })}
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
                  {t("teacher.invites.emptyStudents")}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
