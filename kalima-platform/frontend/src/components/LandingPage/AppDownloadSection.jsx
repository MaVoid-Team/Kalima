import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Sparkles } from "lucide-react";

export default function AppDownloadSection() {
  const { t } = useTranslation("landing");

  return (
    <section className="py-16" data-testid="landing-page-app-section">
      <div className="container mx-auto px-4 md:px-10">
        <div className="rounded-3xl border border-border p-6 shadow-xl md:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.8 }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              >
                <Sparkles className="h-4 w-4" />
                {t("landingPage.download.badge")}
              </motion.div>
              <motion.h2
                className="text-3xl font-bold text-foreground md:text-4xl"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.8 }}
                transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.05 }}
              >
                {t("landingPage.download.title")}
              </motion.h2>
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.8 }}
                transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.1 }}
              >
                {t("landingPage.download.description")}
              </motion.p>
              <motion.div
                className="flex flex-col gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.8 }}
                transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.14 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full" data-testid="landing-page-app-download-button">
                    <Download className="me-2 h-4 w-4" />
                    {t("landingPage.download.downloadButton")}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button asChild size="lg" variant="outline" className="w-full" data-testid="landing-page-app-explore-market-button">
                    <Link to="/market">{t("landingPage.download.exploreMarket")}</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
            <motion.div
              className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.02, transition: { type: "spring", stiffness: 300 } }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.12 }}
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
                      className="h-2 w-4/5 rounded-full bg-primary"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "20%" }}
                      viewport={{ once: false, amount: 0.7 }}
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
                      className="h-2 w-1/5 rounded-full bg-primary"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "80%" }}
                      viewport={{ once: false, amount: 0.7 }}
                      transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
