import React from 'react';
import { ArrowLeft, ArrowRight, Lock, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CartOrderSummary({
  subtotal,
  shippingEstimate,
  taxEstimate,
  total,
  promoCode,
  onPromoCodeChange,
}) {
  const { t, i18n } = useTranslation('cart');

  return (
    <div className="space-y-6 sticky top-20">
      <Card className="rounded-lg shadow-sm border border-gray-200">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl font-bold">{t('orderSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('subtotal')}</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('shippingEstimate')}</span>
              <span className="text-xs">{shippingEstimate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('taxEstimate')}</span>
              <span className="font-semibold">${taxEstimate.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-b border-gray-200 mb-6">
            <span className="text-base font-bold">{t('total')}</span>
            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2">{t('promoLabel')}</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={promoCode}
                onChange={(e) => onPromoCodeChange(e.target.value)}
                placeholder={t('promoPlaceholder')}
                className="flex-1 w-full border-gray-300 rounded-lg text-sm focus-visible:ring-red-500"
              />
              <Button variant="secondary" className="px-4 py-2 text-sm font-medium rounded-lg">
                {t('apply')}
              </Button>
            </div>
          </div>

          <Button className="w-full text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-4">
            {t('proceedToCheckout')}
            <span>
              {i18n.language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </span>
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs">
            <Lock className="w-3 h-3" />
            <span>{t('secureCheckout')}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm border border-gray-200 mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold mb-1">{t('needHelp')}</h3>
              <p className="text-xs mb-3">{t('needHelpText')}</p>
              <Button variant="link" className="text-xs font-semibold text-red-600 hover:text-red-700 p-0 h-auto">
                {t('chatWithUs')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
