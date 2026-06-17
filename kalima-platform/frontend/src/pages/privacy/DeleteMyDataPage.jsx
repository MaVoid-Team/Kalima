import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWhatsAppContact } from "@/lib/whatsappUtils";

const UPDATED_AT = "17 June 2026";

export default function DeleteMyDataPage() {
  const { t } = useTranslation("landing");
  const { handleWhatsAppContact, loading } = useWhatsAppContact();
  const steps = t("dataDeletion.steps", { returnObjects: true });
  const notes = t("dataDeletion.notes", { returnObjects: true });

  return (
    <section className="bg-background text-foreground">
      <div className="container px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="space-y-4 text-start">
            <p className="text-sm font-medium text-primary">
              {t("dataDeletion.eyebrow")}
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {t("dataDeletion.title")}
            </h1>
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              {t("dataDeletion.intro")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("dataDeletion.lastUpdated", { date: UPDATED_AT })}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-start gap-3 text-start">
              <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {t("dataDeletion.requestTitle")}
                </h2>
                <p className="mt-2 leading-8 text-muted-foreground">
                  {t("dataDeletion.requestBody")}
                </p>
              </div>
            </div>
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleWhatsAppContact("dataDeletion")}
              className="mt-2"
            >
              {loading ? t("dataDeletion.loading") : t("dataDeletion.requestButton")}
            </Button>
          </div>

          <article className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {t("dataDeletion.stepsTitle")}
            </h2>
            <ol className="list-decimal space-y-3 ps-6 leading-8 text-muted-foreground">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {t("dataDeletion.dataTitle")}
            </h2>
            <ul className="list-disc space-y-3 ps-6 leading-8 text-muted-foreground">
              {notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
