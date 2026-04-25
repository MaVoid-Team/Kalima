import React from 'react';
import { User, MapPin, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InfoRow from './InfoRow';
import { useTranslation } from 'react-i18next';

export default function LecturerCard({ 
    lecturers = [], 
    isEditing, 
    formData, 
    setFormData, 
    t, 
    levels = [], 
    governments = [], 
    zones = [],
    zonesLoading = false
}) {
    const { i18n } = useTranslation();
    const na = t('common:na', 'N/A');

    return (
        <Card className="shadow-sm" data-testid="user-detail-lecturers-card">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t('details.lecturers', 'Lecturers')}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-0">
                {isEditing ? (
                    <div className="space-y-3 py-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">{t('details.level', 'Level')}</label>
                            <Select
                                dir={i18n.dir()}
                                value={String(formData.lecturer?.level_id || '')}
                                onValueChange={(val) => setFormData({
                                    ...formData,
                                    lecturer: { ...formData.lecturer, level_id: parseInt(val) }
                                })}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder={t('details.selectLevel', 'Select Level')} />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {levels.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">{t('details.government', 'Government')}</label>
                            <Select
                                dir={i18n.dir()}
                                value={String(formData.lecturer?.government_id || '')}
                                onValueChange={(val) => setFormData({
                                    ...formData,
                                    lecturer: { ...formData.lecturer, government_id: parseInt(val), zone_id: null }
                                })}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder={t('details.selectGovernment', 'Select Government')} />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {governments.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">{t('details.zone', 'Zone')}</label>
                            <Select
                                dir={i18n.dir()}
                                value={String(formData.lecturer?.zone_id || '')}
                                onValueChange={(val) => setFormData({
                                    ...formData,
                                    lecturer: { ...formData.lecturer, zone_id: parseInt(val) }
                                })}
                                disabled={zonesLoading || !formData.lecturer?.government_id}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder={zonesLoading ? t('common:loading', 'Loading...') : t('details.selectZone', 'Select Zone')} />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    {!zonesLoading && zones.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {lecturers.length > 0 ? lecturers.map((lecturer) => (
                            <div key={lecturer.id} className="py-2 space-y-1">
                                <InfoRow
                                    icon={GraduationCap}
                                    label={t('details.level')}
                                    value={lecturer.level?.title || lecturer.levels?.title || na}
                                />
                                <InfoRow
                                    icon={MapPin}
                                    label={t('details.government')}
                                    value={lecturer.government?.title || lecturer.governments?.title || na}
                                />
                                <InfoRow
                                    icon={MapPin}
                                    label={t('details.zone')}
                                    value={lecturer.zone?.title || lecturer.zones?.title || na}
                                />
                            </div>
                        )) : (
                            <div className="py-2 space-y-1 opacity-60">
                                <InfoRow
                                    icon={GraduationCap}
                                    label={t('details.level')}
                                    value={na}
                                />
                                <InfoRow
                                    icon={MapPin}
                                    label={t('details.government')}
                                    value={na}
                                />
                                <InfoRow
                                    icon={MapPin}
                                    label={t('details.zone')}
                                    value={na}
                                />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
