import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useLandingInsights from "@/hooks/useLandingInsights";

export default function MarketplaceSection() {
  const { t } = useTranslation("landing");
  const { featuredProducts } = useLandingInsights();

  return (
    <section className="bg-muted/40 py-16" data-testid="landing-page-marketplace-section">
      <div className="container mx-auto px-4 md:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">{t("landingPage.marketplace.title")}</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("landingPage.marketplace.description")}</p>
          </div>
          <Button asChild variant="outline" data-testid="landing-page-marketplace-view-all-button">
            <Link to="/market">{t("landingPage.marketplace.viewAll")}</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredProducts.map((item) => (
            <Card key={item.id} className="flex h-full flex-col border-border/60 bg-background">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">{t("landingPage.marketplace.resourceTag")}</Badge>
                <CardTitle className="line-clamp-2 text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="grow text-sm text-muted-foreground">
                <p className="line-clamp-3">{item.description || t("landingPage.marketplace.placeholderDescription")}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" data-testid={`landing-page-marketplace-item-${item.id}-button`}>
                  <Link to={`/product/${item.id}`}>{t("landingPage.marketplace.openResource")}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
