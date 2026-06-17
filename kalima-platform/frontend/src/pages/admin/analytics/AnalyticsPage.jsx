import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    TrendingUp, Users, ShoppingBag, DollarSign,
    BarChart3, Package, CheckCircle, Clock, CalendarIcon
} from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/admin/useAdminAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import StatCard from '@/components/admin/dashboard/StatCard';
import SectionTitle from '@/components/admin/dashboard/SectionTitle';

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function AnalyticsPage() {
    const { t } = useTranslation('admin');
    const {
        loading,
        storeStats,
        userStats,
        productPerformance,
        responseTime,
        fetchStoreStats,
        fetchUserStats,
        fetchProductPerformance,
        fetchResponseTime
    } = useAdminAnalytics();

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        const startStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
        const endStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';
        fetchStoreStats(startStr, endStr);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    useEffect(() => {
        fetchUserStats();
        fetchProductPerformance();
        fetchResponseTime();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fmt = (n) => (n !== undefined && n !== null && !isNaN(n)) ? Number(n).toLocaleString() : '—';

    /* ── Store stats cards ── */
    const storeCards = [
        {
            icon: DollarSign,
            label: t('dashboard.totalRevenue', 'Total Revenue'),
            value: storeStats?.totalRevenue !== undefined ? `${fmt(storeStats.totalRevenue)} ${t('dashboard.currency', 'EGP')}` : '—',
            color: 'text-emerald-500',
        },
        {
            icon: ShoppingBag,
            label: t('dashboard.totalPurchases', 'Total Purchases'),
            value: fmt(storeStats?.totalPurchases),
            color: 'text-primary',
        },
        {
            icon: DollarSign,
            label: t('dashboard.confirmedRevenue', 'Confirmed Revenue'),
            value: storeStats?.confirmedRevenue !== undefined ? `${fmt(storeStats.confirmedRevenue)} ${t('dashboard.currency', 'EGP')}` : '—',
            color: 'text-emerald-600',
        },
        {
            icon: CheckCircle,
            label: t('dashboard.confirmedPurchases', 'Confirmed Purchases'),
            value: fmt(storeStats?.confirmedPurchases),
            color: 'text-blue-500',
        },
        {
            icon: Clock,
            label: t('dashboard.pendingPurchases', 'Pending Purchases'),
            value: fmt(storeStats?.pendingPurchases),
            color: 'text-orange-500',
        },
        {
            icon: TrendingUp,
            label: t('dashboard.avgOrderValue', 'Avg. Order Value'),
            value: storeStats ? `${fmt(storeStats.averagePrice || storeStats.averageOrderValue)} ${t('dashboard.currency', 'EGP')}` : '—',
            color: 'text-violet-500',
        },
    ];

    /* ── User stats cards ── */
    const totalUsers = userStats?.totalUsers ?? 0;
    const verifiedUsers = userStats?.totalVerifiedUsers ?? 0;
    const roleBreakdown = userStats?.byRole ?? {};

    const userCards = [
        {
            icon: Users,
            label: t('dashboard.totalUsers', 'Total Users'),
            value: fmt(totalUsers),
            color: 'text-chart-3',
        },
        {
            icon: CheckCircle,
            label: t('dashboard.verifiedUsers', 'Verified Users'),
            value: fmt(verifiedUsers),
            sub: totalUsers ? `${Math.round((verifiedUsers / totalUsers) * 100)}% ${t('dashboard.ofTotal', 'of total')}` : undefined,
            color: 'text-emerald-500',
        },
    ];

    /* ── Response Time cards ── */
    const responseTimeCards = [
        {
            icon: Clock,
            label: t('dashboard.avgResponseTime', 'Avg. Response Time'),
            value: responseTime?.averageResponseTimeMinutes !== undefined ? `${fmt(responseTime.averageResponseTimeMinutes)} ${t('dashboard.minutes', 'min')}` : '—',
            color: 'text-blue-500',
        },
        {
            icon: TrendingUp,
            label: t('dashboard.fastestResponseTime', 'Fastest Response Time'),
            value: responseTime?.fastestResponseTimeMinutes !== undefined ? `${fmt(responseTime.fastestResponseTimeMinutes)} ${t('dashboard.minutes', 'min')}` : '—',
            color: 'text-emerald-500',
        },
        {
            icon: Clock,
            label: t('dashboard.slowestResponseTime', 'Slowest Response Time'),
            value: responseTime?.slowestResponseTimeMinutes !== undefined ? `${fmt(responseTime.slowestResponseTimeMinutes)} ${t('dashboard.minutes', 'min')}` : '—',
            color: 'text-orange-500',
        },
    ];


    if (loading && !storeStats && !userStats && !productPerformance && !responseTime) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-10" data-testid="admin-analytics-page">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('nav.analytics', 'Analytics')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('dashboard.analyticsDescription', 'In-depth platform statistics')}
                    </p>
                </div>
            </div>

            {/* Store Stats */}
            <section data-testid="analytics-store-stats-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <SectionTitle icon={ShoppingBag}>{t('dashboard.storeStats', 'Store Statistics')}</SectionTitle>
                    {/* Date Filters */}
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[140px] justify-start text-start font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="ms-auto h-4 w-4" />
                                    {startDate ? format(startDate, "PP") : <span className="ms-2">{t('dashboard.pickDate', 'Pick a date')}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground">-</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-[140px] justify-start text-start font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="ms-auto h-4 w-4" />
                                    {endDate ? format(endDate, "PP") : <span className="ms-2">{t('dashboard.pickDate', 'Pick a date')}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                {loading && !storeStats && <LoadingSpinner className="h-6 w-6 text-primary mb-4" />}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {storeCards.map((c) => (
                        <StatCard key={c.label} {...c} />
                    ))}
                </div>
            </section>

            {/* Response Time Stats */}
            <section data-testid="analytics-response-time-section">
                <SectionTitle icon={Clock}>{t('dashboard.responseTimeStats', 'Response Time Statistics')}</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {responseTimeCards.map((c) => (
                        <StatCard key={c.label} {...c} />
                    ))}
                </div>
            </section>

            {/* User Stats */}
            <section data-testid="analytics-user-stats-section">
                <SectionTitle icon={Users}>{t('dashboard.userStats', 'User Statistics')}</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userCards.map((c) => (
                        <StatCard key={c.label} {...c} />
                    ))}
                </div>

                {/* Role breakdown table */}
                {Object.keys(roleBreakdown).length > 0 && (
                    <Card className="mt-4 shadow-sm w-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                {t('dashboard.usersByRole', 'Users by Role')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="divide-y relative">
                                {Object.entries(roleBreakdown).map(([role, count]) => (
                                    <div key={role} className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-muted-foreground">{role}</span>
                                        <span className="text-sm font-semibold tabular-nums">{fmt(count)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Product Performance Table */}
            <section data-testid="analytics-product-performance-section">
                <SectionTitle icon={TrendingUp}>{t('dashboard.productPerformance', 'Product Performance (Top 50)')}</SectionTitle>
                <Card className="shadow-sm">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-start">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.productName', 'Product Name')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.serial', 'Serial')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.timesPurchased', 'Times Purchased')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.totalValue', 'Total Value')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productPerformance && productPerformance.length > 0 ? (
                                    productPerformance.map((item, idx) => (
                                        <tr key={item.product?.id || idx} className=" border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{item.product?.title || 'Unknown'}</td>
                                            <td className="px-6 py-4">{item.product?.serial}</td>
                                            <td className="px-6 py-4 tabular-nums">{fmt(item.timesPurchased)}</td>
                                            <td className="px-6 py-4 tabular-nums">{fmt(item.totalValue)} {t('dashboard.currency', 'EGP')}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                                            {t('table.noData', 'No data available')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
