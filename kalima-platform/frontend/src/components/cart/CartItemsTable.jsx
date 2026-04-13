import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getBaseUrl } from '@/lib/storeUtils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import CartItem from './CartItem';

export default function CartItemsTable({
  cartItems,
  removeFromCart,
  applyCoupon,
  removeCoupon,
  updateCartItemRequiredFields,
  updateCartItemRequiredFieldsImage
}) {
  const { t } = useTranslation('cart');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [itemForCoupon, setItemForCoupon] = useState(null);
  const [couponValue, setCouponValue] = useState("");

  const [openItems, setOpenItems] = useState({});

  const _overflowRemovalTimer = useRef(null);
  useEffect(() => {
    try {
      const html = document.documentElement;
      const body = document.body;
      const anyOpen = Object.values(openItems).some(Boolean);
      if (anyOpen) {
        if (_overflowRemovalTimer.current) {
          clearTimeout(_overflowRemovalTimer.current);
          _overflowRemovalTimer.current = null;
        }
        html.classList.add('overflow-x-hidden');
        body.classList.add('overflow-x-hidden');
        return undefined;
      }

      _overflowRemovalTimer.current = setTimeout(() => {
        try {
          html.classList.remove('overflow-x-hidden');
          body.classList.remove('overflow-x-hidden');
        } catch (e) {
          // ignore
        }
        _overflowRemovalTimer.current = null;
      }, 260);

      return () => {
        if (_overflowRemovalTimer.current) {
          clearTimeout(_overflowRemovalTimer.current);
          _overflowRemovalTimer.current = null;
        }
      };
    } catch (e) {
      // ignore
    }
  }, [openItems]);

  const baseURL = useMemo(() => getBaseUrl(), []);

  const handleApply = async (itemId, code) => {
    if (!code) return;
    try {
      await applyCoupon(itemId, code);
      setCouponDialogOpen(false);
      setItemForCoupon(null);
    } catch (err) {
      console.error('Coupon apply failed:', err);
      // keep dialog open so user can retry
    }
  };

  const handleRemoveCoupon = async (itemId) => {
    try {
      await removeCoupon(itemId);
    } catch (err) {
      console.error('Coupon removal failed:', err);
    }
  };

  const handleOpenChange = (itemId, isOpen) => {
    setOpenItems(prev => ({ ...prev, [itemId]: isOpen }));
  };

  return (
    <Card className="rounded-lg shadow-sm border overflow-x-hidden w-full">
      <div className="divide-y divide-border overflow-x-hidden">
        {cartItems.map((item, idx) => (
          <CartItem
            key={item.id}
            item={item}
            idx={idx}
            baseURL={baseURL}
            onRemoveClick={(id) => { setItemToDelete(id); setDialogOpen(true); }}
            onApplyCouponClick={(id) => { setItemForCoupon(id); setCouponValue(''); setCouponDialogOpen(true); }}
            removeCoupon={handleRemoveCoupon}
            updateCartItemRequiredFields={updateCartItemRequiredFields}
            updateCartItemRequiredFieldsImage={updateCartItemRequiredFieldsImage}
            onOpenChange={handleOpenChange}
          />
        ))}
      </div>

      {/* coupon dialog */}
      <AlertDialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('applyCouponTitle', 'Enter coupon code')}</AlertDialogTitle>
            <AlertDialogDescription>{t('applyCouponDesc', 'Type your promo code and hit apply.')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 mt-2">
            <Input
              value={couponValue}
              onChange={(e) => setCouponValue(e.target.value)}
              placeholder={t('enterCode', 'Code')}
              className="w-full"
              data-testid="cart-coupon-input"
            />
            <Button
              onClick={() => {
                if (itemForCoupon && couponValue.trim()) {
                  handleApply(itemForCoupon, couponValue.trim());
                }
              }}
              data-testid="cart-coupon-submit"
            >
              {t('applyCoupon', 'Apply Coupon')}
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCouponDialogOpen(false)} data-testid="cart-coupon-cancel">{t('cancel', 'Cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* alert dialog for delete confirmation */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeleteTitle', 'Delete item')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmDeleteDesc', 'Are you sure you want to remove this item from your cart? This action cannot be undone.')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDialogOpen(false)} data-testid="cart-delete-cancel">{t('cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  removeFromCart(itemToDelete);
                }
                setDialogOpen(false);
                setItemToDelete(null);
              }}
              className="text-destructive"
              data-testid="cart-delete-confirm"
            >
              {t('delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
