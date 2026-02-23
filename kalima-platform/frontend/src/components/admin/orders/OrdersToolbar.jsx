import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { ORDER_STATUSES } from '../../../lib/storeUtils';

export default function OrdersToolbar({ filters, onSearchChange, onStatusChange }) {
    const { t } = useTranslation('admin');
    const [searchValue, setSearchValue] = useState(filters.search || '');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchValue !== filters.search) {
                onSearchChange(searchValue);
            }
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [searchValue, onSearchChange, filters.search]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearchChange(searchValue);
    };

    const handleClear = () => {
        setSearchValue('');
        onSearchChange('');
        onStatusChange('all');
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={t('orders.searchPlaceholder')}
                        className="pl-8 w-full"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
            </form>

            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex-1 sm:w-[180px] justify-start text-muted-foreground w-full">
                            {filters.status && filters.status !== 'all'
                                ? t(`orders.status${filters.status.charAt(0).toUpperCase() + filters.status.slice(1).toLowerCase()}`)
                                : t('orders.statusAll')}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem onClick={() => onStatusChange('all')}>
                            {t('orders.statusAll')}
                        </DropdownMenuItem>
                        {ORDER_STATUSES.map(status => (
                            <DropdownMenuItem key={status} onClick={() => onStatusChange(status)}>
                                {t(`orders.status${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}`)}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="icon" onClick={handleClear} title={t('orders.clearFilters')}>
                    <X className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">{t('orders.clearFilters')}</span>
                </Button>
            </div>
        </div>
    );
}
