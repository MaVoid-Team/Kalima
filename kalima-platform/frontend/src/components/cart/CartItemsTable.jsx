import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Minus, Plus, TicketCheck, TicketPlus, Trash, ImageOff, ArrowRight } from 'lucide-react';
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
  updateCartItemRequiredFields,
  updateCartItemRequiredFieldsImage
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
  const [imageFields, setImageFields] = useState({});
  // keep original (server) image URLs to show old -> new replacement preview
  const [originalImages, setOriginalImages] = useState({});
  // track validation errors for file inputs: key format `${itemId}_${fieldId}`
  const [fileErrors, setFileErrors] = useState({});
  // track previews that failed to load
  const [brokenPreviews, setBrokenPreviews] = useState({});

  // Prevent horizontal body scrolling when any accordion is open on small screens
  // delay removal of overflow lock to avoid transient scroll during collapse animation
  const _overflowRemovalTimer = useRef(null);
  useEffect(() => {
    try {
      const html = document.documentElement;
      const body = document.body;
      const anyOpen = Object.values(openItems).some(Boolean);
      // if any open, ensure overflow is locked immediately
      if (anyOpen) {
        if (_overflowRemovalTimer.current) {
          clearTimeout(_overflowRemovalTimer.current);
          _overflowRemovalTimer.current = null;
        }
        html.classList.add('overflow-x-hidden');
        body.classList.add('overflow-x-hidden');
        return undefined;
      }

      // when no items open, wait a short time for collapse animation to finish
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
      // ignore when not running in DOM environment
    }
  }, [openItems]);


  
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
    
  // When cartItems change (e.g., after upload and parent reloads), resync local preview state
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;
    cartItems.forEach(item => {
      if (!openItems[item.id]) return;
      const vals = {};
      item.cart_item_required_fields.forEach(rf => {
        if (rf.required_field_definitions.field_type === 'image') {
          const serverUrl = rf.value ? new URL(rf.value, baseURL).toString() : '';
          vals[rf.field_definition_id] = serverUrl;
          setOriginalImages(prev => ({
            ...prev,
            [item.id]: {
              ...(prev[item.id] || {}),
              [rf.field_definition_id]: serverUrl,
            },
          }));
          setImageFields(prev => ({
            ...prev,
            [item.id]: {
              field_definition_id: rf.field_definition_id,
              value: null,
            },
          }));
        } else {
          vals[rf.field_definition_id] = rf.value || '';
        }
      });
      setFieldValues(prev => ({ ...prev, [item.id]: vals }));
    });
  }, [cartItems, openItems, baseURL]);

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

  const handleCartRequiredFieldsSubmit = async (e, itemId) => {
    e.preventDefault();
    // validate required image fields manually so browser popup doesn't appear
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      let hasError = false;
      const errors = {};
      item.cart_item_required_fields.forEach(rf => {
        if (
          rf.required_field_definitions.field_type === 'image' &&
          rf.is_required &&
          !(imageFields[itemId] && imageFields[itemId].value instanceof File)
        ) {
          hasError = true;
          errors[`${itemId}_${rf.field_definition_id}`] = t('pleaseSelectFile','Please select a file');
        }
      });
      if (hasError) {
        setFileErrors(prev => ({ ...prev, ...errors }));
        return;
      }
    }

    // clear any previous file errors for this item
    setFileErrors(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(k => {
        if (k.startsWith(`${itemId}_`)) delete copy[k];
      });
      return copy;
    });

    // only send image request if a new file was selected
    if (
      imageFields[itemId] &&
      imageFields[itemId].value instanceof File
    ) {
      const fieldDefId = imageFields[itemId].field_definition_id;
      try {
        await updateCartItemRequiredFieldsImage(
          itemId,
          fieldDefId,
          imageFields[itemId].value
        );
        // on success, clear selected file and the stored original image for this field
        setImageFields(prev => ({
          ...prev,
          [itemId]: {
            ...prev[itemId],
            value: null,
          },
        }));
        setOriginalImages(prev => {
          const copy = { ...prev };
          if (copy[itemId]) {
            const itemCopy = { ...copy[itemId] };
            delete itemCopy[fieldDefId];
            if (Object.keys(itemCopy).length === 0) {
              delete copy[itemId];
            } else {
              copy[itemId] = itemCopy;
            }
          }
          return copy;
        });
        setFieldValues(prev => {
          if (!prev[itemId]) return prev;
          const p = { ...prev };
          p[itemId] = { ...p[itemId], [fieldDefId]: '' };
          return p;
        });
        // reset native input value if present
        const inputEl = document.getElementById(`file-${itemId}-${fieldDefId}`);
        if (inputEl) inputEl.value = '';
      } catch (err) {
        console.error('Required fields image update failed:', err);
      }
    }
    const data = Object.entries(fieldValues[itemId] || {})
      .filter(([id]) => {
        // drop the image field entry entirely instead of returning undefined
        return !(
          imageFields[itemId] &&
          Number(id) === imageFields[itemId].field_definition_id
        );
      })
      .map(([id, value]) => ({
        required_field_definition_id: Number(id),
        value,
      }));
    try {
      await updateCartItemRequiredFields(itemId, data);
    } catch (e) {
      console.error('failed updating required fields', e);
    }
  }


  return (
    <Card className="rounded-lg shadow-sm border overflow-x-hidden w-full">

      <div className="divide-y divide-gray-100 overflow-x-hidden">
        {cartItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.35 }}
            className="p-4 min-w-0 w-full max-w-full overflow-x-hidden"
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
                    {item?.coupons?.discount_percentage != 0 && <span className="text-sm text-muted-foreground">{i18n.language==='en' && '-'}{item?.coupons?.discount_percentage}%{i18n.language==='ar' && '-'}</span>}
                    {item?.coupons?.discount_amount != 0 && <span className="text-sm text-muted-foreground">-{item?.coupons?.discount_amount} {t('L.E')}</span>}
                    {item?.coupons?.discount_percentage != 0 && <span className="text-xs text-muted-foreground ml-1">({" - " +  item?.discount} {t('L.E')})</span>}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handleRemove(item.id)}>
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    className="inline-block mb-2 min-w-0"
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
                        initial={{ maxWidth: 0, opacity: 0 }}
                        animate={
                          hoveredCouponItem === item.id
                            ? { maxWidth: 96, opacity: 1 }
                            : { maxWidth: 0, opacity: 0 }
                        }
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden whitespace-nowrap block max-w-full"
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
              <div className="mt-2 overflow-x-hidden">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full mb-2 overflow-x-hidden"
                  onValueChange={val => {
                    const open = !!val;
                    setOpenItems(prev => ({ ...prev, [item.id]: open }));
                    if (open && !fieldValues[item.id]) {
                      const vals = {};
                      item.cart_item_required_fields.forEach(rf => {
                        if (rf.required_field_definitions.field_type === 'image') {
                          // store a preview URL in the form values while keeping file upload state separate
                          const serverUrl = rf.value ? new URL(rf.value, baseURL).toString() : '';
                          vals[rf.field_definition_id] = serverUrl;
                          setImageFields(prev => ({
                            ...prev,
                            [item.id]: {
                              field_definition_id: rf.field_definition_id,
                              value: null, // will be replaced when user selects a file
                            },
                          }));
                          // keep the original (server) image separate so we can show old -> new preview
                          if (serverUrl) {
                            setOriginalImages(prev => ({
                              ...prev,
                              [item.id]: {
                                ...(prev[item.id] || {}),
                                [rf.field_definition_id]: serverUrl,
                              },
                            }));
                          }
                        } else {
                          vals[rf.field_definition_id] = rf.value || '';
                        }
                      });
                      setFieldValues(prev => ({ ...prev, [item.id]: vals }));
                    }
                  }}
                >
                  <AccordionItem value="fields">
                    <AccordionTrigger className={"text-sm " + (item.required_fields_filled ? "text-green-600" : "text-primary")}>
                      {openItems[item.id] ? t('hideDetails','Hide details') : t('viewMore','View more')}
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 space-y-2 p-2 border rounded overflow-x-hidden min-w-0 w-full box-border max-w-full">
                      <form onSubmit={(e) => handleCartRequiredFieldsSubmit(e, item.id)} className='flex flex-col gap-2 w-full max-w-full overflow-x-hidden'>
                        {item.cart_item_required_fields.map(rf => (
                          <div key={rf.field_definition_id} className="flex flex-col">
                            <label className="text-xs font-medium mb-1">
                              {rf.required_field_definitions.label}
                              <span className="text-destructive">{rf.is_required ? ' *' : ''}</span>
                            </label>
                            {rf.required_field_definitions.field_type === 'image' ? (
                              <>
                                {/* custom file picker with translated label */}
                                <div className="flex items-center gap-2 min-w-0">
                                  <label
                                    htmlFor={`file-${item.id}-${rf.field_definition_id}`}
                                    className="cursor-pointer px-3 py-1 bg-accent text-accent-foreground rounded-sm text-sm"
                                  >
                                    {originalImages[item.id]?.[rf.field_definition_id]
                                      ? t('replaceImage', 'Replace image')
                                      : t('uploadImage', 'Upload image')}
                                  </label>
                                  <Input
                                    id={`file-${item.id}-${rf.field_definition_id}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        // store file for uploading
                                        setImageFields(prev => ({
                                          ...prev,
                                          [item.id]: {
                                            field_definition_id: rf.field_definition_id,
                                            value: file,
                                          },
                                        }));
                                        // preview in the form values
                                        const url = URL.createObjectURL(file);
                                        setFieldValues(prev => ({
                                          ...prev,
                                          [item.id]: {
                                            ...prev[item.id],
                                            [rf.field_definition_id]: url,
                                          },
                                        }));
                                        // clear any error
                                        setFileErrors(prev => {
                                          const key = `${item.id}_${rf.field_definition_id}`;
                                          const copy = { ...prev };
                                          delete copy[key];
                                          return copy;
                                        });
                                        // clear any broken flag for this new preview
                                        setBrokenPreviews(prev => {
                                          const copy = { ...prev };
                                          delete copy[`${item.id}_${rf.field_definition_id}_new`];
                                          return copy;
                                        });
                                      }
                                    }}
                                    className="sr-only"
                                  />
                                    {imageFields[item.id]?.value ? (
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-sm max-w-40 truncate block" title={imageFields[item.id].value.name}>
                                        {imageFields[item.id].value.name}
                                      </span>
                                      <Button
                                        type="button"
                                        onClick={() => {
                                          // clear selected file and preview only (keep original server image)
                                          setImageFields(prev => ({
                                            ...prev,
                                            [item.id]: {
                                              ...prev[item.id],
                                              value: null,
                                            },
                                          }));
                                          setFieldValues(prev => ({
                                            ...prev,
                                            [item.id]: {
                                              ...prev[item.id],
                                              [rf.field_definition_id]: originalImages[item.id]?.[rf.field_definition_id] || '',
                                            },
                                          }));
                                          // also reset input value if needed
                                          const inputEl = document.getElementById(
                                            `file-${item.id}-${rf.field_definition_id}`
                                          );
                                          if (inputEl) inputEl.value = '';
                                        }}
                                        className="text-xs"
                                      >
                                        <Trash className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ) : null}
                                  {/* display validation message */}
                                  {fileErrors[`${item.id}_${rf.field_definition_id}`] && (
                                    <p className="text-destructive text-xs mt-1">
                                      {fileErrors[`${item.id}_${rf.field_definition_id}`]}
                                    </p>
                                  )}
                                </div>
                                {
                                  // show old -> new replacement preview when both exist, otherwise show single preview or placeholder
                                  (() => {
                                    const key = `${item.id}_${rf.field_definition_id}`;
                                    const originalUrl = originalImages[item.id]?.[rf.field_definition_id];
                                    const hasSelectedFile = !!(imageFields[item.id] && imageFields[item.id].value instanceof File);
                                    const selectedUrl = fieldValues[item.id]?.[rf.field_definition_id];

                                    const brokenOld = !!brokenPreviews[`${key}_old`];
                                    const brokenNew = !!brokenPreviews[`${key}_new`];

                                    if (originalUrl && hasSelectedFile) {
                                      return (
                                        <div className="mt-2 flex flex-wrap items-center gap-3 max-w-full min-w-0">
                                          <div className="w-20 h-20 overflow-hidden rounded bg-gray-50 border flex-shrink-0">
                                            {!brokenOld ? (
                                              <img
                                                src={originalUrl}
                                                alt={t('oldImage','Old image')}
                                                className="w-full h-full object-cover max-w-full"
                                                onError={() => setBrokenPreviews(prev => ({ ...prev, [`${key}_old`]: true }))}
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <ImageOff className="w-6 h-6 text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                                          <div className="w-20 h-20 overflow-hidden rounded bg-gray-50 border flex-shrink-0">
                                            {!brokenNew ? (
                                              <img
                                                src={selectedUrl}
                                                alt={t('newImage','New image')}
                                                className="w-full h-full object-cover max-w-full"
                                                onError={() => setBrokenPreviews(prev => ({ ...prev, [`${key}_new`]: true }))}
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <ImageOff className="w-6 h-6 text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }

                                    // single preview (either selected or original)
                                    const singleUrl = selectedUrl || originalUrl;
                                    const singleBroken = selectedUrl ? brokenNew : brokenOld;
                                    if (singleUrl && !singleBroken) {
                                      return (
                                        <img
                                          src={singleUrl}
                                          alt={t('preview','Preview')}
                                          className="mt-2 w-24 max-w-full h-auto rounded"
                                          style={{ display: 'block', maxWidth: '100%' }}
                                          onError={() => {
                                            setBrokenPreviews(prev => ({ ...prev, [selectedUrl ? `${key}_new` : `${key}_old`]: true }));
                                          }}
                                        />
                                      );
                                    }

                                    return (
                                      <div className="mt-2 w-24 h-24 flex items-center justify-center bg-gray-100 rounded">
                                        <ImageOff className="w-6 h-6 text-gray-400" />
                                      </div>
                                    );
                                  })()
                                }
                              </>
                            ) : (
                              <Input
                                type={rf?.required_field_definitions?.field_type}
                                value={fieldValues[item.id]?.[rf.field_definition_id] || ''}
                                required={rf?.is_required}
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
                            )}
                          </div>
                        ))}
                        <Button
                          size="sm"
                          type="submit"
                          className="w-fit self-end"
                        >
                        {t('save','Save')}
                      </Button>
                    </form>
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
