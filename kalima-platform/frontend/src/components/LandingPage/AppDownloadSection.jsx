import { Smartphone, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

const APP_IMAGE_URL =
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=1000&fit=crop&q=80";

const AppDownloadSection = () => {
  const { t, i18n } = useTranslation("landing");
  const isRTL = i18n.language === "ar";

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
    <section
      className="w-full bg-white py-16 md:py-24 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Image - First in LTR, Second in RTL (handled by dir) */}
          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none order-1 lg:order-none">
            <div className="relative">
              <div
                className={`h-[500px] lg:h-[600px] w-full rounded-[2.5rem] bg-cover bg-center shadow-2xl transition-transform duration-700 hover:scale-[1.02] ${isRTL ? "-rotate-3" : "rotate-3"}`}
                style={{
                  backgroundImage: `url("${APP_IMAGE_URL}")`,
                }}
              />
              <div className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-black/10 to-transparent ${isRTL ? "-rotate-3" : "rotate-3"}`} />
            </div>
          </div>

          {/* Content */}
          <div className={`flex flex-col justify-center space-y-8 order-2 lg:order-none ${isRTL ? "text-right" : "text-left"}`}>
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold tracking-tight text-text-main sm:text-5xl xl:text-6xl leading-[1.1]">
                {t("appDownload.title")}{" "}
                <span className={`text-transparent bg-clip-text italic ${isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-brand via-brand-dark to-orange-500`}>
                  {t("appDownload.titleHighlight")}
                </span>
                <br />
                {t("appDownload.titleEnd")}
              </h2>

              <p className={`max-w-[500px] text-text-sub text-lg leading-relaxed font-medium ${isRTL ? "border-r-4 border-brand/20 pr-6" : "border-l-4 border-brand/20 pl-6"}`}>
                {t("appDownload.description")}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className={`flex items-center gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} strokeWidth={2} />
                    </div>
                    <h4 className="text-lg font-bold text-text-main">
                      {feature.title}
                    </h4>
                  </div>
                  <p className="text-base text-text-sub font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Download Button */}
            <div className="pt-4">
              <button className={`inline-flex items-center gap-3 px-8 py-4 bg-text-main hover:bg-brand text-white font-bold rounded-full shadow-lg transition-all duration-300 cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}>
                <Download className="h-5 w-5" />
                <span>{t("appDownload.downloadButton")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
