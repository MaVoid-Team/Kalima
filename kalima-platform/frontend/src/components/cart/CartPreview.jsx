import React, { useMemo, useState } from 'react';
import { ShoppingBag, TicketCheck, Plus, Minus, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction, } from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getBaseUrl } from '@/lib/storeUtils';
import { useCart } from '@/contexts/CartContext';

export default function CartPreview({ open, onOpenChange, cart, onViewFullCart }) {
  const { t, i18n } = useTranslation('cart');
  const navigate = useNavigate();
  const baseURL = useMemo(() => getBaseUrl(), []);
  const { updateQuantity, removeFromCart, clearCart } = useCart();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  const onContinueShopping = () => {
    onOpenChange(false);
    navigate('/market');
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      setItemToRemove(null);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setClearDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={i18n.language === 'ar' ? 'left' : 'right'} className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">
              {t('previewTitle', { count: cart.cart_items.length })}
            </SheetTitle>
            {cart?.cart_items?.length > 0 && (
              <Button
                onClick={() => setClearDialogOpen(true)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-auto"
                data-testid="cart-preview-clear-cart-button"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
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
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm">
                          <span className="font-semibold">
                            {item?.final_price}{t('L.E')}
                          </span>
                          <span className="text-muted-foreground ms-1">
                            {t('each', { price: `${item?.price_at_add}${t('L.E')}` })}
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
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-lg h-8">
                          <Button
                            aria-label={t('decreaseQuantity')}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            data-testid={`cart-preview-decrease-${item.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                          <Button
                            aria-label={t('increaseQuantity')}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            data-testid={`cart-preview-increase-${item.id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {/* Remove Item Button */}
                        <Button
                          onClick={() => setItemToRemove(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-auto"
                          data-testid={`cart-preview-remove-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

      {/* Remove Item Confirmation Dialog */}
      <AlertDialog open={!!itemToRemove} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeleteTitle', 'Delete item')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDesc', 'Are you sure you want to remove this item from your cart? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cart-preview-remove-cancel">
              {t('cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToRemove && handleRemoveItem(itemToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="cart-preview-remove-confirm"
            >
              {t('delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Cart Confirmation Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('clearCartTitle', 'Clear Cart')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('clearCartDescription', 'Are you sure you want to remove all items from your cart? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cart-preview-clear-cancel">
              {t('cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCart}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="cart-preview-clear-confirm"
            >
              {t('clearCart', 'Clear Cart')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}