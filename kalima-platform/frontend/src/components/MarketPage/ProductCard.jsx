import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCheck, ShoppingCart, Zap, Clock, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { cn } from "@/lib/utils";

/**
 * ProductCard — renders a single product in the market grid.
 * Improved with premium styling and animations.
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    cartCtx = useCart();
  } catch (_) {}

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
    e.preventDefault(); e.stopPropagation();
    if (!is_released) return;
    if (!isAuthenticated) { navigate("/login", { state: { from: location }, replace: true }); return; }
    if (!cartCtx?.addToCart) return;
    try {
      setIsAddingToCart(true);
      await cartCtx.addToCart(id);
    } catch (_) {
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!is_released) return;
    if (!isAuthenticated) { navigate("/login", { state: { from: location }, replace: true }); return; }
    try {
      setIsBuyingNow(true);
      await startFastBuy(id);
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <motion.div 
      className="group flex flex-col h-full perspective-1000"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      data-testid={`market-product-card-${id}`}
    >
      <Link 
        to={`/product/${id}`} 
        className="block flex-1 mb-3" 
        data-testid={`market-product-card-${id}-link`}
      >
        <Card className="h-full border border-border/40 bg-card/50 backdrop-blur-xs shadow-xs group-hover:shadow-md group-hover:border-primary/20 transition-all duration-500 rounded-3xl overflow-hidden flex flex-col p-0 gap-0">
          <CardContent className="p-0 relative overflow-hidden aspect-[4/5] sm:aspect-square bg-muted/30">
            {/* Overlay Badges */}
            <div className="absolute top-3 inset-x-3 z-10 flex justify-between items-start pointer-events-none">
              <div className="flex flex-col gap-1.5 items-start">
                <AnimatePresence>
                  {hasDiscount && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <Badge className="bg-destructive/90 backdrop-blur-md text-white border-none px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
                        {percentageOff}% {t("product.off", "OFF")}
                      </Badge>
                    </motion.div>
                  )}
                  {!is_released && release_at && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      delay={0.1}
                    >
                      <Badge className="bg-amber-500/90 backdrop-blur-md text-white border-none px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {countdownText}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isPurchased && (
                <Badge className="h-8 w-8 p-0 rounded-full bg-success/90 backdrop-blur-md text-white border-none flex items-center justify-center shadow-lg">
                  <CheckCheck className={cn("h-4 w-4", i18n.language === 'ar' && "-scale-x-100")} />
                </Badge>
              )}
            </div>

            {/* Product Image */}
            <div className="w-full h-full relative overflow-hidden">
              <motion.img
                src={image || fallbackImage}
                alt={title}
                loading="lazy"
                className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {/* Floating Info on Hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
               <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-2xl">
                  <Info className="w-5 h-5 text-white" />
               </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 flex flex-col items-start flex-1 bg-linear-to-b from-transparent to-card/30">
            <div className="w-full mb-1 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                {category}
              </span>
              <RatingDisplay rating={rate} reviewCount={rate_count} size="xs" />
            </div>

            <h3 className="text-sm md:text-base font-bold line-clamp-2 leading-tight w-full group-hover:text-primary transition-colors duration-300 min-h-[2.5rem]">
              {title}
            </h3>

            <div className="mt-auto pt-3 w-full flex items-baseline gap-2">
              <div className="flex items-baseline">
                <span className="text-xl font-black text-foreground">
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-[10px] font-bold ms-0.5 text-muted-foreground uppercase">
                  {t("product.currency")}
                </span>
              </div>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground/60 line-through font-medium">
                  {formatPrice(price)}
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </Link>

      {/* Action Buttons */}
      {!hasAdminAccess && isAuthenticated && (
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 rounded-xl border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
            onClick={handleAddToCart}
            disabled={cartLoading || fastBuyLoading || isAddingToCart || !is_released}
          >
            {isAddingToCart ? (
              <LoadingSpinner className="h-4 w-4 border-primary" />
            ) : !is_released ? (
              <Clock className="h-4 w-4" />
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs font-bold hidden sm:block">{t("product.addToCart", "Add")}</span>
              </div>
            )}
          </Button>

          <Button
            size="sm"
            className="flex-1 h-9 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 bg-primary hover:bg-primary/90 transition-all duration-300"
            onClick={handleBuyNow}
            disabled={cartLoading || fastBuyLoading || isBuyingNow || !is_released}
          >
            {isBuyingNow ? (
              <LoadingSpinner className="h-4 w-4 border-white" />
            ) : !is_released ? (
              <span className="text-[10px] font-bold uppercase tracking-tighter">Soon</span>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <Zap className="h-4 w-4 fill-current" />
                <span className="text-xs font-black uppercase tracking-wider hidden sm:block">
                  {t("product.buyNow", "Buy")}
                </span>
              </div>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ProductCard;
