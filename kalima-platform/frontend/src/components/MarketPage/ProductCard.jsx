import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatPrice } from "@/lib/storeUtils";

/**
 * ProductCard — renders a single product in the market grid.
 * Wraps the whole card in a Link to /product/:id.
 */
const ProductCard = ({ id, title, category, price, originalPrice, image }) => {
  const { t } = useTranslation("market");

  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

  return (
    <Link to={`/product/${id}`} className="group block">
      <Card className="border-none shadow-none">
        <CardContent className="p-0 relative overflow-hidden rounded-4xl mb-4 aspect-4/5 sm:aspect-square bg-muted">
          {image ? (
            <img
              src={image}
              alt={title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <img src={fallbackImage} alt="No image" className="w-full h-full object-cover opacity-50" />
            </div>
          )}
        </CardContent>
        <CardFooter className="p-0 flex flex-col items-start gap-1 w-full">
          <h3 className="text-sm md:text-base font-bold line-clamp-2 leading-snug w-full">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground w-full truncate">{category}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-base font-semibold">
              {t("product.currency")} {formatPrice(price)}
            </span>
            {originalPrice != null && (
              <span className="text-sm text-muted-foreground line-through">
                {t("product.currency")} {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;
