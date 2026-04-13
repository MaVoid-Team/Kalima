import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BookOpen, BriefcaseBusiness, CirclePlay, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HERO_IMAGE = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop";

export default function WelcomeSection() {
  const { t, i18n } = useTranslation("landing");

  const highlights = [
    {
      icon: CirclePlay,
      title: t("landingPage.hero.highlights.liveClasses.title"),
      description: t("landingPage.hero.highlights.liveClasses.description"),
    },
    {
      icon: BookOpen,
      title: t("landingPage.hero.highlights.curriculum.title"),
      description: t("landingPage.hero.highlights.curriculum.description"),
    },
    {
      icon: BriefcaseBusiness,
      title: t("landingPage.hero.highlights.teacherTools.title"),
      description: t("landingPage.hero.highlights.teacherTools.description"),
    },
  ];

  return (
    <motion.section
      className="relative overflow-hidden bg-transparent pt-10 pb-10 md:pb-16 will-change-transform"
      data-testid="landing-page-hero-section"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-transparent" />
      <div className="container relative z-10 mx-auto px-4 md:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.4 }}>
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm" data-testid="landing-page-hero-badge">
                {t("landingPage.hero.badge")}
              </Badge>
            </motion.div>
            <motion.h1
              className="text-balance text-4xl font-bold text-foreground md:text-6xl"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: 0.06 }}
            >
              {t("landingPage.hero.title")} <span className="text-primary">{t("landingPage.hero.titleHighlight")}</span>
            </motion.h1>
            <motion.p
              className="text-base leading-relaxed text-muted-foreground md:text-lg"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, delay: 0.12 }}
            >
              {t("landingPage.hero.description")}
            </motion.p>

            <motion.div
              className="flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.45, delay: 0.32 }}
            >
              <Button asChild size="lg" className="w-full sm:w-auto" data-testid="landing-page-hero-start-learning-button">
                <Link to="/">{t("landingPage.hero.startLearning")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto" data-testid="landing-page-hero-market-button">
                <Link to="/market"><ShoppingBag className="me-2 h-4 w-4" />{t("landingPage.hero.openMarket")}</Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="relative"
          >
            <img src={HERO_IMAGE} alt={t("landingPage.hero.title")} fetchPriority="high" width="800" height="460" className="h-[460px] w-full rounded-3xl object-cover shadow-2xl" />
            <motion.div
              className="absolute -bottom-5 start-4 w-[92%] rounded-2xl border border-border/60 bg-background/95 p-4 shadow-lg"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {highlights.map((highlight, index) => (
                  <motion.div
                    key={highlight.title}
                    className="space-y-2 text-center"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.35, delay: 0.24 + index * 0.06 }}
                  >
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-linear-to-br from-primary/25 via-primary/10 to-background shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_6px_14px_rgba(0,0,0,0.14)]">
                      <highlight.icon className={"h-5 w-5 text-primary" + (i18n.language === "ar" ? " scale-x-[-1]" : "")} />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{highlight.title}</p>
                    <p className="text-xs text-muted-foreground">{highlight.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
