import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpenCheck, CreditCard, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentEBooklets } from "@/hooks/useEBookletAccess";
import useAuth from "@/hooks/auth/useAuth";
import { useTranslation } from "react-i18next";

const TERMS_VERSION = "e-booklet-invite-v1";

export default function AcceptEBookletInvitePage() {
  const { t } = useTranslation("eBooklets");
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth() || {};
  const { acceptInvite, openInvite } = useStudentEBooklets();
  const [state, setState] = useState({ status: "idle", message: "" });
  const [passcode, setPasscode] = useState("");
  const [purchaseId, setPurchaseId] = useState("");
  const [paymentProofFileId, setPaymentProofFileId] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (!token) return;
    openInvite(token).catch(() => {});
  }, [openInvite, token]);


  const submit = async (accessPath) => {
    if (!termsAccepted) {
      setState({ status: "error", message: t("inviteAccept.termsRequired") });
      return;
    }
    setState({ status: "loading", message: "" });
    try {
      const payload = {
        accessPath,
        termsAccepted: true,
        termsVersion: TERMS_VERSION,
      };
      if (accessPath === "offline_passcode") payload.passcode = passcode;
      if (accessPath === "online_purchase") {
        payload.purchaseId = Number(purchaseId);
        if (paymentProofFileId) payload.paymentProofFileId = Number(paymentProofFileId);
      }
      const response = await acceptInvite(token, payload);
      const instanceId = response?.data?.bookletInstanceId || response?.data?.booklet_instance_id;
      if (accessPath === "online_purchase") {
        setState({ status: "success", message: t("inviteAccept.purchaseSubmitted") });
        return;
      }
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
        <h1 className="mt-4 text-2xl font-bold">{t("inviteAccept.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("inviteAccept.loginRequired")}</p>
        <div className="mt-5 flex gap-2"><Button asChild><Link to={`/login?redirect=${encodeURIComponent(`/e-booklet-invite/${token}`)}`}>{t("inviteAccept.login")}</Link></Button><Button asChild variant="outline"><Link to={`/signup?redirect=${encodeURIComponent(`/e-booklet-invite/${token}`)}`}>{t("inviteAccept.register")}</Link></Button></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-10" data-testid="accept-e-booklet-invite-page">
      <div className="text-center"><BookOpenCheck className="mx-auto h-12 w-12 text-primary" /><h1 className="mt-4 text-2xl font-bold">{t("inviteAccept.title")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("inviteAccept.description")}</p></div>
      <div className="rounded-lg border bg-amber-50 p-3 text-sm text-amber-900">{t("inviteAccept.metadataUnavailable")}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-3 rounded-lg border bg-background p-4"><h2 className="flex items-center gap-2 font-semibold"><KeyRound className="h-4 w-4" />{t("inviteAccept.offlineTitle")}</h2><p className="text-sm text-muted-foreground">{t("inviteAccept.offlineDescription")}</p><Label>{t("inviteAccept.passcode")}</Label><Input value={passcode} onChange={(event) => setPasscode(event.target.value)} placeholder={t("inviteAccept.passcodePlaceholder")} /><Button className="w-full" onClick={() => submit("offline_passcode")} disabled={state.status === "loading" || !passcode}>{state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}{t("inviteAccept.unlockWithPasscode")}</Button></section>
        <section className="space-y-3 rounded-lg border bg-background p-4"><h2 className="flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4" />{t("inviteAccept.purchaseTitle")}</h2><p className="text-sm text-muted-foreground">{t("inviteAccept.purchaseDescription")}</p><div className="rounded-md bg-muted p-2 text-xs text-muted-foreground">{t("inviteAccept.internalPriceHidden")}</div><Label>{t("inviteAccept.purchaseId", { defaultValue: "Purchase ID" })}</Label><Input inputMode="numeric" value={purchaseId} onChange={(event) => setPurchaseId(event.target.value)} placeholder={t("inviteAccept.purchaseIdPlaceholder", { defaultValue: "Enter your submitted purchase ID" })} /><Label>{t("inviteAccept.paymentProofFileId", { defaultValue: "Payment proof file ID" })}</Label><Input inputMode="numeric" value={paymentProofFileId} onChange={(event) => setPaymentProofFileId(event.target.value)} placeholder={t("inviteAccept.paymentProofFileIdPlaceholder", { defaultValue: "Optional when already attached to purchase" })} /><Button className="w-full" variant="outline" onClick={() => submit("online_purchase")} disabled={state.status === "loading" || !purchaseId}>{t("inviteAccept.requestOnlinePurchase")}</Button><Button className="w-full" variant="outline" onClick={() => submit("free")} disabled={state.status === "loading"}>{t("inviteAccept.acceptFree")}</Button></section>
      </div>
      <label className="flex items-start gap-2 rounded-md border p-3 text-sm"><input type="checkbox" className="mt-1" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span>{t("inviteAccept.terms")}</span></label>
      {state.message && <div className={`rounded-md border p-3 text-sm ${state.status === "error" ? "text-destructive" : "text-emerald-700"}`}>{state.message}</div>}
      {state.status === "success" && <Button asChild><Link to="/student/e-booklets">{t("inviteAccept.openMyEBooklets")}</Link></Button>}
    </div>
  );
}
