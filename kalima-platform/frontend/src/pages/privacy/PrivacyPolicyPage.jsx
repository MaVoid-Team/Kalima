import { useTranslation } from "react-i18next";

const UPDATED_AT = "17 June 2026";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation("landing");
  const sections = t("privacyPolicy.sections", { returnObjects: true });

  return (
    <section className="bg-background text-foreground">
      <div className="container px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="space-y-4 text-start">
            <p className="text-sm font-medium text-primary">
              {t("privacyPolicy.eyebrow")}
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {t("privacyPolicy.title")}
            </h1>
            <p className="text-base leading-8 text-muted-foreground md:text-lg">
              {t("privacyPolicy.intro")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("privacyPolicy.lastUpdated", { date: UPDATED_AT })}
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <article key={section.title} className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="mb-3 text-2xl font-semibold text-foreground">
                  {section.title}
                </h2>
                <p className="leading-8 text-muted-foreground">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
