import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PaymentMethodImageUpload from './PaymentMethodImageUpload';
import { useAdminPaymentMethods } from '@/hooks/admin/useAdminPaymentMethods';
import { getImageUrl } from '@/lib/storeUtils';

const paymentMethodSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters')
        .regex(/^[a-zA-Z0-9\s\-]+$/, 'Name can only contain letters, numbers, spaces, and hyphens'),
    phone_number: z
        .string()
        .min(1, 'Phone number is required')
        .max(20, 'Phone number must be less than 20 characters')
        .regex(/^[+]?[0-9\s\-()]+$/, 'Please enter a valid phone number'),
    status: z.boolean(),
    image: z
        .instanceof(File)
        .optional()
        .refine(
            (file) => !file || file.size <= 5 * 1024 * 1024,
            'Image size must be less than 5MB'
        )
        .refine(
            (file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
            'Image must be JPEG, PNG, or WebP format'
        ),
});

export default function EditPaymentMethodDialog({ open, onOpenChange, paymentMethod, onSuccess }) {
    const { t } = useTranslation('admin');
    const { updatePaymentMethod } = useAdminPaymentMethods();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            name: '',
            phone_number: '',
            status: true,
        },
    });

    useEffect(() => {
        if (paymentMethod && open) {
            form.reset({
                name: paymentMethod.name,
                phone_number: paymentMethod.phone_number,
                status: paymentMethod.status,
            });
        }
    }, [paymentMethod, open, form]);

    const handleImageUpload = (file) => {
        if (file) {
            form.setValue('image', file, { shouldValidate: true });
        } else {
            form.setValue('image', null, { shouldValidate: true });
        }
    };

    const onSubmit = async (data) => {
        if (!paymentMethod) return;

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('phone_number', data.phone_number);
            formData.append('status', data.status ? 'true' : 'false');
            
            if (data.image) {
                formData.append('image', data.image);
            }

            const result = await updatePaymentMethod(paymentMethod.id, formData, (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(progress);
            });

            if (result?.success) {
                form.reset();
                onSuccess?.();
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Failed to update payment method:', error);
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            form.reset();
            onOpenChange(false);
        }
    };

    if (!paymentMethod) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md" data-testid="edit-payment-method-dialog">
                <DialogHeader>
                    <DialogTitle>{t('paymentMethods.edit.title', 'Edit Payment Method')}</DialogTitle>
                    <DialogDescription>
                        {t('paymentMethods.edit.description', 'Update the payment method details.')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="edit-name">
                                            {t('paymentMethods.fields.name', 'Name')} *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="edit-name"
                                                placeholder={t('paymentMethods.fields.namePlaceholder', 'e.g., Vodafone Cash')}
                                                {...field}
                                                data-testid="payment-method-edit-name-input"
                                                className="transition-colors focus:ring-2 focus:ring-primary/20"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t('paymentMethods.fields.nameDescription', 'Enter a descriptive name for the payment method')}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="edit-phone_number">
                                            {t('paymentMethods.fields.phoneNumber', 'Phone Number')} *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="edit-phone_number"
                                                placeholder={t('paymentMethods.fields.phoneNumberPlaceholder', 'e.g., 01012345678')}
                                                {...field}
                                                data-testid="payment-method-edit-phone-input"
                                                className="transition-colors focus:ring-2 focus:ring-primary/20"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {t('paymentMethods.fields.phoneDescription', 'Enter the contact phone number for this payment method')}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base font-medium">
                                                {t('paymentMethods.fields.status', 'Status')}
                                            </FormLabel>
                                            <FormDescription>
                                                {t('paymentMethods.fields.statusDescription', 'Enable or disable this payment method')}
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                data-testid="payment-method-edit-status-switch"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <Card className="border-dashed">
                                <CardContent className="pt-6">
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-medium">
                                                    {t('paymentMethods.fields.image', 'Payment Method Image')}
                                                    <span className="text-sm text-muted-foreground ml-2">
                                                        ({t('paymentMethods.fields.imageOptional', 'Optional')})
                                                    </span>
                                                </FormLabel>
                                                <FormDescription>
                                                    {t('paymentMethods.fields.imageDescription', 'Upload a new image to replace the current one. Recommended size: 200x200px')}
                                                </FormDescription>
                                                <FormControl>
                                                    <div className="space-y-4">
                                                        {paymentMethod?.image_url && !field.value && (
                                                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                                                                <img
                                                                    src={getImageUrl(paymentMethod.image_url)}
                                                                    alt={paymentMethod.name}
                                                                    className="h-16 w-16 rounded-md object-cover border"
                                                                />
                                                                <div className="space-y-1">
                                                                    <p className="text-sm font-medium">{t('paymentMethods.currentImage', 'Current Image')}</p>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {t('paymentMethods.unchanged', 'Unchanged')}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <PaymentMethodImageUpload
                                                            value={field.value ? URL.createObjectURL(field.value) : null}
                                                            onChange={field.onChange}
                                                            disabled={isSubmitting}
                                                        />
                                                        {field.value && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {t('paymentMethods.newImage', 'New Image')}
                                                                </Badge>
                                                                <span>{field.value.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{t('paymentMethods.uploading', 'Uploading...')}</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                data-testid="payment-method-edit-cancel"
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                data-testid="payment-method-edit-submit"
                            >
                                {isSubmitting ? t('paymentMethods.updating', 'Updating...') : t('paymentMethods.edit.submit', 'Update Payment Method')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
