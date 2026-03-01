import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BookOpen, BriefcaseBusiness, CirclePlay, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import useLandingInsights from "@/hooks/useLandingInsights";

const HERO_IMAGE = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1887&auto=format&fit=crop";

export default function WelcomeSection() {
  const { t } = useTranslation("landing");
  const { metrics } = useLandingInsights();

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
    <section className="relative overflow-hidden bg-background py-10 md:py-16" data-testid="landing-page-hero-section">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-transparent" />
      <div className="container relative z-10 mx-auto px-4 md:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6">
            <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm" data-testid="landing-page-hero-badge">
              {t("landingPage.hero.badge")}
            </Badge>
            <h1 className="text-balance text-4xl font-bold text-foreground md:text-6xl">
              {t("landingPage.hero.title")} <span className="text-primary">{t("landingPage.hero.titleHighlight")}</span>
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{t("landingPage.hero.description")}</p>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border-border/60 bg-card/80 backdrop-blur">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-semibold text-foreground">{metrics.activePrograms}+</p>
                  <p className="text-xs text-muted-foreground">{t("landingPage.hero.metrics.programs")}</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-card/80 backdrop-blur">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-semibold text-foreground">{metrics.learningTracks}+</p>
                  <p className="text-xs text-muted-foreground">{t("landingPage.hero.metrics.tracks")}</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-card/80 backdrop-blur">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-semibold text-foreground">{t("landingPage.hero.metrics.ratio")}</p>
                  <p className="text-xs text-muted-foreground">{t("landingPage.hero.metrics.learningFocus")}</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto" data-testid="landing-page-hero-start-learning-button">
                <Link to="/">{t("landingPage.hero.startLearning")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto" data-testid="landing-page-hero-market-button">
                <Link to="/market"><ShoppingBag className="me-2 h-4 w-4" />{t("landingPage.hero.openMarket")}</Link>
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img src={HERO_IMAGE} alt={t("landingPage.hero.title")} className="h-[460px] w-full rounded-3xl object-cover shadow-2xl" />
            <div className="absolute -bottom-5 start-4 w-[92%] rounded-2xl border border-border/60 bg-background/95 p-4 shadow-lg">
              <div className="grid gap-3 sm:grid-cols-3">
                {highlights.map((highlight) => (
                  <div key={highlight.title} className="space-y-1">
                    <highlight.icon className="h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold text-foreground">{highlight.title}</p>
                    <p className="text-xs text-muted-foreground">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
