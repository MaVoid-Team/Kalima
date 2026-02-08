import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const RATING_DISTRIBUTION = { 5: 78, 4: 15, 3: 4, 2: 1, 1: 2 };
const AVATAR_COLORS = [
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-muted",
];

export default function ProductTabs({ product }) {
  const { t, i18n } = useTranslation("product");
  const reviews = t("reviews.sampleReviews", { returnObjects: true });

  const renderStars = (rating, size = "h-5 w-5") => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${i < Math.floor(rating) ? "fill-current" : ""}`}
      />
    ));
  };

  return (
    <Tabs
      defaultValue="description"
      dir={i18n.dir()}
      className="w-full mt-12 md:mt-16"
    >
      <TabsList>
        {[
          { value: "description", label: t("tabs.description") },
          { value: "specifications", label: t("tabs.specifications") },
          {
            value: "reviews",
            label: `${t("tabs.reviews")} (${product.reviewCount})`,
          },
          { value: "resources", label: t("tabs.resources") },
        ].map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Description */}
      <TabsContent value="description" className="mt-6 md:mt-8">
        <div className="prose max-w-none">
          <p className="text-base leading-relaxed mb-6">
            {product.description}
          </p>

          <h3 className="text-xl font-bold mb-4">
            {t("description.whatsIncluded")}
          </h3>
          <ul className="space-y-2">
            {product.included.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Card className="mt-6 border-l-4 border-l-accent bg-accent/10">
            <CardContent className="pt-4 flex gap-3">
              <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-foreground mb-1">
                  {t("description.educatorNote")}
                </p>
                <p className="text-sm text-foreground opacity-90">
                  {t("description.educatorNoteText")}
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-base leading-relaxed">
            {t("description.engagementText")}
          </p>
        </div>
      </TabsContent>

      {/* Specifications */}
      <TabsContent value="specifications" className="mt-6 md:mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("specifications.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(product.specs).map(([key, value], index) => (
                <div key={key}>
                  <div className="flex justify-between items-center pb-3">
                    <span className="text-sm text-muted-foreground">
                      {t(`specifications.${key}`, key)}
                    </span>
                    <span className="text-sm font-bold">{value}</span>
                  </div>
                  {index < Object.entries(product.specs).length - 1 && (
                    <Separator />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Reviews */}
      <TabsContent value="reviews" className="mt-6 md:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Rating Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{product.rating}</div>
                <div className="flex justify-center text-highlight mb-2">
                  {renderStars(product.rating)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("reviews.basedOn", { count: product.reviewCount })}
                </p>
              </div>

              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-3">{stars}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-highlight"
                        style={{ width: `${RATING_DISTRIBUTION[stars]}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-end">
                      {RATING_DISTRIBUTION[stars]}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.map((review, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className={AVATAR_COLORS[index % AVATAR_COLORS.length]}
                      >
                        <AvatarFallback className="bg-transparent text-white font-bold">
                          {review.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{review.author}</p>
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success border-transparent"
                          >
                            {t("reviews.verifiedBuyer")}
                          </Badge>
                        </div>
                        <div className="flex text-highlight mt-1">
                          {renderStars(review.rating, "h-4 w-4")}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {review.timeAgo}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{review.text}</p>
                </CardContent>
              </Card>
            ))}
            <Button variant="link" className="p-0 h-auto font-bold text-sm">
              {t("reviews.readAll", { count: product.reviewCount })}
            </Button>
          </div>
        </div>
      </TabsContent>

      {/* Resources */}
      <TabsContent value="resources" className="mt-6 md:mt-8">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-base leading-relaxed">
            {t("resources.placeholder")}
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
