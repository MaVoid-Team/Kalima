import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function UsersCreatedCard({ createdEntries = [], t }) {
    if (createdEntries.length === 0) return null;

    return (
        <Card className="shadow-sm" data-testid="user-detail-users-created-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {t('details.usersCreated')}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2">
                    {createdEntries.map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between py-1">
                            <span className="text-sm text-muted-foreground">
                                {t(`roles.${role}`, role)}
                            </span>
                            <Badge variant="secondary" className="font-mono tabular-nums">
                                {count}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
