import React, { useState, useEffect } from 'react';
import { ArrowRight, Lock, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function CartOrderSummary({
  subtotal,
  discount = '0',
  total,
  isCartItemsRequiredFieldsFilled = true,
  onProceed
}) {
  const { t } = useTranslation('cart');
  const navigate = useNavigate();

  const [clientStates, setClientStates] = useState({});

  useEffect(() => {
    const handleStateChange = (e) => {
      const { itemId, isDirty, missingFields } = e.detail;
      setClientStates(prev => ({
        ...prev,
        [itemId]: { isDirty, missingFields }
      }));
    };
    window.addEventListener('cart-item-client-state', handleStateChange);
    window.dispatchEvent(new CustomEvent('request-cart-item-client-state'));
    return () => window.removeEventListener('cart-item-client-state', handleStateChange);
  }, []);

  const handleCheckout = () => {
    let hasMissing = false;
    let hasDirty = false;

    Object.values(clientStates).forEach(state => {
      if (state.missingFields && state.missingFields.length > 0) {
        hasMissing = true;
      } else if (state.isDirty) {
        hasDirty = true;
      }
    });

    if (!isCartItemsRequiredFieldsFilled && !hasMissing && !hasDirty) {
      hasMissing = true;
    }

    if (hasMissing) {
      toast.error(t('fillRequiredFields_Client_Missing', 'Please fill the missing required fields first'), { description: t('fillRequiredFieldsHint_Client_Missing', 'Some items have missing required fields.') });
      window.dispatchEvent(new CustomEvent('highlight-missing-fields'));
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          const firstError = document.querySelector('.ring-destructive');
          if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
      return;
    }

    if (hasDirty) {
      toast.error(t('saveRequiredFieldsFirst', 'Please save your required fields first.'), { description: t('saveRequiredFieldsFirstHint', 'You have unsaved changes in your cart items.') });
      window.dispatchEvent(new CustomEvent('highlight-unsaved-save-buttons'));
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          const firstUnsaved = document.querySelector('.ring-primary.animate-pulse');
          if (firstUnsaved) firstUnsaved.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
      return;
    }

    if (onProceed) {
      onProceed();
    } else {
      navigate('/checkout');
    }
  };
  return (
    <div className="space-y-6 sticky top-20">
      <Card className="rounded-lg shadow-sm border border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl font-bold">
            {t("orderSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('subtotal')}</span>
              <span className="font-semibold">{subtotal} {t('L.E')}</span>
            </div>
            {discount && discount !== '0' && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('discount', 'Discount')}</span>
                <span className="font-semibold">-{discount} {t('L.E')}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center py-4 border-t border-b border-border mb-6">
            <span className="text-base font-bold">{t('total')}</span>
            <span className="text-2xl font-bold">{total} {t('L.E')}</span>
          </div>

          <Button onClick={handleCheckout} className="w-full text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-4" data-testid="cart-summary-checkout-button">
            {t('proceedToCheckout')}
            <span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs">
            <Lock className="w-3 h-3" />
            <span>{t("secureCheckout")}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm border border-border mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold mb-1">{t("needHelp")}</h3>
              <p className="text-xs mb-3">{t("needHelpText")}</p>
              <Button
                variant="link"
                className="text-xs font-semibold text-primary hover:text-primary/80 p-0 h-auto"
                data-testid="cart-summary-chat-button"
              >
                {t("chatWithUs")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
