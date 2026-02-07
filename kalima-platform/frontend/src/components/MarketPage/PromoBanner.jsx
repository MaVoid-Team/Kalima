import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PromoBanner() {
  const { t } = useTranslation("market");

  return (
    <section className="container py-16">
      <Card className="bg-primary text-primary-foreground border-none">
        <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("promo.title")}
            </h2>
            <p className="text-base md:text-lg opacity-90">
              {t("promo.description")}
            </p>
          </div>
          <Button size="lg" variant="secondary" className="shrink-0">
            {t("promo.cta")}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
