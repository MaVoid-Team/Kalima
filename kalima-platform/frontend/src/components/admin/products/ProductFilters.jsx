import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';

export default function ProductFilters({ filters, onSearchChange, onCategoryChange, onArchivedChange }) {
    const { t } = useTranslation('admin');
    const { categories, loading: categoriesLoading } = useCategories();

    return (
        <div className="flex flex-col sm:flex-row gap-3" data-testid="products-filters">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    placeholder={t('products.searchPlaceholder')}
                    value={filters.search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="ps-9"
                    data-testid="products-filter-search"
                />
            </div>

            {/* Category Filter */}
            <Select
                value={filters.category_id?.toString() ?? 'all'}
                onValueChange={(val) => onCategoryChange(val === 'all' ? null : Number(val))}
                disabled={categoriesLoading}
            >
                <SelectTrigger className="w-full sm:w-48" data-testid="products-filter-category">
                    <SelectValue placeholder={t('products.filters.allCategories')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('products.filters.allCategories')}</SelectItem>
                    {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Archived Filter */}
            <Select
                value={filters.is_archived === null || filters.is_archived === undefined ? 'all' : filters.is_archived.toString()}
                onValueChange={(val) => {
                    if (val === 'all') onArchivedChange(null);
                    else onArchivedChange(val === 'true');
                }}
            >
                <SelectTrigger className="w-full sm:w-44" data-testid="products-filter-status">
                    <SelectValue placeholder={t('products.filters.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('products.filters.allStatuses')}</SelectItem>
                    <SelectItem value="false">{t('products.filters.active')}</SelectItem>
                    <SelectItem value="true">{t('products.filters.archived')}</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
