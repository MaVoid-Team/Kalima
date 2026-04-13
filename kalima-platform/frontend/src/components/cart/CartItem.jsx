import React, { useState } from 'react';
import { Minus, Plus, TicketCheck, TicketPlus, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CartItemRequiredFields from './CartItemRequiredFields';

export default function CartItem({
    item,
    idx,
    baseURL,
    onRemoveClick,
    onApplyCouponClick,
    removeCoupon,
    updateCartItemRequiredFields,
    updateCartItemRequiredFieldsImage,
    onOpenChange
}) {
    const { t, i18n } = useTranslation('cart');
    const [hoveredCouponItem, setHoveredCouponItem] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.35 }}
            className="p-4 min-w-0 w-full max-w-full overflow-x-hidden"
        >
            <div className="flex gap-4">
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                    <img src={item?.products?.thumbnail_image?.url
                        ? new URL(item.products.thumbnail_image.url, baseURL).toString()
                        : 'https://via.placeholder.com/150'} alt={item?.products?.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1 leading-snug">{item?.products?.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item?.products?.description}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
                <div className="text-sm font-bold text-primary">
                    {item?.final_price} {t('L.E')}
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
                <div className='w-full'>
                    {item.coupons ? (
                        <div className="flex items-center justify-between flex-row gap-2">
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-success" title={t('applied', 'Applied')}><TicketCheck className={`w-4 h-4 scale-x-[${i18n.language === 'ar' ? '-1' : '1'}]`} /></span>
                                <Badge variant="success" className="h-5 px-1.5 text-xs bg-accent">{item?.coupons?.code}</Badge>
                                {item?.coupons?.discount_percentage != 0 && <span className="text-sm text-muted-foreground">{i18n.language === 'en' && '-'}{item?.coupons?.discount_percentage}%{i18n.language === 'ar' && '-'}</span>}
                                {item?.coupons?.discount_amount != 0 && <span className="text-sm text-muted-foreground">-{item?.coupons?.discount_amount} {t('L.E')}</span>}
                                {item?.coupons?.discount_percentage != 0 && <span className="text-xs text-muted-foreground ms-1">({" - " + item?.discount} {t('L.E')})</span>}
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => removeCoupon(item.id)} data-testid={`cart-item-remove-coupon-${item.id}`}>
                                <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    ) : (
                        <motion.div
                            className="inline-block mb-2 min-w-0"
                            onHoverStart={() => setHoveredCouponItem(true)}
                            onHoverEnd={() => setHoveredCouponItem(false)}
                        >
                            <Button
                                size="sm"
                                className="bg-accent not-hover:text-accent-foreground flex items-center"
                                onClick={() => onApplyCouponClick(item.id)}
                                data-testid={`cart-item-apply-coupon-${item.id}`}
                            >
                                <TicketPlus className="w-4 h-4" />
                                <motion.span
                                    initial={{ maxWidth: 0, opacity: 0 }}
                                    animate={
                                        hoveredCouponItem
                                            ? { maxWidth: 96, opacity: 1 }
                                            : { maxWidth: 0, opacity: 0 }
                                    }
                                    transition={{ duration: 0.18 }}
                                    className="overflow-hidden whitespace-nowrap block max-w-full"
                                >
                                    {t('applyCoupon', 'Apply Coupon')}
                                </motion.span>
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>

            <CartItemRequiredFields
                item={item}
                baseURL={baseURL}
                updateCartItemRequiredFields={updateCartItemRequiredFields}
                updateCartItemRequiredFieldsImage={updateCartItemRequiredFieldsImage}
                onOpenChange={onOpenChange}
            />

            <Button className="w-full" onClick={() => onRemoveClick(item.id)} data-testid={`cart-item-remove-${item.id}`}>
                {t('removeFromCart', 'Remove From Cart')}
            </Button>
        </motion.div>
    );
}
