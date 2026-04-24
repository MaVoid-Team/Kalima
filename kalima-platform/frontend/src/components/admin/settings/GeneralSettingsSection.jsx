import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings2, HelpCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { PhoneInput, egyptPhoneSchema } from '@/components/ui/phone-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAdminGeneralSettings } from '@/hooks/admin/useAdminGeneralSettings';

const getGeneralSettingsSchema = (t) => z.object({
    whatsapp_sending_number: egyptPhoneSchema(t).optional().or(z.literal('')),
    whatsapp_receiving_number: egyptPhoneSchema(t).optional().or(z.literal(''))
});

export default function GeneralSettingsSection() {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';
    const [isEditing, setIsEditing] = useState(false);

    const { settings, updateSettings, loading, updateLoading } = useAdminGeneralSettings();

    const form = useForm({
        resolver: zodResolver(getGeneralSettingsSchema(t)),
        defaultValues: {
            whatsapp_sending_number: '',
            whatsapp_receiving_number: ''
        }
    });

    useEffect(() => {
        if (settings) {
            form.reset({
                whatsapp_sending_number: settings.whatsapp_sending_number || '',
                whatsapp_receiving_number: settings.whatsapp_receiving_number || ''
            });
        }
    }, [settings, form]);

    const onSubmit = async (values) => {
        const success = await updateSettings(values);
        if (success) {
            setIsEditing(false);
        }
    };

    if (loading && !isEditing) {
        return (
            <Card>
                <CardContent className="p-12 flex justify-center">
                    <LoadingSpinner className="h-8 w-8" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings2 className={isRtl ? "h-5 w-5 scale-x-[-1]" : "h-5 w-5"} />
                    {t('settings.general.title', 'General Administration Settings')}
                </CardTitle>
                <CardDescription>
                    {t('settings.general.description', 'Global settings for store contact and messaging.')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="whatsapp_sending_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FormLabel className="mb-0">
                                                {t('settings.general.whatsappSendingNumber', 'WhatsApp Sending Number')}
                                            </FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">
                                                            {t('settings.general.whatsappSendingNumberHint')}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormControl>
                                            <PhoneInput
                                                disabled={!isEditing || updateLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="whatsapp_receiving_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FormLabel className="mb-0">
                                                {t('settings.general.whatsappReceivingNumber', 'WhatsApp Receiving Number')}
                                            </FormLabel>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">
                                                            {t('settings.general.whatsappReceivingNumberHint')}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <FormControl>
                                            <PhoneInput
                                                disabled={!isEditing || updateLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        type="submit"
                                        disabled={updateLoading || !form.formState.isDirty}
                                    >
                                        {updateLoading && <LoadingSpinner className="h-4 w-4 me-2" />}
                                        {t('common:save', 'Save')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false);
                                            form.reset();
                                        }}
                                        disabled={updateLoading}
                                    >
                                        {t('common:cancel', 'Cancel')}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                >
                                    {t('settings.general.editSettings', 'Edit Settings')}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
