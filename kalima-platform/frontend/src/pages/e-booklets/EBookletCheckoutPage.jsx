import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

const formatMoney = (amount, currency = "EGP") => {
  return new Intl.NumberFormat("en-EG", {
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

function EmptyCheckout() {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center px-4 pt-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
        <BookOpenCheck className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-3xl font-bold tracking-tight">
        Choose an e-booklet before checkout
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        E-booklet checkout is separate from the Market cart and requires one
        selected template.
      </p>
      <Button asChild className="mt-7">
        <Link to="/e-booklets">Browse E-Booklets</Link>
      </Button>
    </main>
  );
}

export default function EBookletCheckoutPage() {
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
      { label: "Template", value: item.title, Icon: FileText },
      { label: "Quantity", value: "1", Icon: ShoppingBag },
      { label: "Access", value: "Invite quota set by admin", Icon: ShieldCheck },
      { label: "Delivery", value: "Manual admin customization", Icon: LockKeyhole },
    ];
  }, [item]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const validate = () => {
    const nextErrors = {};
    requiredFields.forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = "This field is required.";
      }
    });

    if (!item?.template_version_id) {
      setFormError("This e-booklet does not have an active published version.");
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

      setSubmittedPurchase(response?.data || true);
      clear();
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
        "Checkout could not be submitted. Please review the form and try again.",
      );
    }
  };

  if (!item && !submittedPurchase) return <EmptyCheckout />;

  if (submittedPurchase) {
    return (
      <main className="bg-[linear-gradient(180deg,rgba(248,250,252,0.9),#ffffff_42%)] pt-24 text-foreground">
        <section className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center px-4 pb-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <Badge className="mt-6 rounded-md bg-emerald-800 text-white hover:bg-emerald-800">
            Request created
          </Badge>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950">
            Your e-booklet request is pending admin delivery
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Kalima admin will confirm payment, collect or prepare the
            teacher-specific PDF, validate page count, set invite quota, and
            deliver the ready booklet to your account.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/e-booklets">Back to E-Booklets</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/teacher/profile">Open teacher portal</Link>
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
            E-booklet checkout
          </Badge>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
            Branding and delivery details
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            This creates an admin-handled request. The booklet becomes usable
            only after admin payment confirmation and delivery.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Teacher display name"
                helper="Shown in viewer watermarking and invite context."
                error={fieldErrors.teacherName}
              >
                <Input
                  value={form.teacherName}
                  onChange={updateField("teacherName")}
                  placeholder="Mona Abdelrahman"
                  className="h-11"
                />
              </Field>

              <Field
                label="School or center name"
                helper="Optional context for admin delivery."
              >
                <Input
                  value={form.schoolName}
                  onChange={updateField("schoolName")}
                  placeholder="Al Noor Learning Center"
                  className="h-11"
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Branding name on booklet"
                helper="The name that should appear on the customized PDF."
                error={fieldErrors.brandingName}
              >
                <Input
                  value={form.brandingName}
                  onChange={updateField("brandingName")}
                  placeholder="Ms. Mona Arabic"
                  className="h-11"
                />
              </Field>

              <Field
                label="Teacher-specific booklet title"
                helper="Used by admin when delivering the final instance."
                error={fieldErrors.bookletTitle}
              >
                <Input
                  value={form.bookletTitle}
                  onChange={updateField("bookletTitle")}
                  placeholder="Grade 5 Arabic Reading Practice"
                  className="h-11"
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="WhatsApp or contact number"
                helper="Used for manual payment and delivery coordination."
                error={fieldErrors.contactWhatsapp}
              >
                <Input
                  value={form.contactWhatsapp}
                  onChange={updateField("contactWhatsapp")}
                  placeholder="+20 100 482 6194"
                  className="h-11"
                />
              </Field>

              <Field
                label="Logo instructions"
                helper="Paste a logo link or describe what admin should use."
              >
                <Input
                  value={form.logoInstructions}
                  onChange={updateField("logoInstructions")}
                  placeholder="Use my center logo from WhatsApp"
                  className="h-11"
                />
              </Field>
            </div>

            <Field
              label="Notes for admin"
              helper="Include payment reference, preferred watermark name, or delivery details."
            >
              <Textarea
                value={form.notes}
                onChange={updateField("notes")}
                placeholder="Payment will be sent manually. Please use the teacher name in the footer watermark."
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
                <Link to="/e-booklet-cart">Back to cart</Link>
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" />
                {loading ? "Submitting..." : "Submit request"}
              </Button>
            </div>
          </form>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-5 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)]">
          <h2 className="text-xl font-bold tracking-tight">Selected template</h2>
          <div className="mt-4 rounded-md border border-border/70 bg-muted/30 p-4">
            <div className="text-sm font-semibold text-muted-foreground">
              E-booklet template
            </div>
            <div className="mt-1 text-lg font-bold leading-tight">{item.title}</div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-black">{formatMoney(total, currency)}</span>
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
            The teacher-specific PDF is uploaded by admin after checkout. It
            must match the template page count before delivery.
          </div>
        </aside>
      </section>
    </main>
  );
}
