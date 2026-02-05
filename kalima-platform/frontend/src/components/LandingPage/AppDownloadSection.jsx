import { Smartphone, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

// Mobile learning theme - from SubjectsSection (Sciences)
const APP_IMAGE_URL =
  "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800&h=1000&fit=crop&q=80";

export default function AppDownloadSection() {
  const { t, i18n } = useTranslation("landing");
  const rtl = i18n.dir() === "rtl";

  // Direction-aware styles
  const dir = {
    textAlign: rtl ? "text-right" : "text-left",
    gradient: rtl ? "bg-gradient-to-l" : "bg-gradient-to-r",
    border: rtl ? "border-r-4 pr-6" : "border-l-4 pl-6",
    flexReverse: rtl ? "flex-row-reverse" : "",
  };

  const features = [
    {
      icon: Smartphone,
      title: t("appDownload.features.anywhere.title"),
      description: t("appDownload.features.anywhere.description"),
      iconColor: "text-brand",
      iconBg: "bg-brand-light",
    },
    {
      icon: Download,
      title: t("appDownload.features.offline.title"),
      description: t("appDownload.features.offline.description"),
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
    },
  ];

  return (
    <section className="w-full bg-background py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Image - First in LTR, Second in RTL (handled by dir) */}
          <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none order-1 lg:order-none">
            <div className="relative h-[600px] w-full">
              <div
                className="h-full w-full rounded-[2.5rem] bg-cover bg-center transition-transform duration-700"
                style={{
                  backgroundImage: `url("${APP_IMAGE_URL}")`,
                }}
              >
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`flex flex-col justify-center space-y-8 order-2 lg:order-none ${dir.textAlign}`}
          >
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl xl:text-6xl leading-[1.1]">
                {t("appDownload.title")}{" "}
                <span
                  className={`text-transparent bg-clip-text ${dir.gradient} from-brand via-brand-dark to-orange-500`}
                >
                  {t("appDownload.titleHighlight")}
                </span>
                <br />
                {t("appDownload.titleEnd")}
              </h2>

              <p
                className={`max-w-[500px] text-muted-foreground text-lg leading-relaxed font-medium border-brand/20 ${dir.border}`}
              >
                {t("appDownload.description")}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div
                    className={`flex items-center gap-4 mb-4 ${dir.flexReverse}`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconBg} transition-transform duration-300`}
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
            <div className="pt-4">
              <Button
                className={`rounded-full bg-brand px-10 py-4 text-base font-bold h-auto gap-3 ${dir.flexReverse}`}
              >
                <Download className="h-5 w-5" />
                <span>{t("appDownload.downloadButton")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
