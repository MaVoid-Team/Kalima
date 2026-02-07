import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

            <Separator className="my-2" />

            <div className="flex justify-between items-baseline">
                <div className="flex items-baseline gap-2 text-sm text-card-foreground">
                    <span>{t('order_summary.total')}</span>
                </div>
                <span className="text-2xl font-semibold text-card-foreground">${pricing.total.toFixed(2)}</span>
            </div>

            <Button className="w-full py-6 mt-2 text-base" size="lg">
                {t('order_summary.pay')} ${pricing.total.toFixed(2)}
                <ArrowRight className="w-5 h-5 rtl:rotate-180 ml-2" />
            </Button>
        </div>
    );
}
