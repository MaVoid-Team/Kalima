/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DeleteCouponDialog({ open, onOpenChange, onConfirm, loading, couponCode }) {
    const { t } = useTranslation('admin');

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent data-testid="delete-coupon-dialog">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        {t('coupons.delete.title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('coupons.delete.confirm')}
                        {couponCode && (
                            <span className="block mt-1 font-medium text-foreground">
                                &ldquo;{couponCode}&rdquo;
                            </span>
                        )}
                        <span className="block mt-2 text-sm">{t('coupons.delete.disclaimer')}</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} data-testid="delete-coupon-cancel-button">
                        {t('common.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="delete-coupon-confirm-button"
                    >
                        {loading ? '...' : t('coupons.actions.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
