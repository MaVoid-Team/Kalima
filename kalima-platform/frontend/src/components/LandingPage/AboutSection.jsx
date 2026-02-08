import { GraduationCap, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AboutSection() {
  const { t } = useTranslation("landing");

  const features = [
    {
      icon: GraduationCap,
      title: t("about.features.interactive.title"),
      description: t("about.features.interactive.description"),
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      icon: Award,
      title: t("about.features.quality.title"),
      description: t("about.features.quality.description"),
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
  ];

  return (
    <section className="w-full bg-background py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Image */}
          <img
            src={'/about.png'}
            alt={t("about.title")}
            className="h-[600px] w-full max-w-[600px] lg:max-w-none mx-auto object-cover rounded-[2.5rem]"
          />
          {/* Content */}
          <div className="space-y-8">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl xl:text-6xl leading-[1.1]">
              {t("about.title")}{" "}
              <span className="text-primary">
                {t("about.titleHighlight")}
              </span>
              <br />
              {t("about.titleEnd")}
            </h2>
            <p className="max-w-[500px] text-muted-foreground text-lg leading-relaxed font-medium">
              {t("about.description")}
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
          </div>
        </div>
      </div>
    </section>
  );
}
