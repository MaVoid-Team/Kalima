import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/hooks/useRole";

const HERO_IMAGE_DESKTOP = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?fm=webp&q=50&w=800&auto=format&fit=crop";
const HERO_IMAGE_MOBILE = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?fm=webp&q=30&w=300&auto=format&fit=crop";

export default function WelcomeSection() {
  const { t } = useTranslation("landing");
  const { isStudent } = useRole();

  return (
    <section
      className="relative overflow-hidden bg-transparent pt-10 pb-10 md:pb-16"
      data-testid="landing-page-hero-section"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/10 via-transparent to-transparent" />
      <div className="container relative z-10 mx-auto px-4 md:px-10">
        <div
          className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
        >
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="rounded-full px-4 py-1 text-sm" data-testid="landing-page-hero-badge">
                {t("landingPage.hero.badge")}
              </Badge>
            </div>
            <h1
              className="text-balance text-4xl font-bold text-foreground md:text-6xl"
            >
              {t("landingPage.hero.title")} <span className="text-primary">{t("landingPage.hero.titleHighlight")}</span>
            </h1>
            <p
              className="text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              {t("landingPage.hero.description")}
            </p>

            <div
              className="flex flex-col gap-3 sm:flex-row"
            >
              {!isStudent && (
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto" data-testid="landing-page-hero-market-button">
                  <Link to="/market"><ShoppingBag className="me-2 h-4 w-4" />{t("landingPage.hero.openMarket")}</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <img
              src={HERO_IMAGE_DESKTOP}
              srcSet={`${HERO_IMAGE_MOBILE} 480w, ${HERO_IMAGE_DESKTOP} 800w`}
              sizes="(max-width: 640px) 480px, 800px"
              alt={t("landingPage.hero.title")}
              fetchPriority="high"
              width="800"
              height="460"
              className="h-[460px] w-full rounded-3xl object-cover shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
