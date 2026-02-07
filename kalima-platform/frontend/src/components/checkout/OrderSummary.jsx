import { useTranslation } from "react-i18next";
import OrderItem from "./OrderItem";
import DiscountCode from "./DiscountCode";
import PricingSummary from "./PricingSummary";
import { Lock, Heart, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function OrderSummary({ items, pricing }) {
    const { t } = useTranslation('checkout');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('order_summary.title')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex flex-col gap-4">
                    {items.map(item => (
                        <OrderItem key={item.id} item={item} />
                    ))}
                </div>

                <div className="grid gap-6">
                    <Separator />
                    <DiscountCode />
                </div>

                <PricingSummary pricing={pricing} />
            </CardContent>
            <CardFooter className="flex justify-center gap-4 pt-4 border-t">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <Heart className="w-5 h-5 text-muted-foreground" />
                <FileText className="w-5 h-5 text-muted-foreground" />
            </CardFooter>
        </Card>
    );
}
