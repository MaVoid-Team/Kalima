import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCheck, ShoppingCart, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateDiscountPercentage, formatPrice, formatTimeUntilRelease } from "@/lib/storeUtils";
import useAuth from "@/hooks/auth/useAuth";
import { useCart } from "@/contexts/CartContext";
import useRole from "@/hooks/useRole";
import { useFastBuy } from "@/hooks/useFastBuy";
import RatingDisplay from "@/components/ui/RatingDisplay";
import LoadingSpinner from "@/components/ui/loading-spinner";

/**
 * ProductCard — renders a single product in the market grid.
 * The image/title area links to /product/:id.
 * "Add to Cart" and "Buy Now" buttons appear below (not inside the Link).
 */
const ProductCard = ({ id, title, category, price, priceAfterDiscount, image, isPurchased, rate, rate_count, is_released = true, release_at, time_until_release_ms }) => {
  const { t, i18n } = useTranslation("market");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { hasAdminAccess } = useRole();
  const { startFastBuy, loading: fastBuyLoading } = useFastBuy();

  let cartCtx = null;
  try {
    // CartContext is only available for authenticated non-admin users
    // eslint-disable-next-line react-hooks/rules-of-hooks
    cartCtx = useCart();
  } catch (_) {
    // Not inside CartProvider — safe to ignore on admin / unauthenticated pages
  }

  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

  const hasDiscount = priceAfterDiscount !== null && priceAfterDiscount !== "" && Number(priceAfterDiscount) < Number(price);
  const finalPrice = (priceAfterDiscount !== null && priceAfterDiscount !== "" && priceAfterDiscount !== undefined) ? priceAfterDiscount : price;
  const percentageOff = hasDiscount ? Math.round(((Number(price) - Number(priceAfterDiscount)) / Number(price)) * 100) : 0;

  const cartLoading = cartCtx?.loading ?? false;

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const fallbackTimeUntilReleaseMs = release_at ? Math.max(new Date(release_at).getTime() - Date.now(), 0) : 0;
  const countdownText = formatTimeUntilRelease(
    Number.isFinite(Number(time_until_release_ms)) ? time_until_release_ms : fallbackTimeUntilReleaseMs,
    t
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!is_released) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    if (!cartCtx?.addToCart) return;
    try {
      setIsAddingToCart(true);
      await cartCtx.addToCart(id);
    } catch (_) {
      // error handled by hook
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!is_released) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    try {
      setIsBuyingNow(true);
      await startFastBuy(id);
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="group flex flex-col h-full" data-testid={`market-product-card-${id}`}>
      {/* Clickable image/info area */}
      <Link to={`/product/${id}`} className="block" data-testid={`market-product-card-${id}-link`}>
        <Card className="border-none shadow-none">
          <CardContent className="p-0 relative overflow-hidden rounded-4xl mb-4 aspect-4/5 sm:aspect-square bg-muted">
            <div className="absolute top-3 start-3 z-10 flex flex-col gap-2">
              {hasDiscount && (
                <Badge variant="destructive" className="px-2.5 py-1 text-[11px] font-semibold rounded-md flex-wrap w-max">
                  {percentageOff}% {t("product.off", "OFF")}
                </Badge>
              )}
              {!is_released && release_at && (
                <Badge variant="secondary" className="px-2.5 py-1 text-[11px] font-semibold rounded-md gap-1 bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 flex-wrap w-max">
                  <Clock className="w-3" />
                  {t("product.comingSoon", "Coming Soon")} · {countdownText}
                </Badge>
              )}
            </div>
            {isPurchased && (
              <Badge
                variant="secondary"
                title={t("product.purchased", "Purchased")}
                className="absolute top-3 end-3 z-10 h-7 w-7 p-0 rounded-full bg-success/15 text-success border-success/30 flex items-center justify-center md:h-auto md:w-auto md:px-2.5 md:py-1 md:rounded-md md:text-[11px] md:font-semibold"
              >
                <CheckCheck className={`h-3.5 w-3.5 ${i18n.language === 'ar' ? '-scale-x-100' : ''}`} />
                <span className="hidden md:inline ms-1">{t("product.purchased", "Purchased")}</span>
              </Badge>
            )}
            {image ? (
              <img
                src={image}
                alt={title}
                loading="lazy"
                width="400"
                height="500"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImage;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <img src={fallbackImage} alt="Placeholder" loading="lazy" width="400" height="500" className="w-full h-full object-cover opacity-50" />
              </div>
            )}
          </CardContent>
          <CardFooter className="p-0 flex flex-col items-start gap-1 w-full">
            <h3 className="text-sm md:text-base font-bold line-clamp-2 leading-snug w-full">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground w-full truncate">{category}</p>
            <RatingDisplay
              rating={rate}
              reviewCount={rate_count}
              size="sm"
              className="mt-1"
            />
            <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
              <span className="text-lg md:text-xl font-extrabold text-primary tracking-tight">
                {formatPrice(finalPrice)}
                <span className="text-[10px] md:text-xs font-medium ms-1 text-muted-foreground uppercase">{t("product.currency")}</span>
              </span>
              {hasDiscount && (
                <span className="text-xs md:text-sm text-muted-foreground line-through decoration-destructive/40 font-medium">
                  {formatPrice(price)}
                  <span className="text-[10px] ms-0.5 uppercase">{t("product.currency")}</span>
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </Link>

      {/* Action buttons — outside the Link to avoid nested interactive elements */}
      {!hasAdminAccess && isAuthenticated && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-auto w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs font-medium py-2"
            onClick={handleAddToCart}
            disabled={cartLoading || fastBuyLoading || isAddingToCart || !is_released}
            data-testid={`market-product-card-${id}-add-to-cart`}
            title={t("product.addToCart", "Add to Cart")}
          >
            {isAddingToCart ? (
              <LoadingSpinner className="h-5 w-5 border-primary" />
            ) : !is_released ? (
                <>
                  <Clock className="h-3.5 w-3.5 me-1.5 shrink-0" />
                  <span className="truncate">{t("product.comingSoon", "Coming Soon")}</span>
                </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5 me-1.5 shrink-0" />
                <span className="hidden sm:inline truncate">{t("product.addToCart", "Add to Cart")}</span>
                <span className="sm:hidden">{t("product.cart", "Cart")}</span>
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs font-medium py-2"
            onClick={handleBuyNow}
            data-testid={`market-product-card-${id}-buy-now`}
            title={t("product.buyNow", "Buy Now")}
            disabled={cartLoading || fastBuyLoading || isBuyingNow || !is_released}
          >
            {isBuyingNow ? (
              <LoadingSpinner className="h-5 w-5 border-white" />
            ) : !is_released ? (
                <>
                  <Clock className="h-3.5 w-3.5 me-1.5 shrink-0" />
                  <span className="truncate">{t("product.comingSoon", "Coming Soon")}</span>
                </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 me-1.5 shrink-0" />
                <span className="hidden sm:inline truncate">{t("product.buyNow", "Buy Now")}</span>
                <span className="sm:hidden">{t("product.buyNow", "Buy")}</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
