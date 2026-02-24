import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';
import { formatCurrency, formatOrderDate, getStatusColor } from '@/../lib/storeUtils';
import { Badge } from '@/ui/badge';
import OrderActions from './OrderActions';
import { Link } from 'react-router-dom';

export default function OrdersTable({ orders, loading, onActionSuccess }) {
    const { t, i18n } = useTranslation('admin');

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">{t('common.loading', 'Loading...')}</div>;
    }

    if (!orders?.length) {
        return <div className="p-8 text-center text-muted-foreground border rounded-md">{t('orders.messages.noOrdersFound', 'No orders found.')}</div>;
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('orders.table.serial')}</TableHead>
                            <TableHead>{t('orders.table.customer')}</TableHead>
                            <TableHead>{t('orders.table.status')}</TableHead>
                            <TableHead>{t('orders.table.total')}</TableHead>
                            <TableHead>{t('orders.table.payment')}</TableHead>
                            <TableHead className="text-end">{t('orders.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    <Link to={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                                        {order.purchase_serial || `#${order.id}`}
                                    </Link>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {formatOrderDate(order.created_at, i18n.language)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{order.users?.name || t('common.na', 'N/A')}</div>
                                    <div className="text-xs text-muted-foreground">{order.users?.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getStatusColor(order.status)}>
                                        {t(`orders.status${order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}`, { defaultValue: order.status })}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {formatCurrency(order.total, t)}
                                </TableCell>
                                <TableCell>
                                    {order.payment_methods?.name || t('common.na', 'N/A')}
                                </TableCell>
                                <TableCell>
                                    <OrderActions order={order} onActionSuccess={onActionSuccess} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded-md p-4 space-y-4 text-card-foreground shadow-sm">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <Link to={`/admin/orders/${order.id}`} className="font-semibold text-primary hover:underline text-lg">
                                    {order.purchase_serial || `#${order.id}`}
                                </Link>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {formatOrderDate(order.created_at, i18n.language)}
                                </div>
                            </div>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                                {t(`orders.status${order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}`, { defaultValue: order.status })}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <div className="text-muted-foreground">{t('orders.table.customer')}</div>
                                <div className="font-medium truncate" title={order.users?.name || t('common.na', 'N/A')}>{order.users?.name || t('common.na', 'N/A')}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">{t('orders.table.payment')}</div>
                                <div className="font-medium truncate" title={order.payment_methods?.name || t('common.na', 'N/A')}>{order.payment_methods?.name || t('common.na', 'N/A')}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">{t('orders.table.total')}</div>
                                <div className="font-medium">{formatCurrency(order.total, t)}</div>
                            </div>
                        </div>

                        <div className="pt-2 border-t flex justify-end">
                            <OrderActions order={order} onActionSuccess={onActionSuccess} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
