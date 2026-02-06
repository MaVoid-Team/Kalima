import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PromoBanner() {
  const { t } = useTranslation("market");

  return (
    <section className="container py-16">
      <Card className="bg-primary text-primary-foreground border-none">
        <CardContent className="p-12 flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold">{t("promo.title")}</h2>
            <p className="text-lg opacity-90">{t("promo.description")}</p>
          </div>
          <Button size="lg" variant="secondary">
            {t("promo.cta")}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
