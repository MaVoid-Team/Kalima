import { useState } from 'react';
import { TicketCheck, TicketPlus, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="p-6 min-w-0 w-full max-w-full overflow-hidden hover:bg-muted/5 transition-colors group"
        >
            <div className="flex flex-col sm:flex-row gap-6">
                {/* Product Thumbnail */}
                <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-white border border-border/50 shadow-xs relative">
                    <img
                        src={item?.products?.thumbnail_image?.url
                            ? new URL(item.products.thumbnail_image.url, baseURL).toString()
                            : 'https://via.placeholder.com/150'}
                        alt={item?.products?.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="text-base font-bold text-foreground line-clamp-2 leading-tight flex-1">
                                {item?.products?.title}
                            </h3>
                            <div className="text-lg font-black text-primary whitespace-nowrap">
                                {item?.final_price} <span className="text-[10px] uppercase opacity-70">{t('L.E')}</span>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground line-clamp-1 mt-1 opacity-80">
                            {item?.products?.description}
                        </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
                        {/* Coupon Section */}
                        <div className="flex-1 min-w-[120px]">
                            {item.coupons ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full border border-success/20">
                                        <TicketCheck className="w-4 h-4 shrink-0" />
                                        <span className="text-xs font-bold uppercase tracking-wider">{item?.coupons?.code}</span>
                                        <div className="w-px h-3 bg-success/20 mx-0.5" />
                                        <span className="text-xs font-bold whitespace-nowrap">
                                            {item?.coupons?.discount_percentage !== 0
                                                ? `-${item?.coupons?.discount_percentage}%`
                                                : `-${item?.coupons?.discount_amount} ${t('L.E')}`}
                                        </span>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground/60 shrink-0"
                                        onClick={() => removeCoupon(item.id)}
                                        data-testid={`cart-item-remove-coupon-${item.id}`}
                                    >
                                        <Trash className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <motion.div
                                    className="inline-block"
                                    onHoverStart={() => setHoveredCouponItem(true)}
                                    onHoverEnd={() => setHoveredCouponItem(false)}
                                >
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="bg-primary/5 hover:bg-primary/15 text-primary border border-primary/10 rounded-full h-10 px-5 font-bold flex items-center gap-2 group/btn transition-all"
                                        onClick={() => onApplyCouponClick(item.id)}
                                        data-testid={`cart-item-apply-coupon-${item.id}`}
                                    >
                                        <TicketPlus className="w-4 h-4 shrink-0" />
                                        <span className="text-xs sm:hidden">
                                            {t('applyCoupon', 'Apply Coupon')}
                                        </span>
                                        <motion.span
                                            initial={{ maxWidth: 0, opacity: 0 }}
                                            animate={hoveredCouponItem ? { maxWidth: 120, opacity: 1 } : { maxWidth: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="hidden sm:block overflow-hidden whitespace-nowrap text-xs"
                                        >
                                            {t('applyCoupon', 'Apply Coupon')}
                                        </motion.span>
                                    </Button>
                                </motion.div>
                            )}
                        </div>

                        {/* Remove Action */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 font-bold gap-2 rounded-xl h-10 px-4 shrink-0"
                            onClick={() => onRemoveClick(item.id)}
                            data-testid={`cart-item-remove-${item.id}`}
                        >
                            <Trash className="w-4 h-4 shrink-0" />
                            <span className="text-xs">{t('removeFromCart', 'Remove')}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Required Fields Section */}
            <div className="mt-6 pt-4 border-t border-border/5">
                <CartItemRequiredFields
                    item={item}
                    baseURL={baseURL}
                    updateCartItemRequiredFields={updateCartItemRequiredFields}
                    updateCartItemRequiredFieldsImage={updateCartItemRequiredFieldsImage}
                    onOpenChange={onOpenChange}
                />
            </div>
        </motion.div>
    );
}
