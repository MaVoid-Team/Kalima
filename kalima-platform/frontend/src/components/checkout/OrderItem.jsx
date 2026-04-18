import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export default function OrderItem({ item }) {
    const { t } = useTranslation('cart');
    const price = parseFloat(item?.price) || 0;
    const discount = parseFloat(item?.discount) || 0;
    const beforeDiscount = price + discount;
    return (
        <div className="flex items-center gap-4 group">
            <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-white border border-border/50 shadow-xs">
                <img
                    src={item?.image}
                    alt={item?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground line-clamp-1 leading-none mb-1">
                    {item?.name}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">{item?.type}</p>
            </div>

            <div className="flex flex-col items-end shrink-0">
                {discount > 0 ? (
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] text-muted-foreground line-through opacity-70 leading-none mb-1">
                            {beforeDiscount} {t('cart:L.E')}
                        </p>
                        <p className="text-sm font-black text-primary leading-none">
                            {price} <span className="text-[10px] uppercase">{t('cart:L.E')}</span>
                        </p>
                    </div>
                ) : (
                    <p className="text-sm font-black text-foreground leading-none">
                        {price} <span className="text-[10px] uppercase opacity-60">{t('cart:L.E')}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
