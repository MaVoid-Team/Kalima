import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/storeUtils";
import LoadingSpinner from "../ui/loading-spinner";
import OrderReviewWarning from "./OrderReviewWarning";

export default function OrderSummaryCard({
  items,
  subtotal,
  loading,
  isSubmitDisabled,
  onSubmit,
}) {
  const { t } = useTranslation("checkout");

  const submitLabel = loading ? (
    <LoadingSpinner className="w-5 h-5" />
  ) : (
    t("payment.complete_purchase", "Complete Purchase")
  );

  return (
    <div className="w-full lg:w-[400px] sticky top-24 xl:w-[450px]">
      <div className="space-y-4">
        <Card className="border-0 shadow-lg ring-1 ring-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {t("orderSummary.title", "Order Summary")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0 border border-border/50">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/50" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0 pb-1">
                    <h4 className="text-sm font-semibold truncate leading-tight">
                      {item.name}
                    </h4>
                    {item.type && (
                      <p className="text-[10px] uppercase tracking-wider mt-0.5 font-medium">
                        {item.type}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-foreground mt-1">
                      {t("orderSummary.qty", "Qty")}: {item.quantity}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center items-end pl-2">
                    <span className="font-semibold text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-border/50">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-foreground">
                  {t("orderSummary.total", "Total")}
                </span>
                <span className="text-2xl font-black text-primary tracking-tight">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <OrderReviewWarning />

            <Button
              onClick={onSubmit}
              disabled={loading || isSubmitDisabled}
              className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 rounded-xl"
              data-testid="checkout-summary-submit-button"
            >
              {submitLabel}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
