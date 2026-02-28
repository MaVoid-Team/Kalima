import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBlocker, useNavigate } from "react-router-dom";
import FastBuyCheckoutForm from "@/components/fast-buy/FastBuyCheckoutForm";
import FastBuyClearDialog from "@/components/fast-buy/FastBuyClearDialog";
import { useFastBuy } from "@/hooks/useFastBuy";
import LoadingSpinner from "../../components/ui/loading-spinner";

export default function FastBuyCheckoutPage() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { checkout } = useFastBuy({ checkout: true });
  const { preview, isLoading, error, isSubmitting, computed, applyCoupon, clearFastBuyCart } = checkout;
  const [showClearDialog, setShowClearDialog] = useState(false);
  const skipBlockRef = useRef(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (skipBlockRef.current) return false;
    const leavingCheckout = currentLocation.pathname === "/fast-buy/checkout" && nextLocation.pathname !== "/fast-buy/checkout";
    return computed.hasItems && leavingCheckout;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowClearDialog(true);
    }
  }, [blocker.state]);

  const handleStay = () => {
    setShowClearDialog(false);
    blocker.reset?.();
  };

  const handleLeaveAndClear = async () => {
    skipBlockRef.current = true;
    await clearFastBuyCart();
    setShowClearDialog(false);
    blocker.proceed?.();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    const msg = error?.response?.data?.message || t("payment.error_loading");
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <p className="text-destructive text-sm">{msg}</p>
        <button
          className="text-primary hover:underline"
          onClick={() => navigate(-1)}
          data-testid="fast-buy-checkout-go-back-button"
        >
          {t("general.go_back", "Go Back")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background relative selection:bg-primary/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <FastBuyCheckoutForm form={checkout} onApplyCoupon={applyCoupon} loading={isSubmitting} />
        </div>
      </div>

      <FastBuyClearDialog open={showClearDialog} onStay={handleStay} onConfirm={handleLeaveAndClear} />
    </>
  );
}
