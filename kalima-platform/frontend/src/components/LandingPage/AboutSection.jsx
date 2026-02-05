import { GraduationCap, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

const ABOUT_IMAGE_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=1000&fit=crop&q=80";

const AboutSection = () => {
  const { t, i18n } = useTranslation("landing");
  const isRTL = i18n.language === "ar";

  const features = [
    {
      icon: GraduationCap,
      title: t("about.features.interactive.title"),
      description: t("about.features.interactive.description"),
      iconColor: "text-brand",
      iconBg: "bg-brand-light",
    },
    {
      icon: Award,
      title: t("about.features.quality.title"),
      description: t("about.features.quality.description"),
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
    },
  ];

  return (
    <section className="w-full bg-white py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8" dir={isRTL ? "rtl" : "ltr"}>
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div className={`flex flex-col justify-center space-y-8 ${isRTL ? "text-right" : "text-left"}`}>
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold tracking-tight text-text-main sm:text-5xl xl:text-6xl leading-[1.1]">
                {t("about.title")}{" "}
                <span className={`text-transparent bg-clip-text ${isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-brand via-brand-dark to-orange-500`}>
                  {t("about.titleHighlight")}
                </span>
                <br />
                {t("about.titleEnd")}
              </h2>

              <p className={`max-w-[500px] text-text-sub text-lg leading-relaxed font-medium ${isRTL ? "border-r-4 border-brand/20 pr-6" : "border-l-4 border-brand/20 pl-6"}`}>
                {t("about.description")}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="flex items-center gap-4 mb-4">
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
          </div>

          {/* Image */}
          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
            <div className="relative">
              <div
                className={`h-[500px] lg:h-[600px] w-full rounded-[2.5rem] bg-cover bg-center shadow-2xl transition-transform duration-700 hover:scale-[1.02] ${isRTL ? "rotate-3" : "-rotate-3"}`}
                style={{
                  backgroundImage: `url("${ABOUT_IMAGE_URL}")`,
                }}
              />
              <div className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-black/10 to-transparent ${isRTL ? "rotate-3" : "-rotate-3"}`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
