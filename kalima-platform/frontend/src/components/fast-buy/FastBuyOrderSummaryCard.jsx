import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/storeUtils";
import LoadingSpinner from "../ui/loading-spinner";
import { cn } from "@/lib/utils";

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
    <LoadingSpinner className="w-5 h-5 border-white" />
  ) : (
    t("payment.completePurchase", "Complete Purchase")
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full lg:w-[400px] sticky top-24 xl:w-[450px] space-y-4"
    >
      <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 bg-muted/20 border-b border-border/10">
          <CardTitle className="text-xl font-bold tracking-tight">
            {t("orderSummary.title", "Order Summary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col pb-4 border-b border-border/10 last:pb-0 last:border-0"
              >
                <div className="flex gap-4 group">
                  <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-border/50 bg-muted/30">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/50" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h4 className="text-sm font-bold truncate leading-tight text-start">
                      {item.name}
                    </h4>
                    {item.type && (
                      <p className="text-[10px] uppercase font-black tracking-widest mt-1 text-primary/80 text-start">
                        {item.type}
                      </p>
                    )}
                    <p className="text-xs font-bold text-muted-foreground mt-1 text-start">
                      {t("orderSummary.qty", "Qty")}: {item.quantity}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center items-end pl-2">
                    <span className="font-black text-sm whitespace-nowrap text-end">
                      {formatPrice(item.price * item.quantity)} {t('L.E')}
                    </span>
                  </div>
                </div>
                {onApplyCoupon && (
                  <div className="flex justify-end pt-2">
                    <ItemCouponInput
                      itemId={item.id}
                      onApplyCoupon={onApplyCoupon}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-border/20">
            <div className="flex justify-between items-center text-muted-foreground font-medium text-sm">
              <span className="text-start">
                {t("orderSummary.subtotal", "Subtotal")}
              </span>
              <span className="text-end font-bold">{formatPrice(subtotal)} {t('L.E')}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-destructive font-bold text-sm">
                <span className="text-start">
                  {t("orderSummary.discount", "Discount")}
                </span>
                <span className="text-end">-{formatPrice(discount)} {t('L.E')}</span>
              </div>
            )}

            <div className="flex justify-between items-end pt-4 border-t border-border/20 mt-2">
              <span className="text-base font-bold text-foreground text-start">
                {t("orderSummary.total", "Total")}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-black text-primary tracking-tighter leading-none">
                  {formatPrice(total)}
                </span>
                <span className="text-[10px] font-black uppercase text-muted-foreground mt-1">{t('L.E')}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={onSubmit}
            disabled={loading || isSubmitDisabled}
            className="w-full h-14 text-lg font-black uppercase tracking-wider shadow-xl shadow-primary/20 rounded-2xl bg-primary hover:bg-primary/90 transition-all duration-300"
            data-testid="fastbuy-summary-submit-button"
          >
            {submitLabel}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
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
    setCode(""); 
  };

  return (
    <div className="flex gap-2 items-center w-full max-w-[240px]">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={t("orderSummary.discountPlaceholder", "Discount code")}
        className="h-9 text-xs rounded-lg border-muted-foreground/20 focus-visible:ring-primary/20 bg-background/50 backdrop-blur-sm text-start"
        data-testid="fastbuy-summary-coupon-input"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-9 px-3 font-bold text-xs rounded-lg"
        disabled={isApplying || !code.trim()}
        onClick={handleApply}
        data-testid="fastbuy-summary-coupon-apply-button"
      >
        {isApplying ? (
          <LoadingSpinner className="w-4 h-4" />
        ) : (
          t("orderSummary.apply", "Apply")
        )}
      </Button>
    </div>
  );
};
