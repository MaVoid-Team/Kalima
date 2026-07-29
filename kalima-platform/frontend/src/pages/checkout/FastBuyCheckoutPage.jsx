import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBlocker, useNavigate } from "react-router-dom";
import FastBuyCheckoutForm from "@/components/fast-buy/FastBuyCheckoutForm";
import FastBuyClearDialog from "@/components/fast-buy/FastBuyClearDialog";
import { useFastBuy } from "@/hooks/useFastBuy";
import LoadingSpinner from "../../components/ui/loading-spinner";
import { motion } from "framer-motion";
import RepeatPurchaseWarningDialog from "@/components/checkout/RepeatPurchaseWarningDialog";
import PurchaseTrackingDialog from "@/components/checkout/PurchaseTrackingDialog";

export default function FastBuyCheckoutPage() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { checkout } = useFastBuy({ checkout: true });
  const { preview, isLoading, error, isSubmitting, computed, applyCoupon, clearFastBuyCart } = checkout;
  const [showClearDialog, setShowClearDialog] = useState(false);
  const skipBlockRef = useRef(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (checkout.completedPurchase) return false;
    if (skipBlockRef.current) return false;
    if (nextLocation.state?.skipFastBuyClear) return false;
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

  const isLoadingAny = isLoading || isSubmitting || checkout.checkingRepeatPurchase;

  if (error && !isLoading) {
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
      <div className="min-h-screen relative selection:bg-primary/10 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 space-y-2"
          >
            <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">
              {t("payment.completeOrder", "Complete Your Order")}
            </h1>
            <p className="text-muted-foreground font-medium">
              {t("payment.summaryDesc", "Fast Buy Checkout — Secure and Easy")}
            </p>
          </motion.div>

          <FastBuyCheckoutForm form={checkout} onApplyCoupon={applyCoupon} loading={isLoadingAny} />
        </div>
      </div>

      <FastBuyClearDialog open={showClearDialog} onStay={handleStay} onConfirm={handleLeaveAndClear} />
      <RepeatPurchaseWarningDialog
        open={checkout.repeatPurchase.items.length > 0}
        items={checkout.repeatPurchase.items}
        loading={checkout.isSubmitting || checkout.checkingRepeatPurchase}
        title={t("repeatPurchase.title")}
        description={t("repeatPurchase.description")}
        backLabel={t("repeatPurchase.goBack")}
        continueLabel={t("repeatPurchase.continue")}
        onBack={checkout.dismissRepeatedPurchase}
        onContinue={checkout.confirmRepeatedPurchase}
      />
      <PurchaseTrackingDialog
        purchase={checkout.completedPurchase}
        paymentMethodName={
          preview?.paymentMethods?.find(
            (method) => String(method.id) === String(checkout.formData.paymentMethodId),
          )?.name || ""
        }
      />
    </>
  );
}
