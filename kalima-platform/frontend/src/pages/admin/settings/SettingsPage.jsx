import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';

import ProfileSection from '@/components/admin/settings/ProfileSection';
import PasswordSection from '@/components/admin/settings/PasswordSection';
import AccountSection from '@/components/admin/settings/AccountSection';
import SecuritySection from '@/components/admin/settings/SecuritySection';
import SessionSection from '@/components/admin/settings/SessionSection';
import AccountReviewSection from '@/components/admin/settings/AccountReviewSection';
import GeneralSettingsSection from '@/components/admin/settings/GeneralSettingsSection';

export default function SettingsPage() {
    const { t, i18n } = useTranslation('admin');
    const isRtl = i18n.dir() === 'rtl';

    return (
        <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'} data-testid="admin-settings-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-2 sm:p-3 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-3xl font-black tracking-tight text-foreground">
                        {t('settings.title')}
                    </h1>
                    <p className="text-xs sm:text-base text-muted-foreground mt-0.5 sm:mt-1 font-medium">
                        {t('settings.description')}
                    </p>
                </div>
            </div>

            {/* Sections */}
            <div className="grid gap-6">
                <ProfileSection />
                <PasswordSection />
                <AccountSection />
                <SecuritySection />
                <SessionSection />
                <GeneralSettingsSection />
                <AccountReviewSection />
            </div>
        </div>
    );
}
