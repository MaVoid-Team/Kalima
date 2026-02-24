import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/storeUtils";

export default function FastBuyOrderSummaryCard({
  items,
  subtotal,
  total,
  discount,
  loading,
  isSubmitDisabled,
  onSubmit,
  onApplyCoupon,
}) {
  const { t } = useTranslation("checkout");

  const submitLabel = loading ? (
    <Loader2 className="w-5 h-5 animate-spin" />
  ) : (
    t("payment.complete_purchase", "Complete Purchase")
  );

  return (
    <div className="w-full lg:w-[400px] sticky top-24 xl:w-[450px] space-y-4">
      <Card className="border-0 shadow-lg ring-1 ring-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("order_summary.title", "Order Summary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 max-h-[40vh] pr-2 ">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col pb-4 border-b border-border/10 last:pb-0 last:border-0"
              >
                <div className="flex gap-4 group">
                  <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
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
                    <h4 className="text-sm font-semibold truncate leading-tight text-start">
                      {item.name}
                    </h4>
                    {item.type && (
                      <p className="text-[10px] uppercase tracking-wider mt-0.5 font-medium text-start">
                        {item.type}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-xs text-muted-foreground/80 line-clamp-1 mt-0.5 text-start">
                        {item.description}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-foreground mt-1 text-start">
                      {t("order_summary.qty", "Qty")}: {item.quantity}
                    </p>
                  </div>
                  <div className="flex flex-col justify-start pt-1 items-end pl-2">
                    <span className="font-bold text-base whitespace-nowrap text-end">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
                {onApplyCoupon && (
                  <div className="flex justify-end pt-2 pl-[80px]">
                    <ItemCouponInput
                      itemId={item.id}
                      onApplyCoupon={onApplyCoupon}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-6 border-t border-border/20">
            <div className="flex justify-between items-center text-muted-foreground font-medium text-sm mb-2">
              <span className="text-start">
                {t("order_summary.subtotal", "Subtotal")}
              </span>
              <span className="text-end">{formatPrice(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-destructive font-medium text-sm mb-3">
                <span className="text-start">
                  {t("order_summary.discount", "Discount")}
                </span>
                <span className="text-end">-{formatPrice(discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-border/20 mt-2 pb-2">
              <span className="text-lg font-bold text-foreground text-start">
                {t("order_summary.total", "Total")}
              </span>
              <span className="text-3xl font-black text-destructive tracking-tight text-end">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <Button
            onClick={onSubmit}
            disabled={loading || isSubmitDisabled}
            className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 rounded-xl"
          >
            {submitLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const ItemCouponInput = ({ itemId, onApplyCoupon }) => {
  const { t } = useTranslation("checkout");
  const [code, setCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setIsApplying(true);
    await onApplyCoupon(itemId, code);
    setIsApplying(false);
    setCode(""); // clear input on success (backend will reflect new prices)
  };

  const translations = {
    placeholder: t("order_summary.discount_placeholder", "Discount code"),
    apply: t("order_summary.apply", "Apply"),
  };

  return (
    <div className="flex gap-2 mt-3 items-center w-full min-w-[200px] max-w-sm">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={translations.placeholder}
        className="h-10 text-sm rounded-xl bg-background flex-1 border-muted-foreground/30 focus-visible:ring-0 text-start"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isApplying || !code.trim()}
        onClick={handleApply}
        className="h-10 text-sm px-6 rounded-xl bg-muted/60 hover:bg-muted font-semibold text-foreground transition-colors shadow-none border border-transparent"
      >
        {isApplying ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          translations.apply
        )}
      </Button>
    </div>
  );
};
