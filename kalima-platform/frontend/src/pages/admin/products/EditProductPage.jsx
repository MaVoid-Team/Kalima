import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft, PlusCircle, X, Package, Save, Calendar as CalendarIcon, CircleHelp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import LoadingSpinner from '@/components/ui/loading-spinner';
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
import { Switch } from '@/components/ui/switch';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
import { useCategories } from '@/hooks/useCategories';
import GalleryManager from '@/components/admin/products/GalleryManager';
import ThumbnailManager from '@/components/admin/products/ThumbnailManager';
import FileUploadProgress from '@/components/admin/settings/FileUploadProgress';
import { toast } from 'sonner';
import { format, startOfDay } from 'date-fns';
import { arSA } from 'react-day-picker/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';



export default function EditProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hash } = useLocation();
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';

    const editProductSchema = z.object({
        title: z.string().min(1, t('products.form.titleIsRequired')).max(255, t('products.form.titleMaxLength')),
        price: z.coerce.number().min(0, t('products.form.priceMustBeGreaterThan0')),
        type: z.enum(['Product', 'Book']),
        isFreePreview: z.boolean().optional(),
        description: z.string().optional(),
        price_after_discount: z.preprocess(
            (val) => (val === '' || val == null ? undefined : val),
            z.coerce.number().min(0, t('products.form.discountedPriceMustBeGreaterThan0')).optional()
        ),
        serial: z.string().max(100, t('products.form.serialMaxLength')).optional().or(z.literal('')),
        coupon_id: z.preprocess(
            (val) => (val === '' || val == null ? undefined : val),
            z.coerce.number().int(t('products.form.couponIdMustBeInteger')).positive(t('products.form.couponIdMustBeGreaterThan0')).optional()
        ),
        release_at: z.string().optional().or(z.literal('')),
        perks: z.string().optional().or(z.literal('')),
        is_archived: z.boolean(),
    }).refine(
        (data) => {
            if (data.isFreePreview) return data.price_after_discount === 0;
            if (data.price_after_discount == null) return true;
            if (data.price > 0) return data.price_after_discount < data.price;
            return data.price_after_discount === 0;
        },
        { message: t('products.form.discountedPriceMustBeLessThanOriginalPrice'), path: ['price_after_discount'] }
    ).refine(
        (data) => !data.release_at || new Date(data.release_at) >= startOfDay(new Date()),
        { message: t('products.form.releaseDateMustBeFuture', 'Release date must be today or in the future'), path: ['release_at'] }
    );

    const {
        selectedProduct,
        loading,
        actionLoading,
        fetchProductById,
        updateProduct,
        attachCategories,
        detachCategory,
        attachRequiredFields,
        detachRequiredField,
        fetchFieldDefinitions,
        fieldDefinitions,
        toggleRequiredFieldIsRequired,
        uploadThumbnail,
        removeThumbnail,
        addGalleryImages,
        updateGalleryEntry,
        removeGalleryEntry,
        addGalleryVideo,
        addExternalGalleryVideo,
        removeGalleryVideo,
    } = useAdminProducts();

    const {
        categories: roots = [],
        childCategories = {},
        fetchChildCategories = async () => [],
    } = useCategories();

    const [selectedFieldDefId, setSelectedFieldDefId] = useState('');

    // Upload progress state
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadFileName, setUploadFileName] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadAbortController, setUploadAbortController] = useState(null);

    // Category state
    const [pickedCategory, setPickedCategory] = useState(null);
    const [selectedRootId, setSelectedRootId] = useState('');
    const [selectedChildId, setSelectedChildId] = useState('');
    const [selectedGrandchildId, setSelectedGrandchildId] = useState('');
    const [childrenLoading, setChildrenLoading] = useState(false);
    const [grandchildrenLoading, setGrandchildrenLoading] = useState(false);

    const currentChildren = selectedRootId ? (childCategories[selectedRootId] ?? undefined) : undefined;
    const hasChildren = currentChildren && currentChildren.length > 0;

    // Grandchildren: stored in childCategories keyed by the selected child id
    const currentGrandchildren = selectedChildId ? (childCategories[selectedChildId] ?? undefined) : undefined;
    const hasGrandchildren = currentGrandchildren && currentGrandchildren.length > 0;

    const form = useForm({
        resolver: zodResolver(editProductSchema),
        defaultValues: {
            title: '',
            description: '',
            type: 'Product',
            isFreePreview: false,
            price: '',
            price_after_discount: '',
            serial: '',
            coupon_id: '',
            release_at: '',
            perks: '',
            is_archived: false,
        },
    });

    useEffect(() => {
        fetchProductById(id);
        fetchFieldDefinitions();
    }, [fetchProductById, fetchFieldDefinitions, id]);

    // Handle hash navigation when the page has fully loaded
    useEffect(() => {
        if (selectedProduct && hash) {
            // Need a slight timeout to ensure the DOM is fully rendered before jumping
            const timeoutId = setTimeout(() => {
                const elementId = hash.replace('#', '');
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [selectedProduct, hash]);

    useEffect(() => {
        if (selectedProduct) {
            form.reset({
                title: selectedProduct.title ?? '',
                description: selectedProduct.description ?? '',
                type: selectedProduct.type ?? 'Product',
                price: selectedProduct.price != null ? String(selectedProduct.price) : '',
                isFreePreview: selectedProduct.price_after_discount === 0,
                price_after_discount: selectedProduct.price_after_discount != null
                    ? String(selectedProduct.price_after_discount) : '',
                serial: selectedProduct.serial ?? '',
                coupon_id: selectedProduct.coupon_id != null ? String(selectedProduct.coupon_id) : '',
                release_at: selectedProduct.release_at ? new Date(new Date(selectedProduct.release_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
                perks: selectedProduct.perks ?? '',
                is_archived: selectedProduct.is_archived ?? false,
            });

            const existingCat = selectedProduct?.product_categories?.[0];
            if (existingCat) {
                setPickedCategory({ id: existingCat.category_id, title: existingCat.categories?.title ?? '' });
            } else {
                setPickedCategory(null);
            }
            setSelectedRootId('');
            setSelectedChildId('');
            setSelectedGrandchildId('');
            setSelectedFieldDefId('');
        }
    }, [selectedProduct, form]);

    // ─── Category helpers ──────────────────────────────────────────────────────

    const handleRootChange = async (rootId) => {
        setSelectedRootId(rootId);
        setSelectedChildId('');
        setSelectedGrandchildId('');
        if (rootId && !childCategories[rootId]) {
            setChildrenLoading(true);
            await fetchChildCategories(parseInt(rootId));
            setChildrenLoading(false);
        }
        const label = roots.find(r => r.id === parseInt(rootId))?.title;
        setPickedCategory(rootId ? { id: parseInt(rootId), title: label } : null);
    };

    const handleChildChange = async (childId) => {
        setSelectedChildId(childId);
        setSelectedGrandchildId('');
        if (childId) {
            const label = currentChildren?.find(c => c.id === parseInt(childId))?.title;
            setPickedCategory({ id: parseInt(childId), title: label });
            // Fetch grandchildren if not already cached
            if (!childCategories[childId]) {
                setGrandchildrenLoading(true);
                await fetchChildCategories(parseInt(childId));
                setGrandchildrenLoading(false);
            }
        } else {
            const label = roots.find(r => r.id === parseInt(selectedRootId))?.title;
            setPickedCategory(selectedRootId ? { id: parseInt(selectedRootId), title: label } : null);
        }
    };

    const handleGrandchildChange = (grandchildId) => {
        setSelectedGrandchildId(grandchildId);
        if (grandchildId) {
            const label = currentGrandchildren?.find(g => g.id === parseInt(grandchildId))?.title;
            setPickedCategory({ id: parseInt(grandchildId), title: label });
        } else {
            // Revert to child selection
            const label = currentChildren?.find(c => c.id === parseInt(selectedChildId))?.title;
            setPickedCategory(selectedChildId ? { id: parseInt(selectedChildId), title: label } : null);
        }
    };

    const handleClearCategory = () => {
        setPickedCategory(null);
        setSelectedRootId('');
        setSelectedChildId('');
        setSelectedGrandchildId('');
    };

    // ─── Upload Handlers ───────────────────────────────────────────────────────

    const handleThumbnailUpload = async (formData) => {
        const file = formData.get('thumbnail');
        if (!file) return;

        // Create new AbortController for this upload
        const abortController = new AbortController();
        setUploadAbortController(abortController);

        setIsUploading(true);
        setUploadFileName(file.name);
        setUploadError('');
        setUploadProgress(0);

        try {
            const res = await uploadThumbnail(id, formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }, abortController.signal);
            if (res?.success) {
                fetchProductById(id);
            } else {
                setUploadError(res?.message || 'Upload failed');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                setUploadError(error.message || 'Upload failed');
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFileName('');
            setUploadAbortController(null);
        }
    };

    const handleGalleryUpload = async (formData) => {
        // Create new AbortController for this upload
        const abortController = new AbortController();
        setUploadAbortController(abortController);

        setIsUploading(true);
        setUploadFileName('Gallery images');
        setUploadError('');
        setUploadProgress(0);

        try {
            const res = await addGalleryImages(id, formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }, abortController.signal);
            if (res?.success) {
                // Product refresh is handled in the hook
            } else {
                setUploadError(res?.message || 'Upload failed');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                setUploadError(error.message || 'Upload failed');
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFileName('');
            setUploadAbortController(null);
        }
    };

    const handleGalleryVideoUpload = async (formData) => {
        const abortController = new AbortController();
        setUploadAbortController(abortController);

        setIsUploading(true);
        setUploadFileName('Gallery video');
        setUploadError('');
        setUploadProgress(0);

        try {
            const res = await addGalleryVideo(id, formData, (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            }, abortController.signal);
            if (!res?.success) {
                setUploadError(res?.message || 'Upload failed');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                setUploadError(error.message || 'Upload failed');
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setUploadFileName('');
            setUploadAbortController(null);
        }
    };

    const handleGalleryExternalVideo = async (url) => {
        setIsUploading(true);
        try {
            const res = await addExternalGalleryVideo(id, url);
            if (!res?.success) {
                toast.error(res?.message || 'Failed to add external video');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add external video');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUploadCancel = () => {
        if (uploadAbortController) {
            uploadAbortController.abort();
            setUploadAbortController(null);
        }
        // Immediately reset all upload states to re-enable buttons
        setIsUploading(false);
        setUploadProgress(0);
        setUploadFileName('');
        setUploadError('');
    };

    // ─── Required field helpers ────────────────────────────────────────────────

    const attachedFields = selectedProduct?.product_required_fields ?? [];
    const attachedDefIds = new Set(attachedFields.map(f => f.field_definition_id));
    const availableFieldDefs = fieldDefinitions.filter(def => !attachedDefIds.has(def.id));

    const handleAttachField = async () => {
        if (!selectedFieldDefId || !id) return;
        const fields = [{ field_definition_id: parseInt(selectedFieldDefId), is_required: true }];
        await attachRequiredFields(id, fields);
        setSelectedFieldDefId('');
        fetchProductById(id);
    };

    const handleDetachField = async (fieldDefinitionId) => {
        if (!id) return;
        await detachRequiredField(id, fieldDefinitionId);
        fetchProductById(id);
    };

    const handleToggleAttachedFieldRequired = async (requiredFieldId, isRequired) => {
        if (!id) return;
        try {
            await toggleRequiredFieldIsRequired(id, requiredFieldId, isRequired);
        }
        catch (error) {
            console.error('Failed to toggle required field:', error);
        }
    };

    // ─── Submit ────────────────────────────────────────────────────────────────

    const onSubmit = async (values) => {
        const payload = {
            title: values.title,
            type: values.type,
            price: values.price,
            is_archived: values.is_archived,
        };
        if (values.description) payload.description = values.description;
        if (values.isFreePreview) {
            payload.price_after_discount = 0;
        } else if (values.price_after_discount != null && values.price_after_discount !== '') {
            payload.price_after_discount = values.price_after_discount;
        }
        if (values.serial) payload.serial = values.serial;
        if (values.coupon_id) payload.coupon_id = values.coupon_id;

        if (values.release_at) {
            payload.release_at = new Date(values.release_at).toISOString();
        } else {
            payload.release_at = null;
        }

        payload.perks = values.perks || '';

        const res = await updateProduct(id, payload);
        if (!res?.success) return;

        // Reconcile category
        const existingCatId = selectedProduct?.product_categories?.[0]?.category_id ?? null;
        const newCatId = pickedCategory?.id ?? null;

        if (existingCatId !== newCatId) {
            if (existingCatId) {
                await detachCategory(id, existingCatId);
            }
            if (newCatId) {
                await attachCategories(id, [newCatId]);
            }
        }

        navigate(`/admin/products/${id}`);
    };

    // ─── Loading / Not Found States ────────────────────────────────────────────

    if (loading && !selectedProduct) {
        return (
            <div className="space-y-6" data-testid="edit-product-skeleton">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (!selectedProduct) {
        return (
            <div className="text-center py-16" data-testid="edit-product-not-found">
                <p className="text-muted-foreground">{t('products.noProducts')}</p>
                <Button variant="link" onClick={() => navigate('/admin/products')} className="mt-2">
                    {t('products.backToProducts')}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6" data-testid="edit-product-page">
            {/* Breadcrumb / Back */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                    to={`/admin/products/${id}`}
                    className="hover:text-foreground transition-colors flex items-center gap-1"
                    data-testid="edit-product-back-link"
                >
                    <ChevronLeft className="h-4 w-4" />
                    {t('products.backToProduct', 'Back to Product')}
                </Link>
            </div>

            {/* Page Header */}
            <div className="flex items-start gap-3">
                <Package className="h-8 w-8 text-primary mt-1 shrink-0" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('products.edit.dialogTitle')}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{selectedProduct.title}</p>
                </div>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit') {
                            e.preventDefault();
                        }
                    }}
                    className="space-y-6"
                    data-testid="edit-product-form"
                >

                    {/* ── Section: Core Info ── */}
                    <div className="rounded-xl border border-border p-5 space-y-4">
                        <h2 className="font-semibold text-foreground">{t('products.detail.info')}</h2>
                        <Separator />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('products.form.title')} *</FormLabel>
                                    <FormControl>
                                        <Input data-testid="edit-product-title-input" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                                data-testid="edit-product-price-input"
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
                                        <Select dir={i18n.dir()} onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger data-testid="edit-product-type-select">
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

                        <FormField
                            control={form.control}
                            name="isFreePreview"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel className="flex items-center gap-1.5">
                                            {t('products.form.freePreviewToggle')}
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                                            aria-label={t('products.form.freePreviewHintAria', 'Free preview hint')}
                                                        >
                                                            <CircleHelp className="h-4 w-4" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-[260px]">
                                                        {t('products.form.freePreviewHint', 'Enabling this will set the product discount to 100% (free).')}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={!!field.value}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked);
                                                if (checked) {
                                                    form.setValue('price_after_discount', '0', { shouldValidate: true, shouldDirty: true });
                                                }
                                            }}
                                            data-testid="edit-product-free-preview-toggle"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

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
                                                data-testid="edit-product-discount-input"
                                                disabled={!!form.watch('isFreePreview')}
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
                                                data-testid="edit-product-serial-input"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Release At + Perks */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="release_at"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            {t('products.form.releaseAt', 'Release Date')}
                                        </FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        type="button"
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        data-testid="edit-product-release-at-input"
                                                    >
                                                        {field.value ? (
                                                            format(new Date(field.value), "PPP", { locale: isRtl ? arSA : undefined })
                                                        ) : (
                                                            <span>{t('products.form.pickDate', 'Pick a date')}</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date ? date.toISOString() : '')}
                                                    disabled={(date) => date < startOfDay(new Date())}
                                                    initialFocus
                                                    locale={isRtl ? arSA : undefined}
                                                    dir={isRtl ? 'rtl' : 'ltr'}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="perks"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('products.form.perks')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t('products.form.perksPlaceholder')}
                                                data-testid="edit-product-perks-input"
                                                {...field}
                                            />
                                        </FormControl>
                                        <p className="text-[0.8rem] text-muted-foreground mt-1">
                                            {t('products.form.perksTip')}
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('products.form.description')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={4}
                                            data-testid="edit-product-description-input"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_archived"
                            render={({ field }) => (
                                <FormItem className="flex items-center gap-3">
                                    <FormControl>
                                        <Switch
                                            id="edit-product-archived"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            data-testid="edit-product-archived-switch"
                                        />
                                    </FormControl>
                                    <FormLabel htmlFor="edit-product-archived" className="mt-0!">
                                        {t('products.form.isArchived')}
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* ── Section: Thumbnail ── */}
                    <div className="rounded-xl border border-border p-5 space-y-4" data-testid="edit-product-thumbnail">
                        <h2 className="font-semibold text-foreground">{t('products.detail.thumbnail')}</h2>
                        <Separator />
                        <ThumbnailManager
                            product={selectedProduct}
                            onUpload={handleThumbnailUpload}
                            onRemove={() => removeThumbnail(id)}
                            loading={isUploading}
                        />
                    </div>

                    {/* ── Section: Gallery ── */}
                    <div className="rounded-xl border border-border p-5 space-y-4" data-testid="edit-product-gallery">
                        <h2 className="font-semibold text-foreground">{t('products.detail.gallery')}</h2>
                        <Separator />
                        <GalleryManager
                            product={selectedProduct}
                            onAddImages={handleGalleryUpload}
                            onAddVideo={handleGalleryVideoUpload}
                            onAddExternalVideo={handleGalleryExternalVideo}
                            onUpdateEntry={(galleryId, data) => updateGalleryEntry(id, galleryId, data)}
                            onRemoveImage={(galleryId) => removeGalleryEntry(id, galleryId)}
                            onRemoveVideo={(videoId) => removeGalleryVideo(id, videoId)}
                            loading={isUploading}
                        />
                    </div>

                    {/* ── Upload Progress ── */}
                    <FileUploadProgress
                        progress={uploadProgress}
                        isUploading={isUploading}
                        onCancel={handleUploadCancel}
                        fileName={uploadFileName}
                        error={uploadError}
                    />

                    {/* ── Section: Category ── */}
                    <div className="rounded-xl border border-border p-5 space-y-4" data-testid="edit-product-category">
                        <h2 className="font-semibold text-foreground">{t('products.detail.categories')}</h2>
                        <Separator />

                        {/* Picked category badge */}
                        {pickedCategory ? (
                            <div className="flex flex-wrap gap-2">
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                                    data-testid="edit-product-category-badge"
                                >
                                    {pickedCategory.title}
                                    <button
                                        type="button"
                                        onClick={handleClearCategory}
                                        disabled={actionLoading}
                                        className="rounded-full hover:bg-destructive/20 p-0.5 text-destructive"
                                        aria-label={`Remove ${pickedCategory.title}`}
                                        data-testid="edit-product-category-remove"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('products.detail.noCategories')}</p>
                        )}

                        {/* Cascading root → child → grandchild selects */}
                        <div className="flex flex-col gap-2">
                            <Select
                                dir={i18n.dir()}
                                value={selectedRootId}
                                onValueChange={handleRootChange}
                                disabled={actionLoading || roots.length === 0}
                            >
                                <SelectTrigger data-testid="edit-product-category-root-select">
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
                                        <LoadingSpinner className="h-4 w-4 text-primary-foreground" />
                                        <span>{t('common.loading')}</span>
                                    </div>
                                ) : hasChildren ? (
                                    <Select
                                        dir={i18n.dir()}
                                        value={selectedChildId}
                                        onValueChange={handleChildChange}
                                        disabled={actionLoading || !currentChildren?.length}
                                    >
                                        <SelectTrigger data-testid="edit-product-category-child-select">
                                            <SelectValue placeholder={t('products.detail.selectChildCategory', 'Subcategory (optional)')} />
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

                            {selectedChildId && (
                                grandchildrenLoading ? (
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-2 py-2">
                                        <LoadingSpinner className="h-4 w-4 text-primary-foreground" />
                                        <span>{t('common.loading')}</span>
                                    </div>
                                ) : hasGrandchildren ? (
                                    <Select
                                        dir={i18n.dir()}
                                        value={selectedGrandchildId}
                                        onValueChange={handleGrandchildChange}
                                        disabled={actionLoading || !currentGrandchildren?.length}
                                    >
                                        <SelectTrigger data-testid="edit-product-category-grandchild-select">
                                            <SelectValue placeholder={t('products.detail.selectGrandchildCategory', 'Sub-subcategory (optional)')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentGrandchildren.map((gc) => (
                                                <SelectItem key={gc.id} value={gc.id.toString()}>
                                                    {gc.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : null
                            )}
                        </div>
                    </div>

                    {/* ── Section: Required Fields ── */}
                    <div id='editRequiredFields' className="rounded-xl border border-border p-5 space-y-4" data-testid="edit-product-required-fields">
                        <h2 className="font-semibold text-foreground">{t('products.detail.requiredFields')}</h2>
                        <Separator />

                        {attachedFields.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('products.detail.noRequiredFields')}</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 overflow-x-auto custom-scrollbar">
                                {attachedFields.map((field) => (
                                    <div
                                        key={field.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                                        data-testid={`edit-product-required-field-tag-${field.id}`}
                                    >
                                        <span className="font-medium">{field.required_field_definitions?.label}</span>
                                        <Badge variant="outline" className="text-xs border-primary/30 mt-0 ms-1">
                                            {field.required_field_definitions?.field_type}
                                        </Badge>

                                        <div className="flex items-center gap-1 border-s border-primary/30 ps-2 ms-1">
                                            <span className="text-xs opacity-80">
                                                {field.is_required ? t('products.detail.fieldRequired', 'Required') : t('products.detail.fieldOptional', 'Optional')}
                                            </span>
                                            <Switch
                                                checked={field.is_required}
                                                onCheckedChange={(checked) => handleToggleAttachedFieldRequired(field.id, checked)}
                                                disabled={actionLoading}
                                                className="scale-75 origin-left rtl:origin-right"
                                                aria-label="Toggle required status"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDetachField(field.field_definition_id)}
                                            disabled={actionLoading}
                                            className="rounded-full hover:bg-destructive/20 p-0.5 ms-1 text-destructive"
                                            aria-label={`Remove ${field.required_field_definitions?.label}`}
                                            data-testid={`edit-product-detach-field-${field.id}`}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {availableFieldDefs.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Select dir={i18n.dir()} value={selectedFieldDefId} onValueChange={setSelectedFieldDefId}>
                                    <SelectTrigger className="flex-1" data-testid="edit-product-field-def-select">
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
                                    size="sm"
                                    disabled={!selectedFieldDefId || actionLoading}
                                    onClick={handleAttachField}
                                    data-testid="edit-product-attach-field-button"
                                >
                                    <PlusCircle className="me-2 h-4 w-4" />
                                    {t('products.detail.attachField')}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="flex justify-end gap-3 pb-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/admin/products/${id}`)}
                            data-testid="edit-product-cancel-button"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={actionLoading}
                            data-testid="edit-product-submit-button"
                        >
                            {actionLoading ? (
                                <><LoadingSpinner className="h-4 w-4 text-primary-foreground" />{t('products.edit.saving')}</>
                            ) : (
                                <><Save className="me-2 h-4 w-4" />{t('products.edit.submit')}</>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
