import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, School, Building2 } from 'lucide-react';
import { useTeachingLocations } from '@/hooks/useTeachingLocations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TeachingLocations() {
    const { t } = useTranslation('teacher');
    const { locations, fetchLocations } = useTeachingLocations();

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t('profile.teachingLocations', 'Teaching Locations')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
                {locations.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                        {t('profile.noLocations', 'No teaching locations added yet.')}
                    </p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {locations.map((loc) => (
                            <div key={loc.id} className="rounded-xl border bg-muted/30 p-4">
                                <div className="flex items-start gap-2">
                                    {loc.location_type === 'Center' ?
                                        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> :
                                        <School className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    }
                                    <div className="min-w-0 flex-1">
                                        <div className="break-words text-sm font-semibold">{loc.location_name}</div>
                                        {loc.location_type && (
                                            <Badge variant="secondary" className="mt-2 text-xs">
                                                {t(`profile.locationType.${loc.location_type.toLowerCase()}`, loc.location_type)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
