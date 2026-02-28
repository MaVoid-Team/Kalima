import { useTranslation } from "react-i18next";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import CheckoutSuccess from "@/components/checkout/CheckoutSuccess";
import { useCheckoutPage } from "@/hooks/useCheckoutPage";
import LoadingSpinner from "../../components/ui/loading-spinner";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { t } = useTranslation("checkout");
  const { state, submitting, handleCheckout } = useCheckoutPage();
  const { preview, loading, error, purchaseSerial } = state;

  useEffect(() =>{
    alert(purchaseSerial);
  }, [purchaseSerial]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    const msg = error?.response?.data?.message || t("payment.error_loading");
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-destructive text-sm">{msg}</p>
      </div>
    );
  }

  if (purchaseSerial) {
    return <CheckoutSuccess purchaseSerial={purchaseSerial} />;
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <CheckoutForm
          preview={preview}
          cartItems={preview?.purchase?.purchase_items ?? []}
          onSubmit={handleCheckout}
          loading={submitting}
        />
      </div>
    </div>
  );
}
