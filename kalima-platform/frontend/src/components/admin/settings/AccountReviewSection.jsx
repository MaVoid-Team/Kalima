import { useTranslation } from 'react-i18next';
import { ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAccountReviewSettings } from '@/hooks/admin/useAccountReviewSettings';
import { ROLES } from '@/lib/adminConstants';
import useRole from '@/hooks/useRole';

export default function AccountReviewSection() {
    const { t, i18n } = useTranslation('admin');
    const { settings, loading, updateLoading, updateSettings } = useAccountReviewSettings();
    const { isAdmin } = useRole();

    // Only show elevated roles for super-admins
    const filteredRoles = ROLES.filter((role) => {
        if (['Admin', 'SubAdmin'].includes(role)) return isAdmin;
        return true;
    });

    // ── Helpers ───────────────────────────────────────────────────────────────

    const getRequiresReview = (role) => {
        if (!Array.isArray(settings)) return false;
        return settings.find((s) => s.role === role)?.requires_review ?? false;
    };

    /** True only when every visible role has requires_review = true */
    const allEnabled = Array.isArray(settings) && filteredRoles.length > 0
        && filteredRoles.every((role) => getRequiresReview(role));

    /** True when at least one (but not all) roles are enabled */
    const someEnabled = Array.isArray(settings)
        && filteredRoles.some((role) => getRequiresReview(role));

    // ── Handlers ──────────────────────────────────────────────────────────────

    /** Toggle a single role */
    const handleToggle = async (role, currentValue) => {
        const updatedSettings = ROLES.map((r) => {
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

    /** Toggle all visible roles at once */
    const handleToggleAll = async () => {
        const nextValue = !allEnabled; // if all are on, turn all off; otherwise turn all on
        const updatedSettings = ROLES.map((r) => {
            const existing = Array.isArray(settings)
                ? settings.find((s) => s.role === r)
                : null;
            // Only change roles that are visible (filtered); leave hidden ones unchanged
            const isVisible = filteredRoles.includes(r);
            return {
                role: r,
                requires_review: isVisible ? nextValue : (existing?.requires_review ?? false),
            };
        });
        await updateSettings({ settings: updatedSettings });
    };

    return (
        <Card data-testid="admin-settings-account-review-section">
            <CardHeader>
                <CardTitle 
                    className="flex items-center gap-2"
                    data-search-content={`${t('settings.accountReview.title', { lng: 'en' })} ${t('settings.accountReview.title', { lng: 'ar' })}`}
                >
                    <ShieldCheck className={`h-5 w-5 text-primary ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
                    {t('settings.accountReview.title', 'Account Review')}
                </CardTitle>
                <CardDescription data-search-content={`${t('settings.accountReview.description', { lng: 'en' })} ${t('settings.accountReview.description', { lng: 'ar' })}`}>
                    {t('settings.accountReview.description', 'Require admin approval before new users can make purchases.')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {/* Master toggle skeleton */}
                        <div className="flex items-center justify-between py-2 mb-2">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                            <Skeleton className="h-6 w-11 rounded-full" />
                        </div>
                        <Separator />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {/* ── Master "All Accounts" toggle ─────────────────── */}
                        <div
                            className="flex items-center justify-between pb-4"
                            data-testid="admin-settings-account-review-all"
                        >
                            <div className="space-y-0.5">
                                <p 
                                    className="text-sm font-semibold flex items-center gap-2"
                                    data-search-content={`${t('settings.accountReview.allAccounts', { lng: 'en' })} ${t('settings.accountReview.allAccounts', { lng: 'ar' })}`}
                                >
                                    {allEnabled
                                        ? <ToggleRight className="h-4 w-4 text-primary" />
                                        : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                    }
                                    {t('settings.accountReview.allAccounts', 'All Account Types')}
                                    {someEnabled && !allEnabled && (
                                        <span className="text-xs font-normal text-muted-foreground">
                                            ({t('settings.accountReview.partial', 'partial')})
                                        </span>
                                    )}
                                </p>
                                <p 
                                    className="text-xs text-muted-foreground"
                                    data-search-content={`${t('settings.accountReview.allAccountsDesc', { lng: 'en' })} ${t('settings.accountReview.allAccountsDesc', { lng: 'ar' })}`}
                                >
                                    {t('settings.accountReview.allAccountsDesc', 'Enable or disable review for all account types at once.')}
                                </p>
                            </div>
                            {updateLoading ? (
                                <LoadingSpinner className="h-4 w-4" />
                            ) : (
                                <Switch
                                    checked={allEnabled}
                                    onCheckedChange={handleToggleAll}
                                    data-testid="admin-settings-account-review-toggle-all"
                                    aria-label="Toggle all account types review"
                                />
                            )}
                        </div>

                        {/* ── Per-role toggles ──────────────────────────────── */}
                        {filteredRoles.map((role) => {
                            const value = getRequiresReview(role);
                            return (
                                <div
                                    key={role}
                                    className="flex items-center justify-between py-4 first:pt-4 last:pb-0"
                                    data-testid={`admin-settings-account-review-${role}`}
                                >
                                    <div className="space-y-0.5 ps-2">
                                        <p 
                                            className="text-sm font-medium"
                                            data-search-content={`${t(`roles.${role}`, { lng: 'en' })} ${t(`roles.${role}`, { lng: 'ar' })}`}
                                        >
                                            {t(`roles.${role}`, role)}
                                        </p>
                                        <p 
                                            className="text-xs text-muted-foreground"
                                            data-search-content={`${t('settings.accountReview.requireReviewDesc', { role, lng: 'en' })} ${t('settings.accountReview.requireReviewDesc', { role, lng: 'ar' })}`}
                                        >
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
