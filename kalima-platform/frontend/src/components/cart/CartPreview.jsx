import React from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useTranslation } from 'react-i18next';

export default function CartPreview({ open, onOpenChange, cartItems, onViewFullCart }) {
  const { t, i18n } = useTranslation('cart');
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={i18n.language === 'ar' ? 'left' : 'right'} className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-gray-200">
          <SheetTitle className="text-xl font-bold text-gray-900">
            {t('previewTitle', { count: cartItems.length })}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t('previewDescription')}
          </SheetDescription>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('empty')}</h3>
            <p className="text-sm text-gray-600 mb-6">
              {t('emptyHint')}
            </p>
            <button 
                  onClick={() => onOpenChange(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {t('goShopping')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <span className={"text-gray-500" + (i18n.language === 'ar' ? ' mr-1' : ' ml-1')}>
                            {t('qty')} {item.quantity}
                          </span>
                        </div>
                        <button 
                          onClick={(e)=>e.preventDefault()}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label={t('removeItem')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SheetFooter className="border-t border-gray-200 px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{t('subtotal')}</span>
                <span className="text-xl font-bold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                {t('shipping_calculated_next')}
              </p> 

              <div className="space-y-2">
                <button 
                  onClick={onViewFullCart}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {t('viewFullCart')}
                </button> 
                <button 
                  onClick={() => onOpenChange(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {t('continueShopping')}
                </button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}