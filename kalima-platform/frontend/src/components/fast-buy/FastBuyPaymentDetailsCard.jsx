import { useTranslation } from "react-i18next";
import {
  CreditCard,
  Upload,
  } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FastBuyPaymentDetailsCard({
  state,
  updateField,
  needsTransferNumber,
  needsScreenshot,
  screenshotName,
  paymentMethods,
}) {
  const { t } = useTranslation("checkout");

  return (
    <Card className="border-muted shadow-sm overflow-hidden">
      <CardHeader className=" border-b border-muted pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CreditCard className="w-5 h-5 text-primary" />
          {t("payment.title", "Payment Details")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("payment.secure_notice", "Your payment information is secure")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 animate-in fade-in duration-500">
        {paymentMethods?.length > 0 && (
          <div className="space-y-3">
            <Label className="font-semibold text-foreground/80">
              {t("payment.method", "Select Payment Method")}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentMethods.map((method) => {
                const isSelected = state.paymentMethodId === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => updateField("paymentMethodId", method.id)}
                    className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    {method.images ? (
                      <img
                        src={method.images.url}
                        alt={method.name}
                        className="w-12 h-12 rounded-md object-contain  p-1 border shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate text-start">
                        {method.name}
                      </h4>
                      {method.phone_number && (
                        <p className="text-xs text-muted-foreground mt-0.5 text-start">
                          {method.phone_number}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {needsTransferNumber && (
          <div className="space-y-3">
            <Label
              htmlFor="transferNumber"
              className="font-semibold text-foreground/80"
            >
              {t("payment.transfer_number", "Transfer Number")}
            </Label>
            <Input
              id="transferNumber"
              value={state.numberTransferredFrom}
              onChange={(e) =>
                updateField("numberTransferredFrom", e.target.value)
              }
              placeholder={t(
                "payment.transfer_number_placeholder",
                "Enter transfer number",
              )}
              className="h-12 bg-background focus-visible:ring-primary/20"
            />
          </div>
        )}

        {needsScreenshot && (
          <div className="space-y-3">
            <Label
              htmlFor="screenshot"
              className="font-semibold text-foreground/80"
            >
              {t("payment.screenshot", "Payment Screenshot")}
            </Label>

            <div
              className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer "
              onClick={() => document.getElementById("screenshot").click()}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {screenshotName
                    ? screenshotName
                    : t("payment.upload", "Click to upload receipt")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("payment.upload_hint", "PNG, JPG up to 5MB")}
                </p>
              </div>
            </div>

            <input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={(e) =>
                updateField("paymentScreenshot", e.target.files?.[0] ?? null)
              }
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
