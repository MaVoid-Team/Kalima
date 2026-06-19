import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Sparkles } from "lucide-react";
import { useRole } from "@/hooks/useRole";

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

export default function AppDownloadSection() {
  const { t } = useTranslation("landing");
  const { isStudent } = useRole();

  return (
    <motion.section
      className="py-16"
      data-testid="landing-page-app-section"
      variants={sectionContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="container mx-auto px-4 md:px-10">
        <div className="rounded-3xl border border-border p-6 shadow-xl md:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                variants={childFade}
              >
                <Sparkles className="h-4 w-4" />
                {t("landingPage.download.badge")}
              </motion.div>
              <motion.h2
                className="text-3xl font-bold text-foreground md:text-4xl"
                variants={childFade}
              >
                {t("landingPage.download.title")}
              </motion.h2>
              <motion.p
                className="text-muted-foreground"
                variants={childFade}
              >
                {t("landingPage.download.description")}
              </motion.p>
              <motion.div
                className="flex flex-col gap-3 sm:flex-row"
                variants={childFade}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full" data-testid="landing-page-app-download-button">
                    <Download className="me-2 h-4 w-4" />
                    {t("landingPage.download.downloadButton")}
                  </Button>
                </motion.div>
                {!isStudent && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button asChild size="lg" variant="outline" className="w-full" data-testid="landing-page-app-explore-market-button">
                      <Link to="/market">{t("landingPage.download.exploreMarket")}</Link>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
            <motion.div
              className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all"
              variants={childFade}
              whileHover={{ y: -5, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}
            >
              <p className="text-sm font-semibold text-foreground">{t("landingPage.download.mixTitle")}</p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("landingPage.download.learningLabel")}</span>
                    <span>20%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <motion.div
                      className="h-2 rounded-full bg-primary"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "20%" }}
                      viewport={{ once: true, amount: 0.7 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("landingPage.download.marketLabel")}</span>
                    <span>80%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <motion.div
                      className="h-2 rounded-full bg-primary"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "80%" }}
                      viewport={{ once: true, amount: 0.7 }}
                      transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
