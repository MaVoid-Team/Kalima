import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PlusCircle, X, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'react-day-picker/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAdminCoupons } from '@/hooks/admin/useAdminCoupons';
import { toast } from 'sonner';

const editProductSchema = z.object({
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
    is_archived: z.boolean(),
}).refine(
    (data) => !data.price_after_discount || data.price_after_discount < data.price,
    { message: 'Discounted price must be less than the original price', path: ['price_after_discount'] }
);

export default function EditProductDialog({
    product,
    open,
    onOpenChange,
    onSuccess,
    // Optional overrides — used by ProductDetailPage so operations stay in-sync
    // with the parent's hook instance (which holds the live `selectedProduct`).
    onAttachField,
    onDetachField,
    fieldDefinitions: externalFieldDefs,
    onLoadDefinitions,
}) {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.language?.startsWith('ar');
    const {
        updateProduct,
        attachCategories,
        detachCategory,
        attachRequiredFields,
        detachRequiredField,
        fetchFieldDefinitions,
        fieldDefinitions: internalFieldDefs,
        actionLoading,
    } = useAdminProducts();

    const {
        createCoupon,
        generateCouponCode,
        apiLoading: couponLoading,
    } = useAdminCoupons();

    const { categories: roots, childCategories, fetchChildCategories } = useCategories();

    const fieldDefinitions = externalFieldDefs ?? internalFieldDefs;
    const loadDefinitions = onLoadDefinitions ?? fetchFieldDefinitions;

    const [selectedFieldDefId, setSelectedFieldDefId] = useState('');

    // ─── Category state (single category) ─────────────────────────────────────
    // pickedCategory reflects what the user has *chosen* in this dialog session.
    // null means "no category". Initialised from the product on open.
    const [pickedCategory, setPickedCategory] = useState(null); // { id, title } | null
    const [selectedRootId, setSelectedRootId] = useState('');
    const [selectedChildId, setSelectedChildId] = useState('');
    const [childrenLoading, setChildrenLoading] = useState(false);

    // Quick coupon state
    const [quickCouponEnabled, setQuickCouponEnabled] = useState(false);
    const [quickCouponCode, setQuickCouponCode] = useState('');
    const [quickCouponType, setQuickCouponType] = useState('PERCENTAGE');
    const [quickCouponValue, setQuickCouponValue] = useState('');
    const [quickCouponExpiresAt, setQuickCouponExpiresAt] = useState('');

    const currentChildren = selectedRootId ? (childCategories[selectedRootId] ?? undefined) : undefined;
    const hasChildren = currentChildren && currentChildren.length > 0;

    const form = useForm({
        resolver: zodResolver(editProductSchema),
        defaultValues: {
            title: '',
            description: '',
            type: 'Product',
            price: '',
            price_after_discount: '',
            serial: '',
            coupon_id: '',
            perks: '',
            is_archived: false,
        },
    });

    // Reset form and category state whenever the dialog opens
    useEffect(() => {
        if (product && open) {
            form.reset({
                title: product.title ?? '',
                description: product.description ?? '',
                type: product.type ?? 'Product',
                price: product.price != null ? String(product.price) : '',
                price_after_discount: product.price_after_discount != null ? String(product.price_after_discount) : '',
                serial: product.serial ?? '',
                coupon_id: product.coupon_id != null ? String(product.coupon_id) : '',
                perks: product.perks ?? '',
                is_archived: product.is_archived ?? false,
            });
            loadDefinitions();
            setSelectedFieldDefId('');

            // Pre-populate with the existing category (take the first one)
            const existingCat = product?.product_categories?.[0];
            if (existingCat) {
                setPickedCategory({ id: existingCat.category_id, title: existingCat.categories?.title ?? '' });
            } else {
                setPickedCategory(null);
            }
            setSelectedRootId('');
            setSelectedChildId('');
            setQuickCouponEnabled(false);
            setQuickCouponCode('');
            setQuickCouponType('PERCENTAGE');
            setQuickCouponValue('');
            setQuickCouponExpiresAt('');
        }
    }, [product, open, form, loadDefinitions]);

    // ─── Category helpers ─────────────────────────────────────────────────────

    const handleRootChange = async (rootId) => {
        setSelectedRootId(rootId);
        setSelectedChildId('');
        if (rootId && !childCategories[rootId]) {
            setChildrenLoading(true);
            await fetchChildCategories(parseInt(rootId));
            setChildrenLoading(false);
        }
        // Pick root immediately; child selection may override
        const label = roots.find(r => r.id === parseInt(rootId))?.title;
        setPickedCategory(rootId ? { id: parseInt(rootId), title: label } : null);
    };

    const handleChildChange = (childId) => {
        setSelectedChildId(childId);
        if (childId) {
            const label = currentChildren?.find(c => c.id === parseInt(childId))?.title;
            setPickedCategory({ id: parseInt(childId), title: label });
        } else {
            // Revert to root
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

    const attachedFields = product?.product_required_fields ?? [];
    const attachedDefIds = new Set(attachedFields.map(f => f.field_definition_id));
    const availableFieldDefs = fieldDefinitions.filter(def => !attachedDefIds.has(def.id));

    const handleAttachField = () => {
        if (!selectedFieldDefId || !product?.id) return;
        const fields = [{ field_definition_id: parseInt(selectedFieldDefId), is_required: true }];
        if (onAttachField) {
            onAttachField(product.id, fields);
        } else {
            attachRequiredFields(product.id, fields);
        }
        setSelectedFieldDefId('');
    };

    const handleDetachField = (fieldDefinitionId) => {
        if (!product?.id) return;
        if (onDetachField) {
            onDetachField(product.id, fieldDefinitionId);
        } else {
            detachRequiredField(product.id, fieldDefinitionId);
        }
    };

    // ─── Quick coupon helpers ────────────────────────────────────────────────

    const handleGenerateQuickCouponCode = async () => {
        const code = await generateCouponCode();
        if (code) {
            setQuickCouponCode(code);
        }
    };

    const buildQuickCouponPayload = (productPrice) => {
        if (!quickCouponEnabled) return null;

        const code = quickCouponCode.trim().toUpperCase();
        const numericValue = Number(quickCouponValue);

        if (!code || !quickCouponValue || !quickCouponExpiresAt) {
            toast.error(t('products.quickCoupon.validationComplete'));
            return null;
        }

        if (!Number.isFinite(numericValue) || numericValue <= 0) {
            toast.error(t('products.quickCoupon.validationPositive'));
            return null;
        }

        if (quickCouponType === 'PERCENTAGE' && numericValue > 100) {
            toast.error(t('products.quickCoupon.validationPercentageMax'));
            return null;
        }

        if (
            quickCouponType === 'AMOUNT'
            && Number.isFinite(productPrice)
            && numericValue > productPrice
        ) {
            toast.error(t('products.quickCoupon.validationAmountExceedsPrice'));
            return null;
        }

        return {
            code,
            discount_type: quickCouponType,
            product_id: String(product.id),
            expires_at: new Date(quickCouponExpiresAt).toISOString(),
            ...(quickCouponType === 'PERCENTAGE'
                ? { discount_percentage: numericValue }
                : { discount_amount: numericValue }),
        };
    };

    // ─── Submit ───────────────────────────────────────────────────────────────

    const onSubmit = async (values) => {
        const quickCouponPayload = quickCouponEnabled
            ? buildQuickCouponPayload(Number(values.price))
            : null;
        if (quickCouponEnabled && !quickCouponPayload) {
            return;
        }

        // 1. Update basic product fields
        const payload = {
            title: values.title,
            type: values.type,
            price: values.price,
            is_archived: values.is_archived,
        };
        if (values.description) payload.description = values.description;
        if (values.price_after_discount) payload.price_after_discount = values.price_after_discount;
        if (values.serial) payload.serial = values.serial;
        if (values.coupon_id) payload.coupon_id = values.coupon_id;
        payload.perks = values.perks || '';

        const res = await updateProduct(product.id, payload);
        if (!res?.success) return;

        // 2. Reconcile category: detach old → attach new (if changed)
        const existingCatId = product?.product_categories?.[0]?.category_id ?? null;
        const newCatId = pickedCategory?.id ?? null;

        if (existingCatId !== newCatId) {
            if (existingCatId) {
                await detachCategory(product.id, existingCatId);
            }
            if (newCatId) {
                await attachCategories(product.id, [newCatId]);
            }
        }

        if (quickCouponEnabled) {
            try {
                await createCoupon(quickCouponPayload);
            } catch {
                toast.error(t('products.quickCoupon.createFailed'));
            }
        }

        onOpenChange(false);
        onSuccess?.();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] custom-scrollbar overflow-y-auto" data-testid="edit-product-dialog">
                <DialogHeader>
                    <DialogTitle>{t('products.edit.dialogTitle')}</DialogTitle>
                    <DialogDescription>{t('products.edit.dialogDescription')}</DialogDescription>
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
                                        <Input data-testid="edit-product-title-input" {...field} />
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
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                                data-testid="edit-product-discount-input"
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

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('products.form.description')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={3}
                                            data-testid="edit-product-description-input"
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
                                            data-testid="edit-product-perks-input"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category — single selection */}
                        <div className="space-y-3" data-testid="edit-product-category">
                            <span className="text-sm font-medium leading-none">{t('products.detail.categories')}</span>
                            <Separator />

                            {/* Current / picked category badge */}
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

                            {/* Cascading root → child picker */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <Select
                                    value={selectedRootId}
                                    onValueChange={handleRootChange}
                                    disabled={actionLoading || roots.length === 0}
                                >
                                    <SelectTrigger className="flex-1" data-testid="edit-product-category-root-select">
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
                                            disabled={actionLoading || !currentChildren?.length}
                                        >
                                            <SelectTrigger className="flex-1" data-testid="edit-product-category-child-select">
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

                        {/* Required Fields */}
                        <div className="space-y-3" data-testid="edit-product-required-fields">
                            <div>
                                <span className="text-sm font-medium leading-none">{t('products.detail.requiredFields')}</span>
                            </div>
                            <Separator />

                            {/* Attached fields */}
                            {attachedFields.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{t('products.detail.noRequiredFields')}</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {attachedFields.map((field) => (
                                        <span
                                            key={field.id}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
                                            data-testid={`edit-product-required-field-tag-${field.id}`}
                                        >
                                            {field.required_field_definitions?.label}
                                            <Badge variant="outline" className="text-xs ms-1">
                                                {field.required_field_definitions?.field_type}
                                            </Badge>
                                            <button
                                                type="button"
                                                onClick={() => handleDetachField(field.field_definition_id)}
                                                disabled={actionLoading}
                                                className="rounded-full hover:bg-destructive/20 p-0.5 text-destructive"
                                                aria-label={`Remove ${field.required_field_definitions?.label}`}
                                                data-testid={`edit-product-detach-field-${field.id}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Attach picker */}
                            {availableFieldDefs.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Select value={selectedFieldDefId} onValueChange={setSelectedFieldDefId}>
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

                        {/* Quick coupon */}
                        <div className="space-y-3" data-testid="edit-product-quick-coupon">
                            <div>
                                <span className="text-sm font-medium leading-none">{t('products.quickCoupon.title')}</span>
                                <p className="text-sm text-muted-foreground mt-1">{t('products.quickCoupon.description')}</p>
                            </div>
                            <Separator />

                            <div className="flex items-center justify-between gap-3">
                                <label htmlFor="edit-product-quick-coupon-switch" className="text-sm font-medium">
                                    {t('products.quickCoupon.enable')}
                                </label>
                                <Switch
                                    id="edit-product-quick-coupon-switch"
                                    checked={quickCouponEnabled}
                                    onCheckedChange={setQuickCouponEnabled}
                                    data-testid="edit-product-quick-coupon-switch"
                                />
                            </div>

                            {quickCouponEnabled && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium leading-none">{t('products.quickCoupon.code')}</label>
                                            <Input
                                                value={quickCouponCode}
                                                onChange={(e) => setQuickCouponCode(e.target.value.toUpperCase())}
                                                placeholder={t('products.quickCoupon.codePlaceholder')}
                                                data-testid="edit-product-quick-coupon-code-input"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="sm:self-end"
                                            disabled={couponLoading}
                                            onClick={handleGenerateQuickCouponCode}
                                            data-testid="edit-product-quick-coupon-generate-button"
                                        >
                                            {t('products.quickCoupon.generate')}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium leading-none">{t('products.quickCoupon.type')}</label>
                                            <Select value={quickCouponType} onValueChange={setQuickCouponType}>
                                                <SelectTrigger data-testid="edit-product-quick-coupon-type-select">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PERCENTAGE">{t('coupons.discountType.percentage')}</SelectItem>
                                                    <SelectItem value="AMOUNT">{t('coupons.discountType.amount')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium leading-none">
                                                {quickCouponType === 'PERCENTAGE'
                                                    ? t('products.quickCoupon.percentageValue')
                                                    : t('products.quickCoupon.amountValue')}
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={quickCouponValue}
                                                    onChange={(e) => setQuickCouponValue(e.target.value)}
                                                    data-testid="edit-product-quick-coupon-value-input"
                                                    className="pe-14"
                                                />
                                                <span
                                                        className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground"
                                                        data-testid="coupons-create-discount-amount-suffix"
                                                    >
                                                        {quickCouponType === 'PERCENTAGE' ? t('coupons.form.units.percentage') : t('coupons.form.units.amount')} 
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium leading-none">{t('coupons.form.expiresAt')}</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className={cn(
                                                            'w-full justify-start text-start font-normal',
                                                            !quickCouponExpiresAt && 'text-muted-foreground'
                                                        )}
                                                        data-testid="edit-product-quick-coupon-expires-at-input"
                                                    >
                                                        <CalendarIcon className="me-2 h-4 w-4" />
                                                        {quickCouponExpiresAt
                                                            ? format(new Date(quickCouponExpiresAt), 'PPP', { locale: isRtl ? arSA : undefined })
                                                            : t('coupons.form.expiresAtPlaceholder')}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="end">
                                                    <Calendar
                                                        mode="single"
                                                        selected={quickCouponExpiresAt ? new Date(quickCouponExpiresAt) : undefined}
                                                        onSelect={(date) => {
                                                            if (!date) return;
                                                            setQuickCouponExpiresAt(date.toISOString());
                                                        }}
                                                        locale={isRtl ? arSA : undefined}
                                                        dir={isRtl ? 'rtl' : 'ltr'}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Archived toggle */}
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

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                data-testid="edit-product-cancel-button"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={actionLoading || couponLoading}
                                data-testid="edit-product-submit-button"
                            >
                                {actionLoading ? t('products.edit.saving') : t('products.edit.submit')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
