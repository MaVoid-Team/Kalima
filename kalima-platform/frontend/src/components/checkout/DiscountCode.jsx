import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DiscountCode() {
    const { t } = useTranslation('checkout');

    return (
        <div className="flex gap-2">
            <Input
                type="text"
                placeholder={t('order_summary.discount_placeholder')}
                className="flex-1"
            />
            <Button variant="outline">
                {t('order_summary.apply')}
            </Button>
        </div>
    );
}
