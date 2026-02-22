import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Renders the dynamic proof fields (transfer number + screenshot upload)
 * for a selected payment method.
 */
export default function PaymentProofFields({
  needsTransferNumber,
  needsScreenshot,
  numberTransferredFrom,
  onTransferNumberChange,
  paymentScreenshot,
  onScreenshotChange,
}) {
  const { t } = useTranslation("checkout");

  const hasNoFields = !needsTransferNumber && !needsScreenshot;
  if (hasNoFields) return null;

  return (
    <div className="p-4 bg-muted/30 border-t border-border grid gap-4">
      {needsTransferNumber && (
        <div className="grid gap-2">
          <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
            {t("payment.transfer_number")}
          </Label>
          <Input
            type="text"
            placeholder={t("payment.transfer_number_placeholder")}
            value={numberTransferredFrom}
            onChange={(e) => onTransferNumberChange(e.target.value)}
          />
        </div>
      )}

      {needsScreenshot && (
        <div className="grid gap-2">
          <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
            {t("payment.upload_receipt")}
          </Label>
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              className="cursor-pointer"
              onChange={(e) => onScreenshotChange(e.target.files[0])}
            />
            <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {paymentScreenshot && (
            <p className="text-xs text-success">{paymentScreenshot.name}</p>
          )}
        </div>
      )}
    </div>
  );
}
