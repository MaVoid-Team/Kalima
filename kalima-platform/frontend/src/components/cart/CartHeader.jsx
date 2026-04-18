import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Trash2, Package } from 'lucide-react';
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
    <div className="mb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary hidden sm:block">
              <Package className="w-6 h-6" />
            </div>
            {t('title')}
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
            {t('itemsInCart', { count: itemCount })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/market')}
            variant="ghost"
            className="flex items-center gap-2 text-primary hover:bg-primary/5 font-bold transition-all"
            data-testid="cart-header-continue-shopping-button"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('continueShopping')}
          </Button>

          {itemCount > 0 && (
            <Button
              onClick={() => setDialogOpen(true)}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex items-center gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 hover:border-destructive/40 transition-all font-bold"
              data-testid="cart-header-clear-cart-button"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('clearCart', 'Clear Cart')}</span>
            </Button>
          )}
        </div>
      </div>

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
