import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, PlusCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';

/**
 * Two-level cascading category selector (root → optional child).
 * Uses only the data provided by useCategories — no nested trees beyond 2 levels.
 */
export default function CategoriesManager({ product, onAttach, onDetach, loading }) {
    const { t, i18n } = useTranslation('admin');
    const {
        categories: roots = [],
        childCategories = {},
        fetchChildCategories = async () => [],
    } = useCategories();

    const [selectedRootId, setSelectedRootId] = useState('');
    const [selectedChildId, setSelectedChildId] = useState('');
    const [childrenLoading, setChildrenLoading] = useState(false);

    const attachedCategories = product?.product_categories ?? [];
    const attachedIds = new Set(attachedCategories.map(pc => pc.category_id));

    // Children for the currently selected root (undefined = not fetched yet, [] = fetched but empty)
    const currentChildren = selectedRootId ? (childCategories[selectedRootId] ?? undefined) : undefined;
    const hasChildren = currentChildren && currentChildren.length > 0;

    // The ID that will actually be attached — child if one is picked, otherwise root
    const effectiveCategoryId = selectedChildId ? parseInt(selectedChildId) : (selectedRootId ? parseInt(selectedRootId) : null);
    const canAttach = effectiveCategoryId !== null
        && !attachedIds.has(effectiveCategoryId);

    const handleRootChange = async (rootId) => {
        setSelectedRootId(rootId);
        setSelectedChildId('');
        if (rootId && !childCategories[rootId]) {
            setChildrenLoading(true);
            await fetchChildCategories(parseInt(rootId));
            setChildrenLoading(false);
        }
    };

    const handleAttach = () => {
        if (!effectiveCategoryId) return;
        onAttach([effectiveCategoryId]);
        setSelectedRootId('');
        setSelectedChildId('');
    };

    // Root categories not already attached at the root level
    const availableRoots = roots.filter(cat => !attachedIds.has(cat.id));
    // If a root is selected, filter its children to exclude already-attached ones
    const availableChildren = hasChildren
        ? currentChildren.filter(c => !attachedIds.has(c.id))
        : [];

    return (
        <div className="space-y-3" data-testid="categories-manager">
            {/* Attached categories */}
            <div className="flex flex-wrap gap-2 min-h-8">
                {attachedCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('products.detail.noCategories')}</p>
                ) : (
                    attachedCategories.map((pc) => (
                        <Badge key={pc.id} variant="secondary" className="flex items-center gap-1.5 pe-1">
                            {pc.categories?.title}
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => onDetach(pc.category_id)}
                                className="rounded-full hover:bg-destructive/20 p-0.5 transition-colors disabled:opacity-50"
                                data-testid={`category-detach-${pc.category_id}`}
                                aria-label={`Remove ${pc.categories?.title}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))
                )}
            </div>

            {/* Cascading picker */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {/* Root category select */}
                <Select
                    dir={i18n.dir()}
                    value={selectedRootId}
                    onValueChange={handleRootChange}
                    disabled={loading || availableRoots.length === 0}
                >
                    <SelectTrigger className="flex-1" data-testid="categories-manager-root-select">
                        <SelectValue placeholder={t('products.detail.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableRoots.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Child category select — shown once root is selected and children are loaded */}
                {selectedRootId && (
                    childrenLoading ? (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{t('common.loading')}</span>
                        </div>
                    ) : hasChildren ? (
                        <Select
                            dir={i18n.dir()}
                            value={selectedChildId}
                            onValueChange={setSelectedChildId}
                            disabled={loading || availableChildren.length === 0}
                        >
                            <SelectTrigger className="flex-1" data-testid="categories-manager-child-select">
                                <SelectValue placeholder={t('products.detail.selectChildCategory', 'Subcategory (optional)')} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableChildren.map((child) => (
                                    <SelectItem key={child.id} value={child.id.toString()}>
                                        {child.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : null
                )}

                <Button
                    type="button"
                    size="sm"
                    disabled={!canAttach || loading}
                    onClick={handleAttach}
                    className="shrink-0"
                    data-testid="categories-manager-attach-button"
                >
                    <PlusCircle className="me-2 h-4 w-4" />
                    {t('products.detail.attachCategory')}
                </Button>
            </div>
        </div>
    );
}
