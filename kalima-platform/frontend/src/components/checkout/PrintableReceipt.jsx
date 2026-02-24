import React from 'react';
import { useTranslation } from 'react-i18next';

export default function PrintableReceipt({ purchase, paymentMethodName = '', baseURL = '', receiptRef, dir = 'ltr' }) {
  const { t } = useTranslation('checkout');
  if (!purchase) return null;

  const paymentDate = new Date().toLocaleString();

  return (
    <div ref={receiptRef} aria-hidden="true" dir={dir} style={{ position: 'absolute', left: '-99999px', top: 0, width: '210mm', pointerEvents: 'none' }}>
      <div data-print-body className="w-full p-6 text-black bg-white">
        <div className="max-w-2xl mx-auto border p-6">
          <header className="mb-4">
            <h2 className="text-xl font-bold">{t('receipt.title', 'Purchase Receipt')}</h2>
            <div className="text-sm text-muted-foreground">{t('header.market_name', '')}</div>
          </header>

          <section className="mb-4 text-sm font-mono">
            <div> {t('receipt.serial', 'Serial')}: {purchase.purchase_serial}</div>
            <div> {t('receipt.status', 'Status')}: {t(`receipt.statuses.${purchase.status}`, purchase.status)}</div>
            <div> {t('receipt.subtotal', 'Subtotal')}: {purchase.subtotal} </div>
            <div> {t('receipt.discount', 'Discount')}: {purchase.discount} </div>
            <div> {t('receipt.total', 'Total')}: {purchase.total} </div>
            <div> {t('receipt.items', 'Items')}: {purchase.purchase_items?.length || 0}</div>
            {paymentMethodName && <div>{t('receipt.payment_method', 'Payment Method')}: {paymentMethodName}</div>}
          </section>

          <section className="mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left pb-2">{t('checkout:receipt.item', { defaultValue: 'Item' })}</th>
                  <th className="text-left pb-2">{t('checkout:receipt.type', { defaultValue: 'Type' })}</th>
                  <th className="text-right pb-2">{t('checkout:receipt.price', { defaultValue: 'Price' })}</th>
                </tr>
              </thead>
              <tbody>
                {purchase.purchase_items.map((it, idx) => (
                  <tr key={it.products?.id ?? idx} className="align-top">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        {it.products?.thumbnail_image?.url ? (
                          <img src={new URL(it.products.thumbnail_image.url, baseURL).toString()} alt={it.products?.title || ''} className="w-12 h-12 object-cover rounded" />
                        ) : null}
                        <div>
                          <div className="font-medium">{it.products?.title}</div>
                          <div className="text-xs text-muted-foreground">{it.created_at ? new Date(it.created_at).toLocaleDateString() : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2">{it.products?.type}</td>
                    <td className="py-2 text-right">{it.price_at_purchase} </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <footer className="mt-6 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>{t('checkout:receipt.paid_on', { defaultValue: 'Paid on' })}:</span><span>{paymentDate}</span></div>
          </footer>
        </div>
      </div>
    </div>
  );
}
