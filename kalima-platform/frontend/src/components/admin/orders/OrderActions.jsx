import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Eye, CheckCircle, RotateCcw, Package, Trash2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useOrders from '@/hooks/useOrders';

export default function OrderActions({ order, onActionSuccess }) {
    const { t } = useTranslation('admin');
    const { receiveOrder, confirmOrder, returnOrder, deleteOrder } = useOrders();

    const handleAction = async (actionFn) => {
        const res = await actionFn();
        if (res?.success && onActionSuccess) {
            onActionSuccess();
        }
    };

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);

    const handleDelete = async () => {
        const res = await deleteOrder(order.id);
        if (res?.success && onActionSuccess) {
            onActionSuccess();
        }
        setDeleteDialogOpen(false);
    };

    const status = order?.status?.toLowerCase();

    return (
        <div className="flex items-center justify-end gap-1">
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('orders.actions.delete')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('orders.messages.deleteOrderWarning')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            {t('common.confirm', 'Confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('orders.details.adminNotes', 'Admin Notes')}</DialogTitle>
                    </DialogHeader>
                    <div className="whitespace-pre-wrap text-sm text-foreground bg-muted/50 p-4 rounded-md max-h-[60vh] overflow-y-auto">
                        {order.admin_notes}
                    </div>
                </DialogContent>
            </Dialog>

            {order.admin_notes && (
                <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-primary hover:text-primary/90 hover:bg-primary/10"
                    onClick={() => setNoteDialogOpen(true)}
                    title={t('orders.actions.viewNote', 'View Note')}
                >
                    <span className="sr-only">{t('orders.actions.viewNote', 'View Note')}</span>
                    <FileText className="h-4 w-4" />
                </Button>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link to={`/admin/orders/${order.id}`} className="cursor-pointer flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            {t('orders.actions.view')}
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {status === 'pending' && (
                        <DropdownMenuItem
                            onClick={() => handleAction(() => receiveOrder(order.id))}
                            className="cursor-pointer flex items-center"
                        >
                            <Package className="mr-2 h-4 w-4" />
                            {t('orders.actions.receive')}
                        </DropdownMenuItem>
                    )}

                    {(status === 'received' || status === 'returned') && (
                        <DropdownMenuItem
                            onClick={() => handleAction(() => confirmOrder(order.id))}
                            className="cursor-pointer flex items-center text-success focus:text-success"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t('orders.actions.confirm')}
                        </DropdownMenuItem>
                    )}

                    {(status === 'received' || status === 'confirmed') && (
                        <DropdownMenuItem
                            onClick={() => handleAction(() => returnOrder(order.id))}
                            className="cursor-pointer flex items-center text-highlight focus:text-highlight"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {t('orders.actions.return')}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault();
                            setDeleteDialogOpen(true);
                        }}
                        className="cursor-pointer flex items-center text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('orders.actions.delete')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
