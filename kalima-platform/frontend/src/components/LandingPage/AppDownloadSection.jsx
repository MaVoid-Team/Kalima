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
    <section className="w-full bg-background py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

          {/* Content */}
          <div className="space-y-8 order-2 lg:order-0">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl xl:text-6xl leading-[1.1]">
              {t("appDownload.title")}{" "}
              <span className="text-primary">
                {t("appDownload.titleHighlight")}
              </span>
              <br />
              {t("appDownload.titleEnd")}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium">
              {t("appDownload.description")}
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-8 pt-4">
              {features.map((feature, index) => (
                <div key={index}>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconBg}`}
                    >
                      <feature.icon
                        className={`h-6 w-6 ${feature.iconColor}`}
                        strokeWidth={2}
                      />
                    </div>
                    <h4 className="text-lg font-bold text-foreground">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="text-base text-muted-foreground font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Download Button */}
            <Button variant="default" size="lg" className="w-fit gap-3">
              <Download className="h-5 w-5" />
              {t("appDownload.downloadButton")}
            </Button>
          </div>
          {/* Image */}
          <img
            src={APP_IMAGE_URL}
            alt={t("appDownload.title")}
            className="h-[600px] w-full max-w-[600px] lg:max-w-none mx-auto object-cover rounded-[2.5rem] order-1 lg:order-0"
          />
        </div>
      </div>
    </section>
  );
}
