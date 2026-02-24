import { useTranslation } from 'react-i18next';
import { Package, Clock, CalendarDays, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency, formatOrderDate, getStatusColor, getImageUrl } from '@/lib/storeUtils';

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
                </div>
            </div>

            {/* Items Section */}
            <div className="p-5">
                <h4 className="text-sm font-semibold text-foreground mb-3">{t('orders.items.items', 'Items')}</h4>
                <div className="flex flex-col gap-4">
                    {order.purchase_items?.map((item) => {
                        const product = item.products || {};
                        const imgUrl = getImageUrl(product?.thumbnail_image?.url);

                        return (
                            <div key={item.id} className="flex items-center gap-4">
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
                                    <h5 className="font-medium text-foreground text-sm truncate">
                                        {product.title || t('orders.unknownProduct', 'Unknown Product')}
                                    </h5>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                                            {product.type || 'Product'}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="font-semibold text-sm text-foreground">
                                        {formatCurrency(item.price_at_purchase, t)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
