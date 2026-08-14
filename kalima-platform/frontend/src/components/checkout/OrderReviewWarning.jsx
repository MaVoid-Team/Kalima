import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export default function OrderReviewWarning({ className }) {
  const { t } = useTranslation("checkout");

  return (
    <div
      data-testid="checkout-modification-warning"
      className={cn(
        "rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5 leading-relaxed shadow-sm",
        className
      )}
    >
      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-0.5 text-start">
        <p className="font-bold text-amber-900 dark:text-amber-100">
          {t("orderSummary.reviewWarningTitle", "Please review carefully")}
        </p>
        <p className="text-amber-800/90 dark:text-amber-200/90 text-[11px] leading-normal font-medium">
          {t(
            "orderSummary.reviewWarningMessage",
            "Please review all your details and payment information before confirming. Any modification requested after checkout will incur an additional 50 EGP fee."
          )}
        </p>
      </div>
    </div>
  );
}
