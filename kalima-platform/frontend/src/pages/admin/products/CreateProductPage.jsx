import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Loader2, X, Package, PlusCircle } from 'lucide-react';

import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
import { useCategories } from '@/hooks/useCategories';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

// ─── Validation Schema ────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateProductPage() {
    const { t, i18n } = useTranslation('admin');
    const navigate = useNavigate();
    const isRtl = i18n.dir() === 'rtl';

    const {
        createProduct,
        attachRequiredFields,
        fetchFieldDefinitions,
        fieldDefinitions,
        actionLoading,
    } = useAdminProducts();

    const { categories: roots, childCategories, fetchChildCategories } = useCategories();

    const [thumbnail, setThumbnail] = useState(null);
    const [sample, setSample] = useState(null);

    // Category picker state — single category only
    const [selectedRootId, setSelectedRootId] = useState('');
    const [selectedChildId, setSelectedChildId] = useState('');
    const [childrenLoading, setChildrenLoading] = useState(false);
    const [pickedCategory, setPickedCategory] = useState(null); // { id, title } | null

    // Required fields picker state
    const [selectedFieldDefId, setSelectedFieldDefId] = useState('');
    const [pickedFields, setPickedFields] = useState([]); // { id, label, field_type }[]

    // Upload progress state
    const [uploadProgress, setUploadProgress] = useState(0);

    // Fetch field definitions on mount
    useEffect(() => {
        fetchFieldDefinitions();
    }, [fetchFieldDefinitions]);

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

    // ─── Category helpers ─────────────────────────────────────────────────────

    const currentChildren = selectedRootId ? (childCategories[selectedRootId] ?? undefined) : undefined;
    const hasChildren = currentChildren && currentChildren.length > 0;

    const handleRootChange = async (rootId) => {
        setSelectedRootId(rootId);
        setSelectedChildId('');
        if (rootId && !childCategories[rootId]) {
            setChildrenLoading(true);
            await fetchChildCategories(parseInt(rootId));
            setChildrenLoading(false);
        }
        // Update picked category to this root immediately (child may override)
        const label = roots.find(r => r.id === parseInt(rootId))?.title;
        if (rootId) {
            setPickedCategory({ id: parseInt(rootId), title: label });
        } else {
            setPickedCategory(null);
        }
    };

    const handleChildChange = (childId) => {
        setSelectedChildId(childId);
        if (childId) {
            const label = currentChildren?.find(c => c.id === parseInt(childId))?.title;
            setPickedCategory({ id: parseInt(childId), title: label });
        } else {
            // Revert to root selection
            const label = roots.find(r => r.id === parseInt(selectedRootId))?.title;
            setPickedCategory(selectedRootId ? { id: parseInt(selectedRootId), title: label } : null);
        }
    };

    const handleClearCategory = () => {
        setPickedCategory(null);
        setSelectedRootId('');
        setSelectedChildId('');
    };

    // ─── Required field helpers ───────────────────────────────────────────────

    const pickedFieldIds = new Set(pickedFields.map(f => f.id));
    const availableFieldDefs = fieldDefinitions.filter(def => !pickedFieldIds.has(def.id));

    const handleAddField = () => {
        if (!selectedFieldDefId) return;
        const def = fieldDefinitions.find(d => d.id === parseInt(selectedFieldDefId));
        if (!def || pickedFieldIds.has(def.id)) return;
        setPickedFields(prev => [...prev, { id: def.id, label: def.label, field_type: def.field_type }]);
        setSelectedFieldDefId('');
    };

    const handleRemoveField = (id) => {
        setPickedFields(prev => prev.filter(f => f.id !== id));
    };

    // ─── Submit ───────────────────────────────────────────────────────────────

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
        if (pickedCategory) {
            formData.append('category_ids', JSON.stringify([pickedCategory.id]));
        }
        if (thumbnail) formData.append('thumbnail', thumbnail);
        if (sample) formData.append('sample', sample);

        setUploadProgress(0);
        const res = await createProduct(formData, (progressEvent) => {
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        });

        if (res?.success) {
            const newProductId = res.data?.id;
            // Attach required fields after the product is created
            if (pickedFields.length > 0 && newProductId) {
                await attachRequiredFields(
                    newProductId,
                    pickedFields.map(f => ({ field_definition_id: f.id, is_required: true }))
                );
            }
            // Navigate to the new product's detail page
            if (newProductId) {
                navigate(`/admin/products/${newProductId}`);
            } else {
                navigate('/admin/products');
            }
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6" data-testid="create-product-page">

            {/* Breadcrumb / Back */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                    to="/admin/products"
                    className="hover:text-foreground transition-colors flex items-center gap-1"
                    data-testid="create-product-back-link"
                >
                    {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    {t('products.backToProducts')}
                </Link>
            </div>

            {/* Page Header */}
            <div className="flex items-start gap-3">
                <Package className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('products.create.dialogTitle')}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{t('products.create.dialogDescription')}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="create-product-form">

                    {/* ── Section: Core Details ── */}
                    <div className="rounded-xl border border-border p-5 space-y-4">
                        <h2 className="font-semibold text-foreground">{t('products.detail.info')}</h2>
                        <Separator />

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            rows={4}
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
                    </div>

                    {/* ── Section: Category ── */}
                    <div className="rounded-xl border border-border p-5 space-y-4">
                        <h2 className="font-semibold text-foreground">{t('products.detail.categories')}</h2>
                        <Separator />

                        {/* Selected category badge */}
                        {pickedCategory && (
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                                    data-testid="create-product-selected-category"
                                >
                                    {pickedCategory.title}
                                    <button
                                        type="button"
                                        onClick={handleClearCategory}
                                        className="rounded-full hover:bg-primary/20 p-0.5"
                                        aria-label={`Remove ${pickedCategory.title}`}
                                        data-testid="create-product-remove-category"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
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
                                        onValueChange={handleChildChange}
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
                        </div>
                    </div>

                    {/* ── Section: Required Fields ── */}
                    <div className="rounded-xl border border-border p-5 space-y-4">
                        <h2 className="font-semibold text-foreground">{t('products.detail.requiredFields')}</h2>
                        <Separator />

                        {/* Picked field tags */}
                        {pickedFields.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {pickedFields.map((field) => (
                                    <span
                                        key={field.id}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                                        data-testid={`create-product-required-field-tag-${field.id}`}
                                    >
                                        {field.label}
                                        <span className="text-xs text-muted-foreground opacity-70">({field.field_type})</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveField(field.id)}
                                            className="rounded-full hover:bg-primary/20 p-0.5"
                                            aria-label={`Remove ${field.label}`}
                                            data-testid={`create-product-remove-field-${field.id}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('products.detail.noRequiredFields')}</p>
                        )}

                        {/* Field picker */}
                        {availableFieldDefs.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Select value={selectedFieldDefId} onValueChange={setSelectedFieldDefId}>
                                    <SelectTrigger className="flex-1" data-testid="create-product-field-def-select">
                                        <SelectValue placeholder={t('products.detail.selectField')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableFieldDefs.map((def) => (
                                            <SelectItem key={def.id} value={def.id.toString()}>
                                                {def.label} ({def.field_type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                    disabled={!selectedFieldDefId}
                                    onClick={handleAddField}
                                    data-testid="create-product-add-field-button"
                                >
                                    <PlusCircle className="me-2 h-4 w-4" />
                                    {t('products.detail.attachField')}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ── Section: Media ── */}
                    <div className="rounded-xl border border-border p-5 space-y-4">
                        <h2 className="font-semibold text-foreground">{t('products.detail.media')}</h2>
                        <Separator />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Thumbnail */}
                            <div className="space-y-1.5">
                                <span className="text-sm font-medium leading-none">{t('products.form.thumbnail')}</span>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                                    data-testid="create-product-thumbnail-input"
                                />
                                {thumbnail && (
                                    <p className="text-xs text-muted-foreground truncate">{thumbnail.name}</p>
                                )}
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
                                {sample && (
                                    <p className="text-xs text-muted-foreground truncate">{sample.name}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Upload Progress ── */}
                    {actionLoading && uploadProgress > 0 && (
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                                <span>{uploadProgress < 100 ? t('products.create.uploading', 'Uploading...') : t('products.create.processing', 'Processing...')}</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    )}

                    {/* ── Action Buttons ── */}
                    <div className="flex justify-end gap-3 pb-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/admin/products')}
                            data-testid="create-product-cancel-button"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={actionLoading}
                            data-testid="create-product-submit-button"
                        >
                            {actionLoading
                                ? <><Loader2 className="me-2 h-4 w-4 animate-spin" />{t('products.create.creating')}</>
                                : t('products.create.submit')
                            }
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
}
