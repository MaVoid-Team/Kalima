import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CheckoutProvider, useCheckout } from "./context/CheckoutContext";
import { StepIndicator } from "@/components/checkout";
import RequiredFieldsStage from "@/components/checkout/RequiredFieldsStage";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import OrderSummary from "@/components/checkout/OrderSummary";
import CheckoutSuccess from "@/components/checkout/CheckoutSuccess";

const STEPS = [
  { number: 1, label: "information" },
  { number: 2, label: "payment" },
];

const extractCartItems = (previewData) =>
  previewData?.cart?.cart_items || previewData?.cart_items || [];

const extractPricing = (previewData) => ({
  subtotal: previewData?.subtotal || previewData?.cart?.subtotal || 0,
  shipping: previewData?.shipping || 0,
  taxes: previewData?.taxes || 0,
  total: previewData?.total || previewData?.cart?.total || 0,
});

const mapToOrderItems = (cartItems) =>
  cartItems.map((item) => ({
    id: item.id,
    name: item.name || item.nameAr || item.nameEn || "",
    type: item.type || "",
    price: item.price || 0,
    quantity: item.quantity || 1,
    image: item.image || "",
  }));

function CheckoutContent() {
  const { t, i18n } = useTranslation("checkout");
  const {
    previewData,
    previewLoading,
    previewError,
    currentStep,
    purchaseSerial,
  } = useCheckout();

  if (previewLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const errorMessage =
    previewError?.response?.data?.message || t("payment.error_loading");
  if (previewError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-destructive text-sm">{errorMessage}</p>
      </div>
    );
  }

  if (currentStep === 3)
    return <CheckoutSuccess purchaseSerial={purchaseSerial} />;

  const cartItems = extractCartItems(previewData);
  const pricing = extractPricing(previewData);
  const orderItems = mapToOrderItems(cartItems);

  const isRequiredFieldsStep = currentStep === 1;
  const isPaymentStep = currentStep === 2;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <main className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 max-w-6xl mx-auto px-8 py-8 flex-1">
        <div className="flex flex-col gap-6">
          {isRequiredFieldsStep && (
            <RequiredFieldsStage cartItems={cartItems} lang={i18n.language} />
          )}
          {isPaymentStep && <PaymentMethod />}
        </div>

        <aside className="lg:sticky lg:top-8 h-fit">
          <OrderSummary items={orderItems} pricing={pricing} />
        </aside>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
