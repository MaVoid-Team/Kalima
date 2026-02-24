import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export default function OrderItem({ item }) {
    const { t } = useTranslation('cart');
    const price = parseFloat(item?.price) || 0;
    const discount = parseFloat(item?.discount) || 0;
    const beforeDiscount = price + discount;
    return (
        <div className="flex items-start gap-4">
            <div className="relative shrink-0">
                <img
                    src={item?.image}
                    alt={item?.name}
                    className="w-16 h-16 rounded-lg object-cover border border-border"
                />
                <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full p-0 text-xs"
                >
                    {item?.quantity}
                </Badge>
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground line-clamp-2">
                    {item?.name}
                </p>
                <p className="text-xs text-muted-foreground">{item?.type}</p>
            </div>

            <div className="flex flex-col items-end justify-between text-right flex-shrink-0">
                {discount > 0 ? (
                    <>
                        <p className="text-sm text-muted-foreground line-through">
                            {beforeDiscount} {t('cart:L.E')}
                        </p>
                        <p className="text-sm font-bold text-success">
                            {price} {t('cart:L.E')}
                        </p>
                    </>
                ) : (
                    <p className="text-sm font-bold text-card-foreground">
                        {price} {t('cart:L.E')}
                    </p>
                )}
            </div>
        </div>
    );
}
