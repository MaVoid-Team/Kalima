import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Eye, Pencil, ArchiveRestore, Archive, Trash2, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl, formatCurrency } from '@/lib/storeUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import RatingDisplay from '@/components/ui/RatingDisplay';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsTable({
    products,
    loading,
    onEdit,
    onArchiveToggle,
    onDelete,
    selectedIds = [],
    onSelect,
    onSelectAll,
}) {
    const { t, i18n } = useTranslation('admin');
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="space-y-2" data-testid="products-table-skeleton">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-md" />
                ))}
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="products-table-empty">
                <ImageOff className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">{t('products.noProducts')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('products.noProductsDescription')}</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border border-border overflow-hidden" data-testid="products-table">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <Checkbox
                                className={i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}
                                checked={products.length > 0 && selectedIds.length === products.length}
                                onCheckedChange={onSelectAll}
                                aria-label="Select all"
                                data-testid="products-table-select-all"
                            />
                        </TableHead>
                        <TableHead className="w-16">{t('products.table.thumbnail')}</TableHead>
                        <TableHead>{t('products.table.title')}</TableHead>
                        <TableHead className="hidden md:table-cell">{t('products.table.type')}</TableHead>
                        <TableHead>{t('products.table.price')}</TableHead>
                        <TableHead className="hidden lg:table-cell">{t('products.table.rating')}</TableHead>
                        <TableHead className="hidden lg:table-cell">{t('products.table.categories')}</TableHead>
                        <TableHead className="hidden sm:table-cell">{t('products.table.status')}</TableHead>
                        <TableHead className="text-end">{t('products.table.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => {
                        const thumbnailUrl = getImageUrl(product.thumbnail_image?.url);
                        const isArchived = product.is_archived;

                        return (
                            <TableRow
                                key={product.id}
                                className={cn('hover:bg-muted/50', isArchived && 'opacity-60')}
                                data-state={selectedIds.includes(product.id) && 'selected'}
                                data-testid={`products-table-row-${product.id}`}
                            >
                                {/* Checkbox */}
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        className={i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}
                                        checked={selectedIds.includes(product.id)}
                                        onCheckedChange={(checked) => onSelect?.(product.id, checked)}
                                        aria-label={`Select product ${product.title}`}
                                        data-testid={`products-table-select-${product.id}`}
                                    />
                                </TableCell>

                                {/* Thumbnail */}
                                <TableCell className="cursor-pointer" onClick={() => navigate(`/admin/products/${product.id}`)}>
                                    {thumbnailUrl ? (
                                        <img
                                            src={thumbnailUrl}
                                            alt={product.title}
                                            className="h-12 w-12 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                            <ImageOff className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                </TableCell>

                                {/* Title */}
                                <TableCell className="cursor-pointer" onClick={() => navigate(`/admin/products/${product.id}`)}>
                                    <p className="font-medium line-clamp-1">{product.title}</p>
                                    {product.serial && (
                                        <p className="text-xs text-muted-foreground">{product.serial}</p>
                                    )}
                                </TableCell>

                                {/* Type */}
                                <TableCell className="hidden md:table-cell">
                                    <Badge variant="outline">{t(`products.type.${product.type}`, product.type)}</Badge>
                                </TableCell>

                                {/* Price */}
                                {product.price_after_discount && product.price_after_discount !== product.price ? (
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold text-sm">{formatCurrency(product.price_after_discount, t)}</p>
                                            <p className="text-xs text-muted-foreground line-through">{formatCurrency(product.price, t)}</p>
                                        </div>
                                    </TableCell>
                                ) : (
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold text-sm">{formatCurrency(product.price, t)}</p>
                                        </div>
                                    </TableCell>
                                )}

                                {/* Rating */}
                                <TableCell className="hidden lg:table-cell">
                                    <RatingDisplay 
                                        rating={product.rate || 0} 
                                        reviewCount={product.rate_count || 0}
                                        size="sm"
                                        data-testid={`products-table-rating-${product.id}`}
                                    />
                                </TableCell>

                                {/* Categories */}
                                <TableCell className="hidden lg:table-cell">
                                    <div className="flex flex-wrap gap-1">
                                        {product.product_categories?.slice(0, 2).map((pc) => (
                                            <Badge key={pc.id} variant="secondary" className="text-xs">
                                                {pc.categories?.title}
                                            </Badge>
                                        ))}
                                        {(product.product_categories?.length ?? 0) > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{product.product_categories.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Status */}
                                <TableCell className="hidden sm:table-cell">
                                    <Badge
                                        variant={isArchived ? 'destructive' : 'default'}
                                        className={cn(
                                            isArchived
                                                ? 'bg-destructive/20 text-destructive border-destructive/50'
                                                : 'bg-success/20 text-success border-success/50'
                                        )}
                                    >
                                        {isArchived ? t('products.status.archived') : t('products.status.active')}
                                    </Badge>
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu dir={i18n.dir()}>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                data-testid={`products-table-actions-${product.id}`}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align={i18n.dir() === 'rtl' ? 'start' : 'end'}>
                                            <DropdownMenuItem
                                                onClick={() => navigate(`/admin/products/${product.id}`)}
                                                data-testid={`products-action-view-${product.id}`}
                                            >
                                                <Eye className="me-2 h-4 w-4" />
                                                {t('products.actions.view')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                                                data-testid={`products-action-edit-${product.id}`}
                                            >
                                                <Pencil className="me-2 h-4 w-4" />
                                                {t('products.actions.edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => onArchiveToggle(product)}
                                                data-testid={`products-action-archive-${product.id}`}
                                            >
                                                {isArchived ? (
                                                    <>
                                                        <ArchiveRestore className="me-2 h-4 w-4" />
                                                        {t('products.actions.unarchive')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Archive className="me-2 h-4 w-4" />
                                                        {t('products.actions.archive')}
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(product)}
                                                className="text-destructive focus:text-destructive"
                                                data-testid={`products-action-delete-${product.id}`}
                                            >
                                                <Trash2 className="me-2 h-4 w-4 text-destructive" />
                                                {t('products.actions.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
