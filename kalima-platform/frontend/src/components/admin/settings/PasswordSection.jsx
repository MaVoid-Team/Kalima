import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Key } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmPasswordChangeDialog from './ConfirmPasswordChangeDialog';
import ConfirmSetPasswordDialog from './ConfirmSetPasswordDialog';
import usePassword from '@/hooks/auth/usePassword';
import { useAccountProviders } from '@/hooks/useAccountProviders';

export default function PasswordSection({ ns = 'admin' }) {
    const { t, i18n } = useTranslation(ns);
    const { changePassword, setPassword, loading } = usePassword();
    const { hasOAuthProviders } = useAccountProviders();
    
    const [showChangeDialog, setShowChangeDialog] = useState(false);
    const [showSetDialog, setShowSetDialog] = useState(false);

    const handleChangePassword = async (data) => {
        try {
            await changePassword(data.currentPassword, data.newPassword);
            setShowChangeDialog(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleSetPassword = async (data) => {
        try {
            await setPassword(data.password);
            setShowSetDialog(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    {t('settings.password.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">{t('settings.password.changePassword')}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t('settings.password.changeDescription', 'Change your existing password')}
                        </p>
                        <Button 
                            onClick={() => setShowChangeDialog(true)}
                            variant="default"
                            className="w-full"
                        >
                            <Key className="h-4 w-4 mr-2" />
                            {t('settings.password.changePassword')}
                        </Button>
                    </div>
                    
                    {/* Only show set password option for OAuth users */}
                    {hasOAuthProviders && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">{t('settings.password.setPassword')}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.password.setDescription', 'Set a password for local login')}
                            </p>
                            <Button 
                                onClick={() => setShowSetDialog(true)}
                                variant="outline"
                                className="w-full"
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                {t('settings.password.setPassword')}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Change Password Confirmation Dialog */}
                <ConfirmPasswordChangeDialog
                    open={showChangeDialog}
                    onOpenChange={setShowChangeDialog}
                    onConfirm={handleChangePassword}
                    loading={loading}
                    ns={ns}
                />

                {/* Set Password Confirmation Dialog */}
                {hasOAuthProviders && (
                    <ConfirmSetPasswordDialog
                        open={showSetDialog}
                        onOpenChange={setShowSetDialog}
                        onConfirm={handleSetPassword}
                        loading={loading}
                        ns={ns}
                    />
                )}
            </CardContent>
        </Card>
    );
}
