import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, ShieldCheck, Users2, Rocket } from "lucide-react";

const ABOUT_IMAGE = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop";

export default function AboutSection() {
  const { t } = useTranslation("landing");

  const pillars = [
    { icon: BrainCircuit, title: t("landingPage.about.pillars.curriculum.title"), description: t("landingPage.about.pillars.curriculum.description") },
    { icon: Users2, title: t("landingPage.about.pillars.teachers.title"), description: t("landingPage.about.pillars.teachers.description") },
    { icon: ShieldCheck, title: t("landingPage.about.pillars.assessment.title"), description: t("landingPage.about.pillars.assessment.description") },
    { icon: Rocket, title: t("landingPage.about.pillars.engagement.title"), description: t("landingPage.about.pillars.engagement.description") },
  ];

  return (
    <section className="bg-background py-16" data-testid="landing-page-about-section">
      <div className="container mx-auto px-4 md:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{t("landingPage.about.title")}</h2>
            <p className="text-muted-foreground">{t("landingPage.about.description")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {pillars.map((pillar, index) => (
                <motion.div key={pillar.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}>
                  <Card className="h-full border-border/60">
                    <CardHeader className="pb-3">
                      <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/20 text-primary">
                        <pillar.icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-base">{pillar.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{pillar.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <img src={ABOUT_IMAGE} alt={t("landingPage.about.title")} className="h-[460px] w-full rounded-3xl object-cover shadow-xl" />
        </div>
      </div>
    </section>
  );
}
