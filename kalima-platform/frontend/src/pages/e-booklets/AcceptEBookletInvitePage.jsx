import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpenCheck, KeyRound, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentEBooklets } from "@/hooks/useEBookletAccess";
import useAuth from "@/hooks/auth/useAuth";
import { useTranslation } from "react-i18next";

const TERMS_VERSION = "e-booklet-invite-v1";

const normalizeRedemptionPayload = (payload) => payload?.data && !Array.isArray(payload.data) ? payload.data : payload;
const redemptionInstanceId = (payload) => {
  const result = normalizeRedemptionPayload(payload);
  return result?.bookletInstanceId || result?.booklet_instance_id || result?.bookletInstance?.id || result?.booklet_instance?.id;
};
const redemptionCountedForProgress = (payload) => {
  const result = normalizeRedemptionPayload(payload);
  return Boolean(result?.countedForProgress ?? result?.counted_for_progress);
};

export default function AcceptEBookletInvitePage({ mode = "invite" }) {
  const { t } = useTranslation("eBooklets");
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth() || {};
  const { acceptInvite, openInvite, redeemAccessCode } = useStudentEBooklets();
  const [state, setState] = useState({ status: "idle", message: "" });
  const [code, setCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const isCodeMode = mode === "code";
  const loginRedirect = isCodeMode ? "/e-booklet-code" : `/e-booklet-invite/${token}`;

  useEffect(() => {
    if (!token || isCodeMode) return;
    openInvite(token).catch(() => {});
  }, [isCodeMode, openInvite, token]);

  const requireTerms = () => {
    if (termsAccepted) return false;
    setState({ status: "error", message: t("inviteAccept.termsRequired") });
    return true;
  };

  const submitCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setState({ status: "error", message: t("inviteAccept.codeRedemption.codeRequired") });
      return;
    }
    if (requireTerms()) return;
    setState({ status: "loading", message: "" });
    try {
      const response = await redeemAccessCode(trimmedCode, TERMS_VERSION);
      const result = normalizeRedemptionPayload(response?.data ?? response);
      const instanceId = redemptionInstanceId(result);
      if (instanceId) {
        navigate(`/student/e-booklets/${instanceId}`, { replace: true });
        return;
      }
      setState({
        status: "success",
        message: redemptionCountedForProgress(result)
          ? t("inviteAccept.codeRedemption.paidSuccess")
          : t("inviteAccept.codeRedemption.freeAccessNoPaidProgressSuccess"),
      });
    } catch (error) {
      setState({ status: "error", message: error?.response?.data?.message || t("inviteAccept.codeRedemption.error") });
    }
  };

  const submit = async (accessPath) => {
    if (requireTerms()) return;
    setState({ status: "loading", message: "" });
    try {
      const payload = { accessPath, termsAccepted: true, termsVersion: TERMS_VERSION };
      if (accessPath === "offline_passcode") payload.passcode = passcode;
      const response = await acceptInvite(token, payload);
      const instanceId = redemptionInstanceId(response?.data);
      if (instanceId) navigate(`/student/e-booklets/${instanceId}`, { replace: true });
      else setState({ status: "success", message: t("inviteAccept.accepted") });
    } catch (error) {
      setState({ status: "error", message: error?.response?.data?.message || t("inviteAccept.error") });
    }
  };

  if (authLoading) {
    return <div className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center text-sm text-muted-foreground"><Loader2 className="me-2 h-4 w-4 animate-spin" />{t("inviteAccept.loading")}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <BookOpenCheck className="h-12 w-12 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">{isCodeMode ? t("inviteAccept.codeRedemption.title") : t("inviteAccept.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("inviteAccept.loginRequired")}</p>
        <div className="mt-5 flex gap-2">
          <Button asChild><Link to={`/login?redirect=${encodeURIComponent(loginRedirect)}`}>{t("inviteAccept.login")}</Link></Button>
          <Button asChild variant="outline"><Link to={`/signup?redirect=${encodeURIComponent(loginRedirect)}`}>{t("inviteAccept.register")}</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-10" data-testid="accept-e-booklet-invite-page">
      <div className="text-center">
        <BookOpenCheck className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">{isCodeMode ? t("inviteAccept.codeRedemption.title") : t("inviteAccept.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{isCodeMode ? t("inviteAccept.codeRedemption.description") : t("inviteAccept.description")}</p>
      </div>

      {isCodeMode ? (
        <section className="space-y-3 rounded-lg border bg-background p-4" data-testid="e-booklet-code-redemption-form">
          <h2 className="flex items-center gap-2 font-semibold"><Ticket className="h-4 w-4" />{t("inviteAccept.codeRedemption.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("inviteAccept.codeRedemption.helper")}</p>
          <Label>{t("inviteAccept.codeRedemption.codeLabel")}</Label>
          <Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder={t("inviteAccept.codeRedemption.codePlaceholder")} />
          <Button className="w-full" onClick={submitCode} disabled={state.status === "loading" || !code.trim()}>
            {state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
            {t("inviteAccept.codeRedemption.submit")}
          </Button>
        </section>
      ) : (
        <>
          <div className="rounded-lg border bg-amber-50 p-3 text-sm text-amber-900">{t("inviteAccept.metadataUnavailable")}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <section className="space-y-3 rounded-lg border bg-background p-4">
              <h2 className="flex items-center gap-2 font-semibold"><KeyRound className="h-4 w-4" />{t("inviteAccept.offlineTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("inviteAccept.offlineDescription")}</p>
              <Label>{t("inviteAccept.passcode")}</Label>
              <Input value={passcode} onChange={(event) => setPasscode(event.target.value)} placeholder={t("inviteAccept.passcodePlaceholder")} />
              <Button className="w-full" onClick={() => submit("offline_passcode")} disabled={state.status === "loading" || !passcode}>{state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}{t("inviteAccept.unlockWithPasscode")}</Button>
            </section>
            <section className="space-y-3 rounded-lg border bg-background p-4">
              <h2 className="flex items-center gap-2 font-semibold"><Ticket className="h-4 w-4" />{t("inviteAccept.teacherCodeTitle")}</h2>
              <p className="text-sm text-muted-foreground">{t("inviteAccept.teacherCodeDescription")}</p>
              <div className="rounded-md bg-muted p-2 text-xs text-muted-foreground">{t("inviteAccept.directPurchaseDisabled")}</div>
              <Button asChild className="w-full" variant="outline"><Link to="/e-booklet-code">{t("inviteAccept.openCodeRedemption")}</Link></Button>
              <Button className="w-full" onClick={() => submit("free")} disabled={state.status === "loading"}>{t("inviteAccept.acceptFree")}</Button>
            </section>
          </div>
        </>
      )}

      <label className="flex items-start gap-2 rounded-md border p-3 text-sm"><input type="checkbox" className="mt-1" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span>{t("inviteAccept.terms")}</span></label>
      {state.message && <div className={`rounded-md border p-3 text-sm ${state.status === "error" ? "text-destructive" : "text-emerald-700"}`}>{state.message}</div>}
      {state.status === "success" && <Button asChild><Link to="/student/e-booklets">{t("inviteAccept.openMyEBooklets")}</Link></Button>}
    </div>
  );
}
