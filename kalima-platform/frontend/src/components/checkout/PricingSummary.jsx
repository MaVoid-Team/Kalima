/* eslint-disable react/prop-types */
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function PricingSummary({ pricing, onPay }) {
    const { t } = useTranslation(['checkout', 'cart']);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('orderSummary.subtotal')}</span>
                <span>{pricing.subtotal}{t("cart:L.E")}</span>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('orderSummary.discount')}</span>
                <span>-{pricing.discount}{t("cart:L.E")}</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between items-baseline">
                <div className="flex items-baseline gap-2 text-sm text-card-foreground">
                    <span>{t('orderSummary.total')}</span>
                </div>
                <span className="text-2xl font-semibold text-card-foreground">{pricing.total}{t("cart:L.E")}</span>
            </div>

            <Button
                className="w-full py-6 mt-2 text-base"
                size="lg"
                onClick={onPay}
                disabled={!onPay}
                data-testid="checkout-pricing-summary-pay-button"
            >
                {t('orderSummary.pay')}

                <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
        </div>
    );
}
