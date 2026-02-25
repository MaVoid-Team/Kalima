import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/storeUtils';
import { ShoppingCart, DollarSign, Activity, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StoreStatsCards() {
    const { t } = useTranslation('admin');
    const { dailyStoreStats, loading, fetchDailyStoreStats } = useAnalytics();

    useEffect(() => {
        fetchDailyStoreStats();
    }, [fetchDailyStoreStats]);

    if (loading) {
        return (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 mb-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!dailyStoreStats) return null;

    const stats = [
        {
            title: t('orders.statsToday.totalPurchases', 'Total Purchases'),
            value: dailyStoreStats.totalPurchases || 0,
            icon: ShoppingCart,
            color: "text-primary"
        },
        {
            title: t('orders.statsToday.totalRevenue', 'Total Revenue'),
            value: formatCurrency(dailyStoreStats.totalRevenue || 0, t),
            icon: DollarSign,
            color: "text-success"
        },
        {
            title: t('orders.statsToday.averagePrice', 'Average Price'),
            value: formatCurrency(dailyStoreStats.averagePrice || 0, t),
            icon: Activity,
            color: "text-chart-2"
        },
        {
            title: t('orders.statsToday.confirmedPurchases', 'Confirmed Purchases'),
            value: dailyStoreStats.confirmedPurchases || 0,
            icon: CheckCircle,
            color: "text-chart-4"
        },
        {
            title: t('orders.statsToday.confirmedRevenue', 'Confirmed Revenue'),
            value: formatCurrency(dailyStoreStats.confirmedRevenue || 0, t),
            icon: DollarSign,
            color: "text-chart-5"
        },
        {
            title: t('orders.statsToday.pendingPurchases', 'Pending Purchases'),
            value: dailyStoreStats.pendingPurchases || 0,
            icon: Clock,
            color: "text-chart-3"
        }
    ];

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 mb-6">
            {stats.map((stat, i) => (
                <Card key={i} className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className={`h-4 w-4 shrink-0 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold truncate" title={stat.value}>
                            {stat.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
