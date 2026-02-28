import { useState } from 'react';
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
import PaymentMethodImageUpload from './PaymentMethodImageUpload';
import { useAdminPaymentMethods } from '@/hooks/admin/useAdminPaymentMethods';

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
    status: z.boolean().default(true),
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

export default function CreatePaymentMethodDialog({ open, onOpenChange, onSuccess }) {
    const { t } = useTranslation('admin');
    const { createPaymentMethod } = useAdminPaymentMethods();
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

    const handleImageUpload = (file) => {
        if (file) {
            form.setValue('image', file, { shouldValidate: true });
        } else {
            form.setValue('image', null, { shouldValidate: true });
        }
    };

    const onSubmit = async (data) => {
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

            const result = await createPaymentMethod(formData, (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(progress);
            });

            if (result?.success) {
                form.reset();
                onSuccess?.();
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Failed to create payment method:', error);
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

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md" data-testid="create-payment-method-dialog">
                <DialogHeader>
                    <DialogTitle>{t('paymentMethods.create.title', 'Create Payment Method')}</DialogTitle>
                    <DialogDescription>
                        {t('paymentMethods.create.description', 'Add a new payment method to your store.')}
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
                                        <FormLabel htmlFor="name">
                                            {t('paymentMethods.fields.name', 'Name')} *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="name"
                                                placeholder={t('paymentMethods.fields.namePlaceholder', 'e.g., Vodafone Cash')}
                                                {...field}
                                                data-testid="payment-method-name-input"
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
                                        <FormLabel htmlFor="phone_number">
                                            {t('paymentMethods.fields.phoneNumber', 'Phone Number')} *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                id="phone_number"
                                                placeholder={t('paymentMethods.fields.phoneNumberPlaceholder', 'e.g., 01012345678')}
                                                {...field}
                                                data-testid="payment-method-phone-input"
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
                                                data-testid="payment-method-status-switch"
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
                                                </FormLabel>
                                                <FormDescription>
                                                    {t('paymentMethods.fields.imageDescription', 'Upload an image to represent this payment method. Recommended size: 200x200px')}
                                                </FormDescription>
                                                <FormControl>
                                                    <PaymentMethodImageUpload
                                                        value={field.value ? URL.createObjectURL(field.value) : null}
                                                        onChange={handleImageUpload}
                                                        disabled={isSubmitting}
                                                    />
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
                                data-testid="payment-method-create-cancel"
                            >
                                {t('common.cancel', 'Cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                data-testid="payment-method-create-submit"
                            >
                                {isSubmitting ? t('paymentMethods.creating', 'Creating...') : t('paymentMethods.create.submit', 'Create Payment Method')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
