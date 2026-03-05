import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Package, CheckCircle, RotateCcw, Trash2, ArrowLeft, MessageCircle } from 'lucide-react';
import useOrders from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusTimeline from '@/components/admin/orders/StatusTimeline';
import OrderItemsTable from '@/components/admin/orders/OrderItemsTable';
import AdminNotesSection from '@/components/admin/orders/AdminNotesSection';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatCurrency, formatOrderDate, getImageUrl, getStatusColor } from '@/lib/storeUtils';

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('admin');

    const {
        selectedOrder: order,
        loading,
        actionLoading,
        receiveOrder,
        confirmOrder,
        returnOrder,
        deleteOrder,
        addAdminNote,
        deleteOrderItem
    } = useOrders(id);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">{t('orders.details.loading', 'Loading details...')}</div>;
    }

    if (!order) {
        return (
            <div className="p-8 text-center">
                <div className="text-muted-foreground mb-4">{t('orders.details.notFound', 'Order not found.')}</div>
                <Button variant="outline" onClick={() => navigate('/admin/orders')} data-testid="order-detail-back-to-orders">
                    {t('orders.details.backToOrders')}
                </Button>
            </div>
        );
    }

    const status = order.status?.toLowerCase();

    const handleDelete = async () => {
        const res = await deleteOrder(order.id);
        if (res?.success) navigate('/admin/orders');
        setDeleteDialogOpen(false);
    };

    const paymentScreenshot = getImageUrl(order.payment_screenshot?.url);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('orders.actions.delete')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('orders.messages.deleteOrderWarning')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel data-testid="order-detail-delete-cancel">{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" data-testid="order-detail-delete-confirm">
                            {t('common.confirm', 'Confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')} className="shrink-0" data-testid="order-detail-back-button">
                        <ChevronLeft />
                    </Button>
                    <div>
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {order.purchase_serial || `#${order.id}`}
                            </h1>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                                {t(`orders.status${order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}`, { defaultValue: order.status })}
                            </Badge>
                        </div>
                        <div className="text-muted-foreground">
                            {formatOrderDate(order.created_at, i18n.language)}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {status === 'pending' && (
                        <Button
                            onClick={() => receiveOrder(order.id)}
                            disabled={actionLoading}
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/20"
                            data-testid="order-detail-receive-button"
                        >
                            <Package className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2 rtl:scale-x-[-1]" />
                            {t('orders.actions.receive')}
                        </Button>
                    )}

                    {(status === 'received' || status === 'returned') && (
                        <Button
                            onClick={() => confirmOrder(order.id)}
                            disabled={actionLoading}
                            className="bg-success text-success-foreground hover:bg-success/90"
                            data-testid="order-detail-confirm-button"
                        >
                            <CheckCircle className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2 rtl:scale-x-[-1]" />
                            {t('orders.actions.confirm')}
                        </Button>
                    )}

                    {(status === 'received' || status === 'confirmed') && (
                        <Button
                            onClick={() => returnOrder(order.id)}
                            disabled={actionLoading}
                            variant="outline"
                            className="text-highlight border-highlight hover:bg-highlight/10"
                            data-testid="order-detail-return-button"
                        >
                            <RotateCcw className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2 rtl:scale-x-[-1]" />
                            {t('orders.actions.return')}
                        </Button>
                    )}

                    <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={actionLoading}
                        className="ml-auto"
                        data-testid="order-detail-delete-button"
                    >
                        <Trash2 className="mr-2 h-4 w-4 rtl:mr-0 rtl:ml-2 rtl:scale-x-[-1]" />
                        {t('orders.actions.delete')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Items table */}
                    <OrderItemsTable
                        items={order.purchase_items}
                        orderId={order.id}
                        onDeleteItem={deleteOrderItem}
                    />

                    {/* Admin Notes */}
                    <AdminNotesSection
                        orderId={order.id}
                        initialNote={order.admin_notes}
                        onSaveNote={addAdminNote}
                    />
                </div>

                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="border rounded-md p-4 space-y-4">
                        <h3 className="font-medium">{t('orders.details.orderSummary')}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('orders.details.itemsCount')}:</span>
                                <span>{order.purchase_items?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t('orders.details.subtotal', 'Subtotal')}:</span>
                                <span>{formatCurrency(order.subtotal, t)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t('orders.details.discount', 'Discount')}:</span>
                                <span className="text-success" dir="ltr">-{formatCurrency(order.discount, t)}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg border-t pt-4">
                                <span>{t('orders.details.total', 'Total')}:</span>
                                <span>{formatCurrency(order.total, t)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border rounded-md p-4 space-y-3">
                        <h3 className="font-medium">{t('orders.details.customerInfo')}</h3>
                        <div className="space-y-1 text-sm overflow-hidden">
                            <div className="font-medium truncate" title={order.users?.name || 'N/A'}>{order.users?.name || 'N/A'}</div>
                            <div className="text-muted-foreground truncate" title={order.users?.email}>{order.users?.email}</div>
                            {order.users?.phone && (
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="text-muted-foreground truncate" title={order.users.phone}>{order.users.phone}</div>
                                    <a
                                        href={`https://wa.me/${order.users.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-7 px-2 py-1 text-success border-success/30 hover:border-success/50"
                                        title={t('orders.details.contactWhatsApp', 'Contact on WhatsApp')}
                                        data-testid="order-detail-whatsapp-link"
                                    >
                                        <MessageCircle className="h-3 w-3 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                                        WhatsApp
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Notes */}
                    {order.notes && (
                        <div className="border rounded-md p-4 space-y-3">
                            <h3 className="font-medium">{t('orders.details.customerNotes', 'Customer Notes')}</h3>
                            <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                                {order.notes}
                            </div>
                        </div>
                    )}

                    {/* Payment Info */}
                    <div className="border rounded-md p-4 space-y-3">
                        <h3 className="font-medium">{t('orders.details.paymentInfo')}</h3>
                        <div className="space-y-2 text-sm overflow-hidden">
                            <div className="flex justify-between align-top gap-2">
                                <span className="text-muted-foreground shrink-0">{t('orders.details.method')}:</span>
                                <span className="text-right truncate flex-1" title={order.payment_methods?.name || 'N/A'}>{order.payment_methods?.name || 'N/A'}</span>
                            </div>
                            {order.number_transferred_from && (
                                <div className="flex justify-between align-top gap-2">
                                    <span className="text-muted-foreground shrink-0">{t('orders.details.transferFrom')}:</span>
                                    <span className="text-right truncate flex-1" title={order.number_transferred_from}>{order.number_transferred_from}</span>
                                </div>
                            )}
                            {order.payment_number && (
                                <div className="flex justify-between align-top gap-2">
                                    <span className="text-muted-foreground shrink-0">{t('orders.details.paymentNumber')}:</span>
                                    <span className="text-right truncate flex-1" title={order.payment_number}>{order.payment_number}</span>
                                </div>
                            )}
                            {paymentScreenshot && (
                                <div className="mt-4">
                                    <span className="text-muted-foreground block mb-2">{t('orders.details.screenshot')}:</span>
                                    <a href={paymentScreenshot} target="_blank" rel="noreferrer" className="block border rounded-md overflow-hidden hover:opacity-90" data-testid="order-detail-payment-screenshot">
                                        <img src={paymentScreenshot} alt={t('orders.details.screenshot', 'Payment screenshot')} className="w-full object-cover" style={{ maxHeight: '200px' }} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <StatusTimeline order={order} />

                    {/* Coupon Info */}
                    {order.coupon_usages && order.coupon_usages.length > 0 && (
                        <div className="border rounded-md p-4 space-y-2">
                            <h3 className="font-medium">{t('orders.details.couponInfo')}</h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                                {order.coupon_usages.map((cu, idx) => (
                                    <span key={cu.id || idx} className="font-mono bg-muted px-2 py-1 rounded inline-block">
                                        {cu.coupons?.code || cu.coupon?.code || cu.code || t('orders.details.couponInfo')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
