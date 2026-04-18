import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Unlink, Mail } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ConfirmUnlinkDialog from './ConfirmUnlinkDialog';
import useLinkAccounts from '@/hooks/auth/useLinkAccounts';
import useAuth from '@/hooks/auth/useAuth';
import { useAccountProviders } from '@/hooks/useAccountProviders';
import { providerIcons, GoogleIcon } from './ProviderIcons';
import { getFirebaseIdToken } from '@/utils/firebaseAuth';

export default function AccountSection({ ns = 'admin' }) {
    const { t, i18n } = useTranslation(ns);
    const { user } = useAuth();
    const { linkFirebaseAccount, unlinkProvider } = useLinkAccounts();
    const {
        linkedProviders,
        loading,
        refreshProviders,
        hasOAuthProviders,
        hasLocalProvider,
        hasFirebaseProvider
    } = useAccountProviders();

    const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [isLinkingFirebase, setIsLinkingFirebase] = useState(false);

    const handleLinkFirebase = async () => {
        setIsLinkingFirebase(true);
        try {
            // Initiate Firebase OAuth flow and get ID token
            const idToken = await getFirebaseIdToken();

            // Link the Firebase account to the user's profile
            await linkFirebaseAccount(idToken);
            refreshProviders();
        } catch (error) {
            // Error handled by hook - the hook should show error message
            console.error('Failed to link Firebase account:', error);
        } finally {
            setIsLinkingFirebase(false);
        }
    };

    const handleUnlinkProvider = (provider) => {
        setSelectedProvider(provider);
        setShowUnlinkDialog(true);
    };

    const confirmUnlink = async () => {
        if (selectedProvider) {
            try {
                await unlinkProvider(selectedProvider.provider);
                refreshProviders();
                setShowUnlinkDialog(false);
                setSelectedProvider(null);
            } catch (error) {
                // Error handled by hook
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t('settings.account.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Linked Providers */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium">{t('settings.account.linkedProviders')}</h3>

                    {linkedProviders.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {t('settings.account.noLinkedProviders', 'No linked accounts')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {linkedProviders.map((provider, index) => {
                                const IconComponent = providerIcons[provider.provider] || providerIcons.firebase;
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-2xl bg-muted/20 gap-4"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm border border-border/40">
                                                {typeof IconComponent === 'function' ? (
                                                    <IconComponent className="h-5 w-5" />
                                                ) : (
                                                    <IconComponent className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-foreground">
                                                    {provider.provider === 'local'
                                                        ? t('settings.account.providers.local', 'Email Account')
                                                        : ['firebase', 'google'].includes(provider.provider)
                                                            ? t('settings.account.providers.google', 'Google')
                                                            : t(`settings.account.providers.${provider.provider}`, provider.provider)
                                                    }
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-none" title={provider.providerEmail}>
                                                    {provider.providerEmail}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Badge variant="secondary" className="rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider bg-background/50">
                                                {t('settings.account.connected', 'Connected')}
                                            </Badge>
                                            {linkedProviders.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleUnlinkProvider(provider)}
                                                    disabled={loading}
                                                    className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10 border-transparent ml-auto"
                                                >
                                                    <Unlink className="h-3.5 w-3.5 mr-1.5" />
                                                    {t('settings.account.unlink', 'Unlink')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <Separator />

                {/* Link New Accounts */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium">{t('settings.account.linkNewAccount')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!hasFirebaseProvider && (
                            <Button
                                onClick={handleLinkFirebase}
                                variant="outline"
                                disabled={isLinkingFirebase || loading}
                                className="flex items-center gap-2"
                            >
                                <GoogleIcon className="h-4 w-4" />
                                {isLinkingFirebase
                                    ? t('common.loading')
                                    : t('settings.account.linkFirebase', 'Link Google Account')
                                }
                            </Button>
                        )}

                        {!hasLocalProvider && hasOAuthProviders && (
                            <Button
                                variant="outline"
                                disabled={true}
                                className="flex items-center gap-2"
                            >
                                <Mail className="h-4 w-4" />
                                {t('settings.account.setPasswordFirst', 'Set password first')}
                            </Button>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {t('settings.account.linkDescription', 'Link additional accounts to enable multiple login methods.')}
                    </p>
                </div>

                {/* Unlink Confirmation Dialog */}
                <ConfirmUnlinkDialog
                    open={showUnlinkDialog}
                    onOpenChange={setShowUnlinkDialog}
                    onConfirm={confirmUnlink}
                    loading={loading}
                    provider={selectedProvider}
                />
            </CardContent>
        </Card>
    );
}
