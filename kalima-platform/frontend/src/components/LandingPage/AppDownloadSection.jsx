import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Download, Sparkles } from "lucide-react";

export default function AppDownloadSection() {
  const { t } = useTranslation("landing");

  return (
    <section className="py-16" data-testid="landing-page-app-section">
      <div className="container mx-auto px-4 md:px-10">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl md:p-10">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                {t("landingPage.download.badge")}
              </div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">{t("landingPage.download.title")}</h2>
              <p className="text-muted-foreground">{t("landingPage.download.description")}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" data-testid="landing-page-app-download-button">
                  <Download className="me-2 h-4 w-4" />
                  {t("landingPage.download.downloadButton")}
                </Button>
                <Button asChild size="lg" variant="outline" data-testid="landing-page-app-explore-market-button">
                  <Link to="/market">{t("landingPage.download.exploreMarket")}</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background p-5">
              <p className="text-sm font-semibold text-foreground">{t("landingPage.download.mixTitle")}</p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("landingPage.download.learningLabel")}</span>
                    <span>80%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-4/5 rounded-full bg-primary" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("landingPage.download.marketLabel")}</span>
                    <span>20%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-1/5 rounded-full bg-secondary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
