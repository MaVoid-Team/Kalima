import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle, AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import useEmailVerification from '@/hooks/auth/useEmailVerification';
import useAuth from '@/hooks/auth/useAuth';
import useDeleteAccount from '@/hooks/auth/useDeleteAccount';
import ConfirmDeleteAccountDialog from './ConfirmDeleteAccountDialog';

export default function SecuritySection({ ns = 'admin' }) {
    const { t, i18n } = useTranslation(ns);
    const { user } = useAuth();
    const { sendVerification, resendVerification, loading } = useEmailVerification();
    const { deleteAccount, loading: deletingAccount } = useDeleteAccount();
    
    const [isSending, setIsSending] = useState(false);
    const [lastSentTime, setLastSentTime] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            window.location.href = '/login';
        } catch (error) {
            // Error handled by hook
        }
    };

    useEffect(() => {
        // Load last sent time from localStorage if exists
        const savedTime = localStorage.getItem('lastVerificationSent');
        if (savedTime) {
            setLastSentTime(new Date(savedTime));
        }
    }, []);

    const isEmailVerified = user?.is_email_verified;
    const canResend = !lastSentTime || (Date.now() - lastSentTime.getTime()) > 60000; // 1 minute cooldown

    const handleSendVerification = async () => {
        setIsSending(true);
        try {
            await sendVerification();
            setLastSentTime(new Date());
            localStorage.setItem('lastVerificationSent', new Date().toISOString());
        } catch (error) {
            // Error handled by hook
        } finally {
            setIsSending(false);
        }
    };

    const handleResendVerification = async () => {
        setIsSending(true);
        try {
            await resendVerification(user?.email);
            setLastSentTime(new Date());
            localStorage.setItem('lastVerificationSent', new Date().toISOString());
        } catch (error) {
            // Error handled by hook
        } finally {
            setIsSending(false);
        }
    };

    const getCooldownText = () => {
        if (!lastSentTime) return '';
        const timeDiff = Date.now() - lastSentTime.getTime();
        const remainingTime = Math.max(0, 60000 - timeDiff);
        const seconds = Math.ceil(remainingTime / 1000);
        return t('settings.email.cooldown', 'Wait {{seconds}}s', { seconds });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle 
                    className="flex items-center gap-2"
                    data-search-content={`${t('settings.email.title', { lng: 'en' })} ${t('settings.email.title', { lng: 'ar' })}`}
                >
                    <Mail className="h-5 w-5" />
                    {t('settings.email.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Email Verification Status */}
                <div className="space-y-4">
                    <h3 
                        className="text-sm font-medium"
                        data-search-content={`${t('settings.email.verificationStatus', { lng: 'en' })} ${t('settings.email.verificationStatus', { lng: 'ar' })}`}
                    >
                        {t('settings.email.verificationStatus')}
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-2xl bg-muted/20 gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                                isEmailVerified ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20"
                            )}>
                                {isEmailVerified ? (
                                    <CheckCircle className={cn("h-5 w-5 text-green-600", i18n.language === "ar" && 'scale-x-[-1]')} />
                                ) : (
                                    <AlertCircle className={cn("h-5 w-5 text-amber-600", i18n.language === "ar" && 'scale-x-[-1]')} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm text-foreground mb-0.5">
                                    {isEmailVerified
                                        ? t('settings.email.verified', 'Email Verified')
                                        : t('settings.email.notVerified', 'Email Not Verified')
                                    }
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-none" title={user?.email}>
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <Badge variant={isEmailVerified ? "default" : "secondary"} className="rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider self-end sm:self-auto">
                            {isEmailVerified
                                ? t('settings.email.verified', 'Verified')
                                : t('settings.email.pending', 'Pending')
                            }
                        </Badge>
                    </div>

                    {!isEmailVerified && (
                        <div className="space-y-3">
                            <p 
                                className="text-sm text-muted-foreground"
                                data-search-content={`${t('settings.email.verificationDescription', { lng: 'en' })} ${t('settings.email.verificationDescription', { lng: 'ar' })}`}
                            >
                                {t('settings.email.verificationDescription', 'Verify your email to secure your account and receive important notifications.')}
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    onClick={handleSendVerification}
                                    disabled={isSending || loading}
                                    className="flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4" />
                                    {isSending 
                                        ? t('common.loading') 
                                        : t('settings.email.sendVerification', 'Send Verification Email')
                                    }
                                </Button>
                                
                                <Button
                                    onClick={handleResendVerification}
                                    disabled={!canResend || isSending || loading}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    {isSending 
                                        ? t('common.loading')
                                        : canResend 
                                            ? t('settings.email.resendVerification', 'Resend Verification')
                                            : getCooldownText()
                                    }
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Security Information */}
                <div className="space-y-4">
                    <h3 
                        className="text-sm font-medium"
                        data-search-content={`${t('settings.email.securityInfo', { lng: 'en' })} ${t('settings.email.securityInfo', { lng: 'ar' })}`}
                    >
                        {t('settings.email.securityInfo')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                             <h4 
                                className="font-medium mb-2"
                                data-search-content={`${t('settings.email.benefits.title', { lng: 'en' })} ${t('settings.email.benefits.title', { lng: 'ar' })}`}
                            >
                                {t('settings.email.benefits.title', 'Benefits of Verification')}
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• {t('settings.email.benefits.security', 'Enhanced account security')}</li>
                                <li>• {t('settings.email.benefits.recovery', 'Password recovery access')}</li>
                                <li>• {t('settings.email.benefits.notifications', 'Important notifications')}</li>
                            </ul>
                        </div>
                        
                        <div className="p-3 border rounded-lg">
                            <h4 
                                className="font-medium mb-2"
                                data-search-content={`${t('settings.email.troubleshooting.title', { lng: 'en' })} ${t('settings.email.troubleshooting.title', { lng: 'ar' })}`}
                            >
                                {t('settings.email.troubleshooting.title', 'Troubleshooting')}
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• {t('settings.email.troubleshooting.spam', 'Check spam folder')}</li>
                                <li>• {t('settings.email.troubleshooting.address', 'Verify email address')}</li>
                                <li>• {t('settings.email.troubleshooting.contact', 'Contact support if needed')}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div className="space-y-4 pt-2">
                    <h3 
                        className="text-sm font-medium text-destructive flex items-center gap-2"
                        data-search-content={`${t('settings.account.dangerZone', { lng: 'en' })} ${t('settings.account.dangerZone', { lng: 'ar' })}`}
                    >
                        <AlertTriangle className="h-4 w-4" />
                        {t('settings.account.dangerZone', 'Danger Zone')}
                    </h3>
                    
                    <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 
                                className="font-medium text-destructive"
                                data-search-content={`${t('settings.account.deleteAccount', { lng: 'en' })} ${t('settings.account.deleteAccount', { lng: 'ar' })}`}
                            >
                                {t('settings.account.deleteAccount')}
                            </h4>
                            <p 
                                className="text-sm text-muted-foreground mt-1"
                                data-search-content={`${t('settings.account.deleteAccountDesc', { lng: 'en' })} ${t('settings.account.deleteAccountDesc', { lng: 'ar' })}`}
                            >
                                {t('settings.account.deleteAccountDesc', 'Permanently remove your account and all associated data. This action is irreversible.')}
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={deletingAccount}
                            className="whitespace-nowrap"
                        >
                            {deletingAccount ? t('common.loading') : t('settings.account.deleteAccountBtn', 'Delete Account')}
                        </Button>
                    </div>
                </div>

                {/* Delete Account Dialog */}
                <ConfirmDeleteAccountDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    onConfirm={handleDeleteAccount}
                    loading={deletingAccount}
                    ns={ns}
                />
            </CardContent>
        </Card>
    );
}
