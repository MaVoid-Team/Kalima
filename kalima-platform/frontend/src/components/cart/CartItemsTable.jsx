import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CartItemsTable({ cartItems, localize, updateQuantity }) {
  const { t } = useTranslation('cart');

  return (
    <Card className="rounded-lg shadow-sm border">
      <div className="hidden md:block">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('header.product')}</TableHead>
              <TableHead className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center hidden md:table-cell">{t('header.quantity')}</TableHead>
              <TableHead className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right hidden md:table-cell">{t('header.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cartItems.map((item, idx) => (
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
                      <img src={item.image} alt={localize(item, 'name')} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold mb-1">{localize(item, 'name')}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{localize(item, 'description')}</p>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">{localize(item, 'type')}</span>
                        <span className={`text-xs font-medium flex items-center gap-1 ${item.stockLow ? 'text-red-600' : 'text-green-600'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {localize(item, 'stock')}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6">
                  <div className="flex items-center justify-between md:justify-center gap-3 border rounded-lg px-3 py-2 w-full md:w-auto">
                    <Button aria-label={t('decreaseQuantity')} onClick={() => updateQuantity(item.id, item.quantity - 1)} variant="ghost" size="icon" className="text-muted-foreground p-1.5 md:p-0 h-auto w-auto"><Minus className="w-4 h-4" /></Button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <Button aria-label={t('increaseQuantity')} onClick={() => updateQuantity(item.id, item.quantity + 1)} variant="ghost" size="icon" className="text-muted-foreground p-1.5 md:p-0 h-auto w-auto"><Plus className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-6 text-right">
                  <div className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{t('each', { price: `$${item.price.toFixed(2)}` })}</div>
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
                <img src={item.image} alt={localize(item, 'name')} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1 leading-snug">{localize(item, 'name')}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{localize(item, 'description')}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-base font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</div>
                  {item.stockLow && (
                    <span className="text-[10px] font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                      {localize(item, 'stock')}
                    </span>
                  )}
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
                {t('each', { price: `$${item.price.toFixed(2)}` })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
