import { useTranslation } from "react-i18next";

export default function DiscountCode() {
    const { t } = useTranslation('checkout');

    return (
        <div className="flex gap-2">
            <input
                type="text"
                placeholder={t('order_summary.discount_placeholder')}
                className="flex-1 px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
            <button className="px-5 py-3 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors">
                {t('order_summary.apply')}
            </button>
        </div>
    );
}
