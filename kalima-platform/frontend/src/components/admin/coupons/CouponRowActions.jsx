/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';
import { Copy, Power, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export default function CouponRowActions({ coupon, couponId, active, onToggleActivation, onEdit, onDelete }) {
    const { t } = useTranslation('admin');

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
        <div className="flex items-center justify-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                title={active ? t('coupons.actions.deactivate') : t('coupons.actions.activate')}
                onClick={() => onToggleActivation?.(coupon)}
                data-testid={`coupons-table-toggle-activation-${couponId}`}
            >
                <Power className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                title={t('coupons.actions.copyCode')}
                onClick={() => handleCopyCode(coupon.code)}
                data-testid={`coupons-table-copy-code-${couponId}`}
            >
                <Copy className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit?.(coupon)}
                data-testid={`coupons-table-edit-${couponId}`}
            >
                <Pencil className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete?.(coupon)}
                data-testid={`coupons-table-delete-${couponId}`}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    );
}
