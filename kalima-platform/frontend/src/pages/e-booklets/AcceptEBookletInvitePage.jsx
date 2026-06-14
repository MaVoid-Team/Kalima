import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpenCheck, CreditCard, KeyRound, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStudentEBooklets } from "@/hooks/useEBookletAccess";
import useAuth from "@/hooks/auth/useAuth";
import api from "@/api/axios";
import { useTranslation } from "react-i18next";

const TERMS_VERSION = "e-booklet-invite-v1";

const normalizePaymentMethods = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.payment_methods)) return payload.payment_methods;
  if (Array.isArray(payload?.methods)) return payload.methods;
  return [];
};

export default function AcceptEBookletInvitePage() {
  const { t } = useTranslation("eBooklets");
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth() || {};
  const { acceptInvite, openInvite } = useStudentEBooklets();
  const [state, setState] = useState({ status: "idle", message: "" });
  const [passcode, setPasscode] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [numberTransferredFrom, setNumberTransferredFrom] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (!token) return;
    openInvite(token).catch(() => {});
  }, [openInvite, token]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    api.get("/payment-methods")
      .then((response) => {
        if (!active) return;
        const methods = normalizePaymentMethods(response?.data);
        setPaymentMethods(methods);
        if (methods[0]?.id) setPaymentMethodId(String(methods[0].id));
      })
      .catch(() => {
        if (active) setPaymentMethods([]);
      });
    return () => { active = false; };
  }, [isAuthenticated]);

  const submit = async (accessPath) => {
    if (!termsAccepted) {
      setState({ status: "error", message: t("inviteAccept.termsRequired") });
      return;
    }
    if (accessPath === "online_purchase" && (!paymentMethodId || !numberTransferredFrom || !paymentScreenshot)) {
      setState({
        status: "error",
        message: t("inviteAccept.paymentRequired", { defaultValue: "Choose a payment method, enter the number you paid from, and upload the payment proof." }),
      });
      return;
    }
    setState({ status: "loading", message: "" });
    try {
      let payload;
      if (accessPath === "online_purchase") {
        payload = new FormData();
        payload.append("accessPath", "online_purchase");
        payload.append("termsAccepted", "true");
        payload.append("termsVersion", TERMS_VERSION);
        payload.append("payment_method_id", paymentMethodId);
        payload.append("numberTransferredFrom", numberTransferredFrom.trim());
        if (notes.trim()) payload.append("notes", notes.trim());
        payload.append("paymentScreenshot", paymentScreenshot);
      } else {
        payload = {
          accessPath,
          termsAccepted: true,
          termsVersion: TERMS_VERSION,
        };
        if (accessPath === "offline_passcode") payload.passcode = passcode;
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
        <section className="space-y-3 rounded-lg border bg-background p-4"><h2 className="flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4" />{t("inviteAccept.purchaseTitle")}</h2><p className="text-sm text-muted-foreground">{t("inviteAccept.purchaseDescription")}</p><div className="rounded-md bg-muted p-2 text-xs text-muted-foreground">{t("inviteAccept.internalPriceHidden")}</div><Label>{t("inviteAccept.paymentMethod", { defaultValue: "Payment method" })}</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={paymentMethodId} onChange={(event) => setPaymentMethodId(event.target.value)}><option value="">{t("inviteAccept.selectPaymentMethod", { defaultValue: "Select payment method" })}</option>{paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name || method.title || method.phone_number || `#${method.id}`}</option>)}</select><Label>{t("inviteAccept.numberTransferredFrom", { defaultValue: "Number transferred from" })}</Label><Input value={numberTransferredFrom} onChange={(event) => setNumberTransferredFrom(event.target.value)} placeholder={t("inviteAccept.numberTransferredFromPlaceholder", { defaultValue: "Your wallet/mobile number" })} /><Label>{t("inviteAccept.paymentScreenshot", { defaultValue: "Payment proof screenshot" })}</Label><Input type="file" accept="image/*" onChange={(event) => setPaymentScreenshot(event.target.files?.[0] || null)} /><Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={t("inviteAccept.notesPlaceholder", { defaultValue: "Optional notes for the admin" })} /><Button className="w-full" variant="outline" onClick={() => submit("online_purchase")} disabled={state.status === "loading" || !paymentMethodId || !numberTransferredFrom || !paymentScreenshot}>{state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{t("inviteAccept.requestOnlinePurchase")}</Button><Button className="w-full" variant="outline" onClick={() => submit("free")} disabled={state.status === "loading"}>{t("inviteAccept.acceptFree")}</Button></section>
      </div>
      <label className="flex items-start gap-2 rounded-md border p-3 text-sm"><input type="checkbox" className="mt-1" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /><span>{t("inviteAccept.terms")}</span></label>
      {state.message && <div className={`rounded-md border p-3 text-sm ${state.status === "error" ? "text-destructive" : "text-emerald-700"}`}>{state.message}</div>}
      {state.status === "success" && <Button asChild><Link to="/student/e-booklets">{t("inviteAccept.openMyEBooklets")}</Link></Button>}
    </div>
  );
}
