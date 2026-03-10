import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, User, Lock, Shield, LogOut } from 'lucide-react';

import ProfileSection from '@/components/admin/settings/ProfileSection';
import PasswordSection from '@/components/admin/settings/PasswordSection';
import AccountSection from '@/components/admin/settings/AccountSection';
import SecuritySection from '@/components/admin/settings/SecuritySection';
import SessionSection from '@/components/admin/settings/SessionSection';

export default function SettingsPage() {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';

    return (
        <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
                    <p className="text-muted-foreground">
                        {t('settings.description', 'Manage your account settings and preferences')}
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                <ProfileSection />
                <PasswordSection />
                <AccountSection />
                <SecuritySection />
                <SessionSection />
            </div>
        </div>
    );
}
