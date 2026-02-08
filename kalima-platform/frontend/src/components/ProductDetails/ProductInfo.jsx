import { Star, StarHalf, Circle, CircleDot } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

export default function ProductInfo({ product }) {
  const { t } = useTranslation("product");
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 !== 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight mb-3 text-balance break-words">
          {product.title}
        </h1>

        {/* Ratings */}
        <div className="flex items-center gap-2 ">
          <div className="flex text-highlight">
            {[...Array(fullStars)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
            {hasHalfStar && <StarHalf className="h-5 w-5 fill-current" />}
            {[...Array(5 - Math.ceil(product.rating))].map((_, i) => (
              <Star key={`empty-${i}`} className="h-5 w-5" />
            ))}
          </div>
          <span className="text-sm font-bold ms-1">{product.rating}</span>
          <span className="text-sm text-muted-foreground underline decoration-dotted">
            ({product.reviewCount} reviews)
          </span>
        </div>
      </div>

      {/* Price & Stock */}
      <Card>
        <CardContent className="p-4 pt-4">
          <div className="flex items-end gap-3 mb-2 flex-wrap">
            <span className="text-3xl font-black ">${product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through mb-1">
                  ${product.originalPrice}
                </span>
                <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full mb-1">
                  {t("info.save")} {product.discount}%
                </span>
              </>
            )}
          </div>
          {product.inStock && (
            <div className="flex items-center gap-2 text-sm text-success font-medium">
              <span>
                {t("info.inStock")} ({t("info.readyToShip")})
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
