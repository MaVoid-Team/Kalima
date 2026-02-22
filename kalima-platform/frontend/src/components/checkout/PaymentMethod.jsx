import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { useCheckout } from "@/pages/checkout/context/CheckoutContext";
import PaymentMethodOption from "./PaymentMethodOption";

const SCREENSHOT_KEYS = ["paymentScreenShot", "paymentScreenshot"];
const TRANSFER_KEY = "numberTransferredFrom";

const fieldMatches = (field, keys) =>
  keys.includes(field) || keys.includes(field?.key);

export default function PaymentMethod() {
  const { t } = useTranslation("checkout");
  const { previewData, finalizePurchase, mutationLoading } = useCheckout();

  const paymentMethods = previewData?.payment_methods || [];
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [numberTransferredFrom, setNumberTransferredFrom] = useState("");

  const selectedMethod = paymentMethods.find(
    (m) => String(m.id) === String(selectedMethodId),
  );
  const requiredFields = selectedMethod?.required_fields || [];

  const needsScreenshot = requiredFields.some((f) =>
    fieldMatches(f, SCREENSHOT_KEYS),
  );
  const needsTransferNumber = requiredFields.some((f) =>
    fieldMatches(f, [TRANSFER_KEY]),
  );

  const isSubmitDisabled = !selectedMethodId || mutationLoading;

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("payment_method_id", selectedMethodId);

    if (needsScreenshot && paymentScreenshot) {
      formData.append("paymentScreenshot", paymentScreenshot);
    }
    if (needsTransferNumber && numberTransferredFrom) {
      formData.append("numberTransferredFrom", numberTransferredFrom);
    }

    try {
      await finalizePurchase(formData);
    } catch {
      // Error toast handled globally by axios interceptor
    }
  };

  const proofFieldsProps = {
    needsScreenshot,
    needsTransferNumber,
    numberTransferredFrom,
    onTransferNumberChange: setNumberTransferredFrom,
    paymentScreenshot,
    onScreenshotChange: setPaymentScreenshot,
  };

  const hasNoMethods = paymentMethods.length === 0;
  if (hasNoMethods) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("payment.title")}</CardTitle>
          <CardDescription>{t("payment.secure_notice")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("payment.no_methods")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const submitLabel = mutationLoading ? (
    <Loader2 className="w-5 h-5 animate-spin" />
  ) : (
    <>
      {t("payment.complete_purchase")}
      <ArrowRight className="w-5 h-5 ms-2" />
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("payment.title")}</CardTitle>
        <CardDescription>{t("payment.secure_notice")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <RadioGroup
          value={selectedMethodId}
          onValueChange={setSelectedMethodId}
          className="grid gap-4"
        >
          {paymentMethods.map((method) => (
            <PaymentMethodOption
              key={method.id}
              method={method}
              isSelected={String(method.id) === String(selectedMethodId)}
              proofFieldsProps={proofFieldsProps}
            />
          ))}
        </RadioGroup>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="w-full"
          size="lg"
        >
          {submitLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
