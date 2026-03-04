import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PaymentMethodFilters({
    filters,
    onSearchChange,
    onStatusChange,
    selectedCount,
    onBulkActivate,
    onBulkDeactivate,
}) {
    const { t, i18n } = useTranslation('admin');

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('paymentMethods.filters.searchPlaceholder', 'Search by name...')}
                        value={filters.search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                        data-testid="payment-methods-search-input"
                    />
                </div>

                {/* Status Filter */}
                <Select dir={i18n.dir()}
                    value={filters.status === null ? 'all' : filters.status.toString()}
                    onValueChange={(value) => {
                        if (value === 'all') {
                            onStatusChange(null);
                        } else {
                            onStatusChange(value === 'true');
                        }
                    }}
                >
                    <SelectTrigger className="w-40" data-testid="payment-methods-status-filter">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder={t('paymentMethods.filters.statusFilter', 'Status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            {t('paymentMethods.filters.allStatus', 'All Status')}
                        </SelectItem>
                        <SelectItem value="true">
                            {t('paymentMethods.status.active', 'Active')}
                        </SelectItem>
                        <SelectItem value="false">
                            {t('paymentMethods.status.inactive', 'Inactive')}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bulk Actions */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {t('paymentMethods.selectedCount', '{{count}} selected', { count: selectedCount })}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBulkActivate}
                        data-testid="payment-methods-bulk-activate"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t('paymentMethods.bulkActivate', 'Activate')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onBulkDeactivate}
                        data-testid="payment-methods-bulk-deactivate"
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        {t('paymentMethods.bulkDeactivate', 'Deactivate')}
                    </Button>
                </div>
            )}
        </div>
    );
}
