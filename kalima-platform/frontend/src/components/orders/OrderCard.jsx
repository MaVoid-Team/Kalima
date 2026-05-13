/* eslint-disable react/prop-types */
import { useTranslation } from 'react-i18next';
import { Package, Clock, CalendarDays, CheckCircle2, AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { formatCurrency, formatOrderDate, getStatusColor } from '@/lib/storeUtils';
import { buildWhatsAppLink } from '@/lib/whatsappUtils';
import { Button } from '@/components/ui/button';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import OrderItemsCollapsible from '@/components/orders/OrderItemsCollapsible';
import { cn } from '@/lib/utils';

const ORDER_TRACKING_WHATSAPP_NUMBER = '201044067113';

const OrderCard = ({ order }) => {
    const { t, i18n } = useTranslation('admin');

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'deleted': return <AlertCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'received': return <Package className="h-4 w-4" />;
            case 'confirmed': return <CheckCircle2 className="h-4 w-4" />;
            case 'returned': return <RefreshCw className="h-4 w-4" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getStatusTranslation = (status) => {
        if (!status) return "";
        if (status === 'deleted') return t('orders.deleted', 'Deleted');
        return t(`orders.status.${status.toLowerCase()}`, status);
    };

    const isDeleted = Boolean(order?.is_deleted || order?.deleted_at);
    const removedItemsCount = (order?.purchase_items || []).filter((item) => item?.is_deleted || item?.deleted_at).length;
    const displayStatus = isDeleted ? 'deleted' : order.status;
    const orderNumber = order.purchase_serial || `#${order.id}`;
    const trackingMessage = `مرحباً، رقم طلبي المميز هو ${orderNumber} وأرغب في معرفة حالة الطلب`;
    const trackingLink = buildWhatsAppLink(ORDER_TRACKING_WHATSAPP_NUMBER, trackingMessage);

    return (
        <div
            className={cn(
                "rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border/80 group",
                isDeleted && "opacity-75 border-destructive/30 bg-destructive/5 hover:shadow-none"
            )}
            data-testid={`orders-card-${order.id}`}
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-muted/20 border-b border-border gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            {order.purchase_serial || `#${order.id}`}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isDeleted ? 'bg-destructive/10 text-destructive border-destructive/30' : getStatusColor(displayStatus)}`}>
                            {getStatusIcon(displayStatus)}
                            {getStatusTranslation(displayStatus)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <time dateTime={order.created_at}>
                            {formatOrderDate(order.created_at, i18n.language)}
                        </time>
                    </div>
                    {isDeleted && (
                        <p className="text-sm font-medium text-destructive" data-testid={`orders-deleted-notice-${order.id}`}>
                            {t('orders.deletedNotice', 'This order was deleted by the administration.')}
                        </p>
                    )}
                    {!isDeleted && removedItemsCount > 0 && (
                        <p className="text-sm font-medium text-destructive" data-testid={`orders-removed-items-notice-${order.id}`}>
                            {t('orders.removedItemsNotice', { count: removedItemsCount, defaultValue: 'An item was removed from this order.' })}
                        </p>
                    )}
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                    <span className="text-sm text-muted-foreground">{t('orders.total', 'Total')}</span>
                    <span className="text-lg font-bold text-foreground">
                        {formatCurrency(order.total, t)}
                    </span>
                    <div className="flex flex-col sm:items-end gap-2 pt-1">
                        <OrderDetailsDialog order={order} />
                        {!isDeleted && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="border-success/30 text-success hover:bg-success/10 hover:text-success"
                                data-testid={`orders-track-order-${order.id}-button`}
                            >
                                <a href={trackingLink} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="h-4 w-4" />
                                    {t('orders.trackOrder', 'Track Your Order')}
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <OrderItemsCollapsible order={order} />
        </div>
    );
};

export default OrderCard;
