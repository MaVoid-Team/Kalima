import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function SuccessStoriesSection() {
  const { t } = useTranslation("landing");
  const [customStories, setCustomStories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    quote: "",
    comment: "",
  });

  const cardReveal = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 50, damping: 20 } },
  };

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

  const allStories = [...customStories, ...stories];

  const handleInputChange = (field) => (event) => {
    setFormData((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleSubmitStory = (event) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedRole = formData.role.trim();
    const trimmedQuote = formData.quote.trim();
    const trimmedComment = formData.comment.trim();

    if (!trimmedName || !trimmedQuote || !trimmedComment) {
      toast.error(t("landingPage.stories.form.validation", "Please add your name, story, and comment."));
      return;
    }

    setCustomStories((previous) => [
      {
        id: `user-story-${Date.now()}`,
        quote: trimmedQuote,
        comment: trimmedComment,
        name: trimmedName,
        role: trimmedRole || t("landingPage.stories.form.defaultRole", "Community Member"),
      },
      ...previous,
    ]);

    setFormData({ name: "", role: "", quote: "", comment: "" });
    toast.success(t("landingPage.stories.form.success", "Your success story has been shared."));
  };

  return (
    <motion.section
      className="bg-transparent py-16 will-change-transform"
      data-testid="landing-page-stories-section"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4 md:px-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          >
            <Badge variant="outline" className="mb-3">{t("landingPage.stories.badge")}</Badge>
          </motion.div>
          <motion.h2
            className="text-3xl font-bold text-foreground md:text-4xl"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.08 }}
          >
            {t("landingPage.stories.titleStart")}
            <span className="text-primary">{t("landingPage.stories.titleHighlight")}</span>
            {t("landingPage.stories.titleEnd")}
          </motion.h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {allStories.map((story, index) => (
            <motion.div
              key={story.id || `${story.name}-${index}`}
              variants={cardReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6, scale: 1.02, rotate: 1, transition: { type: "spring", stiffness: 300, damping: 15 } }}
            >
              <Card className="flex h-full flex-col border border-white/40 dark:border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/20 dark:ring-white/10 bg-gradient-to-br from-white/30 to-white/5 dark:from-white/10 dark:to-transparent transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="space-y-4 p-6 relative z-10 flex flex-col h-full justify-between">
                  <p className="text-sm font-medium leading-relaxed text-foreground/90 italic drop-shadow-sm">"{story.quote}"</p>

                  <div className="space-y-4 mt-auto">
                    {story.comment ? (
                      <div className="rounded-lg border border-white/20 bg-white/5 dark:bg-black/10 p-3 backdrop-blur-sm shadow-inner">
                        <p className="text-xs font-semibold text-foreground/80">{t("landingPage.stories.form.commentLabel", "Comment")}</p>
                        <p className="mt-1 text-sm text-foreground/70">{story.comment}</p>
                      </div>
                    ) : null}
                    <div>
                      <p className="font-bold text-foreground drop-shadow-sm">{story.name}</p>
                      <p className="text-xs font-medium text-primary shadow-sm">{story.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mx-auto mt-12 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          <Card className="border border-white/40 dark:border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/20 dark:ring-white/10 bg-gradient-to-br from-white/30 to-white/5 dark:from-white/10 dark:to-transparent transition-all duration-300 hover:border-primary/50 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
            <CardContent className="space-y-5 p-6 md:p-8 relative z-10">
              <div className="text-center sm:text-start">
                <h3 className="text-2xl font-bold text-foreground drop-shadow-sm">{t("landingPage.stories.form.title", "Share your success story")}</h3>
                <p className="mt-2 text-sm text-foreground/80 font-medium">
                  {t("landingPage.stories.form.description", "Add your own story and send a comment to inspire others.")}
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmitStory}>
                <Textarea
                  value={formData.comment}
                  onChange={handleInputChange("comment")}
                  placeholder={t("landingPage.stories.form.commentPlaceholder", "Add a comment (Optional)")}
                  rows={2}
                  className="bg-background/50 backdrop-blur-sm border-white/20 focus-visible:ring-primary/50 resize-none"
                />
                <div className="flex justify-end pt-2">
                  <Button type="submit" className="shadow-md hover:shadow-lg transition-all bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-sm w-full sm:w-auto px-8" data-testid="landing-page-story-submit-button">
                    {t("landingPage.stories.form.submit", "Share Story")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}
