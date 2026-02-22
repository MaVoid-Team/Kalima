import { Star, StarHalf } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/storeUtils";

export default function ProductInfo({ product }) {
  const { t } = useTranslation("product");

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight mb-3 text-balance wrap-break-word">
          {product.title}
        </h1>
      </div>

      {/* Price & Stock */}
      <Card>
        <CardContent className="p-4 pt-4">
          <div className="flex items-end gap-3 mb-2 flex-wrap">
            <span className="text-3xl font-black">
              {formatPrice(product.price)} {t("info.currency")}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through mb-1">
                  {formatPrice(product.originalPrice)} {t("info.currency")}
                </span>
                {product.discount && (
                  <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full mb-1">
                    {t("info.save")} {product.discount}%
                  </span>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
