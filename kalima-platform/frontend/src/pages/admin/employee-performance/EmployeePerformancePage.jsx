import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Activity, CheckCircle, Users, BarChart3, Filter
} from 'lucide-react';
import { useEmployeePerformance } from '@/hooks/admin/useEmployeePerformance';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import SectionTitle from '@/components/admin/dashboard/SectionTitle';

export default function EmployeePerformancePage() {
    const { t } = useTranslation('admin');
    const {
        loading,
        confirmerStats,
        confirmedCount,
        createdAccounts,
        fetchConfirmerStats,
        fetchConfirmedCount,
        fetchCreatedAccounts
    } = useEmployeePerformance();

    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    useEffect(() => {
        fetchConfirmerStats();
        fetchCreatedAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchConfirmedCount(month, year);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month, year]);

    if (loading && !confirmerStats && !confirmedCount && !createdAccounts) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-10" data-testid="employee-performance-page">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('nav.employeePerformance', 'Employee Performance')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('dashboard.employeePerformanceDesc', 'Track admins and sub-admins efficiency')}
                    </p>
                </div>
            </div>

            {/* Confirmer Stats (Who handled how many) */}
            <section data-testid="ep-confirmer-stats-section">
                <SectionTitle icon={CheckCircle}>{t('dashboard.confirmerStats', 'Confirmer Statistics')}</SectionTitle>
                <Card className="shadow-sm">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-start">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.adminName', 'Admin Name')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.email', 'Email')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.totalHandled', 'Total Handled')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.confirmed', 'Confirmed')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.pending', 'Pending')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {confirmerStats && confirmerStats.length > 0 ? (
                                    confirmerStats.map((item, idx) => (
                                        <tr key={item.user?.id || idx} className=" border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{item.user?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4">{item.user?.email}</td>
                                            <td className="px-6 py-4 tabular-nums">{item.totalHandled || 0}</td>
                                            <td className="px-6 py-4 tabular-nums text-emerald-600 font-medium">{item.byStatus?.confirmed || 0}</td>
                                            <td className="px-6 py-4 tabular-nums text-orange-500 font-medium">{item.byStatus?.pending || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                                            {t('table.noData', 'No data available')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </section>

            {/* Confirmed Purchase Count (Monthly breakdown) */}
            <section data-testid="ep-confirmed-count-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <SectionTitle icon={BarChart3}>{t('dashboard.confirmedPurchasesByAdmin', 'Confirmed Purchases by Admin')}</SectionTitle>
                    {/* Month/Year Filters */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="bg-background border border-input rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            aria-label="Month"
                        >
                            <option value="">{t('dashboard.allMonths', 'All Months')}</option>
                            {[...Array(12).keys()].map(m => (
                                <option key={m + 1} value={m + 1}>{m + 1}</option>
                            ))}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="bg-background border border-input rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            aria-label="Year"
                        >
                            <option value="">{t('dashboard.allYears', 'All Years')}</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                        </select>
                    </div>
                </div>
                {loading && !confirmedCount && <LoadingSpinner className="h-6 w-6 text-primary mb-4" />}
                <Card className="shadow-sm">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-start">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.month', 'Month')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.adminName', 'Admin Name')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.email', 'Email')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.confirmedCount', 'Count')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {confirmedCount && confirmedCount.length > 0 ? (
                                    confirmedCount.map((item, idx) => {
                                        const d = new Date(item.month);
                                        const formattedMonth = !isNaN(d.getTime()) ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : item.month;
                                        return (
                                            <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4">{formattedMonth}</td>
                                                <td className="px-6 py-4 font-medium">{item.admin_name || 'Unknown'}</td>
                                                <td className="px-6 py-4">{item.admin_email}</td>
                                                <td className="px-6 py-4 tabular-nums font-semibold text-primary">{item.count || 0}</td>
                                            </tr>
                                        )
                                    })
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

            {/* Created Accounts Stats */}
            <section data-testid="ep-created-accounts-section">
                <SectionTitle icon={Users}>{t('dashboard.createdAccounts', 'Created Accounts Statistics')}</SectionTitle>
                <Card className="shadow-sm">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-start">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.adminName', 'Admin Name')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.email', 'Email')}</th>
                                    <th className="px-6 py-3 font-medium text-start">{t('table.createdAccounts', 'Accounts Created')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {createdAccounts && createdAccounts.length > 0 ? (
                                    createdAccounts.map((item, idx) => (
                                        <tr key={item.user?.id || idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{item.user?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4">{item.user?.email}</td>
                                            <td className="px-6 py-4 tabular-nums font-semibold text-blue-600">{item.totalAccounts || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-muted-foreground">
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
