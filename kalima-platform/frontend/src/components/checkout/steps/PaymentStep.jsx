import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PaymentMethod from '@/components/checkout/PaymentMethod';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import PrintableReceipt from '@/components/checkout/PrintableReceipt';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { getBaseUrl, getImageUrl } from '@/lib/storeUtils';
import { buildWhatsAppLink } from '@/lib/whatsappUtils';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import RepeatPurchaseWarningDialog from '@/components/checkout/RepeatPurchaseWarningDialog';
import {
    beginRepeatPurchaseCheck,
    confirmRepeatPurchase,
    dismissRepeatPurchase,
    emptyRepeatPurchaseState,
} from '@/lib/repeatPurchaseFlow';
import useRole from '@/hooks/useRole';

const ORDER_TRACKING_WHATSAPP_NUMBER = '201044067113';

export default function PaymentStep({ onBack }) {
    const { cart, checkout, getPaymentMethods, loadCart } = useCart();
    const { t, i18n } = useTranslation('checkout');
    const navigate = useNavigate();
    const { isTeacher } = useRole();
    const ordersPath = isTeacher ? '/teacher/orders' : '/orders';

    const baseURL = React.useMemo(() => getBaseUrl(), []);

    const [numberTransferredFrom, setNumberTransferredFrom] = useState('');
    const [notes, setNotes] = useState('');
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
    const [purchase, setPurchase] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [paymentMethodName, setPaymentMethodName] = useState('');
    const [hasValidationErrors, setHasValidationErrors] = useState(false);
    const [checkingRepeatPurchase, setCheckingRepeatPurchase] = useState(false);
    const [repeatPurchase, setRepeatPurchase] = useState(emptyRepeatPurchaseState);
    const receiptRef = useRef(null);
    const trackingMessage = purchase
        ? `مرحباً، رقم طلبي المميز هو ${purchase.purchase_serial || `#${purchase.id}`} وأرغب في معرفة حالة الطلب`
        : '';
    const trackingLink = buildWhatsAppLink(ORDER_TRACKING_WHATSAPP_NUMBER, trackingMessage);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const submitValidatedCheckout = async (formData) => {
        const data = await checkout(formData);
        if (data?.purchase) {
            setPurchase(data.purchase);
            setShowReceipt(true);
        }
    };

    const handlePay = async () => {
        if (!isFreeOrder && !selectedPaymentMethod) {
            toast.error(t('payment.methodRequired') || 'Please select a payment method');
            return;
        }
        if (!isFreeOrder && !numberTransferredFrom) {
            toast.error(t('payment.transferNumberRequired') || 'Please enter the number you transferred from');
            return;
        }

        if (!isFreeOrder && hasValidationErrors) {
            toast.error(t('payment.invalidPhoneNumber', 'Please enter a valid phone number'));
            return;
        }
        // Assuming screenshot might be optional in some cases but required here
        if (!isFreeOrder && !screenshotFile) {
            toast.error(t('payment.screenshotRequired') || 'Please upload payment screenshot');
            return;
        }

        try {
            const methods = await getPaymentMethods();
            const sel = methods.find(m => m.id === selectedPaymentMethod || m.id == selectedPaymentMethod);
            setPaymentMethodName(sel?.name || '');
        } catch { }

        const formData = new FormData();
        if (!isFreeOrder && selectedPaymentMethod) formData.append('payment_method_id', selectedPaymentMethod);
        if (!isFreeOrder && numberTransferredFrom) formData.append('numberTransferredFrom', numberTransferredFrom);
        if (notes) formData.append('notes', notes);
        if (!isFreeOrder && screenshotFile) formData.append('paymentScreenshot', screenshotFile);

        setCheckingRepeatPurchase(true);
        let repeatedItems = [];
        try {
            const response = await api.get('/cart/checkout/repeat-purchases');
            repeatedItems = response?.data?.data?.items ?? [];
        } catch {}

        const decision = beginRepeatPurchaseCheck(repeatedItems, formData);
        setRepeatPurchase(decision.state);
        setCheckingRepeatPurchase(false);
        if (decision.shouldSubmit) await submitValidatedCheckout(decision.submission);
    };

    const confirmRepeatedPurchase = async () => {
        const confirmation = confirmRepeatPurchase(repeatPurchase);
        setRepeatPurchase(confirmation.state);
        if (!confirmation.submission) return;

        setCheckingRepeatPurchase(true);
        try {
            await submitValidatedCheckout(confirmation.submission);
        } catch (e) {
            toast.error(t('failed', 'Checkout failed, please try again'), { description: e.message });
        } finally {
            setCheckingRepeatPurchase(false);
        }
    };

    const items = (cart?.cart_items || []).map(i => {
        const image = i.products?.thumbnail_image?.url
            ? (getImageUrl(i.products.thumbnail_image.url) || '')
            : '';
        return {
            id: i.id,
            name: i.products?.title || '',
            type: i.products?.type || '',
            price: i.final_price || 0,
            discount: i.discount || 0,
            quantity: i.quantity,
            image,
        };
    });

    const pricing = {
        subtotal: cart?.subtotal || 0,
        total: cart?.total || 0,
        discount: cart?.discount || 0,
    };
    const isFreeOrder = Number(pricing.total || 0) <= 0;

    const handlePrintReceipt = () => {
        const contentNode = receiptRef.current?.querySelector('[data-print-body]');
        if (!contentNode) {
            toast.error(t('receipt.unableToPrint', 'Unable to print receipt'));
            return;
        }

        const printWindow = globalThis.open('', '_blank', 'width=900,height=1200');
        if (!printWindow) {
            toast.error(t('receipt.popupBlocked', 'Please allow popups to print receipt'));
            return;
        }

        printWindow.document.open();
        printWindow.document.write(`<!doctype html><html dir="${i18n.dir()}" lang="${i18n.language}"><head><meta charset="utf-8" /><title>${t('receipt.title', 'Purchase Receipt')}</title></head><body></body></html>`);
        printWindow.document.close();

        const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
        styleNodes.forEach((node) => {
            printWindow.document.head.appendChild(node.cloneNode(true));
        });

        const baseStyle = printWindow.document.createElement('style');
        baseStyle.textContent = `
            * { box-sizing: border-box; }
            body { margin: 0; padding: 24px; background: #fff; color: #111; }
            @page { size: A4; margin: 14mm; }
            th, td { text-align: start; }
            th:last-child, td:last-child { text-align: end; }
        `;
        printWindow.document.head.appendChild(baseStyle);

        const cloned = contentNode.cloneNode(true);
        printWindow.document.body.innerHTML = '';
        printWindow.document.body.appendChild(cloned);

        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.addEventListener('afterprint', () => printWindow.close(), { once: true });
        }, 250);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full"
        >
            <div className="mb-10">
                <Button 
                    variant="ghost" 
                    className="group gap-2 text-primary font-bold hover:bg-primary/5 transition-all" 
                    onClick={onBack} 
                    data-testid="checkout-payment-step-back-button"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {t('payment.backToCart', 'Back to Cart')}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                <div className="flex flex-col gap-6">
                    <PaymentMethod
                        getPaymentMethods={getPaymentMethods}
                        selectedId={selectedPaymentMethod}
                        onSelect={setSelectedPaymentMethod}
                        numberTransferredFrom={numberTransferredFrom}
                        setNumberTransferredFrom={setNumberTransferredFrom}
                        notes={notes}
                        setNotes={setNotes}
                        screenshotFile={screenshotFile}
                        setScreenshotFile={setScreenshotFile}
                        setValidationErrors={setHasValidationErrors}
                        isFreeOrder={isFreeOrder}
                    />
                </div>

                <aside className="lg:sticky lg:top-8 h-fit">
                    <OrderSummary items={items} pricing={pricing} onPay={handlePay} />
                </aside>
            </div>

            <AlertDialog open={showReceipt}>
                <AlertDialogContent
                    className="max-w-xl p-6 print:hidden"
                    onEscapeKeyDown={(event) => event.preventDefault()}
                    onPointerDownOutside={(event) => event.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold text-center">{t('receipt.title', 'Purchase Receipt')}</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="space-y-4 text-sm font-mono">
                        {purchase && (
                            <div className="space-y-1">
                                <p>{t('receipt.serial', 'Serial')}: {purchase.purchase_serial}</p>
                                <p>{t('receipt.status', 'Status')}: {t(`receipt.statuses.${purchase.status}`, purchase.status)}</p>
                                <p>{t('receipt.subtotal', 'Subtotal')}: {purchase.subtotal} {t('cart:L.E')}</p>
                                <p>{t('receipt.discount', 'Discount')}: {purchase.discount} {t('cart:L.E')}</p>
                                <p>{t('receipt.total', 'Total')}: {purchase.total} {t('cart:L.E')}</p>
                                <p>{t('receipt.items', 'Items')}: {purchase.purchase_items?.length || 0}</p>
                                {paymentMethodName && (
                                    <p>{t('receipt.paymentMethod', 'Payment Method')}: {paymentMethodName}</p>
                                )}
                            </div>
                        )}
                        {purchase && (
                            <div className="mt-4 border-t pt-2 space-y-2">
                                {purchase.purchase_items.map((it, idx) => (
                                    <div key={it.products?.id ?? idx} className="flex items-center gap-2">
                                        <img src={getImageUrl(it.products.thumbnail_image?.url) || ''} alt={it.products?.title || ''} className="w-8 h-8 object-cover rounded" />
                                        <div className="flex-1">
                                            <p>{it.products.title}</p>
                                            <p className="text-xs text-muted-foreground">{it.products.type}</p>
                                        </div>
                                        <div>{it.price_at_purchase} {t('cart:L.E')}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <AlertDialogFooter className="flex-col sm:flex-col gap-3">
                        <p className="text-center text-sm font-medium text-muted-foreground">
                            {t('receipt.trackOrderRequired')}
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="w-full bg-success text-success-foreground hover:bg-success/90"
                            data-testid="checkout-payment-step-receipt-track-order-button"
                        >
                            <a href={trackingLink} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="h-5 w-5" />
                                {t('receipt.trackOrder', 'Track your order')}
                            </a>
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <PrintableReceipt purchase={purchase} paymentMethodName={paymentMethodName} baseURL={baseURL} receiptRef={receiptRef} dir={i18n.dir()} />
            <RepeatPurchaseWarningDialog
                open={repeatPurchase.items.length > 0}
                items={repeatPurchase.items}
                loading={checkingRepeatPurchase}
                title={t('repeatPurchase.title')}
                description={t('repeatPurchase.description')}
                backLabel={t('repeatPurchase.goBack')}
                continueLabel={t('repeatPurchase.continue')}
                onBack={() => setRepeatPurchase(dismissRepeatPurchase())}
                onContinue={confirmRepeatedPurchase}
            />
        </motion.div>
    );
}
