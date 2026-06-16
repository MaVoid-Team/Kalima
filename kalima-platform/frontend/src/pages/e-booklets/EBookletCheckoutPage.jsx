import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useEBookletCart, useEBookletCheckout } from "@/hooks/useEBooklets";
import api from "@/api/axios";
import { useTranslation } from "react-i18next";

const TERMS_VERSION = "public-checkout-v1";

const formatMoney = (amount, currency = "EGP", language = "en") => {
  return new Intl.NumberFormat(language?.startsWith("ar") ? "ar-EG" : "en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const normalizePaymentMethods = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.payment_methods)) return payload.payment_methods;
  if (Array.isArray(payload?.methods)) return payload.methods;
  return [];
};

function EmptyCheckout({ t }) {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center px-4 pt-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
        <BookOpenCheck className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        {t("checkout.emptyTitle")}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t("checkout.emptyDescription")}
      </p>
      <Button asChild className="mt-7">
        <Link to="/e-booklets">{t("common.browse")}</Link>
      </Button>
    </main>
  );
}

export default function EBookletCheckoutPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("eBooklets");
  const { item, total, currency, clear } = useEBookletCart();
  const { submitCheckout, loading } = useEBookletCheckout();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [numberTransferredFrom, setNumberTransferredFrom] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submittedPurchase, setSubmittedPurchase] = useState(null);
  const [formError, setFormError] = useState(null);

  const isPaid = Number(total || 0) > 0;

  useEffect(() => {
    if (!isPaid) return;
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
  }, [isPaid]);

  const summary = useMemo(() => {
    if (!item) return [];
    return [
      { label: t("checkout.summary.template"), value: item.title, Icon: FileText },
      { label: t("common.access"), value: t("checkout.summary.accessValue"), Icon: ShieldCheck },
      { label: t("common.price"), value: formatMoney(total, currency, i18n.language), Icon: CreditCard },
    ];
  }, [currency, i18n.language, item, t, total]);

  const validate = () => {
    if (!item?.instance_id) {
      setFormError(t("checkout.instanceMissing", { defaultValue: "Selected e-booklet instance is missing." }));
      return false;
    }
    if (!item?.template_version_id) {
      setFormError(t("checkout.activeVersionMissing"));
      return false;
    }
    if (!termsAccepted) {
      setFormError(t("checkout.termsRequired", { defaultValue: "Accept the terms before continuing." }));
      return false;
    }
    if (isPaid && (!paymentMethodId || !numberTransferredFrom || !paymentScreenshot)) {
      setFormError(t("checkout.paymentRequired", { defaultValue: "Choose a payment method, enter the number you paid from, and upload payment proof." }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("instance_id", String(item.instance_id || item.id));
      formData.append("template_id", String(item.template_id));
      formData.append("template_version_id", String(item.template_version_id));
      formData.append("terms_accepted", "true");
      formData.append("terms_version", TERMS_VERSION);
      if (notes.trim()) formData.append("notes", notes.trim());
      if (isPaid) {
        formData.append("payment_method_id", paymentMethodId);
        formData.append("numberTransferredFrom", numberTransferredFrom.trim());
        formData.append("paymentScreenshot", paymentScreenshot);
      }
      const response = await submitCheckout(formData);
      const result = response?.data || true;
      setSubmittedPurchase(result);
      clear();
      if (result?.next_url) {
        navigate(result.next_url, { replace: true });
      }
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
        t("checkout.submitError"),
      );
    }
  };

  if (!item && !submittedPurchase) return <EmptyCheckout t={t} />;

  if (submittedPurchase) {
    return (
      <main className="bg-[linear-gradient(180deg,rgba(248,250,252,0.9),#ffffff_42%)] pt-24 text-foreground">
        <section className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center px-4 pb-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <Badge className="mt-6 rounded-md bg-emerald-800 text-white hover:bg-emerald-800">
            {t("checkout.successBadge")}
          </Badge>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">
            {t("checkout.purchaseSubmittedTitle", { defaultValue: "Purchase submitted for review" })}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            {t("checkout.purchaseSubmittedDescription", { defaultValue: "We received your payment proof. Your e-booklet access will appear in your student library after admin approval." })}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/student/e-booklets">{t("checkout.openStudentLibrary", { defaultValue: "Open my e-booklets" })}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/e-booklets">{t("common.backToEBooklets")}</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[linear-gradient(180deg,rgba(248,250,252,0.9),#ffffff_42%)] pt-24 text-foreground">
      <section className="mx-auto grid max-w-[1200px] gap-8 px-4 pb-20 pt-10 md:grid-cols-[1fr_380px] md:px-6">
        <div>
          <Badge className="rounded-md bg-emerald-800 text-white hover:bg-emerald-800">
            {t("checkout.badge")}
          </Badge>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
            {t("checkout.studentTitle", { defaultValue: "Complete your e-booklet purchase" })}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {isPaid
              ? t("checkout.studentDescriptionPaid", { defaultValue: "Upload your payment proof so the admin can approve access to this teacher e-booklet instance." })
              : t("checkout.studentDescriptionFree", { defaultValue: "Accept the terms to unlock this free e-booklet instance." })}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            {isPaid && (
              <section className="grid gap-4 rounded-lg border bg-background p-4">
                <h2 className="flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4" />{t("checkout.paymentTitle", { defaultValue: "Payment proof" })}</h2>
                <label className="grid gap-2 text-sm font-medium">
                  {t("checkout.paymentMethod", { defaultValue: "Payment method" })}
                  <select className="h-11 rounded-md border bg-background px-3 text-sm" value={paymentMethodId} onChange={(event) => setPaymentMethodId(event.target.value)}>
                    <option value="">{t("checkout.selectPaymentMethod", { defaultValue: "Select payment method" })}</option>
                    {paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name || method.title || method.phone_number || `#${method.id}`}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  {t("checkout.numberTransferredFrom", { defaultValue: "Number transferred from" })}
                  <Input value={numberTransferredFrom} onChange={(event) => setNumberTransferredFrom(event.target.value)} placeholder={t("checkout.numberTransferredFromPlaceholder", { defaultValue: "Your wallet/mobile number" })} />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  {t("checkout.paymentScreenshot", { defaultValue: "Payment proof screenshot" })}
                  <Input type="file" accept="image/*" onChange={(event) => setPaymentScreenshot(event.target.files?.[0] || null)} />
                </label>
              </section>
            )}

            <label className="grid gap-2 text-sm font-medium">
              {t("checkout.fields.notes")}
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={t("checkout.fields.notesPlaceholder")} className="min-h-28 resize-y" />
            </label>

            <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
              <input type="checkbox" className="mt-1" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
              <span>{t("checkout.terms", { defaultValue: "I accept the e-booklet access terms and understand access is tied to my student account." })}</span>
            </label>

            {formError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="outline">
                <Link to="/e-booklet-cart">{t("checkout.backToCart")}</Link>
              </Button>
              <Button type="submit" size="lg" disabled={loading} className="active:scale-[0.98]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {loading
                  ? t("checkout.submitting")
                  : isPaid
                    ? t("checkout.submitForReview", { defaultValue: "Submit purchase for review" })
                    : t("checkout.unlockFree", { defaultValue: "Get access" })}
              </Button>
            </div>
          </form>
        </div>

        <aside className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">{t("checkout.summary.title")}</h2>
          <div className="mt-5 grid gap-4">
            {summary.map(({ label, value, Icon }) => (
              <div key={label} className="flex gap-3 rounded-lg bg-muted/50 p-3">
                <Icon className="mt-0.5 h-4 w-4 text-emerald-800" />
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
                  <div className="text-sm font-semibold text-foreground">{value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
            {isPaid
              ? t("checkout.pendingApprovalNotice", { defaultValue: "Paid e-booklet purchases are reviewed by the admin before student access is activated." })
              : t("checkout.freeAccessNotice", { defaultValue: "This e-booklet is free. Access is activated immediately after you accept the terms." })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
            <span className="font-semibold">{t("common.total")}</span>
            <span className="text-xl font-black text-slate-950">{formatMoney(total, currency, i18n.language)}</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
