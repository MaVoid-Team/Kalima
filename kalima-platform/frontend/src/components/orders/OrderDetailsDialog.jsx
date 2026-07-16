/* eslint-disable react/prop-types */
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatCurrency, formatOrderDate, getImageUrl } from '@/lib/storeUtils';
import { cn } from '@/lib/utils';

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      <span className="text-muted-foreground col-span-1">{label}</span>
      <span className="font-medium col-span-2 wrap-break-word">{value || '-'}</span>
    </div>
  );
}

export default function OrderDetailsDialog({ order }) {
  const { t, i18n } = useTranslation('admin');

  const screenshotUrl = getImageUrl(order?.payment_screenshot?.url);
  const isDeleted = Boolean(order?.is_deleted || order?.deleted_at);
  const statusValue = isDeleted
    ? t('orders.deleted', 'Deleted')
    : t(`orders.status.${(order?.status || '').toLowerCase()}`, order?.status || '-');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="order-details-trigger-button">
          {t('orders.actions.viewDetails', 'View details')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto" dir={i18n.dir()}>
        <DialogHeader>
          <DialogTitle>
            {t('orders.details.title', 'Order details')} - {order?.purchase_serial || `#${order?.id}`}
          </DialogTitle>
          <DialogDescription>
            {t('orders.createdAt', 'Created at')}: {formatOrderDate(order?.created_at, i18n.language)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="rounded-md border p-4 space-y-2">
            <h4 className="font-semibold text-sm">{t('orders.sections.summary', 'Summary')}</h4>
            <DetailRow label={t('orders.status.label', 'Status')} value={statusValue} />
            {isDeleted && (
              <p className="text-sm font-medium text-destructive">
                {t('orders.deletedNotice', 'This order was deleted by the administration.')}
              </p>
            )}
            <DetailRow label={t('orders.subtotal', 'Subtotal')} value={formatCurrency(order?.subtotal, t)} />
            <DetailRow label={t('orders.discount', 'Discount')} value={formatCurrency(order?.discount, t)} />
            <DetailRow label={t('orders.total', 'Total')} value={formatCurrency(order?.total, t)} />
          </section>

          <section className="rounded-md border p-4 space-y-2">
            <h4 className="font-semibold text-sm">{t('orders.sections.customer', 'Customer')}</h4>
            <DetailRow label={t('orders.customer.name', 'Name')} value={order?.users?.name} />
            <DetailRow label={t('orders.customer.email', 'Email')} value={order?.users?.email} />
            <DetailRow label={t('orders.customer.phone', 'Phone')} value={order?.users?.phone} />
          </section>

          <section className="rounded-md border p-4 space-y-2">
            <h4 className="font-semibold text-sm">{t('orders.sections.payment', 'Payment')}</h4>
            <DetailRow label={t('orders.payment.method', 'Method')} value={order?.payment_methods?.name} />
            <DetailRow label={t('orders.payment.methodPhone', 'Payment phone')} value={order?.payment_methods?.phone_number} />
            <DetailRow label={t('orders.payment.transferredFrom', 'Transferred from')} value={order?.number_transferred_from} />
            <DetailRow label={t('orders.payment.targetNumber', 'Target number')} value={order?.payment_number} />
            {screenshotUrl ? (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <span className="text-muted-foreground col-span-1">{t('orders.payment.screenshot', 'Payment screenshot')}</span>
                <div className="col-span-2">
                  <img
                    src={screenshotUrl}
                    alt={t('orders.payment.screenshot', 'Payment screenshot')}
                    className="w-32 h-32 rounded-md border object-cover"
                  />
                </div>
              </div>
            ) : null}
          </section>

          {/* <section className="rounded-md border p-4 space-y-2">
            <h4 className="font-semibold text-sm">{t('orders.sections.notes', 'Notes')}</h4>
            <DetailRow label={t('orders.notes.customer', 'Customer notes')} value={order?.notes || '-'} />
          </section> */}

          <section className="rounded-md border p-4 space-y-3">
            <h4 className="font-semibold text-sm">{t('orders.items.items', 'Items')}</h4>

            {order?.purchase_items?.length ? (
              order.purchase_items.map((item) => {
                const product = item?.products || {};
                const thumbnail = getImageUrl(product?.thumbnail_image?.url);
                const isRemoved = Boolean(item?.is_deleted || item?.deleted_at);

                return (
                  <div key={item.id} className={cn("rounded-md border p-3 space-y-2", isRemoved && "opacity-60 bg-muted/30")}>
                    <div className="flex gap-3 items-start">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={product?.title || 'Product'}
                          className="w-14 h-14 rounded-md border object-cover shrink-0"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn("font-medium text-sm truncate", isRemoved && "line-through")}>{product?.title || t('orders.unknownProduct', 'Unknown Product')}</p>
                          {isRemoved && (
                            <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-sm">
                              {t('orders.items.removed', 'Removed')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{product?.type || 'Product'}</p>
                        <p className="text-xs mt-1" data-testid={`order-item-serial-${item.id}`}>
                          {t('orders.productSerial', 'Product serial number')}: {product?.serial || '-'}
                        </p>
                        <p className="text-xs mt-1">{t('orders.itemPrice', 'Item price')}: {formatCurrency(item?.price_at_purchase, t)}</p>
                      </div>
                    </div>

                    {item?.purchase_item_required_fields?.length ? (
                      <div className="space-y-1 pt-1 border-t">
                        <p className="text-xs font-semibold text-muted-foreground">{t('orders.requiredFields', 'Required fields')}</p>
                        {item.purchase_item_required_fields.map((field) => {
                          const fieldDef = field?.required_field_definitions;
                          const isImage = fieldDef?.field_type === 'image';
                          const possibleImage = isImage ? getImageUrl(field?.value) : null;

                          return (
                            <div key={field.id} className="grid grid-cols-3 gap-3 text-xs">
                              <span className="text-muted-foreground col-span-1">{fieldDef?.label || t('orders.field', 'Field')}</span>
                              <div className="col-span-2 wrap-break-word">
                                {possibleImage ? (
                                  <img
                                    src={possibleImage}
                                    alt={fieldDef?.label || 'Field image'}
                                    className="w-20 h-20 rounded border object-cover"
                                  />
                                ) : (
                                  <span>{field?.value || '-'}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">{t('orders.items.empty', 'No items')}</p>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
