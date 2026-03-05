import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import useEmailVerification from '@/hooks/auth/useEmailVerification';
import useAuth from '@/hooks/auth/useAuth';

export default function SecuritySection() {
    const { t, i18n } = useTranslation('admin');
    const { user } = useAuth();
    const { sendVerification, resendVerification, loading } = useEmailVerification();
    
    const [isSending, setIsSending] = useState(false);
    const [lastSentTime, setLastSentTime] = useState(null);

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
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {t('settings.email.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Email Verification Status */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium">{t('settings.email.verificationStatus')}</h3>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            {isEmailVerified ? (
                                <CheckCircle className={"h-5 w-5 text-green-600" + (i18n.language=="ar" ? ' scale-x-[-1]' : '')} />
                            ) : (
                                <AlertCircle className={"h-5 w-5 text-amber-600" + (i18n.language=="ar" ? ' scale-x-[-1]' : '')} />
                            )}
                            <div>
                                <p className="font-medium">
                                    {isEmailVerified 
                                        ? t('settings.email.verified', 'Email Verified')
                                        : t('settings.email.notVerified', 'Email Not Verified')
                                    }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <Badge variant={isEmailVerified ? "default" : "secondary"}>
                            {isEmailVerified 
                                ? t('settings.email.verified', 'Verified')
                                : t('settings.email.pending', 'Pending')
                            }
                        </Badge>
                    </div>

                    {!isEmailVerified && (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
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
                    <h3 className="text-sm font-medium">{t('settings.email.securityInfo')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                            <h4 className="font-medium mb-2">
                                {t('settings.email.benefits.title', 'Benefits of Verification')}
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• {t('settings.email.benefits.security', 'Enhanced account security')}</li>
                                <li>• {t('settings.email.benefits.recovery', 'Password recovery access')}</li>
                                <li>• {t('settings.email.benefits.notifications', 'Important notifications')}</li>
                            </ul>
                        </div>
                        
                        <div className="p-3 border rounded-lg">
                            <h4 className="font-medium mb-2">
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
            </CardContent>
        </Card>
    );
}
