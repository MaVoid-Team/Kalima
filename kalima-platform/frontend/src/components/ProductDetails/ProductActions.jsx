import { useState } from "react";
import { Minus, Plus, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { formatPrice, getImageUrl } from "@/lib/storeUtils";
import { useFastBuy } from "@/hooks/useFastBuy";

/**
 * ProductActions
 * Props:
 *   - price: number
 *   - productId: string | number   (passed in for future cart integration)
 *   - sampleUrl: string | null
 */
export default function ProductActions({ price, productId, sampleUrl }) {
  const { t } = useTranslation("product");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { startFastBuy, loading: fastBuyLoading } = useFastBuy();

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    // TODO: Implement actual add to cart API logic here
    setTimeout(() => setIsAddingToCart(false), 800);
  };

  const formattedPrice = formatPrice(price);

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50 md:hidden shadow-lg flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {t("info.totalPrice")}
          </span>
          <span className="text-xl font-black">
            {formattedPrice} {t("info.currency")}
          </span>
        </div>
        <Button
          className="flex-1 gap-2 h-12 text-lg font-bold"
          size="lg"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ShoppingCart className="h-5 w-5" />
          )}
          {t("actions.addToCart")}
        </Button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col gap-4">
        <div className="flex gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Input
                type="text"
                value={quantity}
                readOnly
                className="w-14 text-center font-bold shadow-none border-transparent px-0"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleIncrement}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart */}
          <Button
            className="gap-2 flex-1"
            size="lg"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
            {t("actions.addToCart")}
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="text-sm flex-1"
            size="lg"
            onClick={() => startFastBuy(productId, quantity)}
            disabled={fastBuyLoading}
          >
            {fastBuyLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("actions.buyNow")
            )}
          </Button>
          {sampleUrl && (
            <Button
              variant="outline"
              className="text-sm flex-1"
              size="lg"
              asChild
            >
              <a
                href={getImageUrl(sampleUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Sample
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
