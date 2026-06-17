import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useLandingInsights from "@/hooks/useLandingInsights";

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

export default function MarketplaceSection() {
  const { t } = useTranslation("landing");
  const { featuredProducts } = useLandingInsights();

  const cardReveal = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 50, damping: 20 } },
  };

  return (
    <motion.section
      className="bg-transparent py-16"
      data-testid="landing-page-marketplace-section"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="container mx-auto px-4 md:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.h2
              className="text-3xl font-bold text-foreground md:text-4xl drop-shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
              variants={childFade}
            >
              {t("landingPage.marketplace.title")}
            </motion.h2>
            <motion.p
              className="mt-3 max-w-2xl text-base text-muted-foreground font-medium"
              variants={childFade}
            >
              {t("landingPage.marketplace.description")}
            </motion.p>
          </div>
          <motion.div
            variants={childFade}
          >
            <Button asChild variant="outline" className="border border-white/40 dark:border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-[0_4px_16px_0_rgba(31,38,135,0.1)] ring-1 ring-inset ring-white/20 dark:ring-white/10 hover:bg-white/20 dark:hover:bg-white/10 hover:border-primary/50 transition-all font-medium text-foreground" data-testid="landing-page-marketplace-view-all-button">
              <Link to="/market">{t("landingPage.marketplace.viewAll")}</Link>
            </Button>
          </motion.div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredProducts.map((item) => (
            <motion.div
              key={item.id}
              variants={cardReveal}
              whileHover={{ y: -6, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}
            >
              <Card className="flex h-full flex-col border border-white/40 dark:border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/20 dark:ring-white/10 bg-gradient-to-br from-white/30 to-white/5 dark:from-white/10 dark:to-transparent transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 relative overflow-hidden group">
                {/* Subtle top shine effect on hover */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10">
                  <Badge variant="secondary" className="w-fit bg-white/40 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 border-white/30 backdrop-blur-md transition-colors shadow-sm text-foreground">{t("landingPage.marketplace.resourceTag")}</Badge>
                  <CardTitle className="line-clamp-2 text-lg font-semibold drop-shadow-sm group-hover:text-primary transition-colors mt-2">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="grow text-sm text-foreground/80 font-medium relative z-10">
                  <p className="line-clamp-3 leading-relaxed">{item.description || t("landingPage.marketplace.placeholderDescription")}</p>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Button asChild className="w-full shadow-md hover:shadow-lg transition-all bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-sm" data-testid={`landing-page-marketplace-item-${item.id}-button`}>
                    <Link to={`/product/${item.id}`}>{t("landingPage.marketplace.openResource")}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
