import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Lock, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useWhatsAppContact } from '@/lib/whatsappUtils';

export default function CartOrderSummary({
  subtotal,
  discount = '0',
  total,
  isCartItemsRequiredFieldsFilled = true,
  onProceed
}) {
  const { t } = useTranslation('cart');
  const navigate = useNavigate();

  const { handleWhatsAppContact } = useWhatsAppContact();

  const handleWhatsApp = () => {
    handleWhatsAppContact('cart', {
      total,
      // We don't have the explicit items count here, 
      // but we can pass whatever data we have
    });
  };

  const [clientStates, setClientStates] = useState({});
  const [highlightSaveAll, setHighlightSaveAll] = useState(false);

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

  const { hasDirty, hasMissing } = useMemo(() => {
    let dirty = false;
    let missing = false;
    Object.values(clientStates).forEach(state => {
      if (state.missingFields && state.missingFields.length > 0) missing = true;
      if (state.isDirty) dirty = true;
    });
    return { hasDirty: dirty, hasMissing: missing };
  }, [clientStates]);

  const handleCheckout = () => {
    // it has already been filled
    if (isCartItemsRequiredFieldsFilled && onProceed) {
      onProceed();
      return;
    }

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
      setTimeout(() => {
        const firstError = document.querySelector('.ring-destructive');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return;
    }

    if (hasDirty) {
      toast.error(t('saveRequiredFieldsFirst', 'Please save your required fields first.'), { description: t('saveRequiredFieldsFirstHint', 'You have unsaved changes in your cart items.') });
      window.dispatchEvent(new CustomEvent('highlight-unsaved-save-buttons'));
      setHighlightSaveAll(true);
      setTimeout(() => setHighlightSaveAll(false), 2000);
      setTimeout(() => {
        if (window.innerWidth < 1024) {
          const firstUnsaved = document.querySelector('.ring-primary.animate-pulse');
          if (firstUnsaved) firstUnsaved.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return;
    }

    if (onProceed) {
      onProceed();
    } else {
      navigate('/checkout');
    }
  };
  return (
    <div className="space-y-6 sticky top-24">
      <Card className="rounded-3xl shadow-xl border border-border/40 bg-card/60 backdrop-blur-md overflow-hidden">
        <CardHeader className="pb-4 bg-muted/20 border-b border-border/10">
          <CardTitle className="text-xl font-bold tracking-tight">
            {t("orderSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">{t('subtotal')}</span>
              <span className="font-bold">{subtotal} <span className="text-[10px] opacity-70 uppercase">{t('L.E')}</span></span>
            </div>
            {discount && discount !== '0' && (
              <div className="flex justify-between text-sm text-destructive font-bold">
                <span className="">{t('discount', 'Discount')}</span>
                <span className="">-{discount} <span>{t('L.E')}</span></span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end pt-6 border-t border-border/10 mb-8">
            <span className="text-base font-bold text-foreground">{t('total')}</span>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-black text-primary tracking-tighter leading-none">{total}</span>
              <span className="text-[10px] font-black uppercase text-muted-foreground mt-1">{t('L.E')}</span>
            </div>
          </div>

          <div className="space-y-3">
            {hasDirty && (
              <Button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('submit-all-cart-item-fields'));
                  toast.success(t('savingAll', 'Saving all changes...'));
                }}
                variant="outline"
                className={`w-full h-12 rounded-xl transition-all duration-300 font-bold border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary ${highlightSaveAll ? 'ring-2 ring-primary ring-offset-2 animate-pulse bg-primary/10' : ''}`}
                data-testid="cart-summary-save-all-button"
              >
                {t('saveAllChanges', 'Save all items')}
              </Button>
            )}

            <Button
              onClick={handleCheckout}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all duration-300 active:scale-[0.98]"
              data-testid="cart-summary-checkout-button"
            >
              {t('proceedToCheckout')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-6 opacity-60">
            <Lock className="w-3.5 h-3.5" />
            <span>{t("secureCheckout")}</span>
          </div> */}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-lg border border-border/30 bg-card/40 backdrop-blur-md overflow-hidden hover:bg-card/60 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black uppercase tracking-tight mb-1">{t("needHelp")}</h3>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-4">{t("needHelpText")}</p>
              <Button
                variant="outline"
                className="h-9 px-4 rounded-xl font-bold text-xs border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
                onClick={handleWhatsApp}
                data-testid="cart-summary-chat-button"
              >
                <MessageCircle className="w-3.5 h-3.5 me-2" />
                {t("chatWithUs")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
