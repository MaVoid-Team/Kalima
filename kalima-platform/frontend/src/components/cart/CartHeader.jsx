import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useCart } from '@/contexts/CartContext';

export default function CartHeader({ itemCount }) {
  const { t, i18n } = useTranslation('cart');
  const navigate = useNavigate();
  const { clearCart, loading } = useCart();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClearCart = async () => {
    try {
      await clearCart();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
        <div className="flex items-center gap-2">
          {itemCount > 0 && (
            <Button
              onClick={() => setDialogOpen(true)}
              variant="outline"
              size="sm"
              disapled={loading}
              className="flex items-center gap-1 text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40"
              data-testid="cart-header-clear-cart-button"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('clearCart', 'Clear Cart')}</span>
            </Button>
          )}
          <Button
            onClick={() => navigate('/market')}
            variant="link"
            className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium p-0 h-auto"
            data-testid="cart-header-continue-shopping-button"
          >
            {/* arrow always visible */}
            {i18n.language === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {/* hide text on mobile */}
            <span className="hidden md:inline">{t('continueShopping')}</span>
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">{t('itemsInCart', { count: itemCount })}</p>

      {/* Clear Cart Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('clearCartTitle', 'Clear Cart')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('clearCartDescription', 'Are you sure you want to remove all items from your cart? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cart-clear-cancel">
              {t('cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCart}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="cart-clear-confirm"
            >
              {t('clearCart', 'Clear Cart')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
