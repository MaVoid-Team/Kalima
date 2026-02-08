import { Star, StarHalf } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function BookletInfo({ product }) {
  const { t } = useTranslation("product");

  return (
    <div className="flex flex-col gap-4">
      {/* Badges */}
      <div className="flex gap-2">
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 hover:bg-green-100"
        >
          {t("badges.bestSeller")}
        </Badge>
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 hover:bg-blue-100"
        >
          {t("badges.interactive")}
        </Badge>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold leading-tight text-foreground text-balance">
        {product.title}
      </h1>

      {/* Price & Rating Row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-red-500">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg">{product.rating}</span>
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </div>
          <span className="text-sm text-muted-foreground underline decoration-dotted">
            {product.reviewCount} {t("info.reviews")}
          </span>
        </div>
      </div>

      {/* Creator Info */}
      <div className="flex items-center gap-3 mt-2 pb-4 border-b">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder-avatar.jpg" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {t("info.createdBy")}
          </span>
          <span className="font-bold text-sm">ScienceWithSarah</span>
        </div>
        <button className="ms-auto text-xs font-bold border px-3 py-1 rounded-full">
          {t("actions.follow")}
        </button>
      </div>
    </div>
  );
}
