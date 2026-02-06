import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  const { t } = useTranslation("market");

  const popularTags = [
    { key: "ipadPlanners", label: t("hero.tags.ipadPlanners") },
    { key: "stemKits", label: t("hero.tags.stemKits") },
    { key: "math101", label: t("hero.tags.math101") },
    { key: "artSupplies", label: t("hero.tags.artSupplies") },
  ];

  return (
    <section className="container py-20 flex flex-col items-center text-center">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-[1.1]">
        {t("hero.title")}{" "}
        <span className="block mt-2">{t("hero.titleHighlight")}</span>
      </h1>

      <p className="text-muted-foreground text-lg md:text-xl max-w-2xl  mb-12 font-light">
        {t("hero.subtitle")}
      </p>

      <div className="w-full max-w-2xl relative mb-10">
        <div className="relative flex items-center">
          <Search className="absolute start-6 h-5 w-5 " />
          <Input
            className="w-full ps-14 pe-32 py-8 shadow-lg text-lg"
            placeholder={t("hero.searchPlaceholder")}
          />
          <Button size="lg" className="absolute end-2 top-3 bottom-2 px-8">
            {t("hero.searchButton")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {t("hero.popular")}
        </span>
        {popularTags.map((tag) => (
          <Badge key={tag.key} variant="secondary" className="px-4 py-1.5 ">
            {tag.label}
          </Badge>
        ))}
      </div>
    </section>
  );
}
