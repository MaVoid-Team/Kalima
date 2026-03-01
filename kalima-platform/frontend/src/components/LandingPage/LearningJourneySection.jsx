import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Video, BookText, ClipboardCheck } from "lucide-react";

export default function LearningJourneySection() {
  const { t } = useTranslation("landing");

  const journeySteps = [
    { icon: Video, title: t("landingPage.learningJourney.steps.discover.title"), description: t("landingPage.learningJourney.steps.discover.description") },
    { icon: BookText, title: t("landingPage.learningJourney.steps.plan.title"), description: t("landingPage.learningJourney.steps.plan.description") },
    { icon: ClipboardCheck, title: t("landingPage.learningJourney.steps.practice.title"), description: t("landingPage.learningJourney.steps.practice.description") },
    { icon: CheckCircle2, title: t("landingPage.learningJourney.steps.progress.title"), description: t("landingPage.learningJourney.steps.progress.description") },
  ];

  return (
    <section className="bg-muted/40 py-16" data-testid="landing-page-learning-journey-section">
      <div className="container mx-auto px-4 md:px-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{t("landingPage.learningJourney.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("landingPage.learningJourney.description")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {journeySteps.map((step, index) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <Card className="h-full border-border/60 bg-background/95">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
