/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import OrderItem from "./OrderItem";

import PricingSummary from "./PricingSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function OrderSummary({ items, pricing, onPay }) {
    const { t } = useTranslation('checkout');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('orderSummary.title')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex flex-col gap-4">
                    {items.map(item => (
                        <OrderItem key={item.id} item={item} />
                    ))}
                </div>

                <div className="grid gap-6">
                    <Separator />
                </div>

                <PricingSummary pricing={pricing} onPay={onPay} />
            </CardContent>
        </Card>
    );
}
