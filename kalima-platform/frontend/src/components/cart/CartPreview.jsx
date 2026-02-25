import React, { useMemo } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { getBaseUrl } from '@/lib/storeUtils';

export default function CartPreview({ open, onOpenChange, cart, onViewFullCart }) {
  const { t, i18n } = useTranslation('cart');
  const navigate = useNavigate();
  const baseURL = useMemo(() => getBaseUrl(), []);

  const onContinueShopping = () => {
    onOpenChange(false);
    navigate('/market');
  }

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
            <Button
              onClick={() => onContinueShopping()}
              variant='secondary'
              data-testid="cart-preview-empty-shopping-button"
            >
              {t('goShopping')}
            </Button>
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
                            {item?.final_price}{t('L.E')}
                          </span>
                          <span className={"text-muted-foreground ms-1"}>
                            {t('qty')} {item?.quantity}
                          </span>
                        </div>
                        {item?.coupons &&
                          <div className='flex justify-center items-center gap-1'>
                            <TicketCheck className={`w-5 h-5 text-success scale-x-[${i18n.language === 'ar' ? '-1' : '1'}]`} />
                            <span className="text-xs text-success">
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
                <span className="text-xl font-bold">{cart?.subtotal}{t('L.E')}</span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {t('shippingCalculatedNext')}
              </p>

              <div className="space-y-2 flex flex-col">
                <Button
                  onClick={onViewFullCart}
                  variant='default'
                  data-testid="cart-preview-view-cart-button"
                >
                  {t('viewFullCart')}
                </Button>
                <Button
                  onClick={onContinueShopping}
                  variant='outline'
                  data-testid="cart-preview-continue-shopping-button"
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