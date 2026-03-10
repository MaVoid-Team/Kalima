/* eslint-disable react/prop-types */

import { useTranslation } from 'react-i18next';
import { TicketPercent, BadgeCheck, UserX, Percent, HandCoins, DollarSign, BadgeX } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CouponsStatsCards({ stats, loading = false }) {
    const { t, i18n } = useTranslation('admin');

    if (loading && !stats) {
        const skeletonKeys = ['total', 'active', 'inactive', 'percentage', 'amount'];
        return (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5" data-testid="coupons-stats-loading">
                <Card className="col-span-2 md:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-3/4" />
                    </CardContent>
                </Card>

                {skeletonKeys.slice(1).map((key) => (
                    <Card key={key}>
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

    const normalizedStats = {
        total: stats?.total ?? 0,
        active: stats?.active ?? 0,
        inactive: stats?.inactive ?? 0,
        percentage: stats?.percentage ?? 0,
        amount: stats?.fixed ?? 0,
    };

    const totalCard = {
        title: t('coupons.stats.totalCoupons'),
        value: normalizedStats.total,
        icon: TicketPercent,
        color: 'text-primary',
    };

    const secondaryCards = [
        {
            title: t('coupons.stats.activeCoupons'),
            value: normalizedStats.active,
            icon: BadgeCheck,
            color: 'text-success',
        },
        {
            title: t('coupons.stats.inactiveCoupons'),
            value: normalizedStats.inactive,
            icon: BadgeX,
            color: 'text-destructive',
        },
        {
            title: t('coupons.stats.percentageCoupons'),
            value: normalizedStats.percentage,
            icon: Percent,
            color: 'text-chart-2',
        },
        {
            title: t('coupons.stats.amountCoupons'),
            value: normalizedStats.amount,
            icon: DollarSign,
            color: 'text-chart-4',
        },
    ];

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5" data-testid="coupons-stats-cards">
            <Card className="shadow-sm col-span-2 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                        {totalCard.title}
                    </CardTitle>
                    <totalCard.icon className={`h-4 w-4 shrink-0 ${totalCard.color} ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold truncate" title={`${totalCard.value}`}>
                        {totalCard.value}
                    </div>
                </CardContent>
            </Card>

            {secondaryCards.map((stat) => (
                <Card key={stat.title} className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className={`h-4 w-4 shrink-0 ${stat.color} ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold truncate" title={`${stat.value}`}>
                            {stat.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}