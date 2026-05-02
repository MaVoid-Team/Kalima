import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/lib/storeUtils';

export default function PaymentMethodsTable({
    paymentMethods,
    loading,
    onEdit,
    onStatusToggle,
    onDelete,
    selectedIds,
    onSelect,
    onSelectAll,
}) {
    const { t, i18n } = useTranslation('admin');

    const isAllSelected = paymentMethods.length > 0 && selectedIds.length === paymentMethods.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < paymentMethods.length;

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
                ))}
            </div>
        );
    }

    if (paymentMethods.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-muted-foreground">
                    {t('paymentMethods.noMethodsFound', 'No payment methods found')}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                className={`${i18n.language == 'ar' ? 'scale-x-[-1]' : ''}`}
                                checked={isAllSelected}
                                data-testid="payment-methods-select-all"
                                onCheckedChange={(checked) => onSelectAll(checked)}
                                ref={(ref) => {
                                    if (ref) {
                                        ref.indeterminate = isIndeterminate;
                                    }
                                }}
                            />
                        </TableHead>
                        <TableHead>{t('paymentMethods.table.image', 'Image')}</TableHead>
                        <TableHead>{t('paymentMethods.table.id', 'ID')}</TableHead>
                        <TableHead>{t('paymentMethods.table.name', 'Name')}</TableHead>
                        <TableHead>{t('paymentMethods.table.phoneNumber', 'Phone Number')}</TableHead>
                        <TableHead>{t('paymentMethods.table.status', 'Status')}</TableHead>
                        <TableHead>{t('paymentMethods.table.createdAt', 'Created')}</TableHead>
                        <TableHead className="w-12">
                            <span className="sr-only">{t('common.actions', 'Actions')}</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paymentMethods.map((paymentMethod) => (
                        <TableRow key={paymentMethod.id}>
                            <TableCell>
                                <Checkbox
                                    className={`${i18n.language == 'ar' ? 'scale-x-[-1]' : ''}`}
                                    checked={selectedIds.includes(paymentMethod.id)}
                                    onCheckedChange={(checked) => onSelect(paymentMethod.id, checked)}
                                    data-testid={`payment-method-select-${paymentMethod.id}`}
                                />
                            </TableCell>
                            <TableCell>
                                {paymentMethod.image_url ? (
                                    <img
                                        src={getImageUrl(paymentMethod.image_url)}
                                        alt={paymentMethod.name}
                                        className="h-12 w-12 rounded-md object-cover border"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                {!paymentMethod.image_url && (
                                    <div className="h-12 w-12 rounded-md bg-muted border flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground">No image</span>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">
                                {paymentMethod.id}
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{paymentMethod.name}</div>
                            </TableCell>
                            <TableCell className={`${i18n.language == "ar" ? "text-right" : "text-left"}`}>
                                <div dir="ltr" className="text-sm text-muted-foreground">
                                    {paymentMethod.phone_number}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={paymentMethod.status}
                                        onCheckedChange={() => onStatusToggle(paymentMethod)}
                                        data-testid={`payment-method-status-${paymentMethod.id}`}
                                    />
                                    <Badge
                                        variant={paymentMethod.status ? 'default' : 'secondary'}
                                        data-testid={`payment-method-status-badge-${paymentMethod.id}`}
                                    >
                                        {paymentMethod.status
                                            ? t('paymentMethods.status.active', 'Active')
                                            : t('paymentMethods.status.inactive', 'Inactive')
                                        }
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(paymentMethod.created_at).toLocaleDateString()}
                                </div>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu dir={i18n.dir()}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            data-testid={`payment-method-actions-${paymentMethod.id}`}
                                        >
                                            <span className="sr-only">{t('common.openMenu')}</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => onEdit(paymentMethod)}
                                            data-testid={`payment-method-edit-${paymentMethod.id}`}
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            {t('common.edit', 'Edit')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(paymentMethod)}
                                            className="text-destructive"
                                            data-testid={`payment-method-delete-${paymentMethod.id}`}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t('common.delete', 'Delete')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
