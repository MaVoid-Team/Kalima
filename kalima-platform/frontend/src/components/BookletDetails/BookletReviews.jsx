import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Sarah J.",
    initials: "SJ",
    rating: 5,
    timeAgo: "2d ago",
    text: "My 5th graders loved the diagrams! The print quality of the booklet was exceptional.",
    tags: ["Grade 5", "Bundle"],
  },
  {
    id: 2,
    author: "Mark R.",
    initials: "MR",
    rating: 5,
    timeAgo: "1w ago",
    text: "Great value for the price. The digital resources are a nice bonus.",
    tags: ["Digital"],
  },
];

export default function BookletReviews({ product }) {
  const { t } = useTranslation("product");

  return (
    <div className="mt-8 pt-8 border-t">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {t("info.reviews", "Reviews")}
          <span className="text-muted-foreground text-sm font-normal">
            ({product.reviewCount})
          </span>
        </h2>
        <button className="text-primary font-bold text-sm hover:underline">
          {t("reviews.seeAll", "See All")}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_REVIEWS.map((review) => (
          <div key={review.id} className="bg-muted/30 p-4 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                    {review.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-sm">{review.author}</div>
                  <div className="flex text-highlight">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3 fill-current",
                          i < review.rating
                            ? "text-highlight"
                            : "text-muted",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {review.timeAgo}
              </span>
            </div>

            <p className="text-sm text-foreground/80 mb-3 leading-relaxed">
              "{review.text}"
            </p>

            <div className="flex gap-2">
              {review.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-2 py-0 h-5 bg-muted text-muted-foreground hover:bg-muted/80"
                >
                  {tag.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
