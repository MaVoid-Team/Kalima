import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SuccessStoriesSection() {
  const { t } = useTranslation("landing");

  const stories = [
    {
      quote: t("landingPage.stories.storyOne.quote"),
      name: t("landingPage.stories.storyOne.name"),
      role: t("landingPage.stories.storyOne.role"),
    },
    {
      quote: t("landingPage.stories.storyTwo.quote"),
      name: t("landingPage.stories.storyTwo.name"),
      role: t("landingPage.stories.storyTwo.role"),
    },
    {
      quote: t("landingPage.stories.storyThree.quote"),
      name: t("landingPage.stories.storyThree.name"),
      role: t("landingPage.stories.storyThree.role"),
    },
  ];

  return (
    <section className="bg-background py-16" data-testid="landing-page-stories-section">
      <div className="container mx-auto px-4 md:px-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <Badge variant="outline" className="mb-3">{t("landingPage.stories.badge")}</Badge>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">{t("landingPage.stories.title")}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stories.map((story) => (
            <Card key={story.name} className="border-border/60">
              <CardContent className="space-y-4 p-6">
                <p className="text-sm leading-relaxed text-foreground">“{story.quote}”</p>
                <div>
                  <p className="font-semibold text-foreground">{story.name}</p>
                  <p className="text-xs text-muted-foreground">{story.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
