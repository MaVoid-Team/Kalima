import { useTranslation } from 'react-i18next';
import { LogOut, AlertTriangle } from 'lucide-react';
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

export default function ConfirmLogoutAllDialog({ 
    open, 
    onOpenChange, 
    onConfirm, 
    loading 
}) {
    const { t } = useTranslation('admin');

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <LogOut className="h-5 w-5 text-destructive" />
                        {t('settings.session.confirmLogoutAllTitle')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('settings.session.confirmLogoutAll')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <div className="py-4">
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            <div className="text-sm text-destructive space-y-1">
                                <p>
                                    {t('settings.session.logoutAllWarning1', 'You will be logged out from all devices immediately.')}
                                </p>
                                <p>
                                    {t('settings.session.logoutAllWarning2', 'You will need to sign in again on each device to continue using your account.')}
                                </p>
                                <p>
                                    {t('settings.session.logoutAllWarning3', 'Any unsaved work will be lost.')}
                                </p>
                            </div>
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
                        {loading ? t('common.loading') : t('settings.session.logoutAll')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
