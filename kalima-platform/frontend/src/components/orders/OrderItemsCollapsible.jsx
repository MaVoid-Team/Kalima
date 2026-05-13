/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, getImageUrl } from '@/lib/storeUtils';
import { cn } from '@/lib/utils';

export default function OrderItemsCollapsible({ order }) {
  const { t } = useTranslation('admin');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-3 gap-3">
        <h4 className="text-sm font-semibold text-foreground">{t('orders.items.items', 'Items')}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          onClick={() => setIsExpanded((prev) => !prev)}
          data-testid="order-items-expand-button"
        >
          {isExpanded ? t('orders.actions.collapseItems', 'Collapse') : t('orders.actions.expandItems', 'Expand')}
          {isExpanded ? <ChevronUp className="h-4 w-4 ms-1" /> : <ChevronDown className="h-4 w-4 ms-1" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-4">
          {order.purchase_items?.map((item) => {
            const product = item.products || {};
            const imgUrl = getImageUrl(product?.thumbnail_image?.url);
            const isRemoved = Boolean(item?.is_deleted || item?.deleted_at);

            return (
              <div
                key={item.id}
                className={cn("flex items-center gap-4", isRemoved && "opacity-60")}
                data-testid={`order-item-${item.id}`}
              >
                <div className="h-14 w-14 rounded-md bg-muted/50 border border-border/50 overflow-hidden shrink-0 relative">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={product.title || 'Product'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className={cn("font-medium text-foreground text-sm truncate", isRemoved && "line-through")}>
                    {product.title || t('orders.unknownProduct', 'Unknown Product')}
                  </h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                      {product.type || 'Product'}
                    </span>
                    {isRemoved && (
                      <span
                        className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-sm"
                        data-testid={`order-item-${item.id}-removed-badge`}
                      >
                        {t('orders.items.removed', 'Removed')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={cn("font-semibold text-sm text-foreground", isRemoved && "line-through text-muted-foreground")}>
                    {formatCurrency(item.price_at_purchase, t)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
