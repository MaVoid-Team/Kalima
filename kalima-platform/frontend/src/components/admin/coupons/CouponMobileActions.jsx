/* eslint-disable react/prop-types */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Eye, MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CouponDetailsDialog from '@/components/admin/coupons/CouponDetailsDialog';

export default function CouponMobileActions({ coupon, couponId, active, onToggleActivation, onEdit, onDelete }) {
    const { t, i18n } = useTranslation('admin');
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleCopyCode = async (code) => {
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);
            toast.success(t('coupons.messages.codeCopied'));
        } catch {
            toast.error(t('coupons.messages.codeCopyFailed'));
        }
    };

    return (
        <div className="flex items-center justify-end gap-1">
            <DropdownMenu dir={i18n.dir()}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`coupons-table-mobile-menu-${couponId}`}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onSelect={() => setDetailsOpen(true)}
                        data-testid={`coupons-table-mobile-view-${couponId}`}

                    >
                        <Eye className="h-4 w-4" />
                        {t('coupons.actions.viewDetails', { defaultValue: 'View details' })}
                    </DropdownMenuItem>


                    <DropdownMenuItem
                        onSelect={() => onToggleActivation?.(coupon)}
                        data-testid={`coupons-table-mobile-toggle-${couponId}`}
                    >
                        <Power className="h-4 w-4" />
                        {active ? t('coupons.actions.deactivate') : t('coupons.actions.activate')}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => handleCopyCode(coupon.code)}
                        data-testid={`coupons-table-mobile-copy-${couponId}`}
                    >
                        <Copy className="h-4 w-4" />
                        {t('coupons.actions.copyCode')}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => onEdit?.(coupon)}
                        data-testid={`coupons-table-mobile-edit-${couponId}`}
                    >
                        <Pencil className="h-4 w-4" />
                        {t('coupons.actions.edit')}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => onDelete?.(coupon)}
                        data-testid={`coupons-table-mobile-delete-${couponId}`}
                    >
                        <Trash2 className="h-4 w-4" />
                        {t('coupons.actions.delete')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CouponDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} coupon={coupon} />
        </div>
    );
}
