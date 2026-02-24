import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, buildProductImages } from '@/lib/storeUtils';
import { Button } from '@/components/ui/button';
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

export default function OrderItemsTable({ items, onDeleteItem, orderId }) {
    const { t, i18n } = useTranslation('admin');
    const [deleteItemId, setDeleteItemId] = useState(null);

    const handleDeleteConfirm = () => {
        if (deleteItemId) {
            onDeleteItem(orderId, deleteItemId);
            setDeleteItemId(null);
        }
    };

    if (!items?.length) return null;

    return (
        <div className="space-y-4">
            <div className="font-medium">{t('orders.details.orderItems')}</div>

            <AlertDialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('orders.actions.deleteItem', 'Remove Item')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('orders.messages.deleteItemWarning', 'Are you sure you want to remove this item from the order? This action cannot be undone.')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            {t('common.confirm', 'Confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Desktop Table */}
            <div className="hidden md:block border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('orders.items.product', 'Product')}</TableHead>
                            <TableHead>{t('orders.items.type', 'Type')}</TableHead>
                            <TableHead>{t('orders.items.price', 'Price')}</TableHead>
                            <TableHead>{t('orders.items.discount', 'Discount')}</TableHead>
                            <TableHead>{t('orders.items.actions', 'Actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => {
                            const product = item.products;
                            const { main: mainImage } = buildProductImages(product);
                            return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {mainImage && (
                                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                                                    <img src={mainImage} className="h-full w-full object-cover" alt="Product thumbnail" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-sm">{product?.title || t('orders.items.unknownProduct', 'Unknown Product')}</div>
                                                <div className="text-xs text-muted-foreground">{product?.product_serial}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{product?.type || item.item_type || t('common.na', 'N/A')}</TableCell>
                                    <TableCell>{formatCurrency(item.price_at_purchase, t)}</TableCell>
                                    <TableCell className="text-success">
                                        {item.discount && item.discount > 0 ? formatCurrency(item.discount, t) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteItemId(item.id)}
                                            disabled={items.length <= 1}
                                            title={items.length <= 1 ? "Cannot delete the only item" : t('orders.actions.deleteItem')}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {items.map((item) => {
                    const product = item.products;
                    const { main: mainImage } = buildProductImages(product);

                    return (
                        <div key={item.id} className="border rounded-md p-4 space-y-3 shadow-sm">
                            <div className="flex gap-4">
                                {mainImage && (
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                                        <img src={mainImage} className="h-full w-full object-cover" alt="Product thumbnail" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-base truncate" title={product?.title || t('orders.items.unknownProduct', 'Unknown Product')}>
                                        {product?.title || t('orders.items.unknownProduct', 'Unknown Product')}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">
                                        {product?.product_serial} • {product?.type || item.item_type || t('common.na', 'N/A')}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteItemId(item.id)}
                                    disabled={items.length <= 1}
                                    className="shrink-0 h-8 w-8"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm bg-muted/30 p-2 rounded-md">
                                <div>
                                    <span className="text-muted-foreground block text-xs">{t('orders.items.price')}</span>
                                    {formatCurrency(item.price_at_purchase, t)}
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs">{t('orders.items.discount')}</span>
                                    <span className="text-success">{item.discount && item.discount > 0 ? formatCurrency(item.discount, t) : '-'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
