import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
import { useCategories } from '@/hooks/useCategories';

const createProductSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    price: z.coerce.number().positive('Price must be greater than 0'),
    type: z.enum(['Product', 'Book']),
    description: z.string().optional(),
    price_after_discount: z.preprocess(
        (val) => (val === '' || val == null ? undefined : val),
        z.coerce.number().positive().optional()
    ),
    serial: z.string().max(100).optional().or(z.literal('')),
    coupon_id: z.preprocess(
        (val) => (val === '' || val == null ? undefined : val),
        z.coerce.number().int().positive().optional()
    ),
    perks: z.string().optional().or(z.literal('')),
}).refine(
    (data) => !data.price_after_discount || data.price_after_discount < data.price,
    { message: 'Discounted price must be less than the original price', path: ['price_after_discount'] }
);

export default function CreateProductDialog({ onSuccess }) {
    const { t } = useTranslation('admin');
    const { createProduct, actionLoading } = useAdminProducts();
    const { categories: roots, childCategories, fetchChildCategories } = useCategories();

    const [open, setOpen] = useState(false);
    const [thumbnail, setThumbnail] = useState(null);
    const [sample, setSample] = useState(null);

    // Category picker state — mirrors CategoriesManager two-level logic
    const [selectedRootId, setSelectedRootId] = useState('');
    const [selectedChildId, setSelectedChildId] = useState('');
    const [childrenLoading, setChildrenLoading] = useState(false);
    const [pickedCategories, setPickedCategories] = useState([]); // { id, title }[]

    const form = useForm({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            title: '',
            price: '',
            type: 'Product',
            description: '',
            price_after_discount: '',
            serial: '',
            coupon_id: '',
            perks: '',
        },
    });

    const currentChildren = selectedRootId ? (childCategories[selectedRootId] ?? undefined) : undefined;
    const hasChildren = currentChildren && currentChildren.length > 0;
    const pickedIds = new Set(pickedCategories.map(c => c.id));
    const canAddCategory =
        selectedRootId &&
        (!hasChildren || !!selectedChildId) &&
        !pickedIds.has(selectedChildId ? parseInt(selectedChildId) : parseInt(selectedRootId));

    const handleRootChange = async (rootId) => {
        setSelectedRootId(rootId);
        setSelectedChildId('');
        if (rootId && !childCategories[rootId]) {
            setChildrenLoading(true);
            await fetchChildCategories(parseInt(rootId));
            setChildrenLoading(false);
        }
    };

    const handleAddCategory = () => {
        if (!canAddCategory) return;
        const effectiveId = selectedChildId ? parseInt(selectedChildId) : parseInt(selectedRootId);
        if (pickedIds.has(effectiveId)) return;
        const label = selectedChildId
            ? currentChildren.find(c => c.id === parseInt(selectedChildId))?.title
            : roots.find(r => r.id === parseInt(selectedRootId))?.title;
        setPickedCategories(prev => [...prev, { id: effectiveId, title: label }]);
        setSelectedRootId('');
        setSelectedChildId('');
    };

    const handleRemoveCategory = (id) => {
        setPickedCategories(prev => prev.filter(c => c.id !== id));
    };

    const onSubmit = async (values) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('price', values.price);
        formData.append('type', values.type);
        if (values.description) formData.append('description', values.description);
        if (values.price_after_discount) formData.append('price_after_discount', values.price_after_discount);
        if (values.serial) formData.append('serial', values.serial);
        if (values.coupon_id) formData.append('coupon_id', values.coupon_id);
        if (values.perks) formData.append('perks', values.perks);
        if (pickedCategories.length > 0) {
            formData.append('category_ids', JSON.stringify(pickedCategories.map(c => c.id)));
        }
        if (thumbnail) formData.append('thumbnail', thumbnail);
        if (sample) formData.append('sample', sample);

        const res = await createProduct(formData);
        if (res?.success) {
            handleClose();
            onSuccess?.();
        }
    };

    const handleClose = () => {
        setOpen(false);
        form.reset();
        setThumbnail(null);
        setSample(null);
        setPickedCategories([]);
        setSelectedRootId('');
        setSelectedChildId('');
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
                <Button data-testid="create-product-dialog-trigger">
                    <PlusCircle className="me-2 h-4 w-4" />
                    {t('products.createProduct')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-product-dialog">
                <DialogHeader>
                    <DialogTitle>{t('products.create.dialogTitle')}</DialogTitle>
                    <DialogDescription>{t('products.create.dialogDescription')}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('products.form.title')} *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('products.form.titlePlaceholder')}
                                            data-testid="create-product-title-input"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Price + Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('products.form.price')} *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                data-testid="create-product-price-input"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('products.form.type')}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger data-testid="create-product-type-select">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Product">{t('products.type.Product')}</SelectItem>
                                                <SelectItem value="Book">{t('products.type.Book')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Price after discount + Serial */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price_after_discount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('products.form.priceAfterDiscount')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                data-testid="create-product-discount-input"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="serial"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('products.form.serial')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('products.form.serialPlaceholder')}
                                                data-testid="create-product-serial-input"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('products.form.description')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('products.form.descriptionPlaceholder')}
                                            rows={3}
                                            data-testid="create-product-description-input"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Perks */}
                        <FormField
                            control={form.control}
                            name="perks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('products.form.perks')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('products.form.perksPlaceholder')}
                                            data-testid="create-product-perks-input"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Categories — two-level cascading picker */}
                        <div className="space-y-2">
                            <span className="text-sm font-medium leading-none">{t('products.form.categories')}</span>

                            {/* Picked categories tags */}
                            {pickedCategories.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {pickedCategories.map((cat) => (
                                        <span
                                            key={cat.id}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                                        >
                                            {cat.title}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCategory(cat.id)}
                                                className="rounded-full hover:bg-primary/20 p-0.5"
                                                aria-label={`Remove ${cat.title}`}
                                                data-testid={`create-product-remove-category-${cat.id}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Cascading root → child selects */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <Select
                                    value={selectedRootId}
                                    onValueChange={handleRootChange}
                                    disabled={roots.length === 0}
                                >
                                    <SelectTrigger className="flex-1" data-testid="create-product-category-root-select">
                                        <SelectValue placeholder={t('products.detail.selectCategory')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roots.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {selectedRootId && (
                                    childrenLoading ? (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>{t('common.loading')}</span>
                                        </div>
                                    ) : hasChildren ? (
                                        <Select
                                            value={selectedChildId}
                                            onValueChange={setSelectedChildId}
                                            disabled={!currentChildren?.length}
                                        >
                                            <SelectTrigger className="flex-1" data-testid="create-product-category-child-select">
                                                <SelectValue placeholder={t('products.detail.selectChildCategory', 'Subcategory...')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currentChildren.map((child) => (
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
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                    disabled={!canAddCategory}
                                    onClick={handleAddCategory}
                                    data-testid="create-product-add-category-button"
                                >
                                    <PlusCircle className="me-2 h-4 w-4" />
                                    {t('products.detail.attachCategory')}
                                </Button>
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="space-y-1.5">
                            <span className="text-sm font-medium leading-none">{t('products.form.thumbnail')}</span>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                                data-testid="create-product-thumbnail-input"
                            />
                        </div>

                        {/* Sample */}
                        <div className="space-y-1.5">
                            <span className="text-sm font-medium leading-none">{t('products.form.sample')}</span>
                            <Input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setSample(e.target.files?.[0] ?? null)}
                                data-testid="create-product-sample-input"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                data-testid="create-product-cancel-button"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={actionLoading}
                                data-testid="create-product-submit-button"
                            >
                                {actionLoading ? t('products.create.creating') : t('products.create.submit')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
