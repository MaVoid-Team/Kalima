import { useTranslation } from "react-i18next";
import FastBuyCheckoutForm from "@/components/fast-buy/FastBuyCheckoutForm";
import { useFastBuyCheckoutPage } from "@/hooks/useFastBuyCheckoutPage";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/ui/loading-spinner";
import React from "react";

export default function FastBuyCheckoutPage() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { state, handleCheckout, handleApplyCoupon } = useFastBuyCheckoutPage();
  const { preview, isLoading, error, isSubmitting } = state;

  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


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
        >
          {t("general.go_back", "Go Back")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <FastBuyCheckoutForm
          preview={preview}
          onSubmit={handleCheckout}
          onApplyCoupon={handleApplyCoupon}
          loading={isSubmitting}
        />
      </div>
    </div>
  );
}
