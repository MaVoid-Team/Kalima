import { useCallback, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useEBookletCart, useEBookletCheckout } from "@/hooks/useEBooklets";
import api from "@/api/axios";
import { useTranslation } from "react-i18next";

const TERMS_VERSION = "public-checkout-v1";

const normalizePaymentMethods = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.payment_methods)) return payload.payment_methods;
  if (Array.isArray(payload?.methods)) return payload.methods;
  return [];
};

const toCheckoutItem = (item) => ({
  id: item.template_id || item.id,
  name: item.title,
  image: item.coverUrl,
  price: item.price,
  discount: item.discount || 0,
  type: "E-booklet",
});

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
  const formRef = useRef(null);
  const { t } = useTranslation("eBooklets");
  const { items, item, subtotal, discount, total, clear } = useEBookletCart();
  const { submitCheckout, loading } = useEBookletCheckout();
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [numberTransferredFrom, setNumberTransferredFrom] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submittedPurchase, setSubmittedPurchase] = useState(null);
  const [formError, setFormError] = useState(null);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const isPaid = Number(total || 0) > 0;

  const getPaymentMethods = useCallback(async () => {
    if (!isPaid) return [];
    const response = await api.get("/payment-methods");
    return normalizePaymentMethods(response?.data);
  }, [isPaid]);

  const checkoutItems = useMemo(() => items.map(toCheckoutItem), [items]);
  const checkoutPricing = useMemo(() => ({
    subtotal,
    discount,
    total,
  }), [discount, subtotal, total]);

  const validate = () => {
    if (items.some((cartItem) => !cartItem?.template_id)) {
      setFormError(t("checkout.templateMissing", { defaultValue: "Selected e-booklet template is missing." }));
      return false;
    }
    if (items.some((cartItem) => !cartItem?.template_version_id)) {
      setFormError(t("checkout.activeVersionMissing"));
      return false;
    }
    if (!termsAccepted) {
      setFormError(t("checkout.termsRequired", { defaultValue: "Accept the terms before continuing." }));
      return false;
    }
    if (isPaid && (!paymentMethodId || !numberTransferredFrom || !paymentScreenshot || hasValidationErrors)) {
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
      formData.append("items", JSON.stringify(items.map((cartItem) => {
        const payload = {
          template_id: cartItem.template_id,
          template_version_id: cartItem.template_version_id,
        };
        if (cartItem.instance_id) payload.instance_id = cartItem.instance_id;
        return payload;
      })));
      formData.append("terms_accepted", "true");
      formData.append("terms_version", TERMS_VERSION);
      if (notes.trim()) formData.append("notes", notes.trim());
      if (isPaid) {
        formData.append("payment_method_id", String(paymentMethodId));
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

  const submitFromSummary = () => {
    formRef.current?.requestSubmit();
  };

  const submittedPurchaseSerial = submittedPurchase?.purchase_serial || submittedPurchase?.purchaseSerial || submittedPurchase?.serial;
  const submittedPurchaseStatus = submittedPurchase?.status || submittedPurchase?.review_status || submittedPurchase?.reviewStatus;

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
            {t("checkout.purchaseSubmittedDescription", { defaultValue: "We received your payment proof. Track this teacher e-booklet purchase from your e-booklet orders while admin reviews delivery." })}
          </p>
          <div className="mt-6 grid w-full max-w-md gap-3 rounded-2xl border bg-white p-5 text-left shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t("checkout.receiptReference", { defaultValue: "Reference" })}
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-slate-950">
                {submittedPurchaseSerial || t("checkout.referencePending", { defaultValue: "Pending" })}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t("checkout.receiptStatus", { defaultValue: "Status" })}
              </p>
              <Badge variant="outline" className="mt-1 capitalize">
                {submittedPurchaseStatus || t("checkout.statusPendingReview", { defaultValue: "pending_review" })}
              </Badge>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/e-booklet-orders">{t("checkout.openEBookletOrders", { defaultValue: "View e-booklet orders" })}</Link>
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
            {t("checkout.teacherPurchaseTitle", { defaultValue: "Complete your teacher e-booklet purchase" })}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {isPaid
              ? t("checkout.teacherPurchaseDescriptionPaid", { defaultValue: "Upload payment proof so admin can review and deliver this teacher e-booklet purchase." })
              : t("checkout.teacherPurchaseDescriptionFree", { defaultValue: "Accept the terms to place this free teacher e-booklet order." })}
          </p>

          <form ref={formRef} onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <PaymentMethod
              getPaymentMethods={getPaymentMethods}
              selectedId={paymentMethodId}
              onSelect={setPaymentMethodId}
              numberTransferredFrom={numberTransferredFrom}
              setNumberTransferredFrom={setNumberTransferredFrom}
              notes={notes}
              setNotes={setNotes}
              screenshotFile={paymentScreenshot}
              setScreenshotFile={setPaymentScreenshot}
              setValidationErrors={setHasValidationErrors}
              isFreeOrder={!isPaid}
            />

            <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
              <input type="checkbox" className="mt-1" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
              <span>{t("checkout.terms", { defaultValue: "I accept the e-booklet purchase terms and understand student access is delivered separately through private URL and access code." })}</span>
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loading
                  ? t("checkout.submitting")
                  : isPaid
                    ? t("checkout.submitForReview", { defaultValue: "Submit purchase for review" })
                    : t("checkout.unlockFree", { defaultValue: "Place free order" })}
              </Button>
            </div>
          </form>
        </div>

        <aside className="h-fit">
          <OrderSummary
            items={checkoutItems}
            pricing={checkoutPricing}
            onPay={submitFromSummary}
          />
          <div className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
            {isPaid
              ? t("checkout.pendingApprovalNotice", { defaultValue: "Paid teacher e-booklet purchases are reviewed by admin before delivery. Student access is issued separately through a private URL and access code." })
              : t("checkout.freeAccessNotice", { defaultValue: "This teacher e-booklet is free. Placing the order records the teacher purchase; student access is issued separately through a private URL and access code." })}
          </div>
        </aside>
      </section>
    </main>
  );
}
