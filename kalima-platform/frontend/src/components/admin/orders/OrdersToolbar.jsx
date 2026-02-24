import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from "react-day-picker/locale"
import { cn } from '@/../lib/utils';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { Calendar } from '@/ui/calendar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { ORDER_STATUSES } from '@/../lib/storeUtils';

export default function OrdersToolbar({ filters, onSearchChange, onStatusChange, onDateRangeChange }) {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.language?.startsWith('ar');
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
        if (onDateRangeChange) {
            onDateRangeChange({ from: null, to: null });
        }
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

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "flex-1 sm:w-[240px] justify-start text-muted-foreground w-full",
                                filters.startDate && "text-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.startDate ? (
                                filters.endDate ? (
                                    <>
                                        {format(filters.startDate, "LLL dd, y")} -{" "}
                                        {format(filters.endDate, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(filters.startDate, "LLL dd, y")
                                )
                            ) : (
                                <span>{t('orders.filterByDate', 'Filter by date')}</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={filters.startDate}
                            selected={{
                                from: filters.startDate,
                                to: filters.endDate,
                            }}
                            onSelect={onDateRangeChange}
                            numberOfMonths={2}
                            locale={isRtl ? arSA : undefined}
                            dir={isRtl ? "rtl" : "ltr"}
                        />
                    </PopoverContent>
                </Popover>

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

                <Button
                    variant="outline"
                    onClick={handleClear}
                    title={t('orders.clearFilters')}
                    className="w-full sm:w-10 sm:px-0"
                >
                    <X className="h-4 w-4 text-muted-foreground me-2 sm:me-0" />
                    <span className="sm:sr-only">{t('orders.clearFilters')}</span>
                </Button>
            </div>
        </div>
    );
}
