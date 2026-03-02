import { useState } from "react";
import { Minus, Plus, ShoppingCart, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatPrice, getImageUrl } from "@/lib/storeUtils";
import { useCart } from "@/contexts/CartContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useFastBuy } from "@/hooks/useFastBuy";

/**
 * ProductActions
 * Props:
 *   - price: number
 *   - productId: string | number
 *   - sampleUrl: string | null   (legacy fallback — external URL)
 *   - sampleId: number | null    (preferred — links to /samples/:id)
 */
export default function ProductActions({ price, productId, sampleUrl, sampleId }) {
  const { t } = useTranslation("product");
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading } = useCart();
  const { startFastBuy, loading: fastBuyLoading } = useFastBuy();
  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const formattedPrice = formatPrice(price);

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 shadow-lg">
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-muted-foreground leading-none">
                {t("info.totalPrice")}
              </span>
              <span className="text-lg font-black truncate">
                {formattedPrice} {t("info.currency")}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="h-9 w-9"
                data-testid="product-actions-mobile-decrement-button"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                value={quantity}
                readOnly
                className="w-12 h-9 text-center font-bold shadow-none px-0"
              />
              <Button variant="outline" size="icon" onClick={handleIncrement} className="h-9 w-9" data-testid="product-actions-mobile-increment-button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-11 gap-2"
              disabled={loading}
              onClick={() => addToCart(productId, quantity)}
              data-testid="product-actions-mobile-add-cart-button"
            >
              {loading ? (
                <LoadingSpinner className="h-5 w-5 border-white" />
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>{t("actions.addToCart")}</span>
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              className="h-11 gap-2"
              onClick={() => startFastBuy(productId, quantity)}
              disabled={fastBuyLoading}
              data-testid="product-actions-mobile-buy-now-button"
            >
              {fastBuyLoading ? (
                <LoadingSpinner className="h-5 w-5" />
              ) : (
                <>
                  <Zap className="h-4 w-4" />

                  <span>{t("actions.buyNow")}</span>
                </>
              )}
            </Button>
          </div>

          {(sampleId || sampleUrl) && (
            <Button variant="outline" className="w-full h-10" size="sm" asChild data-testid="product-actions-mobile-view-sample-button">
              {sampleId ? (
                <Link to={`/samples/${sampleId}`} state={{ cameFromAdmin: false }}>
                  <Eye className="h-4 w-4" />
                  <span className="ms-2">{t("actions.viewSample")}</span>
                </Link>
              ) : (
                <a href={getImageUrl(sampleUrl)} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" />
                  <span className="ms-2">{t("actions.viewSample")}</span>
                </a>
              )}
            </Button>
          )}
        </div>
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
              data-testid="product-actions-desktop-decrement-button"
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
            <Button variant="outline" size="icon" onClick={handleIncrement} data-testid="product-actions-desktop-increment-button">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart */}
          <Button className="gap-2 flex-1" size="lg" onClick={() => addToCart(productId, quantity)} disabled={loading} data-testid="product-actions-desktop-add-cart-button">
            {loading ? (
              <LoadingSpinner className="h-5 w-5 border-white" />
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                {t("actions.addToCart")}
              </>
            )}
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
            data-testid="product-actions-desktop-buy-now-button"
          >
            {fastBuyLoading ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              t("actions.buyNow")
            )}
          </Button>
          {(sampleId || sampleUrl) && (
            <Button
              variant="outline"
              className="text-sm flex-1"
              size="lg"
              asChild
              data-testid="product-actions-desktop-view-sample-button"
            >
              {sampleId ? (
                <Link to={`/samples/${sampleId}`} state={{ cameFromAdmin: false }}>
                  {t("actions.viewSample")}
                </Link>
              ) : (
                <a href={getImageUrl(sampleUrl)} target="_blank" rel="noopener noreferrer">
                  {t("actions.viewSample")}
                </a>
              )}
            </Button>
          )}
        </div>
      </div >
    </div >
  );
}
