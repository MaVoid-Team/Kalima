import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Package, CheckCircle, RotateCcw, Trash2, ArrowLeft, MessageCircle, ExternalLink, MessageSquare, LogOut, RefreshCw, Copy, Truck } from 'lucide-react';
import { toast } from 'sonner';
import useOrders from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatusTimeline from '@/components/admin/orders/StatusTimeline';
import OrderItemsTable from '@/components/admin/orders/OrderItemsTable';
import AdminNotesSection from '@/components/admin/orders/AdminNotesSection';
import { useWhatsappStatus } from '@/hooks/admin/useWhatsappStatus';
import { QRCodeSVG } from 'qrcode.react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import SendNotificationModal from '@/components/admin/notifications/SendNotificationModal';
import { Bell } from 'lucide-react';
import AppreciationQrButton from '@/components/admin/users/AppreciationQrButton';

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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatOrderDate, getImageUrl, getStatusColor, formatPhone } from '@/lib/storeUtils';

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
        deliverOrder,
        returnOrder,
        deleteOrder,
        addAdminNote,
        deleteOrderItem
    } = useOrders(id);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
    const [isWhatsAppConnectionOpen, setIsWhatsAppConnectionOpen] = useState(false);
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
    const [editableWhatsAppMessage, setEditableWhatsAppMessage] = useState('');

    const { status: whatsappStatus, qrCodeStr, sendingNumber, isActionLoading, requestQR, logout, sendMessage } = useWhatsappStatus();

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
    const purchaserRoles = [
        order.users?.role,
        ...(order.users?.user_roles?.map((userRole) => userRole?.role) || []),
    ];
    const isTeacher = purchaserRoles.some((role) => String(role).toLowerCase() === 'teacher');

    const handleDelete = async () => {
        const res = await deleteOrder(order.id);
        if (res?.success) navigate('/admin/orders');
        setDeleteDialogOpen(false);
    };

    const paymentScreenshot = getImageUrl(order.payment_screenshot?.url);
    const hasPurchaseItemRequiredFields = (order.purchase_items ?? []).some(
        (item) => (item.purchase_item_required_fields ?? []).length > 0
    );

    const whatsappPhone = order.users?.phone?.replace(/\D/g, '');
    const whatsappItems = (order?.purchase_items ?? []).map((item, index) => {
        const title = item.products?.title || item.product?.title || item.title || `#${item.id}`;
        return `- منتج ${index + 1}: ${title} (${item.quantity}x ${item.price} جم)`;
    });

    const whatsappMessage = [
        `هلاً بك أ/ ${order?.users?.name || '-'}`,
        'تم استلام طلبك بنجاح، وجارٍ تجهيزه الآن.',
        '',
        `رقم الطلب: ${order.purchase_serial || `#${order.id}`}`,
        '',
        'المنتجات:',
        whatsappItems.length ? whatsappItems.join('\n') : '-',
        '',
        `الإجمالي: ${order.total} جنية`,
        '',
        'لو عندك أي استفسار بخصوص الطلب، تقدر تتواصل معانا في أي وقت على نفس الرقم.',
        'نتمنى تعجبك تجربتك معانا، ومبسوطين إنك اخترتنا!',
        '',
        'مع تحيات فريق عمل',
        'منصة كلمة',
    ].join('\n');

    const whatsappHref = whatsappPhone
        ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(editableWhatsAppMessage || whatsappMessage)}`
        : '#';

    const buildTransferMemoText = () => {
        const valueOrDash = (value) => {
            const nextValue = String(value ?? '').trim();
            return nextValue || '-';
        };

        const requiredFieldLines = (order.purchase_items ?? []).flatMap((item) => {
            return (item.purchase_item_required_fields ?? [])
                .filter((field) => {
                    const fieldType = field.required_field_definitions?.field_type;
                    return fieldType !== 'file' && fieldType !== 'image';
                })
                .map((field) => {
                    const label = field.required_field_definitions?.label || t('orders.details.field', 'Field');
                    return `${label}: ${valueOrDash(formatPhone(field.value))}`;
                });
        });

        return [
            ...requiredFieldLines,
            `اسم الاكونت: ${valueOrDash(order.users?.name)}`,
            `ايميل الأكونت: ${valueOrDash(order.users?.email)}`,
        ].join('\n');
    };

    const copyTransferMemoText = async () => {
        try {
            await navigator.clipboard.writeText(buildTransferMemoText());
            toast.success(t('orders.messages.transferMemoCopied', 'Transfer memo details copied'));
        } catch (error) {
            toast.error(t('orders.messages.transferMemoCopyFailed', 'Could not copy transfer memo details'));
        }
    };

    const openWhatsAppDialog = () => {
        if (whatsappStatus !== 'ready') {
            setIsWhatsAppConnectionOpen(true);
            return;
        }
        setEditableWhatsAppMessage(whatsappMessage);
        setIsWhatsAppDialogOpen(true);
    };

    const handleWhatsAppSend = () => {
        if (whatsappPhone) {
            sendMessage(editableWhatsAppMessage || whatsappMessage, whatsappPhone);
            setIsWhatsAppDialogOpen(false);
        }
    };

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

            <Dialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>{t('orders.actions.editWhatsAppMessage', 'Edit WhatsApp Message')}</DialogTitle>
                        <DialogDescription>
                            {t('orders.actions.editWhatsAppMessageDesc', 'Review and edit the message before sending it to the customer.')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6">
                        <Textarea
                            value={editableWhatsAppMessage}
                            onChange={(e) => setEditableWhatsAppMessage(e.target.value)}
                            className="font-sans text-sm min-h-[300px] leading-relaxed resize-none"
                            placeholder={t('orders.actions.whatsappPlaceholder', 'Type your message here...')}
                        />
                    </div>
                    <DialogFooter className="p-6 pt-0">
                        <Button variant="outline" onClick={() => setIsWhatsAppDialogOpen(false)}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button
                            onClick={handleWhatsAppSend}
                            className="bg-success text-success-foreground hover:bg-success/90"
                        >
                            <MessageCircle className="h-4 w-4 me-2" />
                            {t('orders.actions.sendOnWhatsApp', 'Send on WhatsApp')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Dialog open={isWhatsAppConnectionOpen} onOpenChange={setIsWhatsAppConnectionOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            {t('settings.general.whatsappLinkAccount')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('settings.general.whatsappLinkDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        {whatsappStatus === 'disconnected' && (
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-muted/20 gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                    <MessageSquare className="h-8 w-8 text-primary" />
                                </div>
                                <p className="font-medium text-center">{t('settings.general.whatsappStatusDisconnected')}</p>
                                <Button onClick={requestQR} className="w-full" disabled={isActionLoading}>
                                    {isActionLoading ? <LoadingSpinner className="h-4 w-4 me-2" /> : <RefreshCw className="h-4 w-4 me-2" />}
                                    {t('settings.general.whatsappConnect')}
                                </Button>
                            </div>
                        )}

                        {whatsappStatus === 'qr_pending' && !qrCodeStr && (
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-muted/20 gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                    <LoadingSpinner className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-medium">{t('settings.general.whatsappInitializing')}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('settings.general.whatsappPreparing')}
                                    </p>
                                </div>
                                <Button onClick={requestQR} variant="outline" size="sm" disabled={isActionLoading}>
                                    {isActionLoading ? <LoadingSpinner className="h-4 w-4 me-2" /> : <RefreshCw className="h-4 w-4 me-2" />}
                                    {t('settings.general.whatsappRefreshQr')}
                                </Button>
                            </div>
                        )}

                        {whatsappStatus === 'qr_pending' && qrCodeStr && (
                            <div className="flex flex-col items-center gap-6">
                                <div className="p-3 bg-white rounded-xl border-2 border-primary/20 shadow-sm">
                                    <QRCodeSVG value={qrCodeStr} size={200} includeMargin />
                                </div>
                                <div className="space-y-3 text-center">
                                    <h4 className="font-bold text-lg">{t('settings.general.whatsappStatusQrPending')}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.general.whatsappScanInstructions')}
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-200">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                                        <span>{t('settings.general.whatsappQrRefreshNotice')}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={requestQR} disabled={isActionLoading}>
                                        {isActionLoading ? <LoadingSpinner className="h-4 w-4 me-2" /> : <RefreshCw className="h-4 w-4 me-2" />}
                                        {t('settings.general.whatsappRefreshQr')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {whatsappStatus === 'failed' && (
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-destructive/30 rounded-xl bg-destructive/5 gap-4">
                                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                                    <LogOut className="h-6 w-6 text-destructive" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-medium text-destructive">{t('settings.general.whatsappStatusFailed')}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('settings.general.whatsappConnectionError')}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" onClick={requestQR} disabled={isActionLoading}>
                                    {isActionLoading ? <LoadingSpinner className="h-4 w-4 me-2" /> : <RefreshCw className="h-4 w-4 me-2" />}
                                    {t('settings.general.whatsappTryAgain')}
                                </Button>
                            </div>
                        )}

                        {whatsappStatus === 'ready' && (
                            <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-900/30 gap-4">
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-green-600">{t('settings.general.whatsappAuthSuccess')}</p>
                                    <p className="text-lg font-mono font-bold mt-1" dir="ltr">+{sendingNumber?.toString().replace(/^\+/, '')}</p>
                                </div>
                                <Button 
                                    className="w-full mt-2" 
                                    onClick={() => {
                                        setIsWhatsAppConnectionOpen(false);
                                        setEditableWhatsAppMessage(whatsappMessage);
                                        setIsWhatsAppDialogOpen(true);
                                    }}
                                >
                                    {t('orders.actions.sendOnWhatsApp')}
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')} className="shrink-0" data-testid="order-detail-back-button">
                        <ChevronLeft />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {order.purchase_serial || `#${order.id}`}
                            </h1>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                                {t(`orders.status${order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}`, { defaultValue: order.status })}
                            </Badge>
                            {order.is_deleted && (
                                <Badge variant="destructive" className="gap-1" data-testid="order-detail-deleted-badge">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {t('orders.deleted', 'Deleted')}
                                </Badge>
                            )}
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
                            <Package className="me-2 h-4 w-4" />
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
                            <CheckCircle className="me-2 h-4 w-4" />
                            {t('orders.actions.confirm')}
                        </Button>
                    )}

                    {status === 'confirmed' && (
                        <Button onClick={() => deliverOrder(order.id)} disabled={actionLoading} variant="default" data-testid="order-detail-deliver-button">
                            <Truck className="me-2 h-4 w-4" />
                            {t('orders.actions.deliver', 'Mark delivered')}
                        </Button>
                    )}

                    {(status === 'received' || status === 'confirmed' || status === 'delivered') && (
                        <Button
                            onClick={() => returnOrder(order.id)}
                            disabled={actionLoading}
                            variant="outline"
                            className="text-highlight border-highlight hover:bg-highlight/10"
                            data-testid="order-detail-return-button"
                        >
                            <RotateCcw className="me-2 h-4 w-4" />
                            {t('orders.actions.return')}
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        onClick={copyTransferMemoText}
                        className="border-primary/20 text-primary hover:bg-primary/10"
                        data-testid="order-detail-copy-transfer-memo-button"
                    >
                        <Copy className="me-2 h-4 w-4" />
                        {t('orders.actions.copyTransferMemo', 'Copy transfer memo')}
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={actionLoading}
                        className="ms-auto"
                        data-testid="order-detail-delete-button"
                    >
                        <Trash2 className="me-2 h-4 w-4" />
                        {t('orders.actions.delete')}
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => setIsNotifModalOpen(true)}
                        className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                    >
                        <Bell className="me-2 h-4 w-4" />
                        {t('notifications:admin.send_notification', 'Send Notification')}
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

                    {/* Required fields collected per purchase item */}
                    {hasPurchaseItemRequiredFields && (
                        <div className="border rounded-md p-4 space-y-4" data-testid="order-detail-required-fields-section">
                            <h3 className="font-medium">{t('orders.details.requiredFields', 'Required Fields')}</h3>

                            <div className="space-y-4">
                                {(order.purchase_items ?? []).map((item, itemIndex) => {
                                    const requiredFields = item.purchase_item_required_fields ?? [];
                                    if (requiredFields.length === 0) return null;

                                    return (
                                        <div key={item.id || itemIndex} className="rounded-md border p-3 space-y-2">
                                            <div className="text-sm font-medium">
                                                {t('orders.details.item', 'Item')} {itemIndex + 1}: {item.products?.title || item.product?.title || item.title || `#${item.id}`}
                                            </div>

                                            <div className="space-y-4 sm:space-y-2">
                                                {requiredFields.map((field, index) => {
                                                    const fieldType = field.required_field_definitions?.field_type;
                                                    const isFile = fieldType === 'file' || fieldType === 'image';
                                                    return (
                                                        <div
                                                            key={field.id || `${item.id || itemIndex}-${field.field_definition_id || index}`}
                                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-sm"
                                                        >
                                                            <span className="text-muted-foreground font-medium shrink-0">
                                                                {field.required_field_definitions?.label || t('orders.details.field', 'Field')}
                                                            </span>
                                                            <div className="sm:max-w-[70%] text-right overflow-hidden break-all">
                                                                {isFile && field.value ? (
                                                                    <div className="flex flex-col items-end gap-1.5">
                                                                        <a
                                                                            href={getImageUrl(field.value)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-block border rounded-md overflow-hidden hover:opacity-90 transition-opacity shadow-sm bg-muted"
                                                                        >
                                                                            <img
                                                                                src={getImageUrl(field.value)}
                                                                                alt="User Upload"
                                                                                className="h-16 w-auto object-cover max-w-full"
                                                                                data-testid={`order-detail-required-file-${field.id}`}
                                                                                onError={(e) => {
                                                                                    // If image fails, hide it and just show the link
                                                                                    e.target.style.display = 'none';
                                                                                }}
                                                                            />
                                                                        </a>
                                                                        <a
                                                                            href={getImageUrl(field.value)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-[10px] text-primary hover:underline flex items-center gap-1 font-medium"
                                                                        >
                                                                            <ExternalLink className="h-3 w-3" />
                                                                            {t('orders.details.viewImage', 'View Image')}
                                                                        </a>
                                                                    </div>
                                                                ) : (
                                                                    <span className="font-mono">{formatPhone(field.value || '-')}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Admin Notes */}
                    <AdminNotesSection
                        orderId={order.id}
                        initialNote={order.admin_notes}
                        onSaveNote={addAdminNote}
                    />

                    {/* Customer Info */}
                    <div className="border rounded-md p-4 space-y-3" data-testid="order-detail-customer-info-section">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-medium text-primary">{t('orders.details.customerInfo')}</h3>
                            {isTeacher && order.users?.id ? (
                                <AppreciationQrButton userId={order.users.id} />
                            ) : null}
                        </div>
                        <div className="space-y-1 text-sm overflow-hidden">
                            <div className="font-medium truncate" title={order.users?.name || 'N/A'}>{order.users?.name || 'N/A'}</div>
                            <div className="text-muted-foreground truncate" title={order.users?.email}>{order.users?.email}</div>
                            {order.users?.phone && (
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="text-muted-foreground truncate" title={formatPhone(order.users.phone)}>{formatPhone(order.users.phone)}</div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={openWhatsAppDialog}
                                        className="h-7 px-2 py-1 text-success border border-success/30 hover:bg-success/10 hover:border-success/50 hover:text-success text-xs font-medium flex items-center gap-1.5"
                                        title={t('orders.details.contactWhatsApp', 'Contact on WhatsApp')}
                                        data-testid="order-detail-whatsapp-button"
                                    >
                                        <MessageCircle className="h-3 w-3" />
                                        WhatsApp
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
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



                    {/* Customer Notes
                    {order.notes && (
                        <div className="bg-destructive/5 border-destructive/20 border rounded-md p-4 space-y-3">
                            <h3 className="font-medium text-destructive">{t('orders.details.customerNotes', 'Customer Notes')}</h3>
                            <div className="text-sm whitespace-pre-wrap text-destructive/80">
                                {order.notes}
                            </div>
                        </div>
                    )} */}

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

            <SendNotificationModal 
                open={isNotifModalOpen} 
                onOpenChange={setIsNotifModalOpen}
                userId={order.user_id}
                entityType="purchase"
                entityId={order.id}
            />
        </div>

    );
}
