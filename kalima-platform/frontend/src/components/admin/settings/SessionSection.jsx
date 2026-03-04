import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, Monitor, Smartphone, Globe } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ConfirmLogoutAllDialog from './ConfirmLogoutAllDialog';
import useLogout from '@/hooks/auth/useLogout';

// Mock active sessions data - in real implementation, this would come from API
const mockActiveSessions = [
    {
        id: 1,
        device: 'Desktop',
        browser: 'Chrome',
        location: 'Cairo, Egypt',
        ip: '192.168.1.1',
        lastActive: new Date(),
        current: true
    },
    {
        id: 2,
        device: 'Mobile',
        browser: 'Safari',
        location: 'Alexandria, Egypt',
        ip: '192.168.1.2',
        lastActive: new Date(Date.now() - 3600000), // 1 hour ago
        current: false
    }
];

const deviceIcons = {
    Desktop: Monitor,
    Mobile: Smartphone,
    Tablet: Smartphone,
    default: Globe
};

export default function SessionSection() {
    const { t, i18n } = useTranslation('admin');
    const { logout, logoutAll, loading } = useLogout();
    
    const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
    const [activeSessions, setActiveSessions] = useState(mockActiveSessions);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleLogoutAll = async () => {
        try {
            await logoutAll();
            setShowLogoutAllDialog(false);
            // In real implementation, would refresh sessions list
        } catch (error) {
            // Error handled by hook
        }
    };

    const formatLastActive = (date) => {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return t('settings.session.activeNow', 'Active now');
        if (minutes < 60) return t('settings.session.minutesAgo', '{{minutes}}m ago', { minutes });
        if (hours < 24) return t('settings.session.hoursAgo', '{{hours}}h ago', { hours });
        return t('settings.session.daysAgo', '{{days}}d ago', { days });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    {t('settings.session.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Active Sessions */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium">{t('settings.session.activeSessions')}</h3>
                    
                    <div className="space-y-3">
                        {activeSessions.map((session) => {
                            const IconComponent = deviceIcons[session.device] || deviceIcons.default;
                            return (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {session.device} - {session.browser}
                                                </p>
                                                {session.current && (
                                                    <Badge variant="default" className="text-xs">
                                                        {t('settings.session.current', 'Current')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>{session.location}</p>
                                                <p>{session.ip}</p>
                                                <p>{formatLastActive(session.lastActive)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Separator />

                {/* Session Actions */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium">{t('settings.session.sessionActions')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">{t('settings.session.logoutCurrent')}</h4>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.session.logoutCurrentDescription', 'Logout from this device')}
                            </p>
                            <Button 
                                onClick={handleLogout}
                                variant="outline"
                                disabled={loading}
                                className="w-full"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                {loading ? t('common.loading') : t('settings.session.logout')}
                            </Button>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">{t('settings.session.logoutAll')}</h4>
                            <p className="text-sm text-muted-foreground">
                                {t('settings.session.logoutAllDescription', 'Logout from all devices')}
                            </p>
                            <Button 
                                onClick={() => setShowLogoutAllDialog(true)}
                                variant="destructive"
                                disabled={loading}
                                className="w-full"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                {loading ? t('common.loading') : t('settings.session.logoutAll')}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                            {t('settings.session.logoutWarning', 'Logging out from all devices will require you to sign in again on each device.')}
                        </p>
                    </div>
                </div>

                {/* Logout All Confirmation Dialog */}
                <ConfirmLogoutAllDialog
                    open={showLogoutAllDialog}
                    onOpenChange={setShowLogoutAllDialog}
                    onConfirm={handleLogoutAll}
                    loading={loading}
                />
            </CardContent>
        </Card>
    );
}
