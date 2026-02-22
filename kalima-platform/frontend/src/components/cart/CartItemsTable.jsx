import React, { useEffect, useState } from 'react';
import { Minus, Plus, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export default function CartItemsTable({ 
  cartItems, 
  updateQuantity, 
  removeFromCart, 
  applyCoupon, 
  removeCoupon, 
  thumbnails }) {
  const { t } = useTranslation('cart');
  
  // thumbnails come from parent via prop

  // delete confirmation dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // coupon dialog state
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [itemForCoupon, setItemForCoupon] = useState(null);
  const [couponValue, setCouponValue] = useState("");

  

  const handleApply = async (itemId, code) => {
    if (!code) return;
    try {
      await applyCoupon(itemId, code);
    } catch (err) {
      console.error('Coupon apply failed:', err);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeCoupon(itemId);
    } catch (err) {
      console.error('Coupon removal failed:', err);
    }
  };


  return (
    <Card className="rounded-lg shadow-sm border">
      <div className="hidden md:block">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('header.product')}</TableHead>
              <TableHead className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center hidden md:table-cell">{t('header.quantity')}</TableHead>
              <TableHead className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right hidden md:table-cell">{t('header.total')}</TableHead>
              <TableHead className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center hidden md:table-cell">{t('header.coupon', 'Coupon')}</TableHead>
              <TableHead className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center hidden md:table-cell">{t('header.remove', 'Remove')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cartItems?.map((item, idx) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.35 }}
                className="hover:bg-muted/50 border-b transition-colors"
              >
                <TableCell className="px-6 py-6 align-top whitespace-normal">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                      <img src={thumbnails[item?.products?.id] || 'https://via.placeholder.com/150'} alt={item?.products?.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold mb-1">{item?.products?.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{item?.products?.description}</p>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">{item?.products?.type}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6">
                  <div className="flex items-center justify-between md:justify-center gap-3 border rounded-lg px-3 py-2 w-full md:w-auto">
                    <Button aria-label={t('decreaseQuantity')} onClick={() => updateQuantity(item.id, item.quantity - 1)} variant="ghost" size="icon" className="text-muted-foreground p-1.5 md:p-0 h-auto w-auto"><Minus className="w-4 h-4" /></Button>
                    <span className="text-sm font-medium w-6 text-center">{item?.quantity}</span>
                    <Button aria-label={t('increaseQuantity')} onClick={() => updateQuantity(item.id, item.quantity + 1)} variant="ghost" size="icon" className="text-muted-foreground p-1.5 md:p-0 h-auto w-auto"><Plus className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6 text-right">
                  <div className="text-lg font-bold">${item?.final_price}</div>
                  <div className="text-xs text-muted-foreground">{t('each', { price: `$${item?.price_at_add}` })}</div>
                </TableCell>
                <TableCell className="px-6 py-6 text-center">
                  {item.coupon_id ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-green-600">{t('applied', 'Applied')}</span>
                      <Button size="sm" variant="link" onClick={() => handleRemove(item.id)}>{t('remove', 'Remove')}</Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => { setItemForCoupon(item.id); setCouponValue(''); setCouponDialogOpen(true); }}>
                      {t('applyCoupon', 'Apply Coupon')}
                    </Button>
                  )}
                </TableCell>
                <TableCell className="px-6 py-6 text-center">
                  <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(item.id); setDialogOpen(true); }}>
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden divide-y divide-gray-100">
        {cartItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.35 }}
            className="p-4"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <img src={thumbnails[item?.products?.id] || 'https://via.placeholder.com/150'} alt={item?.products?.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1 leading-snug">{item?.products?.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item?.products?.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-base font-bold text-primary">${item?.final_price}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center border rounded-lg h-9">
                <Button
                  aria-label={t('decreaseQuantity')}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                <Button
                  aria-label={t('increaseQuantity')}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {t('each', { price: `$${item?.price_at_add}` })}
              </div>
            </div>

            {/* coupon controls for mobile */}
            <div className="mt-2 flex items-center justify-between">
              <div>
                {item.coupon_id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600">{t('applied', 'Applied')}</span>
                    <Button size="sm" variant="link" onClick={() => handleRemove(item.id)}>{t('remove', 'Remove')}</Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => { setItemForCoupon(item.id); setCouponValue(''); setCouponDialogOpen(true); }}>
                    {t('applyCoupon', 'Apply Coupon')}
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(item.id); setDialogOpen(true); }}>
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* coupon dialog */}
      <AlertDialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('applyCouponTitle','Enter coupon code')}</AlertDialogTitle>
            <AlertDialogDescription>{t('applyCouponDesc','Type your promo code and hit apply.')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 mt-2">
            <Input
              value={couponValue}
              onChange={(e)=>setCouponValue(e.target.value)}
              placeholder={t('enterCode','Code')}
              className="w-full"
            />
            <Button
              onClick={async () => {
                if (itemForCoupon && couponValue.trim()) {
                  try {
                    await handleApply(itemForCoupon, couponValue.trim());
                    // only close on success
                    setCouponDialogOpen(false);
                    setItemForCoupon(null);
                  } catch (e) {
                    // keep dialog open so user can retry
                    console.error('Coupon apply error, keeping dialog open', e);
                  }
                }
              }}
            >
              {t('applyCoupon','Apply Coupon')}
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCouponDialogOpen(false)}>{t('cancel','Cancel')}</AlertDialogCancel>
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
            <AlertDialogCancel onClick={() => setDialogOpen(false)}>{t('cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  removeFromCart(itemToDelete);
                }
                setDialogOpen(false);
                setItemToDelete(null);
              }}
              className="text-destructive"
            >
              {t('delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
