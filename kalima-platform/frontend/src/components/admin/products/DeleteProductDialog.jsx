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

/**
 * Reusable confirmation dialog for product deletion.
 * Controlled externally via `open` + `onOpenChange`.
 */
export default function DeleteProductDialog({ open, onOpenChange, onConfirm, loading, productTitle, hasSample }) {
    const { t } = useTranslation('admin');

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent data-testid="delete-product-dialog">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        {t('products.delete.confirmTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                        <p>{t('products.delete.confirm')}</p>
                        {productTitle && (
                            <span className="block font-medium text-foreground">
                                &ldquo;{productTitle}&rdquo;
                            </span>
                        )}
                        {hasSample && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                                <Trash2 className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>{t('products.delete.sampleWarning', 'Warning: This product has linked samples. Deleting the product will also permanently delete all its associated samples.')}</p>
                            </div>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={loading}
                        data-testid="delete-product-cancel-button"
                    >
                        {t('common.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-testid="delete-product-confirm-button"
                    >
                        {loading ? '...' : t('products.actions.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
