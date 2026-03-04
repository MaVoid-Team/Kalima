import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Video, BookText, ClipboardCheck } from "lucide-react";

export default function LearningJourneySection() {
  const { t, i18n } = useTranslation("landing");

  const stepReveal = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 50, damping: 20 } },
  };

  const journeySteps = [
    { icon: Video, title: t("landingPage.learningJourney.steps.discover.title"), description: t("landingPage.learningJourney.steps.discover.description") },
    { icon: BookText, title: t("landingPage.learningJourney.steps.plan.title"), description: t("landingPage.learningJourney.steps.plan.description") },
    { icon: ClipboardCheck, title: t("landingPage.learningJourney.steps.practice.title"), description: t("landingPage.learningJourney.steps.practice.description") },
    { icon: CheckCircle2, title: t("landingPage.learningJourney.steps.progress.title"), description: t("landingPage.learningJourney.steps.progress.description") },
  ];

  return (
    <section className="bg-transparent py-16" data-testid="landing-page-learning-journey-section">
      <div className="container mx-auto px-4 md:px-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <motion.h2
            className="text-3xl font-bold text-foreground md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.7 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          >
            {t("landingPage.learningJourney.title")}
          </motion.h2>
          <motion.p
            className="mt-3 text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.7 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.08 }}
          >
            {t("landingPage.learningJourney.description")}
          </motion.p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {journeySteps.map((step, index) => (
            <motion.div key={step.title} variants={stepReveal} initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} transition={{ delay: index * 0.08 }} whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}>
              <Card className="flex h-full flex-col border border-white/40 dark:border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/20 dark:ring-white/10 bg-gradient-to-br from-white/30 to-white/5 dark:from-white/10 dark:to-transparent transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10">
                  <motion.div
                    className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/40 dark:bg-white/10 border border-white/30 backdrop-blur-md shadow-sm text-primary transition-colors group-hover:bg-white/50 dark:group-hover:bg-white/20"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: index * 0.2 }}
                  >
                    <step.icon className={"h-6 w-6 drop-shadow-sm" + (i18n.language === "ar" ? " scale-x-[-1]" : "")} />
                  </motion.div>
                  <CardTitle className="text-lg font-bold drop-shadow-sm text-foreground">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 grow">
                  <p className="text-sm font-medium leading-relaxed text-foreground/80">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
