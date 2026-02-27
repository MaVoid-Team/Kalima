import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PromoBanner() {
  const { t } = useTranslation("market");

  return (
    <section className="container py-8 md:py-16">
      <Card className="bg-primary text-primary-foreground border-none shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        <CardContent className="p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative z-10">
          <div className="space-y-3 md:space-y-2 max-w-xl">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight">
              {t("promo.title")}
            </h2>
            <p className="text-sm md:text-lg opacity-90 text-primary-foreground/90 leading-relaxed text-balance">
              {t("promo.description")}
            </p>
          </div>
          <Button size="lg" variant="secondary" className="shrink-0 w-full md:w-auto font-bold shadow-sm hover:shadow-md transition-all">
            {t("promo.cta")}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
