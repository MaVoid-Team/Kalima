import React, { useMemo, useState } from 'react';
import { Minus, Plus, TicketCheck, TicketPlus, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
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
  updateCartItemRequiredFields
}) {
  const { t, i18n } = useTranslation('cart');

  // delete confirmation dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // coupon dialog state
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [itemForCoupon, setItemForCoupon] = useState(null);
  const [couponValue, setCouponValue] = useState("");
  const [hoveredCouponItem, setHoveredCouponItem] = useState(null);
  const [openItems, setOpenItems] = useState({});
  const [fieldValues, setFieldValues] = useState({});

  // derive just the origin (scheme+host+port) once; strip any appended paths like `/api/v2`
    const baseURL = useMemo(() => {
      const raw = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        return new URL(raw).origin;
      } catch {
        // fallback to manual fallback if URL parsing fails
        return raw.split('/api/v2')[0];
      }
    }, []);

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

      <div className="divide-y divide-gray-100">
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
                <img src={item?.products?.thumbnail_image?.url
                            ? new URL(item.products.thumbnail_image.url, baseURL).toString()
                            : 'https://via.placeholder.com/150'} alt={item?.products?.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1 leading-snug">{item?.products?.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item?.products?.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-base font-bold">{item?.final_price} {t('L.E')}</div>
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
                {t('each', { price: `${item?.price_at_add} ${t('L.E')}` })}
              </div>
            </div>

            {/* coupon controls for mobile */}
            <div className="mt-2 flex items-center justify-between">
              <div className='w-full'>
                {item.coupons ? (
                  <div className="flex items-center justify-between flex-row gap-2">
                    <div className="flex items-center gap-1">
                    <span className="text-sm text-green-600" title={t('applied', 'Applied')}><TicketCheck className={`w-4 h-4 scale-x-[${i18n.language === 'ar' ? '-1' : '1'}]`} /></span>
                    <Badge variant="success" className="h-5 px-1.5 text-xs bg-accent">{item?.coupons?.code}</Badge>
                    {item?.coupons?.discount_percentage != 0 &&<span className="text-sm text-muted-foreground">{i18n.language==='en' && '-'}{item?.coupons?.discount_percentage}%{i18n.language==='ar' && '-'}</span>}
                    {item?.coupons?.discount_amount != 0 &&<span className="text-sm text-muted-foreground">{i18n.language==='en' && '-'}{item?.coupons?.discount_amount} {t('L.E')} {i18n.language==='ar' && '-'}</span>}
                    <span className="text-xs text-muted-foreground ml-1">({" - " +  item?.discount} {t('L.E')})</span>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handleRemove(item.id)}>
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    className="inline-block mb-2"
                    onHoverStart={() => setHoveredCouponItem(item.id)}
                    onHoverEnd={() => setHoveredCouponItem(null)}
                  >
                    <Button
                      size="sm"
                      className="bg-accent not-hover:text-accent-foreground flex items-center"
                      onClick={() => { setItemForCoupon(item.id); setCouponValue(''); setCouponDialogOpen(true); }}
                    >
                      <TicketPlus className="w-4 h-4" />
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={
                          hoveredCouponItem === item.id
                            ? { width: 'auto', opacity: 1 }
                            : { width: 0, opacity: 0 }
                        }
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {t('applyCoupon', 'Apply Coupon')}
                      </motion.span>
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* required fields accordion (shadcn) */}
            {item.cart_item_required_fields && item.cart_item_required_fields.length > 0 && (
              <div className="mt-2">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  value={openItems[item.id] ? 'fields' : undefined}
                  onValueChange={val => {
                    const open = !!val;
                    setOpenItems(prev => ({ ...prev, [item.id]: open }));
                    if (open && !fieldValues[item.id]) {
                      const vals = {};
                      item.cart_item_required_fields.forEach(rf => {
                        vals[rf.field_definition_id] = rf.required_field_definitions.value || '';
                      });
                      setFieldValues(prev => ({ ...prev, [item.id]: vals }));
                    }
                  }}
                >
                  <AccordionItem value="fields">
                    <AccordionTrigger className="text-sm text-primary">
                      {openItems[item.id] ? t('hideDetails','Hide details') : t('viewMore','View more')}
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 space-y-2 p-2 border rounded">
                      {item.cart_item_required_fields.map(rf => (
                        <div key={rf.field_definition_id} className="flex flex-col">
                          <label className="text-xs font-medium mb-1">
                            {rf.required_field_definitions.label}
                          </label>
                          <Input
                            type={rf.required_field_definitions.field_type}
                            value={fieldValues[item.id]?.[rf.field_definition_id] || ''}
                            required={rf.required_field_definitions.is_required}
                            onChange={e => {
                              const val = e.target.value;
                              setFieldValues(prev => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  [rf.field_definition_id]: val,
                                },
                              }));
                            }}
                            className="input-sm"
                          />
                        </div>
                      ))}
                      <Button
                        size="sm"
                        onClick={async () => {
                          const data = Object.entries(fieldValues[item.id] || {}).map(
                            ([id, value]) => ({
                              required_field_definition_id: Number(id),
                              value,
                            })
                          );
                          try {
                            await updateCartItemRequiredFields(item.id, data);
                          } catch (e) {
                            console.error('failed updating required fields', e);
                          }
                        }}
                      >
                        {t('save','Save')}
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

            <Button className="w-full" onClick={() => { setItemToDelete(item.id); setDialogOpen(true); }}>
                {t('removeFromCart', 'Remove From Cart')}
              </Button>
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
