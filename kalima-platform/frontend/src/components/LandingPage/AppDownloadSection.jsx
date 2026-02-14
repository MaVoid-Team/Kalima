import { Smartphone, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const APP_IMAGE_URL = "/app-download.png";

export default function AppDownloadSection() {
  const { t } = useTranslation("landing");

  const features = [
    {
      icon: Smartphone,
      title: t("appDownload.features.anywhere.title"),
      description: t("appDownload.features.anywhere.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: Download,
      title: t("appDownload.features.offline.title"),
      description: t("appDownload.features.offline.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
  ];

  return (
    <section className="w-full bg-background py-12 md:py-24 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid gap-12 lg:gap-20 lg:grid-cols-2 lg:items-center">

          {/* Content */}
          <div className="space-y-8 order-2 lg:order-0">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl xl:text-6xl leading-tight text-balance">
              {t("appDownload.title")}{" "}
              <span className="text-primary">
                {t("appDownload.titleHighlight")}
              </span>
              <br />
              {t("appDownload.titleEnd")}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium text-balance">
              {t("appDownload.description")}
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 pt-2">
              {features.map((feature, index) => (
                <div key={index}>
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl ${feature.iconBg}`}
                    >
                      <feature.icon
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.iconColor}`}
                        strokeWidth={2}
                      />
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-foreground">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Download Button */}
            <Button variant="default" size="lg" className="w-full sm:w-fit gap-3 h-11 sm:h-12 text-base">
              <Download className="h-5 w-5" />
              {t("appDownload.downloadButton")}
            </Button>
          </div>
          {/* Image */}
          <img
            src={APP_IMAGE_URL}
            alt={t("appDownload.title")}
            className="h-[280px] sm:h-[550px] lg:h-[600px] w-full max-w-[600px] lg:max-w-none mx-auto object-cover rounded-4xl order-1 lg:order-0 shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
