import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { PlusCircle, X } from 'lucide-react';
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
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';

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
    const { t } = useTranslation('admin');
    const {
        updateProduct,
        attachRequiredFields,
        detachRequiredField,
        fetchFieldDefinitions,
        fieldDefinitions: internalFieldDefs,
        actionLoading,
    } = useAdminProducts();

    const fieldDefinitions = externalFieldDefs ?? internalFieldDefs;
    const loadDefinitions = onLoadDefinitions ?? fetchFieldDefinitions;

    const [selectedFieldDefId, setSelectedFieldDefId] = useState('');

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

    // Reset form and fetch field definitions whenever the dialog opens
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
        }
    }, [product, open, form, loadDefinitions]);

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

    const onSubmit = async (values) => {
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
        if (res?.success) {
            onOpenChange(false);
            onSuccess?.();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="edit-product-dialog">
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
                                disabled={actionLoading}
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
