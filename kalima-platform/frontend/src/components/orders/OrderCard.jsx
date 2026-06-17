/* eslint-disable react/prop-types */
import { useTranslation } from 'react-i18next';
import { Package, Clock, CalendarDays, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency, formatOrderDate, getStatusColor } from '@/lib/storeUtils';
import OrderDetailsDialog from '@/components/orders/OrderDetailsDialog';
import OrderItemsCollapsible from '@/components/orders/OrderItemsCollapsible';

const OrderCard = ({ order }) => {
    const { t, i18n } = useTranslation('admin');

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'received': return <Package className="h-4 w-4" />;
            case 'confirmed': return <CheckCircle2 className="h-4 w-4" />;
            case 'returned': return <RefreshCw className="h-4 w-4" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getStatusTranslation = (status) => {
        if (!status) return "";
        return t(`orders.status.${status.toLowerCase()}`, status);
    };

    return (
        <div className="rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border/80 group">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-muted/20 border-b border-border gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            {order.purchase_serial || `#${order.id}`}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusTranslation(order.status)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <time dateTime={order.created_at}>
                            {formatOrderDate(order.created_at, i18n.language)}
                        </time>
                    </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                    <span className="text-sm text-muted-foreground">{t('orders.total', 'Total')}</span>
                    <span className="text-lg font-bold text-foreground">
                        {formatCurrency(order.total, t)}
                    </span>
                    <div className="pt-1">
                        <OrderDetailsDialog order={order} />
                    </div>
                </div>
            </div>

            <OrderItemsCollapsible order={order} />
        </div>
    );
};

export default OrderCard;
