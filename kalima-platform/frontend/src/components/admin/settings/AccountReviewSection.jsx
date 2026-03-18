import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAccountReviewSettings } from '@/hooks/admin/useAccountReviewSettings';
import { ROLES } from '@/lib/adminConstants';

// Roles that are meaningful to review (exclude Student/Parent as self-registered)
const REVIEWABLE_ROLES = ROLES.filter((r) => !['Student', 'Parent'].includes(r));

export default function AccountReviewSection() {
    const { t } = useTranslation('admin');
    const { settings, loading, updateLoading, updateSettings } = useAccountReviewSettings();

    const handleToggle = async (role, currentValue) => {
        // Build a full settings array updating just this role
        const updatedSettings = REVIEWABLE_ROLES.map((r) => {
            const existing = Array.isArray(settings)
                ? settings.find((s) => s.role === r)
                : null;
            return {
                role: r,
                requires_review: r === role ? !currentValue : (existing?.requires_review ?? false),
            };
        });

        await updateSettings({ settings: updatedSettings });
    };

    const getRequiresReview = (role) => {
        if (!Array.isArray(settings)) return false;
        return settings.find((s) => s.role === role)?.requires_review ?? false;
    };

    return (
        <Card data-testid="admin-settings-account-review-section">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    {t('settings.accountReview.title')}
                </CardTitle>
                <CardDescription>
                    {t('settings.accountReview.description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {REVIEWABLE_ROLES.map((role) => {
                            const value = getRequiresReview(role);
                            return (
                                <div
                                    key={role}
                                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                                    data-testid={`admin-settings-account-review-${role}`}
                                >
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-medium">{role}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t('settings.accountReview.requireReviewDesc', { role })}
                                        </p>
                                    </div>
                                    {updateLoading ? (
                                        <LoadingSpinner className="h-4 w-4" />
                                    ) : (
                                        <Switch
                                            checked={value}
                                            onCheckedChange={() => handleToggle(role, value)}
                                            data-testid={`admin-settings-account-review-toggle-${role}`}
                                            aria-label={`${role} review toggle`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
