import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpenCheck, CheckCircle2, KeyRound, Loader2, Search, Ticket, UserRound } from "lucide-react";
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
  const { acceptInvite, openInvite, previewAccessCode, redeemAccessCode } = useStudentEBooklets();
  const [state, setState] = useState({ status: "idle", message: "" });
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(null);
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
    if (!preview || preview?.code !== trimmedCode) {
      setState({ status: "error", message: t("inviteAccept.codeRedemption.previewRequired") });
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

  const previewCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setPreview(null);
      setState({ status: "error", message: t("inviteAccept.codeRedemption.codeRequired") });
      return;
    }
    setState({ status: "loading", message: "" });
    try {
      const response = await previewAccessCode(trimmedCode);
      const data = normalizeRedemptionPayload(response?.data ?? response);
      setPreview({ ...data, code: trimmedCode });
      setState({ status: "idle", message: "" });
    } catch (error) {
      setPreview(null);
      setState({ status: "error", message: error?.response?.data?.message || t("inviteAccept.codeRedemption.previewError") });
    }
  };

  const updateCode = (event) => {
    setCode(event.target.value.toUpperCase());
    setPreview(null);
    if (state.status === "error") setState({ status: "idle", message: "" });
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
          <Input value={code} onChange={updateCode} placeholder={t("inviteAccept.codeRedemption.codePlaceholder")} dir="ltr" className="font-mono tracking-wide" />
          <Button className="w-full" type="button" variant="outline" onClick={previewCode} disabled={state.status === "loading" || !code.trim()}>
            {state.status === "loading" && !preview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {t("inviteAccept.codeRedemption.checkDetails")}
          </Button>
          {preview && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4" data-testid="e-booklet-code-redemption-preview">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">{t("inviteAccept.codeRedemption.confirmTitle")}</p>
                  <h3 className="mt-1 text-lg font-semibold">{preview?.eBooklet?.title || t("common.eBooklet")}</h3>
                </div>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary">{preview?.kind === "paid" ? t("inviteAccept.codeRedemption.paidCode") : t("inviteAccept.codeRedemption.freeCode")}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-background p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5" />{t("common.teacher")}</div>
                  <div className="mt-1 font-semibold">{preview?.teacher?.name || "-"}</div>
                  {preview?.teacher?.phone && <div className="mt-1 text-xs text-muted-foreground" dir="ltr">{preview.teacher.phone}</div>}
                </div>
                <div className="rounded-md bg-background p-3">
                  <div className="text-xs text-muted-foreground">{t("inviteAccept.codeRedemption.price")}</div>
                  <div className="mt-1 font-semibold">{preview?.eBooklet?.studentMarketingPrice ? `${preview.eBooklet.studentMarketingPrice} ${t("common.currencyEGP")}` : t("inviteAccept.codeRedemption.freeIncluded")}</div>
                </div>
                <div className="rounded-md bg-background p-3">
                  <div className="text-xs text-muted-foreground">{t("inviteAccept.codeRedemption.expiresAt")}</div>
                  <div className="mt-1 font-semibold">{preview?.expiresAt ? new Date(preview.expiresAt).toLocaleDateString() : t("inviteAccept.codeRedemption.noExpiry")}</div>
                </div>
                <div className="rounded-md bg-background p-3">
                  <div className="text-xs text-muted-foreground">{t("inviteAccept.codeRedemption.remainingUses")}</div>
                  <div className="mt-1 font-semibold">{preview?.alreadyRedeemedByCurrentStudent ? t("inviteAccept.codeRedemption.alreadyRedeemedByYou") : `${preview?.remainingRedemptions ?? 0} / ${preview?.maxRedemptions ?? 1}`}</div>
                </div>
              </div>
              <div className="rounded-md bg-background p-3 text-sm text-muted-foreground">{preview?.eBooklet?.description || t("inviteAccept.codeRedemption.confirmDescription")}</div>
            </div>
          )}
          <Button className="w-full" onClick={submitCode} disabled={state.status === "loading" || !preview?.canRedeem}>
            {state.status === "loading" && preview ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
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
