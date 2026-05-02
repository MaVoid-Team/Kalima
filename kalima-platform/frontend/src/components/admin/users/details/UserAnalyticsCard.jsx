import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function UserAnalyticsCard({ stats = [], t }) {
    if (stats.length === 0) return null;

    return (
        <Card className="shadow-sm" data-testid="user-detail-analytics-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    {t('details.analytics')}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md bg-background ${stat.color}`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                            </div>
                            <span className="text-lg font-bold">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
