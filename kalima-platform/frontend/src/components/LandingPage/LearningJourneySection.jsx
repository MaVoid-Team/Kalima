import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Video, BookText, ClipboardCheck } from "lucide-react";

// Single parent stagger — one observer instead of 6+
const sectionContainer = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.08 },
  },
};

const childFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } },
};

export default function LearningJourneySection() {
  const { t, i18n } = useTranslation("landing");

  const journeySteps = [
    { icon: Video, title: t("landingPage.learningJourney.steps.discover.title"), description: t("landingPage.learningJourney.steps.discover.description") },
    { icon: BookText, title: t("landingPage.learningJourney.steps.plan.title"), description: t("landingPage.learningJourney.steps.plan.description") },
    { icon: ClipboardCheck, title: t("landingPage.learningJourney.steps.practice.title"), description: t("landingPage.learningJourney.steps.practice.description") },
    { icon: CheckCircle2, title: t("landingPage.learningJourney.steps.progress.title"), description: t("landingPage.learningJourney.steps.progress.description") },
  ];

  return (
    <motion.section
      className="bg-transparent py-16"
      data-testid="landing-page-learning-journey-section"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="container mx-auto px-4 md:px-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <motion.h2
            className="text-3xl font-bold text-foreground md:text-4xl"
            variants={childFade}
          >
            {t("landingPage.learningJourney.title")}
          </motion.h2>
          <motion.p
            className="mt-3 text-muted-foreground"
            variants={childFade}
          >
            {t("landingPage.learningJourney.description")}
          </motion.p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {journeySteps.map((step) => (
            <motion.div key={step.title} variants={childFade} whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}>
              <Card className="flex h-full flex-col border border-white/40 dark:border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/20 dark:ring-white/10 bg-gradient-to-br from-white/30 to-white/5 dark:from-white/10 dark:to-transparent transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10">
                  {/* Replaced infinite JS animate with CSS-only pulse to avoid continuous reflows */}
                  <div
                    className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/40 dark:bg-white/10 border border-white/30 backdrop-blur-md shadow-sm text-primary transition-colors group-hover:bg-white/50 dark:group-hover:bg-white/20 animate-[gentle-pulse_2.5s_ease-in-out_infinite]"
                  >
                    <step.icon className={"h-6 w-6 drop-shadow-sm" + (i18n.language === "ar" ? " scale-x-[-1]" : "")} />
                  </div>
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
    </motion.section>
  );
}
