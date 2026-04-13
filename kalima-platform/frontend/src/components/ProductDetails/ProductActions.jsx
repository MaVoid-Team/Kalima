import { useState } from "react";
import { ShoppingCart, Eye, Zap, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatPrice, getImageUrl } from "@/lib/storeUtils";
import { useCart } from "@/contexts/CartContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useFastBuy } from "@/hooks/useFastBuy";
import useAuth from "@/hooks/auth/useAuth";
import useRole from "@/hooks/useRole";

import { buildWhatsAppLink } from "@/lib/whatsappUtils";
import { FaWhatsapp } from "react-icons/fa";

/**
 * ProductActions
 * Props:
 *   - price: number
 *   - productId: string | number
 *   - sampleUrl: string | null   (legacy fallback — external URL)
 *   - sampleId: number | null    (preferred — links to /samples/:id)
 *   - title: string
 *   - serial: string
 */
export default function ProductActions({ price, productId, sampleUrl, sampleId, title, serial, isReleased = true }) {
  const { t } = useTranslation("product");
  const { isAuthenticated } = useAuth();
  const { isConfirmed } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  let cartCtx = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    cartCtx = useCart();
  } catch (_) {
    // Not inside CartProvider — safe to ignore
  }

  const addToCart = cartCtx?.addToCart;
  const loading = cartCtx?.loading ?? false;
  const { startFastBuy, loading: fastBuyLoading } = useFastBuy();

  const formattedPrice = formatPrice(price);

  // Unconfirmed authenticated users can browse but cannot purchase
  const isPurchaseBlocked = isAuthenticated && !isConfirmed;

  const handleAddToCart = () => {
    if (!isReleased || isPurchaseBlocked) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    if (addToCart) addToCart(productId);
  };

  const handleBuyNow = () => {
    if (!isReleased || isPurchaseBlocked) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }
    startFastBuy(productId, 1);
  };

  const whatsappMessage = t('actions.whatsappTemplate', {
    title,
    serial: serial ? `${t('info.sku', 'Serial')}: ${serial}` : '',
    price: formatPrice(price),
    currency: t('info.currency', 'EGP'),
    url: window.location.href
  });

  const whatsappHref = buildWhatsAppLink('201000000000', whatsappMessage); // Generic admin phone

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Pending Review Banner */}
      {isPurchaseBlocked && (
        <div
          className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400"
          data-testid="product-actions-pending-review-banner"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-relaxed">
            {t("actions.pendingReview", "Your account is pending admin review. You can browse freely but cannot make purchases until your account is approved.")}
          </p>
        </div>
      )}

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
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-11 gap-2"
              disabled={loading || !isReleased || isPurchaseBlocked}
              onClick={handleAddToCart}
              data-testid="product-actions-mobile-add-cart-button"
            >
              {loading ? (
                <LoadingSpinner className="h-5 w-5 border-white" />
              ) : !isReleased ? (
                <>
                  <Clock className="h-5 w-5" />
                  <span>{t("badges.comingSoon", "Coming Soon")}</span>
                </>
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
              onClick={handleBuyNow}
              disabled={fastBuyLoading || !isReleased || isPurchaseBlocked}
              data-testid="product-actions-mobile-buy-now-button"
            >
              {fastBuyLoading ? (
                <LoadingSpinner className="h-5 w-5" />
              ) : !isReleased ? (
                 <>
                   <Clock className="h-4 w-4" />
                   <span>{t("badges.comingSoon", "Coming Soon")}</span>
                 </>
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

          <Button variant="outline" className="w-full h-10 border-success/30 text-success hover:bg-success/5 gap-2" size="sm" asChild>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className="h-4 w-4" />
              <span>{t("actions.contactWhatsApp", "Message us")}</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col gap-4">
        <div className="flex gap-4">
          {/* Quantity Stepper */}
          {/* <div className="flex items-center gap-1">
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
          </div> */}

          {/* Add to Cart */}
          <Button className="gap-2 flex-1" size="lg" onClick={handleAddToCart} disabled={loading || !isReleased || isPurchaseBlocked} data-testid="product-actions-desktop-add-cart-button">
            {loading ? (
              <LoadingSpinner className="h-5 w-5 border-white" />
            ) : !isReleased ? (
                <>
                  <Clock className="h-5 w-5" />
                  {t("badges.comingSoon", "Coming Soon")}
                </>
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
            onClick={handleBuyNow}
            disabled={fastBuyLoading || !isReleased || isPurchaseBlocked}
            data-testid="product-actions-desktop-buy-now-button"
          >
            {fastBuyLoading ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : !isReleased ? (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("badges.comingSoon", "Coming Soon")}
              </span>
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
        <Button
          variant="outline"
          className="text-sm border-success/30 text-success hover:bg-success/5 gap-2 h-11"
          size="lg"
          asChild
        >
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp className="h-4 w-4" />
            {t("actions.contactWhatsApp", "Message Admin on WhatsApp")}
          </a>
        </Button>
      </div >
    </div >
  );
}
