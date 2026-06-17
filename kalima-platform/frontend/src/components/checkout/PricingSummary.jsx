/* eslint-disable react/prop-types */
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function PricingSummary({ pricing, onPay }) {
    const { t } = useTranslation(['checkout', 'cart']);

    return (
        <div className="flex flex-col gap-4">
            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{t('orderSummary.subtotal')}</span>
                    <span className="font-bold text-foreground">{pricing.subtotal} <span className="text-[10px] opacity-70 uppercase">{t("cart:L.E")}</span></span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{t('orderSummary.discount')}</span>
                    <span className="font-bold text-destructive">-{pricing.discount} <span className="text-[10px] uppercase">{t("cart:L.E")}</span></span>
                </div>
            </div>

            <div className="flex justify-between items-end pt-6 border-t border-border/10 mb-6">
                <span className="text-base font-bold text-foreground">{t('orderSummary.total')}</span>
                <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-primary tracking-tighter leading-none">{pricing.total}</span>
                    <span className="text-[10px] font-black uppercase text-muted-foreground mt-1">{t("cart:L.E")}</span>
                </div>
            </div>

            <Button
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all duration-300 active:scale-[0.98]"
                size="lg"
                onClick={onPay}
                disabled={!onPay}
                data-testid="checkout-pricing-summary-pay-button"
            >
                {t('orderSummary.pay')}
                <ArrowRight className="w-5 h-5" />
            </Button>
        </div>
    );
}
