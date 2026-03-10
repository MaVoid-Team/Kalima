import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DeletePaymentMethodDialog({ 
    open, 
    onOpenChange, 
    onConfirm, 
    loading, 
    paymentMethodName 
}) {
    const { t } = useTranslation('admin');

    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" data-testid="delete-payment-method-dialog">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {t('paymentMethods.delete.title', 'Delete Payment Method')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('paymentMethods.delete.description', 'This action cannot be undone.')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {t('paymentMethods.delete.warning', 'Are you sure you want to delete this payment method? This action is permanent and cannot be reversed.')}
                        </AlertDescription>
                    </Alert>

                    {paymentMethodName && (
                        <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium">{t('paymentMethods.delete.methodName', 'Payment Method')}:</p>
                            <p className="text-base font-semibold">{paymentMethodName}</p>
                        </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                        <p>{t('paymentMethods.delete.consequences', 'Deleting this payment method will:')}</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>{t('paymentMethods.delete.consequence1', 'Remove it from the available payment options')}</li>
                            <li>{t('paymentMethods.delete.consequence2', 'Affect any pending orders using this method')}</li>
                            <li>{t('paymentMethods.delete.consequence3', 'Require customers to use alternative payment methods')}</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        data-testid="payment-method-delete-cancel"
                    >
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={loading}
                        data-testid="payment-method-delete-confirm"
                    >
                        {loading ? t('paymentMethods.deleting', 'Deleting...') : t('paymentMethods.delete.confirm', 'Delete Payment Method')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
