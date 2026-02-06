import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PricingSummary({ pricing }) {
    const { t } = useTranslation('checkout');

    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('order_summary.subtotal')}</span>
                <span>${pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('order_summary.shipping')}</span>
                <span>${pricing.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('order_summary.taxes')}</span>
                <span>${pricing.taxes.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-baseline pt-3 mt-2 border-t border-border">
                <div className="flex items-baseline gap-2 text-sm text-card-foreground">
                    <span>{t('order_summary.total')}</span>
                </div>
                <span className="text-2xl font-semibold text-card-foreground">${pricing.total.toFixed(2)}</span>
            </div>

            <button className="flex items-center justify-center gap-2 w-full py-4 mt-2 bg-primary text-primary-foreground rounded-md text-base font-semibold hover:bg-primary/90 transition-colors">
                {t('order_summary.pay')} ${pricing.total.toFixed(2)}
                <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </button>
        </div>
    );
}
