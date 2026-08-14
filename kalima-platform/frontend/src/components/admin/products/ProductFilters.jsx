import { useTranslation } from 'react-i18next';
import { Search, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

export default function ProductFilters({
    filters,
    onSearchChange,
    onCategoryChange,
    onArchivedChange,
    viewMode = 'catalog',
    onViewModeChange,
}) {
    const { t, i18n } = useTranslation('admin');
    const { categories, loading: categoriesLoading } = useCategories();

    return (
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between" data-testid="products-filters">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
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
                    dir={i18n.dir()}
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
                    dir={i18n.dir()}
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

            {/* View Mode Toggle */}
            {onViewModeChange && (
                <div className="flex items-center self-start sm:self-auto p-1 bg-muted/60 border border-border rounded-xl shrink-0" data-testid="products-view-mode-toggle">
                    <Button
                        type="button"
                        variant={viewMode === 'catalog' ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                            "h-8 rounded-lg px-3 text-xs font-medium gap-1.5 transition-all",
                            viewMode === 'catalog' ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => onViewModeChange('catalog')}
                        data-testid="products-view-catalog-btn"
                    >
                        <Package className="h-3.5 w-3.5" />
                        {t('products.viewModes.catalog', 'Catalog Management')}
                    </Button>
                    <Button
                        type="button"
                        variant={viewMode === 'buyers' ? 'default' : 'ghost'}
                        size="sm"
                        className={cn(
                            "h-8 rounded-lg px-3 text-xs font-medium gap-1.5 transition-all",
                            viewMode === 'buyers' ? "shadow-xs" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => onViewModeChange('buyers')}
                        data-testid="products-view-buyers-btn"
                    >
                        <Users className="h-3.5 w-3.5" />
                        {t('products.viewModes.buyers', 'Product Buyers')}
                    </Button>
                </div>
            )}
        </div>
    );
}
