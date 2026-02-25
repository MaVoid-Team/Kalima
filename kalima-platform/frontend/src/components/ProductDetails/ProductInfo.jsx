import { Star, StarHalf } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateDiscountPercentage, formatPrice } from "@/lib/storeUtils";

export default function ProductInfo({ product }) {
  const { t } = useTranslation(["product", "checkout"]);

  const originalPrice = Number.parseFloat(product?.price);
  const discountedPrice = Number.parseFloat(product?.price_after_discount);
  const hasValidDiscount =
    !Number.isNaN(originalPrice) &&
    !Number.isNaN(discountedPrice) &&
    discountedPrice > 0 &&
    discountedPrice < originalPrice;

  const currentPrice = hasValidDiscount ? discountedPrice : originalPrice;
  const discount = hasValidDiscount
    ? calculateDiscountPercentage(originalPrice, currentPrice, 0)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Badges / Meta Info */}
      <div className="flex flex-wrap gap-2">
        {product.is_archived && (
          <Badge variant="destructive">
            {t("badges.archived") || "Archived"}
          </Badge>
        )}
        {product.type && <Badge variant="secondary">{product.type}</Badge>}
        {product.product_categories?.map((pc) => (
          <Badge key={pc.category_id} variant="outline">
            {pc.categories?.title}
          </Badge>
        ))}
      </div>

      {/* Header Info */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight mb-3 text-balance wrap-break-word">
          {product.title}
        </h1>
        {product.serial && (
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-semibold">Serial:</span> {product.serial}
          </p>
        )}
      </div>

      {/* Price & Stock */}
      <Card>
        <CardContent className="p-4 pt-4">
          <div className="flex items-end gap-3 mb-2 flex-wrap">
            <span className="text-3xl font-black">
              {formatPrice(currentPrice)} {t("info.currency")}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through mb-1">
                  {formatPrice(originalPrice)} {t("info.currency")}
                </span>
                {discount > 0 && (
                  <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full mb-1">
                    {t("info.save")} {discount}%
                  </span>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Required Fields Info */}
      {product.product_required_fields &&
        product.product_required_fields.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-sm">
              {t(
                "product:info.requiredInfo",
                "Required Information for Purchase:",
              )}
            </h3>
            <ul className="list-disc ps-5 text-sm text-muted-foreground">
              {product.product_required_fields.map((field) => {
                const label = field.required_field_definitions?.label;
                return (
                  <li key={field.id}>
                    {t(`checkout:payment.${label}`, label)}{" "}
                    {field.is_required && "*"}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

      {/* Perks Info */}
      {product.perks && (
        <div className="flex flex-col gap-2 mt-2">
          <h3 className="font-semibold text-sm">
            {t("product:info.perks", "Product Features:")}
          </h3>
          <ul className="list-disc ps-5 text-sm text-muted-foreground">
            {product.perks.split(',').map((perk, index) => (
              <li key={index}>{perk.trim()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
