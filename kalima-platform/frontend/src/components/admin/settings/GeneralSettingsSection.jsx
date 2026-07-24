import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { MessageSquare, LogOut, RefreshCw, Settings2, HelpCircle, Pencil } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useWhatsappStatus } from '@/hooks/admin/useWhatsappStatus';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const getGeneralSettingsSchema = (t) => z.object({
    whatsapp_receiving_number: egyptPhoneSchema(t).optional().or(z.literal(''))
});

export default function GeneralSettingsSection() {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';
    const [isEditing, setIsEditing] = useState(false);

    const { settings, updateSettings, loading: settingsLoading, updateLoading } = useAdminGeneralSettings();
    const { status, qrCodeStr, sendingNumber, loading: whatsappLoading, isActionLoading, requestQR, logout } = useWhatsappStatus();

    const form = useForm({
        resolver: zodResolver(getGeneralSettingsSchema(t)),
        defaultValues: {
            whatsapp_receiving_number: ''
        }
    });

    useEffect(() => {
        if (settings) {
            form.reset({
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

    const loading = settingsLoading || (whatsappLoading && status === 'disconnected');

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
                <CardTitle 
                    className="flex items-center gap-2"
                    data-search-content={`${t('settings.general.title', { lng: 'en' })} ${t('settings.general.title', { lng: 'ar' })}`}
                >
                    <Settings2 className={isRtl ? "h-5 w-5 scale-x-[-1]" : "h-5 w-5"} />
                    {t('settings.general.title', 'General Administration Settings')}
                </CardTitle>
                <CardDescription data-search-content={`${t('settings.general.description', { lng: 'en' })} ${t('settings.general.description', { lng: 'ar' })}`}>
                    {t('settings.general.description', 'Global settings for store contact and messaging.')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormItem>
                                <div className="flex items-center gap-2 mb-2">
                                    <FormLabel
                                        className="mb-0"
                                        data-search-content={`${t('settings.general.whatsappSendingNumber', { lng: 'en' })} ${t('settings.general.whatsappSendingNumber', { lng: 'ar' })}`}
                                    >
                                        {status === 'ready'
                                            ? t('settings.general.whatsappSendingNumber', 'WhatsApp Sending Number')
                                            : t('settings.general.whatsappLastLinkedNumber', 'Last Linked WhatsApp Number')}
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
                                <Input
                                    disabled={true}
                                    className="bg-muted font-mono"
                                    dir="ltr"
                                    value={(sendingNumber || settings?.whatsapp_sending_number) ? `+${(sendingNumber || settings?.whatsapp_sending_number).toString().replace(/^\+/, '')}` : t('common:na', 'N/A')}
                                />
                                {status !== 'ready' && settings?.whatsapp_sending_number && (
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        {t(
                                            'settings.general.whatsappHistoricalNumberNotice',
                                            'Saved for reference only. The live connection status is shown below.'
                                        )}
                                    </p>
                                )}
                            </FormItem>

                            <FormField
                                control={form.control}
                                name="whatsapp_receiving_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FormLabel 
                                                className="mb-0"
                                                data-search-content={`${t('settings.general.whatsappReceivingNumber', { lng: 'en' })} ${t('settings.general.whatsappReceivingNumber', { lng: 'ar' })}`}
                                            >
                                                {t('settings.general.whatsappReceivingNumber', 'WhatsApp Receiving Number')}
                                            </FormLabel>
                                            {!isEditing && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                                    onClick={() => setIsEditing(true)}
                                                    type="button"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
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
                            {isEditing && (
                                <>
                                    <Button
                                        type="submit"
                                        disabled={updateLoading || !form.formState.isDirty}
                                    >
                                        {updateLoading && <LoadingSpinner className="h-4 w-4 me-2" />}
                                        {t('settings.general.updateReceivingNumber', 'Update Receiving Number')}
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
                            )}
                        </div>
                    </form>
                </Form>

                <Separator />

                <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 
                                className="text-lg font-medium flex items-center gap-2"
                                data-search-content={`${t('settings.general.whatsappStatus', { lng: 'en' })} ${t('settings.general.whatsappStatus', { lng: 'ar' })}`}
                            >
                                <MessageSquare className="h-5 w-5 text-primary" />
                                {t('settings.general.whatsappStatus')}
                            </h3>
                            <p 
                                className="text-sm text-muted-foreground"
                                data-search-content={`${t('settings.general.whatsappLinkDescription', { lng: 'en' })} ${t('settings.general.whatsappLinkDescription', { lng: 'ar' })}`}
                            >
                                {t('settings.general.whatsappLinkDescription')}
                            </p>
                        </div>
                        <Badge
                            variant={
                                status === 'ready' ? 'default' :
                                    status === 'failed' ? 'destructive' :
                                        'secondary'
                            }
                            className={status === 'ready' ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                            {t(`settings.general.whatsappStatus${status.charAt(0).toUpperCase() + status.slice(1).replace(/_([a-z])/g, (_, g) => g.toUpperCase())}`)}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {status === 'ready' && (
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-dashed">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{t('settings.general.whatsappConnectedAs')}</p>
                                        <p className="text-lg font-mono font-bold" dir="ltr">
                                            +{sendingNumber.toString().replace(/^\+/, '')}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={logout}
                                    disabled={isActionLoading}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                >
                                    {isActionLoading ? <LoadingSpinner className="h-4 w-4 me-2" /> : <LogOut className="h-4 w-4 me-2" />}
                                    {t('settings.general.whatsappLogout')}
                                </Button>
                            </div>
                        )}

                        {status === 'disconnected' && (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/20 gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                    <MessageSquare className="h-8 w-8 text-primary" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-medium text-lg">{t('settings.general.whatsappStatusDisconnected')}</p>
                                    <p className="text-sm text-muted-foreground max-w-md">
                                        {t('settings.general.whatsappLinkDescription')}
                                    </p>
                                </div>
                                 <Button 
                                    onClick={requestQR} 
                                    className="mt-2"
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? <LoadingSpinner className="h-4 w-4 me-2" /> : <RefreshCw className="h-4 w-4 me-2" />}
                                    {t('settings.general.whatsappConnect')}
                                </Button>
                            </div>
                        )}

                        {['initializing', 'reconnecting'].includes(status) && (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/20 gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <LoadingSpinner className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-medium text-lg">
                                        {status === 'reconnecting'
                                            ? t('settings.general.whatsappReconnecting', 'Reconnecting WhatsApp...')
                                            : t('settings.general.whatsappInitializing', 'Initializing Session...')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {status === 'reconnecting'
                                            ? t('settings.general.whatsappReconnectingDescription', 'The saved session is reconnecting automatically. No QR scan is needed yet.')
                                            : t('settings.general.whatsappPreparing', 'The server is preparing the WhatsApp connection.')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {status === 'qr_pending' && !qrCodeStr && (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/20 gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                    <LoadingSpinner className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-medium text-lg">{t('settings.general.whatsappInitializing', 'Initializing Session...')}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.general.whatsappPreparing', 'The server is preparing the WhatsApp connection.')}
                                    </p>
                                </div>
                                <Button 
                                    onClick={requestQR} 
                                    variant="outline" 
                                    className="mt-2"
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? <LoadingSpinner className="h-4 w-4 me-2" /> : <RefreshCw className="h-4 w-4 me-2" />}
                                    {t('settings.general.whatsappRefreshQr')}
                                </Button>
                            </div>
                        )}

                        {status === 'qr_pending' && qrCodeStr && (
                            <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-background rounded-xl border shadow-sm">
                                <div className="p-4 bg-white rounded-xl border-2 border-primary/20 shadow-inner">
                                    <QRCodeSVG
                                        value={qrCodeStr}
                                        size={220}
                                        includeMargin
                                        data-testid="whatsapp-qr-code"
                                    />
                                </div>
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-xl">{t('settings.general.whatsappStatusQrPending')}</h4>
                                        <p className="text-muted-foreground">
                                            {t('settings.general.whatsappScanInstructions')}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                            <span>{t('settings.general.whatsappQrRefreshNotice', 'QR code refreshes every 30 seconds')}</span>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={requestQR} className="w-fit">
                                            <RefreshCw className="h-4 w-4 me-2" />
                                            {t('settings.general.whatsappRefreshQr')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === 'failed' && (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-destructive/30 rounded-xl bg-destructive/5 gap-4">
                                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                                    <LogOut className="h-8 w-8 text-destructive" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-medium text-lg text-destructive">{t('settings.general.whatsappStatusFailed')}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {t('settings.general.whatsappConnectionError', 'Something went wrong during the connection process.')}
                                    </p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={requestQR} 
                                    className="mt-2"
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? <LoadingSpinner className="h-4 w-4 me-2" /> : <RefreshCw className="h-4 w-4 me-2" />}
                                    {t('settings.general.whatsappTryAgain', 'Try Again')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
