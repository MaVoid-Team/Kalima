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
export default function DeleteProductDialog({ open, onOpenChange, onConfirm, loading, productTitle }) {
    const { t } = useTranslation('admin');

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent data-testid="delete-product-dialog">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive" />
                        {t('products.delete.confirmTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('products.delete.confirm')}
                        {productTitle && (
                            <span className="block mt-1 font-medium text-foreground">
                                &ldquo;{productTitle}&rdquo;
                            </span>
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
