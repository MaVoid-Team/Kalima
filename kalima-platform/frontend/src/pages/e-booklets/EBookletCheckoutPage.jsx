import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  CheckCircle2,
  FileText,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useEBookletCart, useEBookletCheckout } from "@/hooks/useEBooklets";
import { useTranslation } from "react-i18next";

const formatMoney = (amount, currency = "EGP", language = "en") => {
  return new Intl.NumberFormat(language?.startsWith("ar") ? "ar-EG" : "en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const requiredFields = [
  "teacherName",
  "brandingName",
  "bookletTitle",
  "contactWhatsapp",
];

function Field({ label, helper, error, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {helper && !error && (
        <span className="text-xs leading-5 text-muted-foreground">{helper}</span>
      )}
      {error && (
        <span className="text-xs font-medium text-destructive">{error}</span>
      )}
    </label>
  );
}

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
  const [submittedPurchase, setSubmittedPurchase] = useState(null);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    teacherName: "",
    schoolName: "",
    brandingName: "",
    bookletTitle: "",
    logoInstructions: "",
    contactWhatsapp: "",
    notes: "",
  });

  const summary = useMemo(() => {
    if (!item) return [];
    return [
      { label: t("checkout.summary.template"), value: item.title, Icon: FileText },
      { label: t("common.quantity"), value: "1", Icon: ShoppingBag },
      { label: t("common.access"), value: t("checkout.summary.accessValue"), Icon: ShieldCheck },
      { label: t("common.delivery"), value: t("checkout.summary.deliveryValue"), Icon: LockKeyhole },
    ];
  }, [item, t]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const validate = () => {
    const nextErrors = {};
    requiredFields.forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = t("checkout.fieldRequired");
      }
    });

    if (!item?.template_version_id) {
      setFormError(t("checkout.activeVersionMissing"));
      return false;
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (!validate()) return;

    try {
      const response = await submitCheckout({
        instance_id: Number(item.instance_id || item.id),
        template_id: Number(item.template_id),
        template_version_id: Number(item.template_version_id),
        price: Number(item.price || 0),
        currency: item.currency || "EGP",
        contact_whatsapp: form.contactWhatsapp.trim(),
        notes: form.notes.trim() || undefined,
        branding_json: {
          teacherName: form.teacherName.trim(),
          schoolName: form.schoolName.trim(),
          brandingName: form.brandingName.trim(),
          bookletTitle: form.bookletTitle.trim(),
          logoInstructions: form.logoInstructions.trim(),
          contactWhatsapp: form.contactWhatsapp.trim(),
        },
      });

      const result = response?.data || true;
      setSubmittedPurchase(result);
      clear();
      if (result?.next_url) {
        navigate(result.next_url);
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
            {t("checkout.successTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            {t("checkout.successDescription")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/e-booklets">{t("common.backToEBooklets")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/teacher/profile">{t("checkout.openTeacherPortal")}</Link>
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
            {t("checkout.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("checkout.description")}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label={t("checkout.fields.teacherName")}
                helper={t("checkout.fields.teacherNameHelper")}
                error={fieldErrors.teacherName}
              >
                <Input
                  value={form.teacherName}
                  onChange={updateField("teacherName")}
                  placeholder={t("checkout.fields.teacherNamePlaceholder")}
                  className="h-11"
                />
              </Field>

              <Field
                label={t("checkout.fields.schoolName")}
                helper={t("checkout.fields.schoolNameHelper")}
              >
                <Input
                  value={form.schoolName}
                  onChange={updateField("schoolName")}
                  placeholder={t("checkout.fields.schoolNamePlaceholder")}
                  className="h-11"
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label={t("checkout.fields.brandingName")}
                helper={t("checkout.fields.brandingNameHelper")}
                error={fieldErrors.brandingName}
              >
                <Input
                  value={form.brandingName}
                  onChange={updateField("brandingName")}
                  placeholder={t("checkout.fields.brandingNamePlaceholder")}
                  className="h-11"
                />
              </Field>

              <Field
                label={t("checkout.fields.bookletTitle")}
                helper={t("checkout.fields.bookletTitleHelper")}
                error={fieldErrors.bookletTitle}
              >
                <Input
                  value={form.bookletTitle}
                  onChange={updateField("bookletTitle")}
                  placeholder={t("checkout.fields.bookletTitlePlaceholder")}
                  className="h-11"
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label={t("checkout.fields.contactWhatsapp")}
                helper={t("checkout.fields.contactWhatsappHelper")}
                error={fieldErrors.contactWhatsapp}
              >
                <Input
                  value={form.contactWhatsapp}
                  onChange={updateField("contactWhatsapp")}
                  placeholder={t("checkout.fields.contactWhatsappPlaceholder")}
                  className="h-11"
                />
              </Field>

              <Field
                label={t("checkout.fields.logoInstructions")}
                helper={t("checkout.fields.logoInstructionsHelper")}
              >
                <Input
                  value={form.logoInstructions}
                  onChange={updateField("logoInstructions")}
                  placeholder={t("checkout.fields.logoInstructionsPlaceholder")}
                  className="h-11"
                />
              </Field>
            </div>

            <Field
              label={t("checkout.fields.notes")}
              helper={t("checkout.fields.notesHelper")}
            >
              <Textarea
                value={form.notes}
                onChange={updateField("notes")}
                placeholder={t("checkout.fields.notesPlaceholder")}
                className="min-h-32 resize-y"
              />
            </Field>

            {formError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="outline">
                <Link to="/e-booklet-cart">{t("checkout.backToCart")}</Link>
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                {loading ? t("checkout.submitting") : t("checkout.submit")}
              </Button>
            </div>
          </form>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
          <h2 className="text-xl font-bold tracking-tight">{t("checkout.selectedTemplate")}</h2>
          <div className="mt-4 rounded-md border border-border/70 bg-muted/30 p-4">
            <div className="text-sm font-semibold text-muted-foreground">
              {t("common.eBooklet")} {t("common.template")}
            </div>
            <div className="mt-1 text-lg font-bold leading-tight">{item.title}</div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">{t("common.total")}</span>
              <span className="text-xl font-black">
                {formatMoney(total, currency, i18n.language)}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {summary.map(({ label, value, Icon }) => (
              <div key={label} className="flex gap-3 rounded-md border border-border/70 p-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </div>
                  <div className="text-sm font-medium leading-5">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-md border border-amber-500/30 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            {t("checkout.teacherPdfNotice")}
          </div>
        </aside>
      </section>
    </main>
  );
}
