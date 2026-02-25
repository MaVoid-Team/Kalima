import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, GraduationCap, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserStatsCards() {
    const { t } = useTranslation('userManagement');
    const { userStats, loading, fetchUserStats } = useAnalytics();

    useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]);

    if (loading && !userStats) {
        return (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-4 mb-6">
                {[...Array(4)].map((_, i) => (
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

    if (!userStats) return null;

    const adminCount = (userStats.byRole?.Admin || 0) + (userStats.byRole?.SubAdmin || 0);

    const stats = [
        {
            title: t('stats.totalUsers', 'Total Users'),
            value: userStats.totalUsers || 0,
            icon: Users,
            color: "text-primary"
        },
        {
            title: t('stats.verifiedUsers', 'Verified Users'),
            value: userStats.totalVerifiedUsers || 0,
            icon: UserCheck,
            color: "text-success"
        },
        {
            title: t('stats.teachers', 'Teachers'),
            value: userStats.byRole?.Teacher || 0,
            icon: GraduationCap,
            color: "text-chart-2"
        },
        {
            title: t('stats.administrators', 'Administrators'),
            value: adminCount,
            icon: Shield,
            color: "text-chart-4"
        }
    ];

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-4 mb-6">
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
