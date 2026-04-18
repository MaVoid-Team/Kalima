/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import OrderItem from "./OrderItem";

import PricingSummary from "./PricingSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function OrderSummary({ items, pricing, onPay }) {
    const { t } = useTranslation('checkout');

    return (
        <Card className="border border-border/40 bg-card/60 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/5 pb-4">
                <CardTitle className="text-xl font-black uppercase tracking-tight">{t('orderSummary.title')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex flex-col gap-5 mb-8">
                    {items.map(item => (
                        <OrderItem key={item.id} item={item} />
                    ))}
                </div>

                <PricingSummary pricing={pricing} onPay={onPay} />
            </CardContent>
        </Card>
    );
}
