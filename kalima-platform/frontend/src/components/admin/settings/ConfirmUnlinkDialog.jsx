import { useTranslation } from 'react-i18next';
import { Unlink, AlertTriangle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { providerIcons } from './ProviderIcons';

export default function ConfirmUnlinkDialog({ 
    open, 
    onOpenChange, 
    onConfirm, 
    loading, 
    provider 
}) {
    const { t } = useTranslation('admin');

    if (!provider) return null;

    const IconComponent = providerIcons[provider.provider] || providerIcons.firebase;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Unlink className="h-5 w-5 text-destructive" />
                        {t('settings.account.confirmUnlinkTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('settings.account.confirmUnlink')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        {typeof IconComponent === 'function' ? (
                            <IconComponent className="h-5 w-5" />
                        ) : (
                            <IconComponent className="h-5 w-5" />
                        )}
                        <div className="flex-1">
                            <p className="font-medium">
                                {provider.provider === 'local' 
                                    ? t('settings.account.providers.local', 'Email Account')
                                    : t(`settings.account.providers.${provider.provider}`, provider.provider)
                                }
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {provider.providerEmail}
                            </p>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                            {t('settings.account.connected', 'Connected')}
                        </Badge>
                    </div>
                    
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            <p className="text-sm text-destructive">
                                {t('settings.account.unlinkWarning', 'You will lose access to this login method and will need to use one of your remaining accounts to sign in.')}
                            </p>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {t('common.cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? t('common.loading') : t('settings.account.unlink', 'Unlink')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
