import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, ShieldCheck, Users2, Rocket } from "lucide-react";

const ABOUT_IMAGE_DESKTOP = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?fm=webp&q=60&w=800&auto=format&fit=crop";
const ABOUT_IMAGE_MOBILE = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?fm=webp&q=30&w=300&auto=format&fit=crop";

// Single parent stagger — one observer instead of 6+
const sectionContainer = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.07 },
  },
};

const childFade = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } },
};

export default function AboutSection() {
  const { t, i18n } = useTranslation("landing");

  const pillars = [
    { icon: BrainCircuit, title: t("landingPage.about.pillars.curriculum.title"), description: t("landingPage.about.pillars.curriculum.description") },
    { icon: Users2, title: t("landingPage.about.pillars.teachers.title"), description: t("landingPage.about.pillars.teachers.description") },
    { icon: ShieldCheck, title: t("landingPage.about.pillars.assessment.title"), description: t("landingPage.about.pillars.assessment.description") },
    { icon: Rocket, title: t("landingPage.about.pillars.engagement.title"), description: t("landingPage.about.pillars.engagement.description") },
  ];

  return (
    <motion.section
      className="bg-transparent py-16"
      data-testid="landing-page-about-section"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="container mx-auto px-4 md:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <motion.h2
              className="text-3xl font-bold text-foreground md:text-4xl"
              variants={childFade}
            >
              {t("landingPage.about.titleStart")}
              <span className="text-primary">{t("landingPage.about.titleHighlight")}</span>
              {t("landingPage.about.titleEnd")}
            </motion.h2>
            <motion.p
              className="text-muted-foreground"
              variants={childFade}
            >
              {t("landingPage.about.description")}
            </motion.p>
            <div className="grid gap-4 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <motion.div key={pillar.title} variants={childFade} whileHover={{ y: -8, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}>
                  <Card className="flex h-full flex-col border border-white/40 dark:border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/20 dark:ring-white/10 bg-linear-to-br from-white/30 to-white/5 dark:from-white/10 dark:to-transparent transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 relative overflow-hidden group">
                    <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="pb-3 relative z-10 text-center sm:text-start">
                      <div className="mb-2 mx-auto sm:mx-0 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/40 dark:bg-white/10 border border-white/30 backdrop-blur-md shadow-sm text-primary transition-transform group-hover:scale-110 duration-300">
                        <pillar.icon className={"h-5 w-5 drop-shadow-sm" + (i18n.language === "ar" ? " scale-x-[-1]" : "")} />
                      </div>
                      <CardTitle className="text-base font-bold drop-shadow-sm text-foreground">{pillar.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 text-center sm:text-start grow">
                      <p className="text-sm font-medium leading-relaxed text-foreground/80">{pillar.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.img
            src={ABOUT_IMAGE_DESKTOP}
            srcSet={`${ABOUT_IMAGE_MOBILE} 480w, ${ABOUT_IMAGE_DESKTOP} 800w`}
            sizes="(max-width: 640px) 480px, 800px"
            alt={t("landingPage.about.title")}
            width="800"
            height="460"
            loading="lazy"
            className="h-[460px] w-full rounded-3xl object-cover shadow-xl transition-shadow hover:shadow-2xl hover:shadow-primary/10"
            variants={childFade}
            whileHover={{ scale: 1.02 }}
          />
        </div>
      </div>
    </motion.section>
  );
}
