import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PaymentMethod, OrderSummary } from '@/components/checkout';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import PrintableReceipt from '@/components/checkout/PrintableReceipt';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function PaymentStep({ onBack }) {
    const { cart, checkout, getPaymentMethods } = useCart();
    const { t, i18n } = useTranslation('checkout');
    const navigate = useNavigate();

    const baseURL = React.useMemo(() => {
        const raw = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        try {
            return new URL(raw).origin;
        } catch {
            return raw.split('/api/v2')[0];
        }
    }, []);

    const [numberTransferredFrom, setNumberTransferredFrom] = useState('');
    const [notes, setNotes] = useState('');
    const [screenshotFile, setScreenshotFile] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
    const [purchase, setPurchase] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);
    const [paymentMethodName, setPaymentMethodName] = useState('');
    const receiptRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handlePay = async () => {
        if (!selectedPaymentMethod) {
            toast.error(t('payment.method_required') || 'Please select a payment method');
            return;
        }
        if (!numberTransferredFrom) {
            toast.error(t('payment.transfer_number_required') || 'Please enter the number you transferred from');
            return;
        }
        // Assuming screenshot might be optional in some cases but required here
        if (!screenshotFile) {
            toast.error(t('payment.screenshot_required') || 'Please upload payment screenshot');
            return;
        }

        try {
            const methods = await getPaymentMethods();
            const sel = methods.find(m => m.id === selectedPaymentMethod || m.id == selectedPaymentMethod);
            setPaymentMethodName(sel?.name || '');
        } catch { }

        const formData = new FormData();
        formData.append('payment_method_id', selectedPaymentMethod);
        formData.append('numberTransferredFrom', numberTransferredFrom);
        if (notes) formData.append('notes', notes);
        if (screenshotFile) formData.append('paymentScreenshot', screenshotFile);

        try {
            const data = await checkout(formData);
            if (data && data.purchase) {
                setPurchase(data.purchase);
                setShowReceipt(true);
            }
        } catch (e) {
            toast.error(t('failed', 'Checkout failed, please try again'), { description: e.message });
        }
    };

    const items = (cart?.cart_items || []).map(i => {
        const image = i.products?.thumbnail_image?.url
            ? new URL(i.products.thumbnail_image.url, baseURL).toString()
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

    const handlePrintReceipt = () => {
        const contentNode = receiptRef.current?.querySelector('[data-print-body]');
        if (!contentNode) {
            toast.error(t('receipt.unable_to_print', 'Unable to print receipt'));
            return;
        }

        const printWindow = globalThis.open('', '_blank', 'width=900,height=1200');
        if (!printWindow) {
            toast.error(t('receipt.popup_blocked', 'Please allow popups to print receipt'));
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
        <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={onBack}>
                    {i18n.dir() === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {t('backToCart', 'Back to Cart')}
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
                    />
                </div>

                <aside className="lg:sticky lg:top-8 h-fit">
                    <OrderSummary items={items} pricing={pricing} onPay={handlePay} />
                </aside>
            </div>

            <AlertDialog open={showReceipt} onOpenChange={() => { setShowReceipt(!showReceipt); navigate('/cart'); }}>
                <AlertDialogContent className="max-w-xl p-6 print:hidden">
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
                                    <p>{t('receipt.payment_method', 'Payment Method')}: {paymentMethodName}</p>
                                )}
                            </div>
                        )}
                        {purchase && (
                            <div className="mt-4 border-t pt-2 space-y-2">
                                {purchase.purchase_items.map((it, idx) => (
                                    <div key={it.products?.id ?? idx} className="flex items-center gap-2">
                                        <img src={new URL(it.products.thumbnail_image?.url || '', baseURL).toString()} alt={it.products?.title || ''} className="w-8 h-8 object-cover rounded" />
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
                    <AlertDialogFooter>
                        <Button onClick={handlePrintReceipt}>{t('receipt.print', 'Print')}</Button>
                        <AlertDialogCancel>{t('cancel', 'Close')}</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <PrintableReceipt purchase={purchase} paymentMethodName={paymentMethodName} baseURL={baseURL} receiptRef={receiptRef} dir={i18n.dir()} />
        </div>
    );
}
