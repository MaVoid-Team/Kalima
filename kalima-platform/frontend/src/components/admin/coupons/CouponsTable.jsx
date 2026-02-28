/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '@/components/ui/loading-spinner';
import CouponTableRow from '@/components/admin/coupons/CouponTableRow';
import CouponMobileTableRow from '@/components/admin/coupons/CouponMobileTableRow';
import CouponsTablePagination from '@/components/admin/coupons/CouponsTablePagination';
import { getCouponId } from '@/lib/couponUtils';


export default function CouponsTable({ coupons, loading, onEdit, onDelete, onToggleActivation, pagination, onPageChange, selectedIds = [], onSelect, onSelectAll }) {
    const { t, i18n } = useTranslation('admin');

    if (loading) {
        return (
            <div className="flex h-48 items-center justify-center border rounded-md" data-testid="coupons-table-loading">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!coupons?.length) {
        return (
            <div className="flex h-48 flex-col items-center justify-center border rounded-md text-muted-foreground" data-testid="coupons-table-empty">
                <p>{t('coupons.empty')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4" data-testid="coupons-table-wrapper">
            <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <Checkbox
                                    className={i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}
                                    checked={coupons.length > 0 && selectedIds.length === coupons.length}
                                    onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                                    aria-label="Select all coupons"
                                    data-testid="coupons-table-select-all"
                                />
                            </TableHead>
                            <TableHead>{t('coupons.table.code')}</TableHead>
                            <TableHead>{t('coupons.table.discountType')}</TableHead>
                            <TableHead>{t('coupons.table.discountValue')}</TableHead>
                            <TableHead>{t('coupons.table.productId')}</TableHead>
                            <TableHead className="text-center">{t('coupons.table.dates')}</TableHead>
                            <TableHead>{t('coupons.table.status')}</TableHead>
                            <TableHead className="text-center">{t('coupons.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.map((coupon) => (
                            <CouponTableRow
                                key={getCouponId(coupon)}
                                coupon={coupon}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onToggleActivation={onToggleActivation}
                                isSelected={selectedIds.includes(getCouponId(coupon))}
                                onSelect={onSelect}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="md:hidden rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('coupons.table.code')}</TableHead>
                            <TableHead>{t('coupons.table.discountValue')}</TableHead>
                            <TableHead className="text-end">{t('coupons.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.map((coupon) => (
                            <CouponMobileTableRow
                                key={getCouponId(coupon)}
                                coupon={coupon}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onToggleActivation={onToggleActivation}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>

            <CouponsTablePagination pagination={pagination} onPageChange={onPageChange} />
        </div>
    );
}
