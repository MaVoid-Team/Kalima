import React, {useMemo} from 'react';
import { ShoppingBag, TicketCheck } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function CartPreview({ open, onOpenChange, cart, onViewFullCart }) {
  const { t, i18n } = useTranslation('cart');
  // derive just the origin (scheme+host+port) once; strip any appended paths like `/api/v2`
  const baseURL = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
      return new URL(raw).origin;
    } catch {
      // fallback to manual fallback if URL parsing fails
      return raw.split('/api/v2')[0];
    }
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={i18n.language === 'ar' ? 'left' : 'right'} className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-4">
          <SheetTitle className="text-xl font-bold">
            {t('previewTitle', { count: cart.cart_items.length })}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t('previewDescription')}
          </SheetDescription>
        </SheetHeader>

        {cart?.cart_items?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('empty')}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t('emptyHint')}
            </p>
            <button
              onClick={() => onOpenChange(false)}
              variant='secondary'
            >
              {t('goShopping')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {cart?.cart_items?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={
                          item?.products?.thumbnail_image?.url
                            ? new URL(item.products.thumbnail_image.url, baseURL).toString()
                            : 'https://via.placeholder.com/150'
                        }
                        alt={item?.products?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold mb-1">
                        {item?.products?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {item?.products?.description}
                      </p>
                      <div className={"flex items-center justify-between"}>
                        <div className="text-sm">
                          <span className="font-semibold">
                            ${item?.final_price}
                          </span>
                          <span className={"text-muted-foreground" + (i18n.language === 'ar' ? ' mr-1' : ' ml-1')}>
                            {t('qty')} {item?.quantity}
                          </span>
                        </div>
                        {item?.coupons && 
                        <div className='flex justify-center items-center gap-1'>
                            <TicketCheck className={`w-5 h-5 text-green-500 scale-x-[${i18n.language === 'ar' ? '-1' : '1'}]`} />
                            <span className="text-xs text-green-500">
                              {item?.coupons?.discount_percentage != 0 && `${item?.coupons?.discount_percentage}%`}
                              {item?.coupons?.discount_amount != 0 && `${item?.coupons?.discount_amount} ${t('L.E')}`}
                            </span>
                        </div>
                      }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SheetFooter className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('subtotal')}</span>
                <span className="text-xl font-bold">${cart?.subtotal}</span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {t('shipping_calculated_next')}
              </p>

              <div className="space-y-2 flex flex-col">
                <Button
                  onClick={onViewFullCart}
                  variant='default'
                >
                  {t('viewFullCart')}
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  variant='outline'
                >
                  {t('continueShopping')}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}