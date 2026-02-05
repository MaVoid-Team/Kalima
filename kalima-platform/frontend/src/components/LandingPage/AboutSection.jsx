import { GraduationCap, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

// Education quality theme - from SubjectsSection (Humanities)
// Education quality theme - from SubjectsSection (Humanities)
const ABOUT_IMAGE_URL =
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=1000&fit=crop&q=80";

export default function AboutSection() {
  const { t, i18n } = useTranslation("landing");

  // Direction-aware styles
  const dir = {
    textAlign: i18n.dir() === "rtl" ? "text-right" : "text-left",
    gradient: i18n.dir() === "rtl" ? "bg-gradient-to-l" : "bg-gradient-to-r",
    border: i18n.dir() === "rtl" ? "border-r-4 pr-6" : "border-l-4 pl-6",
  };

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
    <section className="w-full bg-background py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div
            className={`flex flex-col justify-center space-y-8 ${dir.textAlign}`}
          >
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl xl:text-6xl leading-[1.1]">
                {t("about.title")}{" "}
                <span
                  className={`text-transparent bg-clip-text ${dir.gradient} from-brand via-brand-dark to-orange-500`}
                >
                  {t("about.titleHighlight")}
                </span>
                <br />
                {t("about.titleEnd")}
              </h2>

              <p
                className={`max-w-[500px] text-muted-foreground text-lg leading-relaxed font-medium border-brand/20 ${dir.border}`}
              >
                {t("about.description")}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="flex items-center gap-4 mb-4">
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
          </div>

          {/* Image */}
          <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none">
            <div className="relative h-[600px] w-full">
              <div
                className="h-full w-full rounded-[2.5rem] bg-cover bg-center transition-transform duration-700"
                style={{
                  backgroundImage: `url("${ABOUT_IMAGE_URL}")`,
                }}
              >
                <div className="absolute inset-0 rounded-[2.5rem] bg-linear-to-t from-black/10 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
