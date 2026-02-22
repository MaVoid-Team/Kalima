import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/pages/checkout/context/CheckoutContext";
import RequiredFieldItem from "./RequiredFieldItem";

export default function RequiredFieldsStage({ cartItems = [], lang = "ar" }) {
  const { t } = useTranslation("checkout");
  const { submitRequiredFields, mutationLoading, setCurrentStep } =
    useCheckout();

  const itemsNeedingFields = cartItems.filter(
    (item) => item.required_fields_filled === false,
  );
  const [fieldValues, setFieldValues] = useState({});

  const handleFieldChange = (itemId, fieldKey, value) => {
    setFieldValues((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), [fieldKey]: value },
    }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    Object.entries(fieldValues).forEach(([itemId, fields]) => {
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(`items[${itemId}][${key}]`, value);
      });
    });

    try {
      await submitRequiredFields(formData);
      setCurrentStep(2);
    } catch {
      // Error toast handled globally
    }
  };

  const allFieldsFilled = itemsNeedingFields.length === 0;
  if (allFieldsFilled) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-10">
          <CheckCircle2 className="w-10 h-10 text-success" />
          <p className="text-sm text-muted-foreground">
            {t("required_fields.all_filled")}
          </p>
          <Button onClick={() => setCurrentStep(2)}>
            {t("required_fields.continue_to_payment")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const submitLabel = mutationLoading ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    t("required_fields.submit")
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          {t("required_fields.title")}
        </CardTitle>
        <CardDescription>{t("required_fields.description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {itemsNeedingFields.map((item, idx) => (
          <RequiredFieldItem
            key={item.id || idx}
            item={item}
            lang={lang}
            fieldValues={fieldValues}
            onFieldChange={handleFieldChange}
            showSeparator={idx > 0}
          />
        ))}

        <Button
          onClick={handleSubmit}
          disabled={mutationLoading}
          className="w-full"
          size="lg"
        >
          {submitLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
